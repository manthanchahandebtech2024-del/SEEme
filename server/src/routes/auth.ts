import { Router, Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { config } from "../config";
import { getContainer } from "../container";
import { authRequired, AuthRequest } from "../middleware/auth";

const router = Router();

router.post("/register", async (req: Request, res: Response) => {
  try {
    const { email, password, name } = req.body;
    if (!email || !password || !name) {
      res.status(400).json({ error: "Email, password, and name are required" });
      return;
    }

    const container = getContainer();
    const existing = await container.userRepo.findByEmail(email);
    if (existing) {
      res.status(409).json({ error: "Email already registered" });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await container.userRepo.create(email, passwordHash, name);
    const token = jwt.sign({ userId: user.id }, config.jwtSecret, { expiresIn: 60 * 60 * 24 * 7 });

    res.status(201).json({ user, token });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ error: "Registration failed" });
  }
});

router.post("/login", async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ error: "Email and password are required" });
      return;
    }

    const container = getContainer();
    const user = await container.userRepo.findByEmail(email);
    if (!user) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }

    const token = jwt.sign({ userId: user.id }, config.jwtSecret, { expiresIn: 60 * 60 * 24 * 7 });
    res.json({ user: { id: user.id, email: user.email, name: user.name }, token });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Login failed" });
  }
});

router.get("/me", authRequired, async (req: AuthRequest, res: Response) => {
  try {
    const container = getContainer();
    const user = await container.userRepo.findById(req.userId!);
    if (!user) { res.status(404).json({ error: "User not found" }); return; }
    const gameProfile = await container.gamification.getProfile(req.userId!);
    const badges = await container.gamification.getBadges(req.userId!);
    res.json({ user, gameProfile, badges });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch profile" });
  }
});

export default router;
