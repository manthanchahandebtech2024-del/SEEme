import { GameProfile, Tier } from "../utils/types";

export interface BadgeDefinition {
  id: string;
  name: string;
  icon: string;
  description: string;
  condition: (profile: GameProfile) => boolean;
}

export interface IGamificationService {
  getProfile(userId: string): Promise<GameProfile>;
  addXP(userId: string, amount: number): Promise<{ profile: GameProfile; newBadges: string[] }>;
  recordAnalysis(userId: string): Promise<{ profile: GameProfile; newBadges: string[] }>;
  getBadges(userId: string): Promise<{ id: string; earned: boolean; earnedAt?: string }[]>;
  calculateTier(xp: number): Tier;
  calculateLevel(xp: number): number;
  calculateXPReward(score: number): number;
}
