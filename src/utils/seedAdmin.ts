import dotenv from "dotenv";
import { userModel } from "../models/sql/userModel";

dotenv.config();

const seedAdmin = async (): Promise<void> => {
  try {
    const adminEmail = process.env.ADMIN_EMAIL ?? "admin@example.com";

    const existingAdmin = await userModel.findOne({
      where: { email: adminEmail },
    });

    if (!existingAdmin) {
      const admin = await userModel.create({
        fullName: process.env.ADMIN_NAME ?? "Super Admin",
        email: adminEmail,
        phone: process.env.ADMIN_PHONE ?? "9999999999",
        roles: ["ADMIN", "CUSTOMER"],
        status: "ACTIVE",
      });

      console.log(`✅ Default Admin Created: ${admin.email}`);
    } else {
      console.log(`ℹ️ Admin already exists: ${existingAdmin.email}`);
    }
  } catch (error: any) {
    console.error("❌ Error creating default admin:", error.message);
  }
};

export default seedAdmin;
