import { Request, Response, NextFunction } from "express";
import AppError from "../../../core/AppError";
import { User } from "../../auth/auth.model";
import { hashPassword } from "../../../utils/bycrypt";
import { escapeRegex, readSearchTerm } from "../../../utils/sanitize";
import { withAvatar } from "../../../utils/avatar";

/* Query flags arrive as strings — "true"/"1" both mean yes. */
const isTruthy = (value: any) =>
  value === true || value === "true" || value === "1";

export const AdminUsersController = {
  getAllUsers: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const page = Math.max(parseInt(req.query.page as string) || 1, 1);
      const limit = Math.min(
        Math.max(parseInt(req.query.limit as string) || 20, 1),
        100
      );
      const search = readSearchTerm(req.query as any);

      // Soft-deleted accounts are hidden by default; the portal can
      // opt in to see (and restore) them.
      const includeDeleted = isTruthy(req.query.includeDeleted);

      const query: any = {};

      if (search) {
        const term = escapeRegex(search);
        query.$or = [
          { email: { $regex: term, $options: "i" } },
          { username: { $regex: term, $options: "i" } },
          { firstName: { $regex: term, $options: "i" } },
          { lastName: { $regex: term, $options: "i" } }
        ];
      }

      if (req.query.verified !== undefined) {
        query.verified = isTruthy(req.query.verified);
      }

      if (req.query.status === "active") query.isActive = { $ne: false };
      if (req.query.status === "inactive") query.isActive = false;

      const options = { includeDeleted };

      // Count and list run the same filter, so `total` always
      // matches the rows the portal renders.
      const [users, total, stats] = await Promise.all([
        User.find(query, null, options)
          .select("-password")
          .sort({ createdAt: -1 })
          .skip((page - 1) * limit)
          .limit(limit),
        User.countDocuments(query).setOptions(options),
        AdminUsersController.buildStats()
      ]);

      const pages = Math.ceil(total / limit) || 1;

      res.status(200).json({
        success: true,
        data: {
          users: users.map(withAvatar),
          total,
          count: users.length,
          page,
          limit,
          pages,
          hasNextPage: page < pages,
          hasPrevPage: page > 1,
          stats
        }
      });
    } catch (err) {
      next(err);
    }
  },

  /* Totals the Analytics page and the Users page can both trust. */
  buildStats: async () => {
    const [total, verified, inactive, deleted] = await Promise.all([
      User.countDocuments({}),
      User.countDocuments({ verified: true }),
      User.countDocuments({ isActive: false }),
      User.countDocuments({ isDeleted: true }).setOptions({
        includeDeleted: true
      })
    ]);

    return {
      total,
      verified,
      unverified: total - verified,
      active: total - inactive,
      inactive,
      deleted
    };
  },

  getUserById: async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Include deleted so an admin can still open (and restore) a
      // soft-deleted account from the users list.
      const user = await User.findById(req.params.id, null, {
        includeDeleted: true
      }).select("-password");

      if (!user) {
        throw new AppError("User not found", 404);
      }

      res.status(200).json({ success: true, data: withAvatar(user) });
    } catch (err) {
      next(err);
    }
  },

  resetUserPassword: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { newPassword } = req.body;
      const targetPassword = newPassword || "Password123!"; // Default fallback

      const user = await User.findById(req.params.id);
      if (!user) {
        throw new AppError("User not found", 404);
      }

      if (targetPassword.length < 6) {
        throw new AppError("Password must be at least 6 characters long", 400);
      }

      const hashed = await hashPassword(targetPassword);
      user.password = hashed;
      await user.save();

      res.status(200).json({
        success: true,
        message: "User password has been reset successfully",
        data: {
          temporaryPassword: targetPassword
        }
      });
    } catch (err) {
      next(err);
    }
  },

  /* -----------------------------------------------------
     DEACTIVATE / REACTIVATE

     One toggle plus two explicit endpoints, so the portal
     can either flip the switch or set an exact state.
  ----------------------------------------------------- */
  setUserActive: async (
    req: Request,
    res: Response,
    next: NextFunction,
    forcedState?: boolean
  ) => {
    try {
      const user = await User.findById(req.params.id, null, {
        includeDeleted: true
      });

      if (!user) {
        throw new AppError("User not found", 404);
      }

      let nextState: boolean;

      if (forcedState !== undefined) {
        nextState = forcedState;
      } else if (req.body?.isActive !== undefined) {
        nextState = isTruthy(req.body.isActive);
      } else {
        // No explicit state — treat it as a toggle
        nextState = user.isActive === false;
      }

      user.isActive = nextState;
      user.deactivatedAt = nextState ? null : new Date();
      await user.save();

      res.status(200).json({
        success: true,
        message: nextState
          ? "User has been reactivated"
          : "User has been deactivated",
        data: withAvatar(user.toObject())
      });
    } catch (err) {
      next(err);
    }
  },

  deactivateUser: (req: Request, res: Response, next: NextFunction) =>
    AdminUsersController.setUserActive(req, res, next, false),

  activateUser: (req: Request, res: Response, next: NextFunction) =>
    AdminUsersController.setUserActive(req, res, next, true),

  toggleUserActive: (req: Request, res: Response, next: NextFunction) =>
    AdminUsersController.setUserActive(req, res, next),

  /* -----------------------------------------------------
     SOFT DELETE + RESTORE
  ----------------------------------------------------- */
  banUser: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = await User.findById(req.params.id);
      if (!user) {
        throw new AppError("User not found", 404);
      }

      // Soft delete — the record stays, it just drops out of every
      // list and count until an admin restores it.
      user.isDeleted = true;
      user.isActive = false;
      user.deactivatedAt = new Date();
      await user.save();

      res.status(200).json({
        success: true,
        message: "User has been deleted",
        data: { id: user._id, isDeleted: true }
      });
    } catch (err) {
      next(err);
    }
  },

  restoreUser: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = await User.findById(req.params.id, null, {
        includeDeleted: true
      });

      if (!user) {
        throw new AppError("User not found", 404);
      }

      // If this account's email was released (someone re-registered
      // that address), the original identity may no longer be free.
      let identityNote = "";

      if (user.deletedEmail) {
        const taken = await User.findOne(
          { email: user.deletedEmail },
          null,
          { includeDeleted: true }
        ).select("_id");

        if (taken) {
          identityNote =
            ` Their original address (${user.deletedEmail}) has since been registered by someone else, so the account keeps its placeholder email — set a new one before they sign in.`;
        } else {
          user.email = user.deletedEmail;
          if (user.deletedUsername) user.username = user.deletedUsername;
          user.deletedEmail = null;
          user.deletedUsername = null;
          identityNote = " Their original email and username were restored.";
        }
      }

      user.isDeleted = false;
      user.isActive = true;
      user.deactivatedAt = null;
      await user.save();

      res.status(200).json({
        success: true,
        message: `User has been restored.${identityNote}`,
        data: withAvatar(user.toObject())
      });
    } catch (err) {
      next(err);
    }
  }
};
