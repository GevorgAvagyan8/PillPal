import multer from "multer";
import { config } from "../config";

const ALLOWED_MIME_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"]);

export const uploadPhoto = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: config.maxUploadMb * 1024 * 1024 },
  fileFilter: (_req, file, callback) => {
    if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
      callback(new Error("UNSUPPORTED_FILE_TYPE"));
      return;
    }
    callback(null, true);
  },
}).single("photo");
