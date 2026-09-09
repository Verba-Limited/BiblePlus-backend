import { Request, Response, NextFunction } from "express";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import AppError from "../core/AppError";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const cloudinaryConfigured = Boolean(
  process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
);

/* ======================================================
   ACCEPTED IMAGE FIELD NAMES

   Different screens post the cover under different names
   ("cover", "image", "file"...). multer rejects anything
   it wasn't told about with LIMIT_UNEXPECTED_FILE, which
   surfaced as a bare 500 the moment a picture was attached.
   Accept the common aliases and normalise to req.file.
====================================================== */
const IMAGE_FIELD_ALIASES = [
  "avatar",
  "profilePicture",
  "coverImage",
  "cover",
  "coverimage",
  "cover_image",
  "image",
  "picture",
  "photo",
  "thumbnail",
  "file",
  "banner",
];

/**
 * Wrap a multer `.fields()` handler so it behaves like `.single()`:
 * the first uploaded file lands on `req.file`, whatever the client
 * named the form field, and multer errors become clean 4xx messages.
 */
const singleImage = (upload: multer.Multer, primaryField: string) => {
  const handler = upload.fields(
    IMAGE_FIELD_ALIASES.map((name) => ({ name, maxCount: 1 }))
  );

  return (req: Request, res: Response, next: NextFunction) => {
    handler(req, res, (err: any) => {
      if (err) return next(toUploadError(err));

      const files = req.files as
        | Record<string, Express.Multer.File[]>
        | undefined;

      if (files) {
        // Prefer the canonical field, then fall back to any alias
        const picked =
          files[primaryField]?.[0] ??
          IMAGE_FIELD_ALIASES.map((name) => files[name]?.[0]).find(Boolean);

        if (picked) req.file = picked;
      }

      if (req.file && !cloudinaryConfigured) {
        return next(
          new AppError(
            "Image uploads are unavailable — Cloudinary is not configured on the server",
            503
          )
        );
      }

      next();
    });
  };
};

/**
 * Turn multer's terse error codes into messages an admin can act on.
 */
export const toUploadError = (err: any) => {
  if (err instanceof AppError) return err;

  if (err instanceof multer.MulterError) {
    switch (err.code) {
      case "LIMIT_FILE_SIZE":
        return new AppError("Image is too large — maximum size is 10MB", 400);
      case "LIMIT_UNEXPECTED_FILE":
        return new AppError(
          `Unexpected file field "${err.field}". Send the image as "coverImage".`,
          400
        );
      case "LIMIT_FILE_COUNT":
        return new AppError("Too many files uploaded", 400);
      default:
        return new AppError(err.message || "Image upload failed", 400);
    }
  }

  // Cloudinary rejections arrive as plain errors with no status
  if (err && !err.statusCode) {
    const raw = err.message || err?.error?.message || "unknown error";

    // Credential problems are an ops issue, not something the caller
    // did wrong — say so plainly instead of leaving the team to guess
    // why every upload suddenly fails.
    if (/api_key|api key|signature|unauthorized|cloud_name/i.test(raw)) {
      return new AppError(
        `Image upload is misconfigured on the server (Cloudinary said: "${raw}"). ` +
          "Check CLOUDINARY_API_KEY / CLOUDINARY_API_SECRET / CLOUDINARY_CLOUD_NAME.",
        503
      );
    }

    return new AppError(`Image upload failed: ${raw}`, 502);
  }

  return err;
};

/* ======================================================
   FILE FILTER
====================================================== */
const IMAGE_EXTENSIONS = [
  ".jpg", ".jpeg", ".png", ".gif", ".webp",
  ".bmp", ".heic", ".heif", ".avif", ".svg", ".tif", ".tiff"
];

/**
 * Clients do not reliably label images. Postman sends
 * "application/octet-stream" when its file reference goes stale, and
 * some mobile uploads send it for a perfectly ordinary JPEG. Treat
 * those generic types as "unknown" and fall back to the extension
 * rather than rejecting a real image outright.
 *
 * This is no weaker than trusting the header alone — both are set by
 * the client — and Cloudinary rejects anything that is not actually
 * an image when it receives the upload.
 */
const GENERIC_MIME_TYPES = [
  "application/octet-stream",
  "binary/octet-stream",
  "application/binary",
  ""
];

const fileFilter: multer.Options["fileFilter"] = (_req, file, cb) => {
  const mime = (file.mimetype || "").toLowerCase();
  const name = (file.originalname || "").toLowerCase();
  const ext = name.includes(".") ? name.slice(name.lastIndexOf(".")) : "";

  // Properly labelled image
  if (mime.startsWith("image/")) return cb(null, true);

  // Unlabelled: decide on the extension
  if (GENERIC_MIME_TYPES.includes(mime)) {
    if (IMAGE_EXTENSIONS.includes(ext)) return cb(null, true);

    return cb(
      new AppError(
        ext
          ? `"${ext}" is not a supported image type. Allowed: ${IMAGE_EXTENSIONS.join(", ")}`
          : "Could not identify the uploaded file. Give it a file name with an image extension (.jpg, .png, .webp).",
        400
      )
    );
  }

  // Clearly labelled as something else
  return cb(
    new AppError(
      `Only image files are allowed — received "${file.mimetype}"`,
      400
    )
  );
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

export const uploadAvatar = singleImage(
  multer({
    storage: avatarStorage,
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  }),
  "avatar"
);

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

export const uploadBookCover = singleImage(
  multer({
    storage: bookCoverStorage,
    fileFilter,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  }),
  "coverImage"
);

// Add this to upload.middleware.ts alongside uploadAvatar and uploadBookCover
const blogCoverStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "blog-covers",
    format: async () => "webp",
    transformation: [{ width: 1200, height: 630, crop: "fill" }], // ✅ OG image size
  } as any,
});

export const uploadBlogCover = singleImage(
  multer({
    storage: blogCoverStorage,
    fileFilter,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  }),
  "coverImage"
);