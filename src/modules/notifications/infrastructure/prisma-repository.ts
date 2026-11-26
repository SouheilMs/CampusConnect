import { prisma } from '@/infrastructure/persistence/prisma';
import type { NotificationRepository } from '../application/ports';

export class PrismaNotificationRepository implements NotificationRepository {
  async getNotifications(userId: string) {
    return prisma.notification.findMany({ where: { recipientId: userId }, orderBy: { createdAt: 'desc' } });
  }

  async markAllNotificationsRead(userId: string) {
    await prisma.notification.updateMany({ where: { recipientId: userId }, data: { read: true } });
  }

  async markNotificationRead(notificationId: string, userId: string) {
    await prisma.notification.updateMany({
      where: { id: notificationId, recipientId: userId },
      data: { read: true },
    });
  }
}
