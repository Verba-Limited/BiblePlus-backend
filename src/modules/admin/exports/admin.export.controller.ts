import { Request, Response, NextFunction } from "express";
import { User } from "../../auth/auth.model";
import { Prayer } from "../../prayer/prayer.model";

export const ExportController = {
  /* =====================================================
     EXPORT USERS AS CSV
  ===================================================== */
  exportUsers: async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const users = await User.find()
        .select("email username firstName lastName role verified location bio createdAt")
        .sort({ createdAt: -1 })
        .lean();

      // Build CSV
      const headers = [
        "Email",
        "Username",
        "First Name",
        "Last Name",
        "Role",
        "Verified",
        "Location",
        "Bio",
        "Joined"
      ];

      const rows = users.map((u: any) => [
        escapeCsv(u.email),
        escapeCsv(u.username),
        escapeCsv(u.firstName || ""),
        escapeCsv(u.lastName || ""),
        u.role,
        u.verified ? "Yes" : "No",
        escapeCsv(u.location || ""),
        escapeCsv(u.bio || ""),
        u.createdAt ? new Date(u.createdAt).toISOString() : ""
      ]);

      const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");

      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", `attachment; filename="users_export_${Date.now()}.csv"`);
      res.status(200).send(csv);
    } catch (err) {
      next(err);
    }
  },

  /* =====================================================
     EXPORT PRAYERS AS CSV
  ===================================================== */
  exportPrayers: async (_req: Request, res: Response, next: NextFunction) => {
    try {
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
        escapeCsv(p.title),
        escapeCsv(p.description),
        p.visibility,
        p.status || "approved",
        p.isAnswered ? "Yes" : "No",
        p.prayCount,
        escapeCsv(p.user?.username || ""),
        escapeCsv(p.user?.email || ""),
        p.createdAt ? new Date(p.createdAt).toISOString() : ""
      ]);

      const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");

      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", `attachment; filename="prayers_export_${Date.now()}.csv"`);
      res.status(200).send(csv);
    } catch (err) {
      next(err);
    }
  }
};

/* =====================================================
   HELPER — Escape CSV values
===================================================== */
function escapeCsv(value: string): string {
  if (!value) return "";
  // If contains comma, newline, or double-quote, wrap in quotes
  if (value.includes(",") || value.includes("\n") || value.includes('"')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}
