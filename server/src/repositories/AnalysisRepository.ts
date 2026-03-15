import { PrismaClient } from "@prisma/client";
import { IAnalysisRepository } from "../interfaces/IRepository";

export class AnalysisRepository implements IAnalysisRepository {
  constructor(private prisma: PrismaClient) {}

  async saveAnalysis(data: {
    userId?: string;
    fileName: string;
    resumeText: string;
    jobDescription: string;
    score: number;
    breakdown: string;
    tier: string;
  }): Promise<string> {
    const analysis = await this.prisma.analysis.create({ data });
    return analysis.id;
  }

  async getAnalysesByUser(userId: string, limit = 20) {
    return this.prisma.analysis.findMany({
      where: { userId },
      select: { id: true, fileName: true, score: true, tier: true, createdAt: true },
      orderBy: { createdAt: "desc" },
      take: limit,
    });
  }

  async getAnalysisById(id: string) {
    return this.prisma.analysis.findUnique({ where: { id } });
  }
}
