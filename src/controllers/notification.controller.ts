import { Request, Response, NextFunction } from "express";
import { NotificationService } from "../services/notification.service";
import { sendSuccess } from "../helpers/response.helper";

const notificationService = new NotificationService();

export class NotificationController {
  async getMyNotifications(req: Request, res: Response, next: NextFunction) {
    try {
      const { page, limit } = req.query;
      const result = await notificationService.getMyNotifications(
        req.user!.userId,
        Number(page) || 1,
        Number(limit) || 20
      );
      sendSuccess(res, "Notifications retrieved", result.notifications, 200, result.pagination);
    } catch (err) { next(err); }
  }

  async markOneRead(req: Request, res: Response, next: NextFunction) {
    try {
      const notification = await notificationService.markOneRead(
        String(req.params.id),
        req.user!.userId
      );
      sendSuccess(res, "Notification marked as read", notification);
    } catch (err) { next(err); }
  }

  async markAllRead(req: Request, res: Response, next: NextFunction) {
    try {
      await notificationService.markAllRead(req.user!.userId);
      sendSuccess(res, "All notifications marked as read");
    } catch (err) { next(err); }
  }

  async deleteOne(req: Request, res: Response, next: NextFunction) {
    try {
      await notificationService.deleteOne(String(req.params.id), req.user!.userId);
      sendSuccess(res, "Notification deleted");
    } catch (err) { next(err); }
  }

  async saveFCMToken(req: Request, res: Response, next: NextFunction) {
    try {
      await notificationService.saveFCMToken(req.user!.userId, req.body.token);
      sendSuccess(res, "FCM token saved");
    } catch (err) { next(err); }
  }
}