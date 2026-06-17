import mongoose, { Schema, Document } from "mongoose";

/* =====================================================
   SYSTEM CONFIG — Dynamic Feature Flags & Settings
   Allows admins to toggle features without code deploys
===================================================== */

export interface ISystemConfig extends Document {
  key: string;
  value: string;
  type: "boolean" | "string" | "number";
  label: string;
  description: string;
  category: "feature_flags" | "notifications" | "content" | "system";
  updatedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const systemConfigSchema = new Schema<ISystemConfig>(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true
    },
    value: {
      type: String,
      required: true
    },
    type: {
      type: String,
      enum: ["boolean", "string", "number"],
      default: "boolean"
    },
    label: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      default: ""
    },
    category: {
      type: String,
      enum: ["feature_flags", "notifications", "content", "system"],
      default: "feature_flags"
    },
    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: "Admin"
    }
  },
  { timestamps: true }
);

export const SystemConfig = mongoose.model<ISystemConfig>(
  "SystemConfig",
  systemConfigSchema
);

/* =====================================================
   HELPER — Get a config value by key (cached-friendly)
===================================================== */
export const getConfigValue = async (key: string): Promise<string | null> => {
  const config = await SystemConfig.findOne({ key });
  return config ? config.value : null;
};

export const getConfigBool = async (key: string, fallback = true): Promise<boolean> => {
  const val = await getConfigValue(key);
  if (val === null) return fallback;
  return val === "true";
};

/* =====================================================
   SEED DEFAULT CONFIGS (run once on startup)
===================================================== */
export const seedDefaultConfigs = async () => {
  const defaults = [
    {
      key: "rss_sync_enabled",
      value: "true",
      type: "boolean" as const,
      label: "RSS Blog Sync",
      description: "Enable/disable automatic RSS feed syncing for Christian blogs",
      category: "feature_flags" as const
    },
    {
      key: "maintenance_mode",
      value: "false",
      type: "boolean" as const,
      label: "Maintenance Mode",
      description: "Put the entire app in maintenance mode",
      category: "system" as const
    },
    {
      key: "daily_quiz_enabled",
      value: "true",
      type: "boolean" as const,
      label: "Daily Quiz",
      description: "Enable/disable the daily quiz feature",
      category: "feature_flags" as const
    },
    {
      key: "push_notifications_enabled",
      value: "true",
      type: "boolean" as const,
      label: "Push Notifications",
      description: "Enable/disable push notifications globally",
      category: "notifications" as const
    },
    {
      key: "email_notifications_enabled",
      value: "true",
      type: "boolean" as const,
      label: "Email Notifications",
      description: "Enable/disable email notifications globally",
      category: "notifications" as const
    },
    {
      key: "prayer_auto_approve",
      value: "true",
      type: "boolean" as const,
      label: "Auto-Approve Prayers",
      description: "When true, prayers go live immediately. When false, they require admin moderation.",
      category: "content" as const
    },
    {
      key: "comment_auto_approve",
      value: "true",
      type: "boolean" as const,
      label: "Auto-Approve Comments",
      description: "When true, blog comments go live immediately. When false, they require admin moderation.",
      category: "content" as const
    },
    {
      key: "gutenberg_sync_enabled",
      value: "true",
      type: "boolean" as const,
      label: "Gutenberg Book Sync",
      description: "Enable/disable automatic Gutenberg book syncing",
      category: "feature_flags" as const
    }
  ];

  for (const cfg of defaults) {
    await SystemConfig.findOneAndUpdate(
      { key: cfg.key },
      { $setOnInsert: cfg },
      { upsert: true, new: true }
    );
  }

  console.log("✔ System configs seeded");
};
