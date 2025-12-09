import { Admin } from "./admin.model";
import AppError from "../../core/AppError";
import { hashPassword, comparePassword } from "../../utils/bycrypt";
import jwt from "jsonwebtoken";

export const AdminService = {

  // -----------------------------------------------------
  // CREATE DEFAULT ADMIN (RUN MANUALLY ONLY)
  // -----------------------------------------------------
  createDefaultAdmin: async () => {
    const exists = await Admin.findOne({ username: "bibleplus" });
    if (exists) return;

    const hashed = await hashPassword("adminbible12");

    await Admin.create({
      username: "bibleplus",
      password: hashed,
      role: "admin"
    });

    console.log("✔ Default admin created: bibleplus / adminbible12");
  },

  // -----------------------------------------------------
  // ADMIN LOGIN
  // -----------------------------------------------------
  login: async (username: string, password: string) => {
    const admin = await Admin.findOne({ username });

    if (!admin) {
      throw new AppError("Invalid admin credentials", 401);
    }

    const valid = await comparePassword(password, admin.password);
    if (!valid) {
      throw new AppError("Invalid admin credentials", 401);
    }

    // Generate admin JWT
    const token = jwt.sign(
      {
        adminId: admin._id.toString(),
        role: "admin"
      },
      process.env.JWT_ADMIN_SECRET!, 
      { expiresIn: "1d" }
    );

    return {
      token,
      admin: {
        id: admin._id,
        username: admin.username,
        role: admin.role
      }
    };
  }
};
