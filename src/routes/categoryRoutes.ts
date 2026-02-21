import { Router } from "express";
import { adminAuth } from "../middlewares/auth";
import { upload } from "../middlewares/multer";

import {
  createCategory,
  getAllCategories,
  getCategoryById,
  deleteCategory,
  isDisableCategory,
} from "../controllers/categoryController";

const router = Router();

// =============================================
// 📦 PUBLIC ROUTES
// =============================================

// Get all categories : GET
// router.get("/categories", getAllCategories);

// Get single category by ID : GET
// router.get("cat/:id",  getCategoryById);

// =============================================
// 👑 ADMIN ROUTES (Protected)
// =============================================

// Create new category : POST
router.post(
  "/create-category",
  adminAuth,
  upload.single("categoryImage"),
  createCategory,
);

// Soft delete category : DELETE
// router.delete(
//   "/:id",
//   adminAuth,
//   deleteCategory,
// );

// Enable / Disable category : PATCH
// router.patch(
//   "/:id/status",
//   adminAuth,
//   isDisableCategory,
// );

export default router;
