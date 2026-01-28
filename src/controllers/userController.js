const asyncHandler = require("../utils/asyncHandler");
const { ApiError } = require("../utils/ApiError");
const { ApiResponse } = require("../utils/ApiResponse");
const { otpModel } = require("../models/mongo/otpModel");
const { generateOTP } = require("../utils/generateOTP");
const { userModel } = require("../models/sql/userModel");

// =============================================
// 📩 Send OTP Controller
// =============================================

const sendOtp = asyncHandler(async (req, res) => {
  const { email, phone } = req.body || {};

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

  // 🔍 Find latest OTP for email or phone
  const otpQuery = email ? { email, otp } : { phone, otp };

  const otpRecord = await otpModel.findOne(otpQuery).sort({ createdAt: -1 });

  // ❌ OTP not found
  if (!otpRecord) {
    throw new ApiError(400, "Invalid OTP. Please try again.");
  }

  // ⏰ OTP expired
  if (otpRecord.expiresAt < currentTime) {
    throw new ApiError(400, "OTP has expired. Please request a new one.");
  }

  // 🧾 Identify user field
  const userWhere = email ? { email } : { phone };

  // 👤 Check if user exists (SQL)
  let user = await userModel.findOne({ where: userWhere });

  // 🆕 Create user if not exists
  if (!user) {
    user = await userModel.create(userWhere);
  }

  // 🔑 Generate auth token
  const authToken = user.generateAuthToken();

  // 🧹 Delete OTP after successful verification (SECURITY)
  await otpModel.deleteMany({
    email: email || undefined,
    phone: phone || undefined,
  });

  // 🍪 Set token cookie (optional)
  res.cookie("token", authToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        token: authToken,
        user,
        isNewUser: !user.createdAt, // optional flag
      },
      "Authentication successful",
    ),
  );
});

module.exports = { sendOtp, verifyOtpAndAuthenticate };

// const verifyOtpAndRegister
// otp, email/phone check karega optModel me
// ab usi email/phone ke sath userModel me check karega
// agar exist karta hai to login kar dega + token de dega
// agar exist nahi karta hai to naya user banayega + token de dega + frontend ko /user-profile pe bhej dega
