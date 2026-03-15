import { Router, Response } from "express";
import { uploadMultiple } from "../middleware/upload";
import { authOptional, AuthRequest } from "../middleware/auth";
import { getContainer } from "../container";

const router = Router();

router.post("/rank", authOptional, (req: AuthRequest, res: Response) => {
  uploadMultiple(req, res, async (err) => {
    try {
      if (err) { res.status(400).json({ error: err.message }); return; }
      const files = req.files as Express.Multer.File[];
      if (!files || files.length === 0) { res.status(400).json({ error: "No resume files" }); return; }
      const jobDescription = req.body.jobDescription;
      if (!jobDescription) { res.status(400).json({ error: "Job description required" }); return; }

      const container = getContainer();
      const resumes = await Promise.all(
        files.map(async (file) => {
          const parser = container.parserFactory.getParser(file.originalname);
          return parser.parse(file.buffer, file.originalname);
        })
      );

      const ranked = await container.scoringPipeline.rankCandidates(resumes, jobDescription);

      res.json({
        success: true,
        totalCandidates: ranked.length,
        results: ranked,
        aiProvider: container.aiFactory.getProvider().name,
        summary: {
          averageScore: Math.round(ranked.reduce((s, r) => s + r.score.overall, 0) / ranked.length),
          topScore: ranked[0]?.score.overall || 0,
          tierDistribution: {
            unicorn: ranked.filter((r) => r.tier === "unicorn").length,
            gold: ranked.filter((r) => r.tier === "gold").length,
            silver: ranked.filter((r) => r.tier === "silver").length,
            bronze: ranked.filter((r) => r.tier === "bronze").length,
          },
        },
      });
    } catch (error) {
      console.error("Ranking error:", error);
      res.status(500).json({ error: "Failed to rank resumes" });
    }
  });
});

export default router;
