import { Admin } from "./admin.model";
import AppError from "../../core/AppError";
import { hashPassword, comparePassword } from "../../utils/bycrypt";
import jwt from "jsonwebtoken";

export const AdminService = {
  /* =====================================================
      CREATE DEFAULT ADMIN (RUN ONCE / SEED)
  ===================================================== */
  createDefaultAdmin: async () => {
    const exists = await Admin.findOne({ username: "bibleplus" });
    if (exists) return;

    const adminPassword = process.env.DEFAULT_ADMIN_PASSWORD;
    if (!adminPassword) {
      console.error("❌ DEFAULT_ADMIN_PASSWORD env var is not set — skipping default admin creation");
      return;
    }

    const hashedPassword = await hashPassword(adminPassword);

    await Admin.create({
      username: "bibleplus",
      password: hashedPassword,
      role: "admin"
    });

    console.log("✔ Default admin created: bibleplus");
  },

  /* =====================================================
      ADMIN LOGIN
  ===================================================== */
  login: async (username: string, password: string) => {
    const admin = await Admin.findOne({ username });
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

    // 🔐 SINGLE JWT SYSTEM (CRITICAL FIX)
    const token = jwt.sign(
      {
        userId: admin._id.toString(), // must be userId
        role: "admin"
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    return {
      token,
      admin: {
        id: admin._id.toString(),
        username: admin.username,
        role: admin.role
      }
    };
  }
};