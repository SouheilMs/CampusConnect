import { prisma } from '@/infrastructure/persistence/prisma';
import type { ModerationRepository } from '../application/ports';

export class PrismaModerationRepository implements ModerationRepository {
  async findReportedRequest(requestId: string) {
    return prisma.helpRequest.findUnique({
      where: { id: requestId },
      select: { authorId: true, hidden: true },
    });
  }

  async createReport(input: Parameters<ModerationRepository['createReport']>[0]) {
    await prisma.report.create({ data: input });
  }

  async getAdminData() {
    const [users, requestCount, reports] = await Promise.all([
      prisma.user.findMany({
        select: { id: true, name: true, email: true, role: true, status: true },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.helpRequest.count(),
      prisma.report.findMany({
        select: {
          id: true,
          requestId: true,
          reporterId: true,
          reason: true,
          status: true,
          request: { select: { title: true } },
          reporter: { select: { name: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
    ]);
    return {
      users,
      requestCount,
      reports,
    };
  }

  async getAccountStatus(userId: string) {
    const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
    return user.status;
  }

  async updateAccountStatus(input: Parameters<ModerationRepository['updateAccountStatus']>[0]) {
    await prisma.$transaction([
      prisma.user.update({ where: { id: input.userId }, data: { status: input.status } }),
      prisma.notification.create({
        data: {
          recipientId: input.userId,
          type: 'ACCOUNT_STATUS',
          message: input.notificationMessage,
        },
      }),
    ]);
  }

  async getReportForResolution(reportId: string) {
    const report = await prisma.report.findUniqueOrThrow({ where: { id: reportId } });
    return { reporterId: report.reporterId, requestId: report.requestId };
  }

  async resolveReport(input: Parameters<ModerationRepository['resolveReport']>[0]) {
    await prisma.$transaction(async tx => {
      await tx.report.update({ where: { id: input.reportId }, data: { status: 'RESOLVED', moderatorId: input.moderatorId } });
      if (input.hiddenRequestId) {
        await tx.helpRequest.update({ where: { id: input.hiddenRequestId }, data: { hidden: true } });
      }
      await tx.notification.create({
        data: {
          recipientId: input.reporterId,
          type: 'REPORT_MODERATED',
          message: input.notificationMessage,
        },
      });
    });
  }
}
