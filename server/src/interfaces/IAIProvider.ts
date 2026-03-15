import { ChatMessage } from "../utils/types";

export interface AIAnalysisResult {
  semanticScore: number;
  insights: string[];
  rewriteSuggestions: string[];
  missingContextualSkills: string[];
  strengthSummary: string;
  gapSummary: string;
}

export interface AIBiasAnalysis {
  subtleBiasIndicators: string[];
  toneIssues: string[];
  recommendations: string[];
}

export interface IAIProvider {
  readonly name: string;
  readonly isAvailable: boolean;

  analyzeResumeVsJD(resumeText: string, jdText: string): Promise<AIAnalysisResult>;
  detectSubtleBias(resumeText: string): Promise<AIBiasAnalysis>;
  rewriteBulletPoints(bullets: string[], jdContext: string): Promise<string[]>;
  chat(messages: ChatMessage[], resumeContext?: string, jdContext?: string): Promise<string>;
  parseJobDescription(jdText: string): Promise<{
    title: string;
    requiredSkills: string[];
    preferredSkills: string[];
    requiredExperience: number;
    responsibilities: string[];
    companyValues: string[];
  }>;
}
