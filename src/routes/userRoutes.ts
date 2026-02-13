import { Router } from "express";
import { userAuth, adminAuth } from "../middlewares/auth";
import { validate } from "../middlewares/zodValidator";
import { upload } from "../middlewares/multer";
import {
  sendOtp,
  verifyOtpAndAuthenticate,
  getUserProfile,
  completeUserProfile,
  logout,
  getAllUsers,
  updateAccountStatus,
  getUserById,
} from "../controllers/userController";
import {
  sendOtpSchema,
  verifyOtpSchema,
  completeUserProfileSchema,
  getAllUsersSchema,
  updateAccountStatusSchema,
} from "../validators/userValidator";

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
router.put(
  "/complete-profile",
  userAuth,
  upload.single("profileImage"),
  validate(completeUserProfileSchema),
  completeUserProfile,
);

// Logout user
router.post("/logout", userAuth, logout);

// =============================================
// 🛡️ Admin Routes (Admin Authentication Required)
// =============================================

// Get all users with pagination, search, and filters
router.get("/users", adminAuth, validate(getAllUsersSchema), getAllUsers);

// Update user status
router.put(
  "/account-status/:userId",
  adminAuth,
  validate(updateAccountStatusSchema),
  updateAccountStatus,
);

// Get single user by ID
router.get("/single-user/:userId", adminAuth, getUserById);

export default router;
