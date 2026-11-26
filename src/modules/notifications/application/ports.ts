export interface NotificationRepository {
  getNotifications(userId: string): Promise<Array<{ id: string; message: string; read: boolean; createdAt: Date }>>;
  markAllNotificationsRead(userId: string): Promise<void>;
  markNotificationRead(notificationId: string, userId: string): Promise<void>;
}
