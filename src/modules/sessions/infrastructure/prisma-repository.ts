import { prisma } from '@/infrastructure/persistence/prisma';
import type { SessionRepository } from '../application/ports';

export class PrismaSessionRepository implements SessionRepository {
  async getSessions(userId: string) {
    return prisma.studySession.findMany({
      where: { OR: [{ ownerId: userId }, { helpingStudentId: userId }] },
      include: {
        request: { select: { title: true } },
        owner: { select: { name: true } },
        helpingStudent: { select: { name: true } },
      },
      orderBy: { date: 'desc' },
    });
  }

  async completeSession(session: Parameters<SessionRepository['completeSession']>[0], notificationMessage: string) {
    await prisma.$transaction(async tx => {
      await tx.studySession.update({ where: { id: session.id }, data: { status: 'COMPLETED' } });
      await tx.helpRequest.update({ where: { id: session.requestId }, data: { status: 'COMPLETED' } });
      await tx.notification.createMany({
        data: [
          { recipientId: session.ownerId, type: 'SESSION_COMPLETED', message: notificationMessage },
          { recipientId: session.helpingStudentId, type: 'SESSION_COMPLETED', message: notificationMessage },
        ],
      });
    });
  }

  async cancelSession(session: Parameters<SessionRepository['cancelSession']>[0], notificationMessage: string) {
    await prisma.$transaction(async tx => {
      await tx.studySession.update({ where: { id: session.id }, data: { status: 'CANCELLED' } });
      await tx.notification.createMany({
        data: [
          { recipientId: session.ownerId, type: 'SESSION_CANCELLED', message: notificationMessage },
          { recipientId: session.helpingStudentId, type: 'SESSION_CANCELLED', message: notificationMessage },
        ],
      });
    });
  }

  async getCompletedSessionsForReview(userId: string) {
    return prisma.studySession.findMany({
      where: { status: 'COMPLETED', OR: [{ ownerId: userId }, { helpingStudentId: userId }] },
      include: {
        owner: { select: { id: true, name: true } },
        helpingStudent: { select: { id: true, name: true } },
        request: { select: { title: true } },
        reviews: { select: { reviewerId: true, reviewedStudentId: true } },
      },
    });
  }

  async createReview(input: Parameters<SessionRepository['createReview']>[0]) {
    const { notificationMessage, ...review } = input;
    await prisma.$transaction(async tx => {
      await tx.review.create({ data: review });
      const stats = await tx.review.aggregate({
        _avg: { rating: true },
        _count: { _all: true },
        where: { reviewedStudentId: review.reviewedStudentId },
      });
      await tx.studentProfile.updateMany({
        where: { userId: review.reviewedStudentId },
        data: { averageRating: stats._avg.rating || 0, reviewCount: stats._count._all },
      });
      await tx.notification.create({
        data: {
          recipientId: review.reviewedStudentId,
          type: 'REVIEW_RECEIVED',
          message: notificationMessage,
        },
      });
    });
  }
}
