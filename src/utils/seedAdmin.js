const { userModel } = require("../models/sql/userModel");
require("dotenv").config();

const seedAdmin = async () => {
  try {
    const adminEmail = process.env.ADMIN_EMAIL || "admin@example.com";

    // Step #1: Check if email exists
    const existingAdmin = await userModel.findOne({
      where: { email: adminEmail },
    });

    if (!existingAdmin) {
      const adminData = {
        fullName: process.env.ADMIN_NAME || "Super Admin",
        email: adminEmail,
        phone: process.env.ADMIN_PHONE || "9999999999",
        roles: ["ADMIN", "CUSTOMER"],
        status: "ACTIVE",
      };

      const admin = await userModel.create(adminData);
      console.log(`✅ Default Admin Created: ${admin.email}`);
    } else {
      console.log(`ℹ️ Admin already exists: ${existingAdmin.email}`);
    }
  } catch (error) {
    console.error("❌ Error creating default admin:", error.message);
  }
};

module.exports = seedAdmin;
