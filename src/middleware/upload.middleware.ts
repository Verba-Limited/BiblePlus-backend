import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import AppError from "../core/AppError";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => ({
    folder: "avatars",
    // ✅ Use public_id so re-uploads REPLACE the old image, not create a new one
    public_id: `avatar_${req.userId}`,
    format: "webp", // ✅ correct key (not allowed_formats)
    transformation: [{ width: 500, height: 500, crop: "fill", gravity: "face" }],
  }),
});

const fileFilter: multer.Options["fileFilter"] = (_req, file, cb) => {
  if (!file.mimetype.startsWith("image/")) {
    return cb(new AppError("Only image files allowed", 400));
  }
  cb(null, true);
};

// Add this to your existing upload.middleware.ts
const bookCoverStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "book-covers",
    format: async () => "webp",
    transformation: [{ width: 400, height: 600, crop: "fill" }],
  } as any,
});

export const uploadBookCover = multer({
  storage: bookCoverStorage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
}).single("coverImage");