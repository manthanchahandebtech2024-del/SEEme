import { createLogger } from "../utils/logger";

const logger = createLogger("EventBus");

type EventHandler = (...args: unknown[]) => void;

export class EventBus {
  private handlers = new Map<string, Set<EventHandler>>();

  on(event: string, handler: EventHandler) {
    if (!this.handlers.has(event)) this.handlers.set(event, new Set());
    this.handlers.get(event)!.add(handler);
  }

  off(event: string, handler: EventHandler) {
    this.handlers.get(event)?.delete(handler);
  }

  emit(event: string, ...args: unknown[]) {
    logger.debug(`Event: ${event}`);
    const handlers = this.handlers.get(event);
    if (handlers) {
      for (const handler of handlers) {
        try { handler(...args); } catch (err) { logger.error(`Handler error for ${event}`, err); }
      }
    }
  }
}
