import { NotificationRepository } from "../repository/notification.repository";
import { NotificationType } from "../models/notification.model";
import { UserModel } from "../models/user.model";
import { buildPagination } from "../helpers/pagination.helper";
import { AppError } from "../middleware/error.middleware";
import { HTTP_STATUS } from "../config/constants";
import { emitConversationUpdate } from "../socket";

const notificationRepo = new NotificationRepository();

export class NotificationService {
  // Core method — used internally by other services
  async send(data: {
    userId: string;
    type: NotificationType;
    title: string;
    body: string;
    data?: Record<string, string>;
  }): Promise<void> {
    const notification = await notificationRepo.create(data);

    // Emit real-time notification via Socket.io
    emitConversationUpdate(data.userId, {
      type: "notification",
      notification,
    });

    // TODO: Send FCM push notification
    // FCM integration pending — store token is ready via /users/fcm-token
    // Will be implemented when FCM credentials are provided by client
    this.sendFCMPush(data.userId, data.title, data.body, data.data).catch(() => {});
  }

  // Placeholder — implement when FCM server key is available
  private async sendFCMPush(
    userId: string,
    title: string,
    body: string,
    data?: Record<string, string>
  ): Promise<void> {
    const user = await UserModel.findById(userId).select("fcmToken");
    if (!user || !(user as any).fcmToken) return;
    // TODO: implement FCM push using firebase-admin
    // firebase.messaging().send({ token: user.fcmToken, notification: { title, body }, data })
  }

  async getMyNotifications(userId: string, page = 1, limit = 20) {
    const { notifications, total, unreadCount } =
      await notificationRepo.findByUser(userId, page, limit);
    return {
      notifications,
      unreadCount,
      pagination: buildPagination(total, page, limit),
    };
  }

  async markOneRead(notificationId: string, userId: string) {
    const notification = await notificationRepo.markOneRead(notificationId, userId);
    if (!notification) {
      throw new AppError("Notification not found", HTTP_STATUS.NOT_FOUND);
    }
    return notification;
  }

  async markAllRead(userId: string): Promise<void> {
    await notificationRepo.markAllRead(userId);
  }

  async deleteOne(notificationId: string, userId: string): Promise<void> {
    await notificationRepo.deleteOne(notificationId, userId);
  }

  async saveFCMToken(userId: string, token: string): Promise<void> {
    await UserModel.findByIdAndUpdate(userId, { fcmToken: token });
  }
}

// Export singleton for use across services
export const notificationService = new NotificationService();