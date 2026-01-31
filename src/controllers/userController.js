const asyncHandler = require("../utils/asyncHandler");
const { ApiError } = require("../utils/ApiError");
const { ApiResponse } = require("../utils/ApiResponse");
const { otpModel } = require("../models/mongo/otpModel");
const { generateOTP } = require("../utils/generateOTP");
const { userModel } = require("../models/sql/userModel");
const { generateToken } = require("../utils/jwt");

// =============================================
// 📩 Send OTP Controller
// =============================================
const sendOtp = asyncHandler(async (req, res) => {
  const { email, phone } = req.body || {};

  // 🛑 Safety check
  if (email && phone) {
    throw new ApiError(
      400,
      "Either email or phone is required to generate OTP",
    );
  }

  // Generate OTP
  const otp = generateOTP();

  const createOtp = await otpModel.create({
    email: email || null,
    phone: phone || null,
    otp,
    expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes expiry
  });

  // Handle unexpected DB failure
  if (!createOtp) {
    throw new ApiError(500, "Failed to generate OTP. Please try again.");
  }

  // TODO: Send OTP via email/SMS service
  // await sendEmail(email, otp) or await sendSMS(phone, otp)

  const responseData = {
    email,
    phone,
    otp, // ⚠️ REMOVE IN PRODUCTION - for development only
  };

  return res
    .status(200)
    .json(new ApiResponse(200, responseData, "OTP sent successfully"));
});

// =============================================
// 🔐 Verify OTP & Authenticate User
// =============================================
const verifyOtpAndAuthenticate = asyncHandler(async (req, res) => {
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
  const authToken = generateToken(user);

  // 🧹 Delete OTP after verification
  await otpModel.deleteMany({
    $or: [email ? { email } : null, phone ? { phone } : null].filter(Boolean),
  });

  // 🍪 Set token cookie
  res.cookie("token", authToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });

  return res.json(
    new ApiResponse(
      200,
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
});

// =============================================
// 👤 Get User Profile Controller
// =============================================
const getUserProfile = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const user = await userModel.findByPk(userId, {
    attributes: {
      exclude: ["refreshToken"],
    },
    include: [
      {
        association: "sellerProfile",
      },
    ],
  });

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, user, "Profile fetched successfully"));
});

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
const logout = asyncHandler(async (req, res) => {
  // Clear the authentication cookie
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Logged out successfully"));
});

// =============================================
// ADMIN CONTROLLERS
// =============================================

// =============================================
// 📋 Get All Users (Admin Only)
// =============================================
// const getAllUsers = asyncHandler(async (req, res) => {
//   const {
//     page = 1,
//     limit = 10,
//     search = "",
//     role = "",
//     status = "",
//   } = req.query;

//   const offset = (page - 1) * limit;

//   // Build where clause
//   const whereClause = {};

//   // Search by name, email, or phone
//   if (search) {
//     whereClause[Op.or] = [
//       { fullName: { [Op.like]: `%${search}%` } },
//       { email: { [Op.like]: `%${search}%` } },
//       { phone: { [Op.like]: `%${search}%` } },
//     ];
//   }

//   // Filter by role
//   if (role) {
//     whereClause.roles = { [Op.contains]: [role] };
//   }

//   // Filter by status
//   if (status) {
//     whereClause.status = status;
//   }

//   const { count, rows: users } = await userModel.findAndCountAll({
//     where: whereClause,
//     limit: parseInt(limit),
//     offset: parseInt(offset),
//     attributes: {
//       exclude: ["refreshToken"],
//     },
//     order: [["createdAt", "DESC"]],
//   });

//   return res.status(200).json(
//     new ApiResponse(
//       200,
//       {
//         users,
//         pagination: {
//           total: count,
//           page: parseInt(page),
//           limit: parseInt(limit),
//           totalPages: Math.ceil(count / limit),
//         },
//       },
//       "Users fetched successfully",
//     ),
//   );
// });

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

module.exports = {
  sendOtp,
  verifyOtpAndAuthenticate,
  getUserProfile,
  // completeUserProfile,
  // logout,
  // Admin controllers
  // getAllUsers,
  // updateUserStatus,
  // deleteUser,
};

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
