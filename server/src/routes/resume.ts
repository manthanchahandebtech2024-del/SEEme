import { Router, Response } from "express";
import { uploadSingle } from "../middleware/upload";
import { authOptional, AuthRequest } from "../middleware/auth";
import { getContainer } from "../container";
import { parseResumeText } from "../services/parsing/textUtils";

const router = Router();

router.post("/analyze", authOptional, (req: AuthRequest, res: Response) => {
  uploadSingle(req, res, async (err) => {
    try {
      if (err) { res.status(400).json({ error: err.message }); return; }
      if (!req.file) { res.status(400).json({ error: "No resume file uploaded" }); return; }
      const jobDescription = req.body.jobDescription;
      if (!jobDescription) { res.status(400).json({ error: "Job description is required" }); return; }

      const container = getContainer();
      const parser = container.parserFactory.getParser(req.file.originalname);
      const resume = await parser.parse(req.file.buffer, req.file.originalname);
      const result = await container.scoringPipeline.scoreResume(resume, jobDescription);

      const diff = container.diffEngine.generateDiff(
        resume.rawText,
        result.powerMoves.map((m) => m.action),
        result.score.skillsMatch.missing,
        result.aiRewriteSuggestions
      );

      const xpEarned = container.gamification.calculateXPReward(result.score.overall);

      if (req.userId) {
        await container.analysisRepo.saveAnalysis({
          userId: req.userId, fileName: resume.fileName, resumeText: resume.rawText,
          jobDescription, score: result.score.overall, breakdown: JSON.stringify(result.score), tier: result.tier,
        });
        await container.gamification.addXP(req.userId, xpEarned);
        await container.gamification.recordAnalysis(req.userId);
      }

      const aiProvider = container.aiFactory.getProvider();
      const jdParsed = await aiProvider.parseJobDescription(jobDescription);

      res.json({ success: true, result, diff, xpEarned, jdParsed, aiProvider: aiProvider.name });
    } catch (error) {
      console.error("Analysis error:", error);
      res.status(500).json({ error: "Failed to analyze resume" });
    }
  });
});

router.post("/analyze-text", authOptional, async (req: AuthRequest, res: Response) => {
  try {
    const { resumeText, jobDescription } = req.body;
    if (!resumeText || !jobDescription) {
      res.status(400).json({ error: "Resume text and job description are required" });
      return;
    }

    const container = getContainer();
    const resume = parseResumeText(resumeText, "pasted-resume.txt");
    const result = await container.scoringPipeline.scoreResume(resume, jobDescription);

    const diff = container.diffEngine.generateDiff(
      resumeText,
      result.powerMoves.map((m) => m.action),
      result.score.skillsMatch.missing,
      result.aiRewriteSuggestions
    );

    const xpEarned = container.gamification.calculateXPReward(result.score.overall);

    if (req.userId) {
      await container.analysisRepo.saveAnalysis({
        userId: req.userId, fileName: "pasted-resume.txt", resumeText,
        jobDescription, score: result.score.overall, breakdown: JSON.stringify(result.score), tier: result.tier,
      });
      await container.gamification.addXP(req.userId, xpEarned);
      await container.gamification.recordAnalysis(req.userId);
    }

    const aiProvider = container.aiFactory.getProvider();
    const jdParsed = await aiProvider.parseJobDescription(jobDescription);

    res.json({ success: true, result, diff, xpEarned, jdParsed, aiProvider: aiProvider.name });
  } catch (error) {
    console.error("Analysis error:", error);
    res.status(500).json({ error: "Failed to analyze resume" });
  }
});

router.get("/history", authOptional, async (req: AuthRequest, res: Response) => {
  if (!req.userId) { res.json({ analyses: [] }); return; }
  const container = getContainer();
  const analyses = await container.analysisRepo.getAnalysesByUser(req.userId);
  res.json({ analyses });
});

export default router;
