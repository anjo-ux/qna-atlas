import type { Express } from "express";
import { createServer, type Server } from "http";

export function registerRoutes(app: Express): Server {
  // Add your API routes here
  // Example:
  // app.get("/api/data", async (req, res) => {
  //   res.json({ message: "Hello from API" });
  // });

  const httpServer = createServer(app);
  return httpServer;
}
