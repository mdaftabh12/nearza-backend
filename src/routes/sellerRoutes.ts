import { Router } from "express";
import { userAuth, adminAuth, sellerAuth } from "../middlewares/auth";
import { validate } from "../middlewares/zodValidator";
import {
  applyForSellerAccount,
  getMyApplication,
  getMySellerProfile,
  updateMySellerProfile,
  deleteMySellerProfile,
  restoreMySellerProfile,
  resubmitSellerApplication,
  updateSellerStatus,
  getSellerApplications,
  getSellerById,
  deleteSeller,
  restoreSeller,
} from "../controllers/sellerController";
// import {
//   applyForSellerAccountSchema,
//   updateMySellerProfileSchema,
//   resubmitSellerApplicationSchema,
//   updateSellerStatusSchema,
//   getSellerApplicationsSchema,
//   getSellerByIdSchema,
//   deleteSellerSchema,
//   restoreSellerSchema,
// } from "../validators/sellerValidator";

const router = Router();

// ================================================
// 🔐 USER ROUTES (User Authentication Required)
// ================================================

// Apply for seller account (only for authenticated users, not already sellers or pending applicants) : POST
router.post(
  "/apply-for-seller",
  userAuth,
  // validate(applyForSellerAccountSchema),
  applyForSellerAccount,
);

router.get("/my-application", userAuth, getMyApplication);

// Resubmit seller application (rejected sellers only) : POST
// router.post(
//   "/resubmit-application-for-seller",
//   userAuth,
//   validate(resubmitSellerApplicationSchema),
//   resubmitSellerApplication,
// );

// ==================================================
// 🛍️ SELLER ROUTES (Seller Authentication Required)
// ==================================================

// Get current seller's profile (approved sellers only) : GET
router.get("/my-seller-profile", sellerAuth, getMySellerProfile);

// Update seller profile (approved sellers only) : PUT
// router.put(
//   "/update-seller-profile",
//   sellerAuth,
//   validate(updateMySellerProfileSchema),
//   updateMySellerProfile,
// );

// Soft delete seller profile (approved sellers only) : DELETE
// router.delete("/delete-seller-profile", sellerAuth, deleteMySellerProfile);

// Restore soft-deleted seller profile (approved sellers only) : POST
// router.post("/restore-seller-profile", sellerAuth, restoreMySellerProfile);

// ================================================
// 👑 ADMIN ROUTES (Admin Authentication Required)
// ================================================

// Get all seller applications with filters and pagination : GET
router.get(
  "/seller-applications",
  adminAuth,
  // validate(getSellerApplicationsSchema),
  getSellerApplications,
);

//  Get seller details by ID : GET
router.get(
  "/seller-profile/:sellerId",
  adminAuth,
  // validate(getSellerByIdSchema),
  getSellerById,
);

// Update seller status (approve/reject/suspend) : PUT
router.put(
  "/update-seller-status/:sellerId",
  adminAuth,
  // validate(updateSellerStatusSchema),
  updateSellerStatus,
);

// Soft delete seller profile (admin only) : DELETE
// router.delete(
//   "delete-seller/:sellerId",
//   adminAuth,
//   validate(deleteSellerSchema),
//   deleteSeller,
// );

// Restore soft-deleted seller profile (admin only) : POST
// router.post(
//   "/restore-seller/:sellerId",
//   adminAuth,
//   validate(restoreSellerSchema),
//   restoreSeller,
// );

export default router;
