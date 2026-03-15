import { Router, Response } from "express";
import { authOptional, AuthRequest } from "../middleware/auth";
import { getContainer } from "../container";
import { ChatMessage } from "../utils/types";

const router = Router();

router.post("/message", authOptional, async (req: AuthRequest, res: Response) => {
  try {
    const { messages, resumeContext, jdContext } = req.body as {
      messages: ChatMessage[];
      resumeContext?: string;
      jdContext?: string;
    };

    if (!messages || messages.length === 0) {
      res.status(400).json({ error: "Messages are required" });
      return;
    }

    const container = getContainer();
    const aiProvider = container.aiFactory.getProvider();
    const reply = await aiProvider.chat(messages, resumeContext, jdContext);

    res.json({ success: true, reply, provider: aiProvider.name });
  } catch (error) {
    console.error("Chat error:", error);
    res.status(500).json({ error: "Chat failed" });
  }
});

export default router;
