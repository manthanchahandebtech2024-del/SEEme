import { PrismaClient } from "@prisma/client";
import { IUserRepository } from "../interfaces/IRepository";
import { UserProfile } from "../utils/types";

export class UserRepository implements IUserRepository {
  constructor(private prisma: PrismaClient) {}

  async create(email: string, passwordHash: string, name: string): Promise<UserProfile> {
    const user = await this.prisma.user.create({
      data: { email, passwordHash, name },
    });
    return { id: user.id, email: user.email, name: user.name };
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async findById(id: string): Promise<UserProfile | null> {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) return null;
    return { id: user.id, email: user.email, name: user.name };
  }
}
