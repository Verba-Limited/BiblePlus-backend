import { Request, Response, NextFunction } from "express";
import multer from "multer";
import AppError from "../core/AppError";

/* =====================================================
   NORMALISE KNOWN ERROR SHAPES

   Mongo, Mongoose and multer all throw errors with no
   statusCode, so every one of them used to reach the
   client as an opaque 500. Translate the ones an admin
   can actually act on.
===================================================== */
const normalise = (err: any): { status: number; message: string; details?: any } => {
  if (err instanceof AppError) {
    return { status: err.statusCode, message: err.message };
  }

  /* ---- File uploads ---- */
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return { status: 400, message: "Image is too large — maximum size is 10MB" };
    }
    if (err.code === "LIMIT_UNEXPECTED_FILE") {
      return {
        status: 400,
        message: `Unexpected file field "${err.field}". Send the image as "coverImage".`
      };
    }
    return { status: 400, message: err.message || "File upload failed" };
  }

  /* ---- Mongoose validation ---- */
  if (err?.name === "ValidationError" && err.errors) {
    const details = Object.entries(err.errors).map(
      ([field, e]: [string, any]) => ({ field, message: e.message })
    );
    return {
      status: 400,
      message: details.map((d) => d.message).join(", ") || "Validation failed",
      details
    };
  }

  /* ---- Bad ObjectId in a path param ---- */
  if (err?.name === "CastError") {
    return { status: 400, message: `Invalid ${err.path}: "${err.value}"` };
  }

  /* ---- Duplicate key ---- */
  if (err?.code === 11000) {
    const field = Object.keys(err.keyPattern || err.keyValue || {})[0] || "field";

    // Signup is the case users actually meet this on, and "a record
    // already exists" tells them nothing they can act on.
    if (field === "email") {
      return {
        status: 409,
        message:
          "This email is already registered. Try logging in, or use 'Forgot password' if you can't get in."
      };
    }

    return { status: 409, message: `A record with that ${field} already exists` };
  }

  /* ---- Update touched an immutable path (_id, etc.) ---- */
  if (err?.code === 66 || /immutable field/i.test(err?.message || "")) {
    return {
      status: 400,
      message:
        "This update tried to change a read-only field. Send only the fields you edited."
    };
  }

  return { status: err?.statusCode || 500, message: err?.message || "Something went wrong" };
};

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  const { status, message, details } = normalise(err);

  // Client mistakes are noise in the logs; server faults are not.
  if (status >= 500) {
    console.error("🔥 ERROR:", err);
  } else {
    console.warn(`⚠️  ${status} ${req.method} ${req.originalUrl} — ${message}`);
  }

  return res.status(status).json({
    success: false,
    message,
    ...(details ? { errors: details } : {})
  });
};
