import { IScoreAnalyzer } from "../../interfaces/IScoringEngine";
import { ResumeData } from "../../utils/types";
import { AIAnalysisResult } from "../../interfaces/IAIProvider";

export class SemanticAnalyzer implements IScoreAnalyzer {
  readonly name = "semantic";
  readonly weight = 0.10;

  async analyze(_resume: ResumeData, _jdText: string, aiResult?: AIAnalysisResult) {
    if (!aiResult) return { score: 0, details: { insights: [], enabled: false } };
    return {
      score: aiResult.semanticScore,
      details: { insights: aiResult.insights, enabled: true },
    };
  }
}
