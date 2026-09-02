import { Request, Response, NextFunction } from "express";
import { User } from "../../auth/auth.model";
import { Prayer } from "../../prayer/prayer.model";
import { AuditLog } from "../audit/audit.model";
import { readFormat, sendTable, ExportFormat } from "../../../utils/csv";

/* =====================================================
   Record every download in the audit trail.

   Exports carry personal data, so who pulled what and when
   needs to be answerable. The generic audit middleware only
   logs modifying verbs, and an export is a GET.
===================================================== */
const recordExport = (req: Request, dataset: string, rows: number, format: ExportFormat) => {
  setImmediate(async () => {
    try {
      await AuditLog.create({
        adminId: req.userId,
        adminUsername: (req as any).adminUsername || "unknown",
        action: "EXPORT",
        resource: "exports",
        resourceId: dataset,
        details: `Exported ${rows} ${dataset} row(s) as ${format}`,
        ipAddress:
          (req.headers["x-forwarded-for"] as string) ||
          req.socket.remoteAddress ||
          ""
      });
    } catch (err) {
      console.error("⚠️  Export audit log failed:", err);
    }
  });
};

export const ExportController = {
  /* =====================================================
     EXPORT USERS
     GET /api/admin/exports/users?format=csv|excel
  ===================================================== */
  exportUsers: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const format = readFormat(req.query.format);

      const users = await User.find()
        .select(
          "email username firstName lastName role verified isActive location bio createdAt"
        )
        .sort({ createdAt: -1 })
        .lean();

      const headers = [
        "Email",
        "Username",
        "First Name",
        "Last Name",
        "Role",
        "Verified",
        "Status",
        "Location",
        "Bio",
        "Joined"
      ];

      const rows = users.map((u: any) => [
        u.email,
        u.username,
        u.firstName || "",
        u.lastName || "",
        u.role,
        u.verified ? "Yes" : "No",
        u.isActive === false ? "Deactivated" : "Active",
        u.location || "",
        u.bio || "",
        u.createdAt ? new Date(u.createdAt).toISOString() : ""
      ]);

      recordExport(req, "users", rows.length, format);

      return sendTable(res, {
        filename: `users_export_${new Date().toISOString().split("T")[0]}`,
        headers,
        rows,
        format
      });
    } catch (err) {
      next(err);
    }
  },

  /* =====================================================
     EXPORT PRAYERS
     GET /api/admin/exports/prayers?format=csv|excel
  ===================================================== */
  exportPrayers: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const format = readFormat(req.query.format);

      const prayers = await Prayer.find()
        .populate("user", "username email")
        .sort({ createdAt: -1 })
        .lean();

      const headers = [
        "Title",
        "Description",
        "Visibility",
        "Status",
        "Is Answered",
        "Pray Count",
        "Username",
        "Email",
        "Created"
      ];

      const rows = prayers.map((p: any) => [
        p.title,
        p.description,
        p.visibility,
        p.status || "approved",
        p.isAnswered ? "Yes" : "No",
        p.prayCount,
        p.user?.username || "",
        p.user?.email || "",
        p.createdAt ? new Date(p.createdAt).toISOString() : ""
      ]);

      recordExport(req, "prayers", rows.length, format);

      return sendTable(res, {
        filename: `prayers_export_${new Date().toISOString().split("T")[0]}`,
        headers,
        rows,
        format
      });
    } catch (err) {
      next(err);
    }
  },

  /* =====================================================
     PREVIEW — the rows the export will contain, as JSON
     GET /api/admin/exports/preview?dataset=users|prayers
  ===================================================== */
  preview: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const dataset = String(req.query.dataset || "users").toLowerCase();
      const limit = Math.min(Math.max(Number(req.query.limit) || 25, 1), 200);

      if (dataset === "prayers") {
        const [rows, total] = await Promise.all([
          Prayer.find()
            .populate("user", "username email")
            .sort({ createdAt: -1 })
            .limit(limit)
            .lean(),
          Prayer.countDocuments()
        ]);

        return res.status(200).json({
          success: true,
          dataset: "prayers",
          total,
          count: rows.length,
          data: rows
        });
      }

      const [rows, total] = await Promise.all([
        User.find()
          .select("email username firstName lastName role verified isActive createdAt")
          .sort({ createdAt: -1 })
          .limit(limit)
          .lean(),
        User.countDocuments()
      ]);

      return res.status(200).json({
        success: true,
        dataset: "users",
        total,
        count: rows.length,
        data: rows
      });
    } catch (err) {
      next(err);
    }
  }
};
