import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Request timeout so Replit doesn't show "took too long" (60s for long routes, e.g. first load)
const REQUEST_TIMEOUT_MS = 60000;
app.use((req, res, next) => {
  const t = setTimeout(() => {
    if (!res.headersSent) {
      res.status(504).json({ message: "Request timeout" });
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

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const PORT = 5000;
  server.listen(PORT, "0.0.0.0", () => {
    log(`Server running on port ${PORT}`);

    // Scheduled AI question generation (per docs/questions_db_migration_plan.md requirement 3)
    const genEnabled = process.env.QUESTION_GENERATION_ENABLED === "true";
    const genIntervalMs = Number(process.env.QUESTION_GENERATION_INTERVAL_MS) || 86400000; // default 24h
    if (genEnabled && genIntervalMs > 0) {
      import("./jobs/questionGenerationJob").then(({ runQuestionGenerationJob }) => {
        const run = () => {
          runQuestionGenerationJob()
            .then((r) => log(`[questionGenerationJob] created=${r.created} total=${r.total} skipped=${r.skipped}`))
            .catch((e) => log(`[questionGenerationJob] error:`, e));
        };
        run(); // run once after startup
        setInterval(run, genIntervalMs);
        log(`[questionGenerationJob] scheduled every ${genIntervalMs}ms`);
      });
    }
  });
})();
