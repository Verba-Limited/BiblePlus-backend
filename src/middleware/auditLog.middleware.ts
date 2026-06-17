import { Request, Response, NextFunction } from "express";
import { AuditLog } from "../modules/admin/audit/audit.model";

/* =====================================================
   AUDIT LOG MIDDLEWARE
   
   Automatically logs all modifying admin actions 
   (POST, PUT, DELETE, PATCH) to the AuditLog collection.
   Runs AFTER adminRoleResolver so we have adminUsername.
===================================================== */

// Map HTTP methods to audit actions
const METHOD_TO_ACTION: Record<string, string> = {
  POST: "CREATE",
  PUT: "UPDATE",
  PATCH: "UPDATE",
  DELETE: "DELETE"
};

export const auditLogMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Only log modifying operations
  const action = METHOD_TO_ACTION[req.method];
  if (!action) {
    return next();
  }

  // Capture response to log after it's sent
  const originalJson = res.json.bind(res);

  res.json = (body: any) => {
    // Fire and forget — don't block the response
    setImmediate(async () => {
      try {
        const adminId = req.userId;
        const adminUsername = (req as any).adminUsername || "unknown";

        // Extract resource from URL path
        // e.g., /api/admin/blogs/123 → resource: "blogs", resourceId: "123"
        const pathParts = req.originalUrl
          .replace(/^\/api\/admin\//, "")
          .split("/")
          .filter(Boolean);

        const resource = pathParts[0] || "unknown";
        const resourceId = pathParts[1] || req.params?.id || "";

        await AuditLog.create({
          adminId,
          adminUsername,
          action,
          resource,
          resourceId,
          details: `${req.method} ${req.originalUrl}`,
          ipAddress:
            (req.headers["x-forwarded-for"] as string) ||
            req.socket.remoteAddress ||
            ""
        });
      } catch (err) {
        // Never let audit logging crash the app
        console.error("⚠️  Audit log write failed:", err);
      }
    });

    return originalJson(body);
  };

  return next();
};
