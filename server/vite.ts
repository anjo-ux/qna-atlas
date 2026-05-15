import express, { type Express, type Request, type Response } from "express";
import fs from "fs";
import path from "path";
import type { Server } from "http";
import { injectSpaIndexHtml, registerSeoPublicRoutes } from "./seoPublic";

// Load Vite only when setupVite runs — avoids eager `import "vite"` (and tsx resolving its
// internal chunks) on production `npm start` or with an incomplete install.

export function log(message: string) {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [express] ${message}`);
}

function sendSpaIndexHtml(res: Response, distPath: string, requestPath: string): void {
  const indexPath = path.resolve(distPath, "index.html");
  const raw = fs.readFileSync(indexPath, "utf-8");
  const html = injectSpaIndexHtml(raw, requestPath);
  res
    .status(200)
    .type("html")
    .setHeader("Cache-Control", "public, max-age=0, must-revalidate")
    .send(html);
}

export async function setupVite(app: Express, server: Server) {
  registerSeoPublicRoutes(app);
  const { createServer: createViteServer } = await import("vite");
  const vite = await createViteServer({
    server: {
      middlewareMode: true,
      hmr: { server },
    },
    appType: "custom",
  });

  app.use(vite.middlewares);
  app.use("*", async (req, res, next) => {
    const url = req.originalUrl;

    try {
      const clientTemplate = path.resolve(
        process.cwd(),
        "client",
        "index.html"
      );
      let template = fs.readFileSync(clientTemplate, "utf-8");
      template = await vite.transformIndexHtml(url, template);
      template = injectSpaIndexHtml(template, url);

      res
        .status(200)
        .set({ "Content-Type": "text/html", "Cache-Control": "public, max-age=0, must-revalidate" })
        .end(template);
    } catch (e) {
      vite.ssrFixStacktrace(e as Error);
      next(e);
    }
  });
}

export function serveStatic(app: Express) {
  const distPath = path.resolve(process.cwd(), "dist", "public");

  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find build directory: ${distPath}, make sure to build the client first`
    );
  }

  /* Must run before express.static so /sitemap.xml is never answered with SPA index.html */
  registerSeoPublicRoutes(app);

  app.get("/index.html", (_req: Request, res: Response) => {
    res.redirect(301, "/");
  });

  /* index: false so GET / is handled below with injectSpaIndexHtml (marketing title + canonical) */
  app.use(express.static(distPath, { index: false }));

  app.use("*", (req, res) => {
    sendSpaIndexHtml(res, distPath, req.originalUrl || "/");
  });
}
