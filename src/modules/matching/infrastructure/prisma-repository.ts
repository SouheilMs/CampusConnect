import { prisma } from '@/infrastructure/persistence/prisma';
import type { MatchingRepository } from '../application/ports';

export class PrismaMatchingRepository implements MatchingRepository {
  async getMatchingData(userId: string) {
    const [requests, users] = await Promise.all([
      prisma.helpRequest.findMany({
        where: { status: 'OPEN', hidden: false },
        select: { id: true, title: true, level: true, availability: true, subject: { select: { name: true } } },
      }),
      prisma.user.findMany({
        where: { id: { not: userId }, status: 'ACTIVE' },
        select: {
          id: true,
          name: true,
          profile: {
            select: { specialty: true, level: true, skills: true, availabilities: true, averageRating: true },
          },
        },
      }),
    ]);
    const candidates = users.flatMap(user => user.profile ? [{
      id: user.id,
      name: user.name,
      specialty: user.profile.specialty,
      level: user.profile.level,
      skills: user.profile.skills.map(skill => skill.name),
      availability: user.profile.availabilities.map(item => `${item.day} ${item.startTime}-${item.endTime}`),
      averageRating: user.profile.averageRating,
    }] : []);
    return { requests, candidates };
  }
}
