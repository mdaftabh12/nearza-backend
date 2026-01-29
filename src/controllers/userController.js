const asyncHandler = require("../utils/asyncHandler");
const { ApiError } = require("../utils/ApiError");
const { ApiResponse } = require("../utils/ApiResponse");
const { otpModel } = require("../models/mongo/otpModel");
const { generateOTP } = require("../utils/generateOTP");
const { userModel } = require("../models/sql/userModel");
const generateToken = require("../utils/jwt");

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

  // ✅ Production: Hide OTP in real env
  const responseData = {
    email,
    phone,
    otp, // 🔥 Remove/comment this in production
  };

  return res
    .status(200)
    .json(new ApiResponse(200, responseData, "OTP send successful"));
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

  // 🔍 Find latest OTP
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

  // 🆕 Create user if not exists
  if (!user) {
    isNewUser = true;

    user = await userModel.create({
      fullName: "Guest", // ✅ safe default
      email: email || "guest@gmail.com",
      phone: phone || "1234567890",
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

const userCompleteProfile = asyncHandler(async (req, res) => {
  // To be implemented
});

module.exports = { sendOtp, verifyOtpAndAuthenticate };

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