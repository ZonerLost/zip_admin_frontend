import multer from "multer";
import { CONSTANTS } from "../config/constants";

const storage = multer.memoryStorage();

const fileFilter = (
  _req: Express.Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  if (CONSTANTS.ALLOWED_IMAGE_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only JPEG, PNG and WebP images are allowed"));
  }
};

export const upload = multer({
  storage,
  limits: { fileSize: CONSTANTS.MAX_FILE_SIZE },
  fileFilter,
});