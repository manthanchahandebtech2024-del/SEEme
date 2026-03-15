import { PrismaClient } from "@prisma/client";
import { IGameProfileRepository } from "../interfaces/IRepository";
import { GameProfile } from "../utils/types";

export class GameProfileRepository implements IGameProfileRepository {
  constructor(private prisma: PrismaClient) {}

  async getOrCreate(userId: string): Promise<GameProfile> {
    let profile = await this.prisma.gameProfile.findUnique({ where: { userId } });
    if (!profile) {
      profile = await this.prisma.gameProfile.create({
        data: { userId, totalXP: 0, level: 1, tier: "bronze", streak: 0, lastActivity: "", analysisCount: 0 },
      });
    }
    return {
      userId: profile.userId,
      totalXP: profile.totalXP,
      level: profile.level,
      tier: profile.tier as GameProfile["tier"],
      streak: profile.streak,
      lastActivity: profile.lastActivity,
      analysisCount: profile.analysisCount,
    };
  }

  async update(userId: string, data: Partial<GameProfile>): Promise<GameProfile> {
    const profile = await this.prisma.gameProfile.update({
      where: { userId },
      data: {
        ...(data.totalXP !== undefined && { totalXP: data.totalXP }),
        ...(data.level !== undefined && { level: data.level }),
        ...(data.tier !== undefined && { tier: data.tier }),
        ...(data.streak !== undefined && { streak: data.streak }),
        ...(data.lastActivity !== undefined && { lastActivity: data.lastActivity }),
        ...(data.analysisCount !== undefined && { analysisCount: data.analysisCount }),
      },
    });
    return {
      userId: profile.userId,
      totalXP: profile.totalXP,
      level: profile.level,
      tier: profile.tier as GameProfile["tier"],
      streak: profile.streak,
      lastActivity: profile.lastActivity,
      analysisCount: profile.analysisCount,
    };
  }
}
