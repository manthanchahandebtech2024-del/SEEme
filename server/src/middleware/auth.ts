import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { config } from "../config";

export interface AuthRequest extends Request {
  userId?: string;
}

export function authRequired(req: AuthRequest, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    res.status(401).json({ error: "Authentication required" });
    return;
  }

  try {
    const token = header.substring(7);
    const decoded = jwt.verify(token, config.jwtSecret) as { userId: string };
    req.userId = decoded.userId;
    next();
  } catch {
    res.status(401).json({ error: "Invalid or expired token" });
  }
}

export function authOptional(req: AuthRequest, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (header?.startsWith("Bearer ")) {
    try {
      const token = header.substring(7);
      const decoded = jwt.verify(token, config.jwtSecret) as { userId: string };
      req.userId = decoded.userId;
    } catch {}
  }
  next();
}
