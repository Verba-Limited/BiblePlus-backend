import { Admin } from "./admin.model";
import AppError from "../../core/AppError";
import { hashPassword, comparePassword } from "../../utils/bycrypt";
import { generateAccessToken } from "../../utils/jwt";

export const AdminService = {
  // Create the first admin (run once)
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

  login: async (username: string, password: string) => {
    const admin = await Admin.findOne({ username });
    if (!admin) throw new AppError("Invalid credentials", 400);

    const valid = await comparePassword(password, admin.password);
    if (!valid) throw new AppError("Invalid credentials", 400);

    const token = generateAccessToken(admin._id.toString(), "admin");

    return { token, admin };
  }
};
