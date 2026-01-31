const express = require("express");
const router = express.Router();
const { userAuth, adminAuth } = require("../middlewares/auth");
const {
  sendOtp,
  verifyOtpAndAuthenticate,
  getUserProfile,
  // completeUserProfile,
  // logout,
  // getAllUsers,
  // updateUserStatus,
  // deleteUser,
} = require("../controllers/userController");

const {
  sendOtpValidator,
  verifyOtpAndAuthenticateValidator,
} = require("../validators/userValidator");

// =============================================
// 🔓 Public Routes (No Authentication Required)
// =============================================

// Send OTP for login/signup
router.post("/send-otp", sendOtpValidator, sendOtp);

// Verify OTP and authenticate user
router.post(
  "/verify-otp",
  verifyOtpAndAuthenticateValidator,
  verifyOtpAndAuthenticate,
);

// =============================================
// 🔒 Protected Routes (Authentication Required)
// =============================================

// Get current user profile
router.get("/profile", userAuth, getUserProfile);

// Complete user profile (for new users)
// router.put(
//   "/complete-profile",
//   userAuth,
//   completeUserProfileValidator,
//   completeUserProfile,
// );

// Logout user
// router.post("/logout", userAuth, logout);

// =============================================
// 🛡️ Admin Routes (Admin Authentication Required)
// =============================================

// Get all users with pagination, search, and filters
// router.get("/admin/users", adminAuth, getAllUsers);

// Update user status
// router.patch(
//   "/admin/users/:userId/status",
//   adminAuth,
//   updateUserStatusValidator,
//   updateUserStatus,
// );

// Delete user
// router.delete("/admin/users/:userId", adminAuth, deleteUser);

module.exports = router;
