import { Router } from "express";
import { EcoController } from "../controllers/eco.controller";
import { authenticate } from "../middleware/auth.middleware";

const router = Router();
const ctrl = new EcoController();

// Public
router.get("/categories", ctrl.getCategories.bind(ctrl));
router.get("/leaderboard/users", ctrl.getUserLeaderboard.bind(ctrl));
router.get("/leaderboard/cities", ctrl.getCityLeaderboard.bind(ctrl));

// Protected
router.use(authenticate);
router.get("/my-impact", ctrl.getMyImpact.bind(ctrl));
router.get("/booking/:bookingId", ctrl.getBookingImpact.bind(ctrl));

export default router;