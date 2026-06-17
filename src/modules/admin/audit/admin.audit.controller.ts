import { Request, Response, NextFunction } from "express";
import { AuditLog } from "./audit.model";

export const AuditLogController = {
  /* =====================================================
     GET AUDIT LOGS — paginated, filterable
  ===================================================== */
  getAll: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 50;
      const action = req.query.action as string;
      const resource = req.query.resource as string;
      const adminUsername = req.query.admin as string;

      const query: any = {};
      if (action) query.action = action.toUpperCase();
      if (resource) query.resource = resource;
      if (adminUsername) query.adminUsername = { $regex: adminUsername, $options: "i" };

      const logs = await AuditLog.find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit);

      const total = await AuditLog.countDocuments(query);

      res.status(200).json({
        success: true,
        data: {
          logs,
          total,
          page,
          pages: Math.ceil(total / limit)
        }
      });
    } catch (err) {
      next(err);
    }
  }
};
