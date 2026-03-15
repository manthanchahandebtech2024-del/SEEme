import { Server as HttpServer } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { EventBus } from "../events/EventBus";
import { createLogger } from "../utils/logger";

const logger = createLogger("WebSocket");

export function setupWebSocket(server: HttpServer, eventBus: EventBus) {
  const wss = new WebSocketServer({ server, path: "/ws" });
  const clients = new Map<string, Set<WebSocket>>();

  wss.on("connection", (ws, req) => {
    const url = new URL(req.url || "/", `http://${req.headers.host}`);
    const userId = url.searchParams.get("userId") || "anonymous";

    if (!clients.has(userId)) clients.set(userId, new Set());
    clients.get(userId)!.add(ws);
    logger.info(`Client connected: ${userId}`);

    ws.on("close", () => {
      clients.get(userId)?.delete(ws);
      if (clients.get(userId)?.size === 0) clients.delete(userId);
    });

    ws.on("error", (err) => logger.error("WS error", err));
  });

  function broadcast(userId: string, event: string, data: unknown) {
    const userClients = clients.get(userId);
    if (!userClients) return;
    const message = JSON.stringify({ event, data });
    for (const ws of userClients) {
      if (ws.readyState === WebSocket.OPEN) ws.send(message);
    }
  }

  eventBus.on("queue:job:processing", (data: any) => {
    broadcast(data.userId || "anonymous", "analysis:processing", { jobId: data.jobId });
  });

  eventBus.on("queue:job:completed", (data: any) => {
    broadcast(data.userId || "anonymous", "analysis:completed", { jobId: data.jobId, result: data.result });
  });

  eventBus.on("badges:earned", (data: any) => {
    broadcast(data.userId, "badges:earned", { badges: data.badges });
  });

  eventBus.on("xp:added", (data: any) => {
    broadcast(data.userId, "xp:updated", { totalXP: data.totalXP, level: data.level, tier: data.tier });
  });

  logger.info("WebSocket server initialized");
  return wss;
}
