import { prisma } from '@/infrastructure/persistence/prisma';
import type { RequestRepository } from '../application/ports';

export class PrismaRequestRepository implements RequestRepository {
  async listRequests(filters: Parameters<RequestRepository['listRequests']>[0]) {
    const keyword = filters.keyword?.trim();
    return prisma.helpRequest.findMany({
      where: {
        hidden: false,
        AND: [
          keyword
            ? { OR: [{ title: { contains: keyword, mode: 'insensitive' } }, { description: { contains: keyword, mode: 'insensitive' } }] }
            : {},
          { subject: { name: filters.subject || undefined } },
          { level: filters.level || undefined },
          { status: filters.status as 'OPEN' | 'HELP_ACCEPTED' | 'COMPLETED' | undefined },
        ],
      },
      include: { subject: true, author: { select: { name: true } }, _count: { select: { proposals: true } } },
      orderBy: { createdAt: filters.sort === 'oldest' ? 'asc' : 'desc' },
      take: 20,
    });
  }

  async listSubjects() {
    return prisma.subject.findMany({ orderBy: { name: 'asc' } });
  }

  async getRequestDetails(id: string, viewerId: string) {
    const request = await prisma.helpRequest.findUnique({
      where: { id },
      include: { subject: true, author: { select: { name: true } } },
    });
    if (!request) return null;

    const proposals = !request.hidden && request.authorId === viewerId
      ? await prisma.helpProposal.findMany({
        where: { requestId: id },
        select: { id: true, status: true, message: true, student: { select: { name: true } } },
        orderBy: { createdAt: 'desc' },
      })
      : [];
    return { ...request, proposals };
  }

  async createRequest(input: Parameters<RequestRepository['createRequest']>[0]) {
    const { subject, ...request } = input;
    const subjectRecord = await prisma.subject.upsert({
      where: { name: subject },
      update: {},
      create: { name: subject },
    });
    await prisma.helpRequest.create({
      data: { ...request, subjectId: subjectRecord.id },
    });
  }
}
