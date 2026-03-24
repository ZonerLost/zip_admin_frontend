import { Router } from "express";
import authRoutes from "./auth.routes";
import userRoutes from "./user.routes";
import itemRoutes from "./item.routes";

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

export default router;