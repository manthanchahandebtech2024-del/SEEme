export interface ResumeData {
  id: string;
  rawText: string;
  anonymizedText: string;
  skills: string[];
  experience: ExperienceEntry[];
  education: EducationEntry[];
  yearsOfExperience: number;
  fileName: string;
}

export interface ExperienceEntry {
  title: string;
  duration: string;
  keywords: string[];
}

export interface EducationEntry {
  degree: string;
  field: string;
}

export interface JobDescription {
  rawText: string;
  requiredSkills: string[];
  preferredSkills: string[];
  requiredExperience: number;
  keywords: string[];
  title: string;
}

export interface ScoreBreakdown {
  overall: number;
  skillsMatch: { score: number; matched: string[]; missing: string[]; weight: number };
  experienceMatch: { score: number; details: string; weight: number };
  educationMatch: { score: number; details: string; weight: number };
  keywordDensity: { score: number; found: string[]; total: number; weight: number };
  semanticMatch?: { score: number; insights: string[]; weight: number };
}

export interface PowerMove {
  id: number;
  category: "skill" | "experience" | "keyword" | "format" | "semantic";
  action: string;
  impact: "high" | "medium" | "low";
  xpReward: number;
}

export interface CandidateResult {
  id: string;
  fileName: string;
  score: ScoreBreakdown;
  powerMoves: PowerMove[];
  biasFlags: BiasFlag[];
  tier: Tier;
  aiRewriteSuggestions?: string[];
}

export interface BiasFlag {
  type: string;
  description: string;
  severity: "info" | "warning" | "critical";
}

export interface DiffResult {
  original: string;
  improved: string;
  changes: DiffChange[];
}

export interface DiffChange {
  type: "added" | "removed" | "unchanged";
  value: string;
  reason?: string;
}

export type Tier = "bronze" | "silver" | "gold" | "unicorn";

export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
}

export interface GameProfile {
  userId: string;
  totalXP: number;
  level: number;
  tier: Tier;
  streak: number;
  lastActivity: string;
  analysisCount: number;
}

export interface AnalysisJob {
  id: string;
  userId?: string;
  resumeText: string;
  jobDescription: string;
  fileName: string;
  status: "pending" | "processing" | "completed" | "failed";
  result?: CandidateResult;
  error?: string;
}
