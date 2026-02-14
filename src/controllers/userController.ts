import { Request, Response } from "express";
import asyncHandler from "../utils/asyncHandler";
import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";
import otpModel from "../models/mongo/otpModel";
import { userModel, UserStatus } from "../models/sql/userModel";
import { generateOTP } from "../utils/generateOTP";
import { generateToken } from "../utils/jwt";
import { Op, WhereOptions } from "sequelize";
import {
  uploadOnCloudinary,
  deleteFromCloudinary,
} from "../services/cloudinary";

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
        email: email || `guest${Date.now()}@example.com`,
        phone: phone || "0000000000",
      });
    }

    // 🚫 STATUS CHECK (IMPORTANT PART)
    if (user.status === "BLOCKED") {
      throw new ApiError(403, "Your account has been blocked by admin.");
    }

    if (user.status === "DISABLED") {
      throw new ApiError(
        403,
        "Your account is disabled. Please contact support.",
      );
    }

    if (user.status === "SUSPENDED") {
      throw new ApiError(403, "Your account is temporarily suspended.");
    }

    // 🔑 Generate auth token
    const authToken = generateToken({
      id: String(user.id),
      email: user.email,
    });

    // 🧹 Delete OTP
    await otpModel.deleteMany(email ? { email } : { phone });

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
export const completeUserProfile = asyncHandler(
  async (req: Request & { file?: any; user?: any }, res: Response) => {
    const userId = req.user?.id;

    if (!userId) {
      throw new ApiError(401, "Unauthorized");
    }

    const user = await userModel.findByPk(userId);

    if (!user) {
      throw new ApiError(404, "User not found");
    }

    const { fullName, email, phone, addresses } = req.body || {};
    const updateData: any = {};

    // ========= Image Handling =========
    if (req?.file) {
      // delete old image
      if (user?.profileImage) {
        await deleteFromCloudinary(user.profileImage);
      }

      const uploadedImage = await uploadOnCloudinary(req?.file?.path);

      if (!uploadedImage?.secure_url) {
        throw new ApiError(500, "Failed to upload profile image");
      }

      updateData.profileImage = uploadedImage.secure_url;
    }

    // ========= Other Fields =========
    if (fullName) updateData.fullName = fullName;
    if (email) updateData.email = email;
    if (phone) updateData.phone = phone;
    if (addresses) updateData.addresses = addresses;

    // ========= Ensure at least one field =========
    if (Object.keys(updateData).length === 0) {
      throw new ApiError(
        400,
        "At least one field is required to update profile",
      );
    }

    await user.update(updateData);

    return res
      .status(200)
      .json(new ApiResponse(user, "Profile updated successfully"));
  },
);

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
// 🔐 Delete Account Controller
// =============================================
export const deleteAccount = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?.id;

    if (!userId) {
      throw new ApiError(401, "Unauthorized");
    }
    const user = await userModel.findByPk(userId);

    if (!user) {
      throw new ApiError(404, "User not found");
    }

    await user.destroy();
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });
    return res
      .status(200)
      .json(new ApiResponse("User account deleted successfully"));
  },
);

// =============================================
// ♻️ Restore My User Profile
// =============================================
export const restoreMyProfile = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?.id;

    if (!userId) {
      throw new ApiError(401, "Unauthorized");
    }
    const user = await userModel.findOne({
      where: { id: userId },
      paranoid: false, // Include soft-deleted records
    });

    if (!user) {
      throw new ApiError(404, "User not found");
    }

    await user.restore();

    return res
      .status(200)
      .json(new ApiResponse(user, "User profile restored successfully"));
  },
);

// =============================================
// ADMIN CONTROLLERS
// =============================================

// =============================================
// 📋 Get All Users (Admin Only)
// =============================================
export const getAllUsers = asyncHandler(async (req: Request, res: Response) => {
  const page = Math.max(Number(req.query.page) || 1, 1);
  const limit = Math.min(Number(req.query.limit) || 20, 100);
  const search = req.query.search as string | undefined;
  const role = req.query.role as string | undefined;
  const status = req.query.status as UserStatus | undefined;

  const offset = (page - 1) * limit;

  const whereClause: WhereOptions<any> = {
    ...(search && {
      [Op.or]: [
        { fullName: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } },
        { phone: { [Op.iLike]: `%${search}%` } },
      ],
    }),
    ...(role && { roles: { [Op.contains]: [role] } }),
    ...(status && { status }),
  };

  const { count, rows } = await userModel.findAndCountAll({
    where: whereClause,
    limit,
    offset,
    attributes: { exclude: ["refreshToken"] },
    order: [["createdAt", "DESC"]],
  });

  return res.status(200).json(
    new ApiResponse(
      {
        users: rows,
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
});

// =============================================
// 🔄 Update User Status (Admin Only)
// =============================================
export const updateAccountStatus = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = Number(req.params.userId);
    const { status } = req.body as { status: UserStatus };

    const user = await userModel.findByPk(userId);

    if (!user) {
      throw new ApiError(404, "User not found");
    }

    await user.update({ status });

    return res
      .status(200)
      .json(new ApiResponse(user, "User status updated successfully"));
  },
);

// =============================================
// 👤 Get Single User (Admin View)
// =============================================
export const getUserById = asyncHandler(async (req: Request, res: Response) => {
  const userId = Number(req.params.userId);

  const user = await userModel.findByPk(userId);
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(user, "User details fetched successfully"));
});
