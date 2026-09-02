import { Request, Response, NextFunction } from "express";
import { AuditLog } from "./audit.model";
import { escapeRegex, readSearchTerm } from "../../../utils/sanitize";
import { readFormat, sendTable } from "../../../utils/csv";

/* Build the same filter for both the list and the export, so what
   an admin downloads is exactly what they were looking at. */
const buildQuery = (req: Request) => {
  const query: any = {};

  const action = req.query.action as string;
  const resource = req.query.resource as string;
  const adminUsername = req.query.admin as string;

  if (action && action.toLowerCase() !== "all") query.action = action.toUpperCase();
  if (resource && resource.toLowerCase() !== "all") query.resource = resource;
  if (adminUsername) {
    query.adminUsername = { $regex: escapeRegex(adminUsername), $options: "i" };
  }

  // Free-text search across the descriptive columns
  const term = readSearchTerm(req.query as any);
  if (term) {
    const safe = escapeRegex(term);
    query.$or = [
      { adminUsername: { $regex: safe, $options: "i" } },
      { resource: { $regex: safe, $options: "i" } },
      { resourceId: { $regex: safe, $options: "i" } },
      { details: { $regex: safe, $options: "i" } }
    ];
  }

  // Date range
  const from = req.query.from as string;
  const to = req.query.to as string;
  if (from || to) {
    query.createdAt = {};
    if (from) query.createdAt.$gte = new Date(from);
    if (to) {
      const end = new Date(to);
      end.setHours(23, 59, 59, 999);
      query.createdAt.$lte = end;
    }
  }

  return query;
};

export const AuditLogController = {
  /* =====================================================
     GET AUDIT LOGS — paginated, filterable
  ===================================================== */
  getAll: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 50;
      const query = buildQuery(req);

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
  },

  /* =====================================================
     FILTER OPTIONS — populates the "All Actions" and
     "All Resources" dropdowns from real data
  ===================================================== */
  getFilters: async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const [actions, resources, admins] = await Promise.all([
        AuditLog.distinct("action"),
        AuditLog.distinct("resource"),
        AuditLog.distinct("adminUsername")
      ]);

      res.status(200).json({
        success: true,
        data: {
          actions: actions.sort(),
          resources: resources.sort(),
          admins: admins.sort()
        }
      });
    } catch (err) {
      next(err);
    }
  },

  /* =====================================================
     EXPORT ACTIVITY LOGS — CSV or Excel
     GET /api/admin/audit-logs/export?format=csv|excel

     Honours the same filters as the list, so admins export
     the view they are looking at rather than everything.
  ===================================================== */
  exportLogs: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const format = readFormat(req.query.format);
      const query = buildQuery(req);

      // Cap the download so a huge audit trail can't exhaust memory
      const limit = Math.min(Number(req.query.limit) || 10000, 50000);

      const logs = await AuditLog.find(query)
        .sort({ createdAt: -1 })
        .limit(limit)
        .lean();

      const headers = [
        "Timestamp",
        "Admin",
        "Action",
        "Resource",
        "Resource ID",
        "Details",
        "IP Address"
      ];

      const rows = logs.map((log: any) => [
        log.createdAt ? new Date(log.createdAt).toISOString() : "",
        log.adminUsername || "",
        log.action || "",
        log.resource || "",
        log.resourceId || "",
        log.details || "",
        log.ipAddress || ""
      ]);

      const stamp = new Date().toISOString().split("T")[0];

      return sendTable(res, {
        filename: `activity_logs_${stamp}`,
        headers,
        rows,
        format
      });
    } catch (err) {
      next(err);
    }
  }
};
