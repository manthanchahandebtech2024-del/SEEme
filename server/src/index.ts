import express from "express";
import cors from "cors";
import path from "path";
import { createServer } from "http";
import { config } from "./config";
import { getContainer } from "./container";
import { setupWebSocket } from "./websocket";
import { rateLimiter } from "./middleware/rateLimiter";
import { errorHandler } from "./middleware/errorHandler";
import authRoutes from "./routes/auth";
import resumeRoutes from "./routes/resume";
import recruiterRoutes from "./routes/recruiter";
import chatRoutes from "./routes/chat";
import { createLogger } from "./utils/logger";

const logger = createLogger("Server");

async function main() {
  const container = getContainer();
  await container.initialize();

  const app = express();
  const server = createServer(app);

  app.use(cors({
    origin: config.corsOrigin === "*" ? true : config.corsOrigin.split(","),
    credentials: true,
  }));
  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ extended: true, limit: "10mb" }));
  app.use(rateLimiter);

  app.get("/api/health", (_req, res) => {
    res.json({
      status: "ok",
      aiProvider: container.aiFactory.getProvider().name,
      availableProviders: container.aiFactory.getAvailableProviders(),
    });
  });

  app.use("/api/auth", authRoutes);
  app.use("/api/resume", resumeRoutes);
  app.use("/api/recruiter", recruiterRoutes);
  app.use("/api/chat", chatRoutes);

  app.use(express.static(path.join(__dirname, "../../client/dist")));
  app.get("/{*path}", (_req, res) => {
    res.sendFile(path.join(__dirname, "../../client/dist/index.html"));
  });

  app.use(errorHandler);

  setupWebSocket(server, container.eventBus);

  server.listen(config.port, () => {
    logger.info(`SEEme server running on http://localhost:${config.port}`);
    logger.info(`AI Provider: ${container.aiFactory.getProvider().name}`);
    logger.info(`Available providers: ${container.aiFactory.getAvailableProviders().join(", ")}`);
  });

  process.on("SIGTERM", async () => {
    logger.info("Shutting down...");
    await container.shutdown();
    process.exit(0);
  });
}

main().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
