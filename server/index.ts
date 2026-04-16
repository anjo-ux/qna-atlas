import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { canonicalHostRedirect, registerSeoPublicRoutes } from "./seoPublic";

const app = express();
app.use(canonicalHostRedirect);
// Limit body size to mitigate DoS via large payloads
const BODY_LIMIT = '100kb';

// Stripe webhook needs raw body for signature verification (must be before express.json)
const { handleStripeWebhook } = await import("./stripe");
app.post(
  "/api/webhooks/stripe",
  express.raw({ type: "application/json", limit: "100kb" }),
  (req: express.Request, res: express.Response) => {
    const rawReq = req as express.Request & { body: Buffer };
    handleStripeWebhook(
      { body: rawReq.body, headers: req.headers },
      res
    ).catch((err) => {
      console.error("Stripe webhook error:", err);
      res.status(500).send("Webhook handler error");
    });
  }
);

app.use(express.json({ limit: BODY_LIMIT }));
app.use(express.urlencoded({ extended: false, limit: BODY_LIMIT }));

// Request timeout so Replit doesn't show "took too long" (60s for long routes, e.g. first load)
const REQUEST_TIMEOUT_MS = 60000;
app.use((req, res, next) => {
  const t = setTimeout(() => {
    if (!res.headersSent) {
      res.status(504).json({ message: "Request timeout." });
    }
  }, REQUEST_TIMEOUT_MS);
  res.on("finish", () => clearTimeout(t));
  next();
});

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  const server = await registerRoutes(app);
  registerSeoPublicRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error.";

    res.status(status).json({ message });
    throw err;
  });

  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  function onServerListening(port: number) {
    log(`Server running on port ${port}`);
    const sgKey = process.env.SENDGRID_API_KEY;
    const sgFrom = process.env.SENDGRID_FROM_EMAIL;
    log(`SendGrid: SENDGRID_API_KEY=${sgKey ? "set" : "NOT SET"}, SENDGRID_FROM_EMAIL=${sgFrom ? "set" : "not set"}`);
    if (!sgKey) {
      log("Forgot-password emails will not be sent. Add SENDGRID_API_KEY to your environment (e.g. Replit Secrets) and restart the server.");
    }
    const stripeKey = process.env.STRIPE_SECRET_KEY;
    const stripeWebhook = process.env.STRIPE_WEBHOOK_SECRET;
    log(`Stripe: STRIPE_SECRET_KEY=${stripeKey ? "set" : "NOT SET"}, STRIPE_WEBHOOK_SECRET=${stripeWebhook ? "set" : "NOT SET"}`);
    if (!stripeKey) {
      log("Subscription checkout will not work. Add STRIPE_SECRET_KEY and configure Stripe webhook (STRIPE_WEBHOOK_SECRET) for production.");
    }
    const stripeReconcileIntervalMs = Number(process.env.STRIPE_RECONCILIATION_INTERVAL_MS) || 3 * 24 * 60 * 60 * 1000;
    if (stripeReconcileIntervalMs > 0) {
      import("./stripe").then(({ reconcileStripeSubscriptions }) => {
        const run = () => {
          reconcileStripeSubscriptions()
            .then((r) =>
              log(
                `[stripeReconciliation] scanned=${r.scanned} updatedUsers=${r.updatedUsers} createdTransactions=${r.createdTransactions} errors=${r.errors}`
              )
            )
            .catch((e) => log(`[stripeReconciliation] error: ${e}`));
        };
        run(); // run once immediately at startup
        setInterval(run, stripeReconcileIntervalMs);
        log(`[stripeReconciliation] scheduled every ${stripeReconcileIntervalMs}ms`);
      });
    }

    // Scheduled AI question generation (per docs/questions_db_migration_plan.md requirement 3)
    const genEnabled = process.env.QUESTION_GENERATION_ENABLED === "true";
    const genIntervalMs = Number(process.env.QUESTION_GENERATION_INTERVAL_MS) || 86400000; // default 24h
    if (genEnabled && genIntervalMs > 0) {
      import("./jobs/questionGenerationJob").then(({ runQuestionGenerationJob }) => {
        const run = () => {
          runQuestionGenerationJob()
            .then((r) => log(`[questionGenerationJob] created=${r.created} total=${r.total} skipped=${r.skipped}`))
            .catch((e) => log(`[questionGenerationJob] error: ${e}`));
        };
        run(); // run once after startup
        setInterval(run, genIntervalMs);
        log(`[questionGenerationJob] scheduled every ${genIntervalMs}ms`);
      });
    }
  }

  const rawPort = process.env.PORT;
  const hasHostedPort = rawPort !== undefined && rawPort !== "";
  const desiredPort = hasHostedPort ? Number(rawPort) : 5000;
  if (hasHostedPort && (!Number.isFinite(desiredPort) || desiredPort < 1 || desiredPort > 65535)) {
    log(`Invalid PORT="${rawPort}". Set PORT to a number between 1 and 65535.`);
    process.exit(1);
  }

  /**
   * Replit / Render / Fly only expose the port in PORT. If 5000 is busy we must not bind to 5001+ —
   * that looks "running" locally but is unreachable from the web.
   */
  if (hasHostedPort) {
    server.listen(desiredPort, "0.0.0.0", () => onServerListening(desiredPort));
    server.once("error", (err: NodeJS.ErrnoException) => {
      if (err.code === "EADDRINUSE") {
        log(
          `Port ${desiredPort} (PORT) is already in use. Only PORT is exposed on this host — stop duplicate dev servers or workflows, then restart.`
        );
        process.exit(1);
      }
      throw err;
    });
  } else {
    const maxAttempts = 10;
    function tryListen(port: number, attempt: number) {
      server.listen(port, "0.0.0.0", () => onServerListening(port));
      server.once("error", (err: NodeJS.ErrnoException) => {
        if (err.code === "EADDRINUSE" && attempt < maxAttempts) {
          log(`Port ${port} in use, trying ${port + 1}...`);
          tryListen(port + 1, attempt + 1);
        } else {
          throw err;
        }
      });
    }
    tryListen(desiredPort, 0);
  }
})();
