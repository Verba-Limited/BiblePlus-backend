import multer from "multer";
import path from "path";
import AppError from "../core/AppError";

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, "uploads/avatars");
  },
  filename: (_req, file, cb) => {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  }
});

const fileFilter = (
  _req: any,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  if (!file.mimetype.startsWith("image/")) {
    cb(new AppError("Only image files allowed", 400));
  } else {
    cb(null, true);
  }
};

export const uploadAvatar = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 2 * 1024 * 1024 // 2MB
  }
});