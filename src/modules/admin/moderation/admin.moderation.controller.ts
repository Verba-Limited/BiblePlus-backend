import { Request, Response, NextFunction } from "express";
import { Prayer } from "../../prayer/prayer.model";
import { BlogComment } from "../../blog/blogComment.model";
import AppError from "../../../core/AppError";

export const ModerationController = {
  /* =====================================================
     PRAYERS — List pending/flagged
  ===================================================== */
  getPendingPrayers: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const status = (req.query.status as string) || "pending";

      const query: any = { status };
      const prayers = await Prayer.find(query)
        .populate("user", "username email firstName lastName")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit);

      const total = await Prayer.countDocuments(query);

      res.status(200).json({
        success: true,
        data: {
          prayers,
          total,
          page,
          pages: Math.ceil(total / limit)
        }
      });
    } catch (err) {
      next(err);
    }
  },

  /* =====================================================
     PRAYERS — Approve
  ===================================================== */
  approvePrayer: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const prayer = await Prayer.findByIdAndUpdate(
        req.params.id,
        { status: "approved" },
        { returnDocument: "after" }
      );
      if (!prayer) throw new AppError("Prayer not found", 404);

      res.status(200).json({
        success: true,
        message: "Prayer approved",
        data: prayer
      });
    } catch (err) {
      next(err);
    }
  },

  /* =====================================================
     PRAYERS — Reject (delete)
  ===================================================== */
  rejectPrayer: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const prayer = await Prayer.findByIdAndDelete(req.params.id);
      if (!prayer) throw new AppError("Prayer not found", 404);

      res.status(200).json({
        success: true,
        message: "Prayer rejected and removed"
      });
    } catch (err) {
      next(err);
    }
  },

  /* =====================================================
     PRAYERS — Flag
  ===================================================== */
  flagPrayer: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const prayer = await Prayer.findByIdAndUpdate(
        req.params.id,
        { status: "flagged" },
        { returnDocument: "after" }
      );
      if (!prayer) throw new AppError("Prayer not found", 404);

      res.status(200).json({
        success: true,
        message: "Prayer flagged for review",
        data: prayer
      });
    } catch (err) {
      next(err);
    }
  },

  /* =====================================================
     COMMENTS — List pending/flagged
  ===================================================== */
  getPendingComments: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const status = (req.query.status as string) || "pending";

      const query: any = { status };
      const comments = await BlogComment.find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit);

      const total = await BlogComment.countDocuments(query);

      res.status(200).json({
        success: true,
        data: {
          comments,
          total,
          page,
          pages: Math.ceil(total / limit)
        }
      });
    } catch (err) {
      next(err);
    }
  },

  /* =====================================================
     COMMENTS — Approve
  ===================================================== */
  approveComment: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const comment = await BlogComment.findByIdAndUpdate(
        req.params.id,
        { status: "approved" },
        { returnDocument: "after" }
      );
      if (!comment) throw new AppError("Comment not found", 404);

      res.status(200).json({
        success: true,
        message: "Comment approved",
        data: comment
      });
    } catch (err) {
      next(err);
    }
  },

  /* =====================================================
     COMMENTS — Reject (delete)
  ===================================================== */
  rejectComment: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const comment = await BlogComment.findByIdAndDelete(req.params.id);
      if (!comment) throw new AppError("Comment not found", 404);

      res.status(200).json({
        success: true,
        message: "Comment rejected and removed"
      });
    } catch (err) {
      next(err);
    }
  },

  /* =====================================================
     COMMENTS — Flag
  ===================================================== */
  flagComment: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const comment = await BlogComment.findByIdAndUpdate(
        req.params.id,
        { status: "flagged" },
        { returnDocument: "after" }
      );
      if (!comment) throw new AppError("Comment not found", 404);

      res.status(200).json({
        success: true,
        message: "Comment flagged for review",
        data: comment
      });
    } catch (err) {
      next(err);
    }
  },

  /* =====================================================
     OVERVIEW — Moderation queue counts
  ===================================================== */
  getQueueCounts: async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const [pendingPrayers, flaggedPrayers, pendingComments, flaggedComments] =
        await Promise.all([
          Prayer.countDocuments({ status: "pending" }),
          Prayer.countDocuments({ status: "flagged" }),
          BlogComment.countDocuments({ status: "pending" }),
          BlogComment.countDocuments({ status: "flagged" })
        ]);

      res.status(200).json({
        success: true,
        data: {
          pendingPrayers,
          flaggedPrayers,
          pendingComments,
          flaggedComments,
          total: pendingPrayers + flaggedPrayers + pendingComments + flaggedComments
        }
      });
    } catch (err) {
      next(err);
    }
  }
};
