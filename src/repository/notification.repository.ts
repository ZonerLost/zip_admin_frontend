import { INotification, NotificationModel, NotificationType } from "../models/notification.model";

export class NotificationRepository {
  async create(data: {
    userId: string;
    type: NotificationType;
    title: string;
    body: string;
    data?: Record<string, string>;
  }): Promise<INotification> {
    return NotificationModel.create({
      user: data.userId,
      type: data.type,
      title: data.title,
      body: data.body,
      data: data.data,
    });
  }

  async findByUser(
    userId: string,
    page = 1,
    limit = 20
  ): Promise<{ notifications: INotification[]; total: number; unreadCount: number }> {
    const [notifications, total, unreadCount] = await Promise.all([
      NotificationModel.find({ user: userId })
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      NotificationModel.countDocuments({ user: userId }),
      NotificationModel.countDocuments({ user: userId, isRead: false }),
    ]);
    return { notifications, total, unreadCount };
  }

  async markOneRead(id: string, userId: string): Promise<INotification | null> {
    return NotificationModel.findOneAndUpdate(
      { _id: id, user: userId },
      { isRead: true },
      { new: true }
    );
  }

  async markAllRead(userId: string): Promise<void> {
    await NotificationModel.updateMany({ user: userId, isRead: false }, { isRead: true });
  }

  async deleteOne(id: string, userId: string): Promise<void> {
    await NotificationModel.findOneAndDelete({ _id: id, user: userId });
  }
}