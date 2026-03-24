import { Request, Response, NextFunction } from "express";
import { UserService } from "../services/user.service";
import { sendSuccess } from "../helpers/response.helper";

const userService = new UserService();

export class UserController {
  async getProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await userService.getProfile(req.user!.userId);
      sendSuccess(res, "Profile retrieved", user);
    } catch (err) { next(err); }
  }

  async updateProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await userService.updateProfile(req.user!.userId, req.body);
      sendSuccess(res, "Profile updated", user);
    } catch (err) { next(err); }
  }

  async updateProfilePhoto(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.file) {
        res.status(400).json({ success: false, message: "No file uploaded" });
        return;
      }
      const user = await userService.updateProfilePhoto(
        req.user!.userId,
        req.file.buffer,
        req.file.mimetype
      );
      sendSuccess(res, "Profile photo updated", user);
    } catch (err) { next(err); }
  }

  async uploadIdentityDocument(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.file) {
        res.status(400).json({ success: false, message: "No file uploaded" });
        return;
      }
      const result = await userService.uploadIdentityDocument(
        req.user!.userId,
        req.file.buffer,
        req.file.mimetype
      );
      sendSuccess(res, result.message);
    } catch (err) { next(err); }
  }
}