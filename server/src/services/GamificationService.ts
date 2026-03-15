import { IGamificationService, BadgeDefinition } from "../interfaces/IGamificationService";
import { IGameProfileRepository, IBadgeRepository } from "../interfaces/IRepository";
import { GameProfile, Tier } from "../utils/types";
import { EventBus } from "../events/EventBus";

const BADGES: BadgeDefinition[] = [
  { id: "first_scan", name: "First Scan", icon: "Scan", description: "Analyze your first resume", condition: (p) => p.analysisCount >= 1 },
  { id: "triple_threat", name: "Triple Threat", icon: "Zap", description: "Analyze 3 resumes", condition: (p) => p.analysisCount >= 3 },
  { id: "power_user", name: "Power User", icon: "Flame", description: "Analyze 10 resumes", condition: (p) => p.analysisCount >= 10 },
  { id: "silver_tier", name: "Silver Achiever", icon: "Award", description: "Reach Silver tier", condition: (p) => ["silver", "gold", "unicorn"].includes(p.tier) },
  { id: "gold_tier", name: "Gold Standard", icon: "Trophy", description: "Reach Gold tier", condition: (p) => ["gold", "unicorn"].includes(p.tier) },
  { id: "unicorn", name: "Unicorn Status", icon: "Star", description: "Reach Unicorn tier", condition: (p) => p.tier === "unicorn" },
  { id: "streak_3", name: "On Fire", icon: "Flame", description: "3-day streak", condition: (p) => p.streak >= 3 },
  { id: "streak_7", name: "Unstoppable", icon: "Target", description: "7-day streak", condition: (p) => p.streak >= 7 },
];

export class GamificationService implements IGamificationService {
  constructor(
    private profileRepo: IGameProfileRepository,
    private badgeRepo: IBadgeRepository,
    private eventBus: EventBus
  ) {}

  async getProfile(userId: string): Promise<GameProfile> {
    return this.profileRepo.getOrCreate(userId);
  }

  async addXP(userId: string, amount: number) {
    const profile = await this.profileRepo.getOrCreate(userId);
    const totalXP = profile.totalXP + amount;
    const tier = this.calculateTier(totalXP);
    const level = this.calculateLevel(totalXP);
    const updated = await this.profileRepo.update(userId, { totalXP, tier, level });
    const newBadges = await this.checkBadges(userId, updated);
    if (newBadges.length > 0) this.eventBus.emit("badges:earned", { userId, badges: newBadges });
    return { profile: updated, newBadges };
  }

  async recordAnalysis(userId: string) {
    const profile = await this.profileRepo.getOrCreate(userId);
    const today = new Date().toDateString();
    const lastDay = profile.lastActivity ? new Date(profile.lastActivity).toDateString() : "";
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    let streak = profile.streak;
    if (lastDay === yesterday) streak += 1;
    else if (lastDay !== today) streak = 1;

    const updated = await this.profileRepo.update(userId, { analysisCount: profile.analysisCount + 1, streak, lastActivity: today });
    const newBadges = await this.checkBadges(userId, updated);
    this.eventBus.emit("analysis:recorded", { userId, count: updated.analysisCount });
    return { profile: updated, newBadges };
  }

  async getBadges(userId: string) {
    const earned = await this.badgeRepo.getByUser(userId);
    const earnedMap = new Map(earned.map((b) => [b.badgeId, b.earnedAt]));
    return BADGES.map((b) => ({
      id: b.id, name: b.name, icon: b.icon, description: b.description,
      earned: earnedMap.has(b.id),
      earnedAt: earnedMap.get(b.id)?.toISOString(),
    }));
  }

  calculateTier(xp: number): Tier {
    if (xp >= 600) return "unicorn";
    if (xp >= 300) return "gold";
    if (xp >= 100) return "silver";
    return "bronze";
  }

  calculateLevel(xp: number): number { return Math.floor(xp / 50) + 1; }
  calculateXPReward(score: number): number { return 25 + Math.floor(score / 10) * 5; }

  private async checkBadges(userId: string, profile: GameProfile): Promise<string[]> {
    const earned = await this.badgeRepo.getByUser(userId);
    const earnedIds = new Set(earned.map((b) => b.badgeId));
    const newBadges: string[] = [];
    for (const badge of BADGES) {
      if (!earnedIds.has(badge.id) && badge.condition(profile)) {
        await this.badgeRepo.award(userId, badge.id);
        newBadges.push(badge.id);
      }
    }
    return newBadges;
  }
}
