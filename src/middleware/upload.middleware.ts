import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import AppError from "../core/AppError";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/* ======================================================
   FILE FILTER
====================================================== */
const fileFilter: multer.Options["fileFilter"] = (_req, file, cb) => {
  if (!file.mimetype.startsWith("image/")) {
    return cb(new AppError("Only image files allowed", 400));
  }
  cb(null, true);
};

/* ======================================================
   AVATAR STORAGE
====================================================== */
const avatarStorage = new CloudinaryStorage({
  cloudinary,
  params: async (req: any, file) => ({
    folder: "avatars",
    public_id: `avatar_${req.userId}`,
    format: "webp",
    transformation: [{ width: 500, height: 500, crop: "fill", gravity: "face" }],
  }),
});

export const uploadAvatar = multer({
  storage: avatarStorage,
  fileFilter,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
}).single("avatar");

/* ======================================================
   BOOK COVER STORAGE
====================================================== */
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

// Add this to upload.middleware.ts alongside uploadAvatar and uploadBookCover
const blogCoverStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "blog-covers",
    format: async () => "webp",
    transformation: [{ width: 1200, height: 630, crop: "fill" }], // ✅ OG image size
  } as any,
});

export const uploadBlogCover = multer({
  storage: blogCoverStorage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
}).single("coverImage");