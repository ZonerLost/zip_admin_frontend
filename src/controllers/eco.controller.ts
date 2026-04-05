import { Request, Response, NextFunction } from "express";
import { EcoService } from "../services/eco.service";
import { sendSuccess } from "../helpers/response.helper";

const ecoService = new EcoService();

export class EcoController {
  async getMyImpact(req: Request, res: Response, next: NextFunction) {
    try {
      const period = req.query.period as "month" | "year" | undefined;
      const impact = await ecoService.getMyImpact(req.user!.userId, period);
      sendSuccess(res, "Eco impact retrieved", impact);
    } catch (err) { next(err); }
  }

  async getBookingImpact(req: Request, res: Response, next: NextFunction) {
    try {
      const impact = await ecoService.getBookingImpact(
        String(req.params.bookingId),
        req.user!.userId
      );
      sendSuccess(res, "Booking eco impact retrieved", impact);
    } catch (err) { next(err); }
  }

  async getUserLeaderboard(req: Request, res: Response, next: NextFunction) {
    try {
      const limit = Math.min(Number(req.query.limit) || 10, 50);
      const leaderboard = await ecoService.getUserLeaderboard(limit);
      sendSuccess(res, "User leaderboard retrieved", leaderboard);
    } catch (err) { next(err); }
  }

  async getCityLeaderboard(req: Request, res: Response, next: NextFunction) {
    try {
      const limit = Math.min(Number(req.query.limit) || 10, 50);
      const leaderboard = await ecoService.getCityLeaderboard(limit);
      sendSuccess(res, "City leaderboard retrieved", leaderboard);
    } catch (err) { next(err); }
  }

  async getCategories(_req: Request, res: Response, next: NextFunction) {
    try {
      const categories = ecoService.getCategories();
      sendSuccess(res, "CO₂ categories retrieved", categories);
    } catch (err) { next(err); }
  }
}