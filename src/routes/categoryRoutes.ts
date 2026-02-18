import { Router } from "express";
import { adminAuth } from "../middlewares/auth";
import { upload } from "../middlewares/multer";
import { createCategory } from "../controllers/categoryController";

const router = Router();

// Create a new category
router.post(
  "/create-category",
  adminAuth,
  upload.single("categoryImage"),
  createCategory,
);

export default router;
