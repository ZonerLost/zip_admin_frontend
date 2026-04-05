import { Router } from "express";
import { DashboardController } from "../controllers/dashboard.controller";
import { authenticate } from "../middleware/auth.middleware";

const router = Router();
const ctrl = new DashboardController();

router.use(authenticate);
router.get("/", ctrl.getDashboard.bind(ctrl));

export default router;