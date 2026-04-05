import { Router } from "express";
import { NotificationController } from "../controllers/notification.controller";
import { authenticate } from "../middleware/auth.middleware";
import { validate } from "../middleware/validate.middleware";
import Joi from "joi";

const router = Router();
const ctrl = new NotificationController();

const fcmTokenSchema = Joi.object({
  token: Joi.string().required(),
});

const paginationSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(50).default(20),
});

router.use(authenticate);

router.get("/", validate(paginationSchema, "query"), ctrl.getMyNotifications.bind(ctrl));
router.put("/read-all", ctrl.markAllRead.bind(ctrl));
router.put("/:id/read", ctrl.markOneRead.bind(ctrl));
router.delete("/:id", ctrl.deleteOne.bind(ctrl));

// FCM token — mounted on /users in user routes
export const saveFCMTokenHandler = [
  authenticate,
  validate(fcmTokenSchema),
  ctrl.saveFCMToken.bind(ctrl),
];

export default router;