import { Request, Response, NextFunction } from "express";
import { createLogger } from "../utils/logger";

const logger = createLogger("ErrorHandler");

export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction) {
  logger.error(err.message, { stack: err.stack });
  res.status(500).json({ error: "Internal server error" });
}
