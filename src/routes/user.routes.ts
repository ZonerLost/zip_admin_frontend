import { Router } from "express";
import { UserController } from "../controllers/user.controller";
import { authenticate } from "../middleware/auth.middleware";
import { validate } from "../middleware/validate.middleware";
import { updateProfileSchema } from "../validators/profile.validator";
import { upload } from "../middleware/upload.middleware";

const router = Router();
const ctrl = new UserController();

router.use(authenticate);

router.get("/profile", ctrl.getProfile.bind(ctrl));
router.put("/profile", validate(updateProfileSchema), ctrl.updateProfile.bind(ctrl));
router.put("/profile/photo", upload.single("photo"), ctrl.updateProfilePhoto.bind(ctrl));
router.post("/identity-verify", upload.single("document"), ctrl.uploadIdentityDocument.bind(ctrl));

export default router;