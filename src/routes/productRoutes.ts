import { Router } from "express";
import { sellerAuth, adminAuth } from "../middlewares/auth";
import { upload } from "../middlewares/multer";
import { validate } from "../middlewares/zodValidator";
import {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  toggleProductStatus,
  getSellerProducts,
  adminGetProducts,
  adminDeleteProduct,
} from "../controllers/productController";
import {
  createProductSchema,
  updateProductSchema,
  getProductsQuerySchema,
} from "../validators/productValidator";
import { validateImages } from "../middlewares/imageValidator";

const router = Router();

/* ============================================================
   🌍 PUBLIC ROUTES
============================================================ */

// Get all published products
router.get("/get-products", validate(getProductsQuerySchema), getProducts);

// Get single product
router.get("/get-product-by-id/:productId", getProductById);

/* ============================================================
   🧑‍💼 SELLER ROUTES
============================================================ */

// Create product
router.post(
  "/create-product",
  sellerAuth,
  upload.array("productImage", 5),
  validateImages({ required: true, maxCount: 5 }),
  validate(createProductSchema),
  createProduct,
);

// Seller products
router.get("/seller-products", sellerAuth, getSellerProducts);

// Update product
router.put(
  "/update-product/:productId",
  sellerAuth,
  upload.array("productImage", 5),
  validateImages({ required: false, maxCount: 5 }),
  validate(updateProductSchema),
  updateProduct,
);

// Toggle status
router.put("/toggle-status/:productId", sellerAuth, toggleProductStatus);

// Soft delete
router.delete("/delete-product/:productId", sellerAuth, deleteProduct);

/* ============================================================
   👑 ADMIN ROUTES
============================================================ */

router.get("/admin-products", adminAuth, adminGetProducts);

router.delete("/admin-delete-product/:productId", adminAuth, adminDeleteProduct);

export default router;
