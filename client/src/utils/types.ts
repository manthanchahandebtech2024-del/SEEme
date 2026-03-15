export interface ScoreBreakdown {
  overall: number;
  skillsMatch: { score: number; matched: string[]; missing: string[]; weight: number };
  experienceMatch: { score: number; details: string; weight: number };
  educationMatch: { score: number; details: string; weight: number };
  keywordDensity: { score: number; found: string[]; total: number; weight: number };
}

export interface PowerMove {
  id: number;
  category: "skill" | "experience" | "keyword" | "format";
  action: string;
  impact: "high" | "medium" | "low";
  xpReward: number;
}

export interface BiasFlag {
  type: string;
  description: string;
  severity: "info" | "warning" | "critical";
}

export interface CandidateResult {
  id: string;
  fileName: string;
  score: ScoreBreakdown;
  powerMoves: PowerMove[];
  biasFlags: BiasFlag[];
  tier: Tier;
}

export interface DiffChange {
  type: "added" | "removed" | "unchanged";
  value: string;
  reason?: string;
}

export interface AnalysisResponse {
  success: boolean;
  result: CandidateResult;
  diff: { original: string; improved: string; changes: DiffChange[] };
  xpEarned: number;
  jdParsed: { title: string; requiredSkills: string[]; preferredSkills: string[] };
}

export interface RankingResponse {
  success: boolean;
  totalCandidates: number;
  results: CandidateResult[];
  summary: {
    averageScore: number;
    topScore: number;
    tierDistribution: Record<Tier, number>;
  };
}

export type Tier = "bronze" | "silver" | "gold" | "unicorn";

export interface GameState {
  totalXP: number;
  level: number;
  tier: Tier;
  streak: number;
  lastActivity: string;
  analysisCount: number;
  badges: Badge[];
}

export interface Badge {
  id: string;
  name: string;
  icon: string;
  description: string;
  earned: boolean;
  earnedAt?: string;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}
