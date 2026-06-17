import { Request, Response, NextFunction } from "express";

/* =====================================================
   ROLE-BASED ACCESS CONTROL (RBAC) MIDDLEWARE
   
   Usage:
     router.use("/users", requireRole("superadmin"), adminUsersRoutes);
     router.use("/blogs", requireRole("superadmin", "editor"), adminBlogRoutes);
===================================================== */

export type AdminRole = "superadmin" | "editor" | "moderator";

/**
 * Factory that returns middleware restricting access to specific admin roles.
 * Must be used AFTER authMiddleware + adminOnly have already run.
 */
export const requireRole = (...allowedRoles: AdminRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // adminOnly already validated that req.userRole exists and is "admin"
    // But we need the granular role from the Admin document.
    // The admin's granular role is attached as req.adminRole by the
    // adminRoleResolver middleware (see below).
    const adminRole = (req as any).adminRole as AdminRole | undefined;

    if (!adminRole) {
      return res.status(403).json({
        success: false,
        message: "Admin role not resolved. Internal error."
      });
    }

    // superadmin bypasses all role checks
    if (adminRole === "superadmin") {
      return next();
    }

    if (!allowedRoles.includes(adminRole)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required role: ${allowedRoles.join(" or ")}. Your role: ${adminRole}`
      });
    }

    return next();
  };
};
