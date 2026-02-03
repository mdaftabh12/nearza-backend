import { Request, Response } from "express";
import asyncHandler from "../utils/asyncHandler";
import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";
import otpModel from "../models/mongo/otpModel";
import { userModel } from "../models/sql/userModel";
import { generateOTP } from "../utils/generateOTP";
import { generateToken } from "../utils/jwt";
import { Op, WhereOptions } from "sequelize";

// =============================================
// 📩 Send OTP Controller
// =============================================
export const sendOtp = asyncHandler(async (req: Request, res: Response) => {
  const { email, phone }: { email?: string; phone?: string } = req.body || {};

  // 🛑 Safety check
  if (!email && !phone) {
    throw new ApiError(400, "Email or phone is required to generate OTP");
  }

  if (email && phone) {
    throw new ApiError(400, "Provide only one: email OR phone");
  }

  // Generate OTP
  const otp = generateOTP();
  const OTP_EXPIRY_TIME = 5 * 60 * 1000; // OTP will expire after 5 minutes

  const createOtp = await otpModel.create({
    ...(email && { email }),
    ...(phone && { phone }),
    otp,
    expiresAt: new Date(Date.now() + OTP_EXPIRY_TIME),
  });

  if (!createOtp) {
    throw new ApiError(500, "Failed to generate OTP. Please try again.");
  }

  // TODO: Send OTP via Email/SMS

  return res.status(200).json(
    new ApiResponse(
      {
        email,
        phone,
        otp, // ⚠️ DEV ONLY
      },
      "OTP sent successfully",
    ),
  );
});

// =============================================
// 🔐 Verify OTP & Authenticate User
// =============================================
export const verifyOtpAndAuthenticate = asyncHandler(
  async (req: Request, res: Response) => {
    const { email, phone, otp } = req.body || {};
    const currentTime = new Date();

    // 🛑 Safety check
    if (email && phone) {
      throw new ApiError(
        400,
        "Either email or phone is required to generate OTP",
      );
    }

    // 🔍 Find latest OTP record
    const otpQuery = email ? { email, otp } : { phone, otp };
    const otpRecord = await otpModel.findOne(otpQuery).sort({ createdAt: -1 });

    if (!otpRecord) {
      throw new ApiError(400, "Invalid OTP. Please try again.");
    }

    if (otpRecord.expiresAt < currentTime) {
      throw new ApiError(400, "OTP has expired. Please request a new one.");
    }

    // 🧾 User lookup condition
    const userWhere = email ? { email } : { phone };

    // 👤 Check user (SQL)
    let user = await userModel.findOne({ where: userWhere });
    let isNewUser = false;

    if (!user) {
      isNewUser = true;

      // 🆕 Create new user with provided credentials
      user = await userModel.create({
        fullName: "Guest", // ✅ safe default
        email: email || `guest_${Date.now()}@example.com`,
        phone: phone || "0000000000",
      });
    }

    // 🔑 Generate auth token
    const authToken = generateToken({
      id: String(user.id),
      email: user.email,
    });

    // 🧹 Delete OTP after verification
    const deleteQuery: any = {
      $or: [],
    };

    if (email) deleteQuery.$or.push({ email });
    if (phone) deleteQuery.$or.push({ phone });

    await otpModel.deleteMany(deleteQuery);

    // 🍪 Set token cookie
    res.cookie("token", authToken, {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    return res.status(200).json(
      new ApiResponse(
        {
          token: authToken,
          user,
          isNewUser,
        },
        "Authentication successful",
      ),
    );

    // 🔔 NOTE FOR FRONTEND:
    // If `isNewUser === true`, redirect user to profile completion page.
    // Otherwise, proceed to dashboard/home.
  },
);

// =============================================
// 👤 Get User Profile Controller
// =============================================
export const getUserProfile = asyncHandler(
  async (req: Request, res: Response) => {
    // 🔐 userAuth middleware guarantees req.user
    const userId = req.user?.id;

    if (!userId) {
      throw new ApiError(401, "Unauthorized");
    }

    const user = await userModel.findByPk(userId);

    if (!user) {
      throw new ApiError(404, "User not found");
    }

    return res
      .status(200)
      .json(new ApiResponse(user, "Profile fetched successfully"));
  },
);

// =============================================
// 📝 User Complete Profile Controller
// =============================================
// const completeUserProfile = asyncHandler(async (req, res) => {
//   const userId = req.user.id;
//   const { fullName, email, phone, profileImage, addresses } = req.body || {};

//   // Find existing user
//   const user = await userModel.findByPk(userId);

//   if (!user) {
//     throw new ApiError(404, "User not found");
//   }

//   // Prepare update data
//   const updateData = {};

//   if (fullName) updateData.fullName = fullName;
//   if (email) updateData.email = email;
//   if (phone) updateData.phone = phone;
//   if (profileImage) updateData.profileImage = profileImage;
//   if (addresses && Array.isArray(addresses)) updateData.addresses = addresses;

//   // Update user profile
//   await user.update(updateData);

//   return res
//     .status(200)
//     .json(new ApiResponse(200, user, "Profile completed successfully"));
// });

// =============================================
// 🚪 Logout Controller
// =============================================
export const logout = asyncHandler(async (req: Request, res: Response) => {
  // Clear the authentication cookie
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });

  return res.status(200).json(new ApiResponse("Logged out successfully"));
});

// =============================================
// ADMIN CONTROLLERS
// =============================================

// =============================================
// 📋 Get All Users (Admin Only)
// =============================================
export const getAllUsers = asyncHandler(
  async (req: Request, res: Response) => {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const search = (req.query.search as string) || "";
    const role = (req.query.role as string) || "";
    const status = (req.query.status as string) || "";

    const offset = (page - 1) * limit;

    // ✅ Type-safe WhereOptions
    const whereClause: WhereOptions = {};

    // 🔍 Search filter
    if (search) {
      Object.assign(whereClause, {
        [Op.or]: [
          { fullName: { [Op.like]: `%${search}%` } },
          { email: { [Op.like]: `%${search}%` } },
          { phone: { [Op.like]: `%${search}%` } },
        ],
      });
    }

    // 🎭 Role filter
    if (role) {
      whereClause.roles = { [Op.contains]: [role] };
    }

    // 🚦 Status filter
    if (status) {
      whereClause.status = status;
    }

    const { count, rows: users } = await userModel.findAndCountAll({
      where: whereClause,
      limit,
      offset,
      attributes: {
        exclude: ["refreshToken"],
      },
      order: [["createdAt", "DESC"]],
    });

    return res.status(200).json(
      new ApiResponse(
        {
          users,
          pagination: {
            total: count,
            page,
            limit,
            totalPages: Math.ceil(count / limit),
          },
        },
        "Users fetched successfully",
      ),
    );
  }
);

// =============================================
// 🔄 Update User Status (Admin Only)
// =============================================
// const updateUserStatus = asyncHandler(async (req, res) => {
//   const { userId } = req.params;
//   const { status } = req.body;

//   const validStatuses = ["ACTIVE", "DISABLED", "BLOCKED", "SUSPENDED"];

//   if (!validStatuses.includes(status)) {
//     throw new ApiError(400, "Invalid status value");
//   }

//   const user = await userModel.findByPk(userId);

//   if (!user) {
//     throw new ApiError(404, "User not found");
//   }

//   await user.update({ status });

//   return res
//     .status(200)
//     .json(new ApiResponse(200, user, "User status updated successfully"));
// });

// =============================================
// 🗑️ Delete User (Admin Only)
// =============================================
// const deleteUser = asyncHandler(async (req, res) => {
//   const { userId } = req.params;

//   const user = await userModel.findByPk(userId);

//   if (!user) {
//     throw new ApiError(404, "User not found");
//   }

//   await user.destroy();

//   return res
//     .status(200)
//     .json(new ApiResponse(200, null, "User deleted successfully"));
// });

// module.exports = {
//   sendOtp,
//   verifyOtpAndAuthenticate,
//   getUserProfile,
// completeUserProfile,
// logout,
// Admin controllers
// getAllUsers,
// updateUserStatus,
// deleteUser,
// };

// const verifyOtpAndAuthenticate
// otp, email/phone check karega optModel me
// ab usi email/phone ke sath userModel me check karega
// agar exist karta hai to login kar dega + token de dega
// agar exist nahi karta hai to naya user banayega + token de dega + frontend ko /user-profile pe bhej dega

// userCompleteProfile = update user profile
// authenticated user apna profile complete karega
// or uska data form me default filled hoga => uske
// (jaisa ki fullName, email, phone, profileImage, address)
// aur update ho jayega userModel me
// phir frontend ko dashboard/home pe bhej dega

// getUserProfile = get user profile
// authenticated user apna profile dekh sakta hai

// logut = clear cookie token

// This is for admin user management later

// getAllUsers by  with pagination, search, filter
// status("ACTIVE", "DISABLED", "BLOCKED", "SUSPENDED")

// filter by role ("SELLER", "CUSTOMER")

// updateUserStatus by id (ADMIN only)

// deleteUser by id (ADMIN only)

// 7️⃣ Refresh Token (Future Ready)
