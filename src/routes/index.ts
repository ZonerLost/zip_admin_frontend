import { Router } from "express";
import authRoutes from "./auth.routes";
import userRoutes from "./user.routes";
import itemRoutes from "./item.routes";
import bookingRoutes from "./booking.routes";
import reviewRoutes from "./review.routes";
import chatRoutes from "./chat.routes";
import ecoRoutes from "./eco.routes";

const router = Router();

router.get("/health", (_, res) => {
  res.json({
    success: true,
    message: "Zonerlost API is running",
    timestamp: new Date().toISOString(),
    version: "1.0.0",
  });
});

router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/items", itemRoutes);
router.use("/bookings", bookingRoutes);
router.use("/reviews", reviewRoutes);
router.use("/chats", chatRoutes);
router.use("/eco", ecoRoutes);
export default router;