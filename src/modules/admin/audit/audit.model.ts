import mongoose, { Schema, Document } from "mongoose";

/* =====================================================
   AUDIT LOG — Tracks all admin actions for accountability
===================================================== */

export interface IAuditLog extends Document {
  adminId: mongoose.Types.ObjectId;
  adminUsername: string;
  action: "CREATE" | "UPDATE" | "DELETE" | "LOGIN" | "EXPORT" | "CONFIG_CHANGE";
  resource: string;
  resourceId?: string;
  details?: string;
  ipAddress?: string;
  createdAt: Date;
}

const auditLogSchema = new Schema<IAuditLog>(
  {
    adminId: {
      type: Schema.Types.ObjectId,
      ref: "Admin",
      required: true,
      index: true
    },
    adminUsername: {
      type: String,
      required: true
    },
    action: {
      type: String,
      enum: ["CREATE", "UPDATE", "DELETE", "LOGIN", "EXPORT", "CONFIG_CHANGE"],
      required: true,
      index: true
    },
    resource: {
      type: String,
      required: true,
      index: true
    },
    resourceId: {
      type: String,
      default: ""
    },
    details: {
      type: String,
      default: ""
    },
    ipAddress: {
      type: String,
      default: ""
    }
  },
  { timestamps: true }
);

// Fast queries for "show me all actions on X" or "show me all actions by admin Y"
auditLogSchema.index({ createdAt: -1 });
auditLogSchema.index({ adminId: 1, createdAt: -1 });

export const AuditLog = mongoose.model<IAuditLog>("AuditLog", auditLogSchema);
