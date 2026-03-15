type LogLevel = "debug" | "info" | "warn" | "error";

const LEVELS: Record<LogLevel, number> = { debug: 0, info: 1, warn: 2, error: 3 };
const currentLevel: LogLevel = (process.env.LOG_LEVEL as LogLevel) || "info";

function shouldLog(level: LogLevel): boolean {
  return LEVELS[level] >= LEVELS[currentLevel];
}

function formatMessage(level: LogLevel, context: string, message: string, meta?: unknown): string {
  const timestamp = new Date().toISOString();
  const metaStr = meta ? ` ${JSON.stringify(meta)}` : "";
  return `[${timestamp}] [${level.toUpperCase()}] [${context}] ${message}${metaStr}`;
}

export class Logger {
  constructor(private context: string) {}

  debug(message: string, meta?: unknown) {
    if (shouldLog("debug")) console.debug(formatMessage("debug", this.context, message, meta));
  }

  info(message: string, meta?: unknown) {
    if (shouldLog("info")) console.info(formatMessage("info", this.context, message, meta));
  }

  warn(message: string, meta?: unknown) {
    if (shouldLog("warn")) console.warn(formatMessage("warn", this.context, message, meta));
  }

  error(message: string, meta?: unknown) {
    if (shouldLog("error")) console.error(formatMessage("error", this.context, message, meta));
  }
}

export function createLogger(context: string): Logger {
  return new Logger(context);
}
