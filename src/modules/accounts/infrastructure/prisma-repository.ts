import { prisma } from '@/infrastructure/persistence/prisma';
import type { AccountRepository } from '../application/ports';

export class PrismaAccountRepository implements AccountRepository {
  async findCredentialUser(email: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return null;
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      image: user.image,
      passwordHash: user.passwordHash,
      active: user.status === 'ACTIVE',
    };
  }

  async emailExists(email: string) {
    return Boolean(await prisma.user.findUnique({ where: { email }, select: { id: true } }));
  }

  async createAccount(input: { name: string; email: string; passwordHash: string }) {
    await prisma.user.create({
      data: { ...input, profile: { create: {} } },
    });
  }

  async findSessionAccount(userId: string) {
    return prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true, image: true, role: true, status: true },
    });
  }

  async getProfile(userId: string) {
    const [user, skills] = await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        include: { profile: { include: { skills: true, availabilities: true } } },
      }),
      prisma.skill.findMany({ orderBy: { name: 'asc' } }),
    ]);
    return {
      user: user
        ? {
            name: user.name,
            profile: user.profile
              ? {
                  specialty: user.profile.specialty,
                  level: user.profile.level,
                  biography: user.profile.biography,
                  skills: user.profile.skills.map(skill => ({ name: skill.name })),
                  availabilities: user.profile.availabilities,
                }
              : null,
          }
        : null,
      skills,
    };
  }

  async saveProfile(input: Parameters<AccountRepository['saveProfile']>[0]) {
    const { userId, name, specialty, level, biography, skills } = input;
    await prisma.$transaction(async tx => {
      await tx.studentProfile.upsert({
        where: { userId },
        update: { specialty, level, biography, skills: { set: [] } },
        create: { userId, specialty, level, biography },
      });
      for (const skillName of skills) {
        const skill = await tx.skill.upsert({
          where: { name: skillName },
          update: {},
          create: { name: skillName },
        });
        await tx.studentProfile.update({
          where: { userId },
          data: { skills: { connect: { id: skill.id } } },
        });
      }
      await tx.user.update({ where: { id: userId }, data: { name } });
    });
  }
}
