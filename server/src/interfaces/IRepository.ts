import { UserProfile, GameProfile } from "../utils/types";

export interface IUserRepository {
  create(email: string, passwordHash: string, name: string): Promise<UserProfile>;
  findByEmail(email: string): Promise<(UserProfile & { passwordHash: string }) | null>;
  findById(id: string): Promise<UserProfile | null>;
}

export interface IAnalysisRepository {
  saveAnalysis(data: {
    userId?: string;
    fileName: string;
    resumeText: string;
    jobDescription: string;
    score: number;
    breakdown: string;
    tier: string;
  }): Promise<string>;
  getAnalysesByUser(userId: string, limit?: number): Promise<Array<{
    id: string;
    fileName: string;
    score: number;
    tier: string;
    createdAt: Date;
  }>>;
  getAnalysisById(id: string): Promise<{
    id: string;
    fileName: string;
    resumeText: string;
    jobDescription: string;
    score: number;
    breakdown: string;
    tier: string;
    createdAt: Date;
  } | null>;
}

export interface IGameProfileRepository {
  getOrCreate(userId: string): Promise<GameProfile>;
  update(userId: string, profile: Partial<GameProfile>): Promise<GameProfile>;
}

export interface IBadgeRepository {
  getByUser(userId: string): Promise<Array<{ badgeId: string; earnedAt: Date }>>;
  award(userId: string, badgeId: string): Promise<void>;
}
