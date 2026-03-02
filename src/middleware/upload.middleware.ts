import multer from "multer";
import path from "path";
import fs from "fs";
import AppError from "../core/AppError";

/* ======================================================
   ENSURE UPLOAD DIRECTORY EXISTS (RENDER SAFE)
====================================================== */

const avatarDir = path.join(process.cwd(), "uploads", "avatars");

// Create directory if it doesn't exist
if (!fs.existsSync(avatarDir)) {
  fs.mkdirSync(avatarDir, { recursive: true });
}

/* ======================================================
   STORAGE CONFIG
====================================================== */

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, avatarDir); // Use absolute path
  },

  filename: (_req, file, cb) => {
    const uniqueName =
      Date.now() +
      "-" +
      Math.round(Math.random() * 1e9) +
      path.extname(file.originalname);

    cb(null, uniqueName);
  }
});

/* ======================================================
   FILE FILTER (IMAGES ONLY)
====================================================== */

const fileFilter: multer.Options["fileFilter"] = (
  _req,
  file,
  cb
) => {
  if (!file.mimetype.startsWith("image/")) {
    return cb(new AppError("Only image files allowed", 400));
  }

  cb(null, true);
};

/* ======================================================
   EXPORT MIDDLEWARE
====================================================== */

export const uploadAvatar = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 2 * 1024 * 1024 // 2MB
  }
}).single("avatar");