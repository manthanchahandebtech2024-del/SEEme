import { PrismaClient } from "@prisma/client";
import { IBadgeRepository } from "../interfaces/IRepository";

export class BadgeRepository implements IBadgeRepository {
  constructor(private prisma: PrismaClient) {}

  async getByUser(userId: string) {
    return this.prisma.badge.findMany({
      where: { userId },
      select: { badgeId: true, earnedAt: true },
    });
  }

  async award(userId: string, badgeId: string) {
    await this.prisma.badge.upsert({
      where: { userId_badgeId: { userId, badgeId } },
      create: { userId, badgeId },
      update: {},
    });
  }
}
