import { Request, Response, NextFunction } from "express";
import { config } from "../config";

const hits = new Map<string, { count: number; resetAt: number }>();

export function rateLimiter(req: Request, res: Response, next: NextFunction) {
  const key = req.ip || "unknown";
  const now = Date.now();
  const record = hits.get(key);

  if (!record || now > record.resetAt) {
    hits.set(key, { count: 1, resetAt: now + config.rateLimit.windowMs });
    next();
    return;
  }

  if (record.count >= config.rateLimit.max) {
    res.status(429).json({ error: "Too many requests. Please try again later." });
    return;
  }

  record.count++;
  next();
}
