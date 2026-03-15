import { IScoringEngine, IScoreAnalyzer, IPowerMoveGenerator } from "../../interfaces/IScoringEngine";
import { IAIProvider, AIAnalysisResult } from "../../interfaces/IAIProvider";
import { IBiasDetector } from "../../interfaces/IBiasDetector";
import { ResumeData, ScoreBreakdown, CandidateResult, Tier, PowerMove } from "../../utils/types";
import { createLogger } from "../../utils/logger";

const logger = createLogger("ScoringPipeline");

export class PowerMoveGenerator implements IPowerMoveGenerator {
  generate(score: ScoreBreakdown, _requiredSkills: string[], aiResult?: AIAnalysisResult): PowerMove[] {
    const moves: PowerMove[] = [];
    let id = 1;

    if (score.skillsMatch.missing.length > 0) {
      moves.push({ id: id++, category: "skill", action: `Add missing skills: ${score.skillsMatch.missing.slice(0, 3).join(", ")}. Make them explicit in your experience.`, impact: "high", xpReward: 50 });
    }
    if (score.experienceMatch.score < 70) {
      moves.push({ id: id++, category: "experience", action: "Quantify achievements with metrics (e.g., 'Increased performance by 40%').", impact: "high", xpReward: 40 });
    }
    if (score.keywordDensity.score < 60) {
      moves.push({ id: id++, category: "keyword", action: "Mirror the job description's language. Use exact phrases from the posting.", impact: "medium", xpReward: 30 });
    }
    if (aiResult?.rewriteSuggestions) {
      for (const suggestion of aiResult.rewriteSuggestions.slice(0, 2)) {
        moves.push({ id: id++, category: "semantic", action: suggestion, impact: "high", xpReward: 35 });
      }
    }
    moves.push({ id: id++, category: "format", action: "Start each bullet with a strong action verb (Built, Designed, Led, Optimized) followed by measurable impact.", impact: score.overall < 60 ? "high" : "low", xpReward: 20 });
    if (score.overall < 50) {
      moves.push({ id: id++, category: "experience", action: "Add a 'Projects' section with relevant side projects, open source, or certifications.", impact: "high", xpReward: 35 });
    }
    return moves.slice(0, 5);
  }
}

export class ScoringPipeline implements IScoringEngine {
  private analyzers: IScoreAnalyzer[];
  private aiProvider: IAIProvider;
  private biasDetector: IBiasDetector;
  private powerMoveGen: IPowerMoveGenerator;

  constructor(analyzers: IScoreAnalyzer[], aiProvider: IAIProvider, biasDetector: IBiasDetector) {
    this.analyzers = analyzers;
    this.aiProvider = aiProvider;
    this.biasDetector = biasDetector;
    this.powerMoveGen = new PowerMoveGenerator();
  }

  async scoreResume(resume: ResumeData, jdText: string): Promise<CandidateResult> {
    let aiResult: AIAnalysisResult | undefined;
    try {
      aiResult = await this.aiProvider.analyzeResumeVsJD(resume.anonymizedText, jdText);
    } catch (err) {
      logger.warn("AI analysis failed, continuing without semantic layer", err);
    }

    const { flags: biasFlags } = this.biasDetector.stripIdentifiers(resume.rawText);
    try {
      const subtleBias = await this.biasDetector.detectSubtleBias(resume.rawText);
      biasFlags.push(...subtleBias);
    } catch {}

    const results = await Promise.all(
      this.analyzers.map((a) =>
        a.analyze(resume, jdText, aiResult).then((r) => ({ name: a.name, weight: a.weight, ...r }))
      )
    );

    const activeResults = results.filter((r) => r.score > 0 || r.name !== "semantic");
    const totalWeight = activeResults.reduce((sum, r) => sum + r.weight, 0);
    const overall = Math.round(activeResults.reduce((sum, r) => sum + r.score * r.weight, 0) / (totalWeight || 1));

    const get = (name: string) => results.find((r) => r.name === name)!;
    const skills = get("skills");
    const exp = get("experience");
    const edu = get("education");
    const kw = get("keywords");
    const sem = results.find((r) => r.name === "semantic");

    const scoreBreakdown: ScoreBreakdown = {
      overall,
      skillsMatch: { score: skills.score, matched: (skills.details as any).matched || [], missing: (skills.details as any).missing || [], weight: skills.weight },
      experienceMatch: { score: exp.score, details: (exp.details as any).description || "", weight: exp.weight },
      educationMatch: { score: edu.score, details: (edu.details as any).description || "", weight: edu.weight },
      keywordDensity: { score: kw.score, found: (kw.details as any).found || [], total: (kw.details as any).total || 0, weight: kw.weight },
      ...(sem && sem.score > 0 ? { semanticMatch: { score: sem.score, insights: (sem.details as any).insights || [], weight: sem.weight } } : {}),
    };

    const powerMoves = this.powerMoveGen.generate(scoreBreakdown, [], aiResult);
    const tier = this.calculateTier(overall);

    return {
      id: resume.id,
      fileName: resume.fileName,
      score: scoreBreakdown,
      powerMoves,
      biasFlags,
      tier,
      aiRewriteSuggestions: aiResult?.rewriteSuggestions,
    };
  }

  async rankCandidates(resumes: ResumeData[], jdText: string): Promise<CandidateResult[]> {
    const results = await Promise.all(resumes.map((r) => this.scoreResume(r, jdText)));
    return results.sort((a, b) => b.score.overall - a.score.overall);
  }

  private calculateTier(score: number): Tier {
    if (score >= 90) return "unicorn";
    if (score >= 75) return "gold";
    if (score >= 55) return "silver";
    return "bronze";
  }
}
