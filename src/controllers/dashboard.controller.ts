// dashboard.controller.ts
import { Request, Response, NextFunction } from "express";
import { DashboardService } from "../services/dashboard.service";
import { sendSuccess } from "../helpers/response.helper";

const dashboardService = new DashboardService();

export class DashboardController {
  async getDashboard(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await dashboardService.getUserDashboard(req.user!.userId);
      sendSuccess(res, "Dashboard retrieved", data);
    } catch (err) { next(err); }
  }
}