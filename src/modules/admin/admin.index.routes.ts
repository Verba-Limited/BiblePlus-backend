import { Router } from "express";
import { requireRole } from "../../middleware/rbac.middleware";

/* =====================================================
   DOMAIN ADMIN ROUTES
===================================================== */
import adminAnalyticsRoutes from "./adminAnalytics.routes";
import adminBlogRoutes from "../blog/admin.blog.routes";
import adminBlogCategoryRoutes from "../blog/admin.blogCategory.routes";
import adminBookRoutes from "../books/admin.book.routes";
import adminEventRoutes from "../events/admin.events.routes";
import adminSpeakerRoutes from "../events/admin.speaker.routes";
import adminEventCategoryRoutes from "../events/categories/admin.eventCategory.routes";
import adminNotificationRoutes from "../notifications/admin.notification.routes";
import adminQuizRoutes from "../quiz/admin.quiz.routes";
import adminVerseRoutes from "../verse/admin.verse.routes";
import adminPrayerRoutes from "../prayer/admin.prayer.routes";

/* =====================================================
   CORE ADMIN ROUTES
===================================================== */
import adminUsersRoutes from "./users/admin.users.routes";
import adminSettingsRoutes from "./settings/admin.settings.routes";
import adminSystemConfigRoutes from "./system/admin.systemConfig.routes";
import adminAuditRoutes from "./audit/admin.audit.routes";
import adminModerationRoutes from "./moderation/admin.moderation.routes";
import adminExportRoutes from "./exports/admin.export.routes";
import adminManagementRoutes from "./management/admin.management.routes";

const router = Router();

/* =====================================================
   RBAC POLICY
   
   superadmin  → full access (bypasses all role checks)
   editor      → content management (blogs, events, books, speakers, quiz, verse)
   moderator   → moderation queue + prayers + notifications
===================================================== */

// ── Content Management (superadmin + editor) ──
router.use("/blogs", requireRole("superadmin", "editor"), adminBlogRoutes);
router.use("/blog-categories", requireRole("superadmin", "editor"), adminBlogCategoryRoutes);
router.use("/books", requireRole("superadmin", "editor"), adminBookRoutes);
router.use("/events", requireRole("superadmin", "editor"), adminEventRoutes);
router.use("/speakers", requireRole("superadmin", "editor"), adminSpeakerRoutes);
router.use("/event-categories", requireRole("superadmin", "editor"), adminEventCategoryRoutes);
router.use("/quiz", requireRole("superadmin", "editor"), adminQuizRoutes);
router.use("/verse", requireRole("superadmin", "editor"), adminVerseRoutes);

// ── Moderation (superadmin + moderator) ──
router.use("/moderation", requireRole("superadmin", "moderator"), adminModerationRoutes);
router.use("/prayers", requireRole("superadmin", "moderator"), adminPrayerRoutes);
router.use("/notifications", requireRole("superadmin", "moderator"), adminNotificationRoutes);

// ── Analytics (all roles can view) ──
router.use("/analytics", adminAnalyticsRoutes);

// ── Superadmin Only ──
router.use("/users", requireRole("superadmin"), adminUsersRoutes);
router.use("/settings", requireRole("superadmin"), adminSettingsRoutes);
router.use("/system-config", requireRole("superadmin"), adminSystemConfigRoutes);
router.use("/audit-logs", requireRole("superadmin"), adminAuditRoutes);
router.use("/exports", requireRole("superadmin"), adminExportRoutes);
router.use("/management", requireRole("superadmin"), adminManagementRoutes);

export default router;
