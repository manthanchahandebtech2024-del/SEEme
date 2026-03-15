import { ResumeData, ScoreBreakdown, PowerMove, CandidateResult } from "../utils/types";
import { AIAnalysisResult } from "./IAIProvider";

export interface IScoreAnalyzer {
  readonly name: string;
  readonly weight: number;
  analyze(resume: ResumeData, jdText: string, aiResult?: AIAnalysisResult): Promise<{
    score: number;
    details: Record<string, unknown>;
  }>;
}

export interface IScoringEngine {
  scoreResume(resume: ResumeData, jdText: string): Promise<CandidateResult>;
  rankCandidates(resumes: ResumeData[], jdText: string): Promise<CandidateResult[]>;
}

export interface IPowerMoveGenerator {
  generate(score: ScoreBreakdown, requiredSkills: string[], aiResult?: AIAnalysisResult): PowerMove[];
}
