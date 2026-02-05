import { Router } from "express";
import { userAuth, adminAuth } from "../middlewares/auth";

import {
  sendOtp,
  verifyOtpAndAuthenticate,
  getUserProfile,
  // completeUserProfile,
  logout,
  getAllUsers,
  updateAccountStatus,
  // deleteUser,
} from "../controllers/userController";
import { validate } from "../middlewares/zodValidator";
import { sendOtpSchema, verifyOtpSchema } from "../validators/userValidator";

const router = Router();

// =============================================
// 🔓 Public Routes (No Authentication Required)
// =============================================

// Send OTP for login/signup
router.post("/send-otp", validate(sendOtpSchema), sendOtp);

// Verify OTP and authenticate user
router.post("/verify-otp", validate(verifyOtpSchema), verifyOtpAndAuthenticate);

// =============================================
// 🔒 Protected Routes (Authentication Required)
// =============================================

// Get current user profile
router.get("/user-profile", userAuth, getUserProfile);

// Complete user profile (for new users)
// router.put(
//   "/complete-profile",
//   userAuth,
//   completeUserProfileValidator,
//   completeUserProfile,
// );

// Logout user
router.post("/logout", userAuth, logout);

// =============================================
// 🛡️ Admin Routes (Admin Authentication Required)
// =============================================
// router.post("/admin/create", adminAuth, createAdmin);

// Get all users with pagination, search, and filters
router.get("/users", adminAuth, getAllUsers);

// Update user status
router.put("/account-status/:userId", adminAuth, updateAccountStatus);

// Delete user
// router.delete("/admin/users/:userId", adminAuth, deleteUser);

export default router;
