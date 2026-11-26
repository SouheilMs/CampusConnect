import { prisma } from '@/infrastructure/persistence/prisma';
import type { DashboardQueries } from '../application/ports';

export class PrismaDashboardQueries implements DashboardQueries {
  async getDashboard(userId: string) {
    const [requestCount, proposalCount, receivedProposalCount, sessions, notifications, profile] = await Promise.all([
      prisma.helpRequest.count({ where: { authorId: userId } }),
      prisma.helpProposal.count({ where: { studentId: userId } }),
      prisma.helpProposal.count({ where: { request: { authorId: userId }, status: 'PENDING' } }),
      prisma.studySession.findMany({
        where: { OR: [{ ownerId: userId }, { helpingStudentId: userId }] },
        include: { request: true },
        orderBy: { date: 'asc' },
      }),
      prisma.notification.findMany({ where: { recipientId: userId }, orderBy: { createdAt: 'desc' }, take: 4 }),
      prisma.studentProfile.findUnique({ where: { userId } }),
    ]);
    return {
      requestCount,
      proposalCount,
      receivedProposalCount,
      sessions,
      notifications,
      averageRating: profile?.averageRating ?? null,
    };
  }
}
