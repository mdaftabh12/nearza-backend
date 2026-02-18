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
  deleteAccount,
  restoreMyProfile,
  getAllUsers,
  updateAccountStatus,
  getUserById,
} from "../controllers/userController";
import {
  sendOtpSchema,
  verifyOtpSchema,
  completeUserProfileSchema,
  updateAccountStatusSchema,
  getAllUsersSchema,
  getUserByIdSchema,
} from "../validators/userValidator";

const router = Router();

// =============================================
// 🔓 PUBLIC ROUTES (No Authentication Required)
// =============================================

// Send OTP for login/signup : POST
router.post("/send-otp", validate(sendOtpSchema), sendOtp);

// Verify OTP and authenticate user : POST
router.post("/verify-otp", validate(verifyOtpSchema), verifyOtpAndAuthenticate);

// ===================================================
// 🔐 PROTECTED ROUTES (User Authentication Required)
// ===================================================

// Get current user profile : GET
router.get("/user-profile", userAuth, getUserProfile);

// Complete user profile (for new users) : PUT
router.put(
  "/complete-profile",
  userAuth,
  upload.single("profileImage"),
  validate(completeUserProfileSchema),
  completeUserProfile,
);

// Logout user : POST
router.post("/logout", userAuth, logout);

// Delete user account (soft delete) : DELETE
router.delete("/delete-account", userAuth, deleteAccount);

// Restore soft-deleted user profile : POST
router.post("/restore-profile", userAuth, restoreMyProfile);

// ================================================
// 👑 ADMIN ROUTES (Admin Authentication Required)
// ================================================

// Get all users with pagination, search, and filters : GET
router.get("/users", adminAuth, validate(getAllUsersSchema), getAllUsers);

// Update user status (ACTIVE, DISABLED, BLOCKED, SUSPENDED) : PUT
router.put(
  "/account-status/:userId",
  adminAuth,
  validate(updateAccountStatusSchema),
  updateAccountStatus,
);

// Get single user by ID : GET
router.get(
  "/single-user/:userId",
  adminAuth,
  validate(getUserByIdSchema),
  getUserById,
);

export default router;
