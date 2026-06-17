import { Admin } from "./admin.model";
import AppError from "../../core/AppError";
import { hashPassword, comparePassword } from "../../utils/bycrypt";
import { generateAccessToken } from "../../utils/jwt";

export const AdminService = {
  /* =====================================================
      CREATE DEFAULT ADMIN (RUN ONCE / SEED)
  ===================================================== */
  createDefaultAdmin: async () => {
    const defaultEmail = process.env.DEFAULT_ADMIN_EMAIL;
    if (!defaultEmail) {
      console.error("❌ DEFAULT_ADMIN_EMAIL env var is not set — skipping default admin creation/backfill");
      return;
    }

    const exists = await Admin.findOne({ username: "SuperAdmin" });
    if (exists) {
      let updated = false;
      // Upgrade legacy "admin" role to "superadmin" if needed
      if ((exists.role as string) === "admin") {
        exists.role = "superadmin";
        updated = true;
        console.log("✔ Upgraded default admin to superadmin");
      }
      // Backfill email if missing
      if (!exists.email) {
        exists.email = defaultEmail;
        updated = true;
        console.log(`✔ Backfilled default admin email with: ${defaultEmail}`);
      }
      
      if (updated) await exists.save();
      return;
    }

    const adminPassword = process.env.DEFAULT_ADMIN_PASSWORD;
    if (!adminPassword) {
      console.error("❌ DEFAULT_ADMIN_PASSWORD env var is not set — skipping default admin creation");
      return;
    }

    const hashedPassword = await hashPassword(adminPassword);

    await Admin.create({
      username: "SuperAdmin",
      email: defaultEmail,
      password: hashedPassword,
      role: "superadmin"
    });

    console.log("✔ Default admin created: SuperAdmin (superadmin)");
  },

  /* =====================================================
      ADMIN LOGIN
  ===================================================== */
  login: async (identifier: string, password: string) => {
    // Identifier can be username OR email
    const admin = await Admin.findOne({
      $or: [{ username: identifier }, { email: identifier }]
    });
    if (!admin) {
      throw new AppError("Invalid admin credentials", 401);
    }

    const isValid = await comparePassword(password, admin.password);
    if (!isValid) {
      throw new AppError("Invalid admin credentials", 401);
    }

    if (!process.env.JWT_SECRET) {
      throw new AppError("JWT_SECRET not configured", 500);
    }

    // 🔐 SINGLE JWT SYSTEM — include granular role
    const token = generateAccessToken({
      userId: admin._id.toString(),
      role: "admin"
    });

    return {
      token,
      admin: {
        id: admin._id.toString(),
        username: admin.username,
        role: admin.role // granular role for frontend
      }
    };
  }
};