import { Request, Response, NextFunction } from "express";
import { Admin } from "../modules/admin/admin.model";

/* =====================================================
   ADMIN ROLE RESOLVER MIDDLEWARE
   
   Runs AFTER authMiddleware + adminOnly.
   Looks up the Admin document and attaches the granular
   role (superadmin/editor/moderator) to req.adminRole.
===================================================== */

export const adminRoleResolver = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const adminId = req.userId;

    if (!adminId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required"
      });
    }

    const admin = await Admin.findById(adminId).select("role username").lean();

    if (!admin) {
      return res.status(403).json({
        success: false,
        message: "Admin account not found"
      });
    }

    // Attach granular role and username for audit logging
    (req as any).adminRole = admin.role;
    (req as any).adminUsername = admin.username;

    return next();
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Failed to resolve admin role"
    });
  }
};
