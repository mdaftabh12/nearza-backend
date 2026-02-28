import { Router } from "express";
import { validate } from "../middlewares/zodValidator";
import {
  createCartSchema,
  updateCartStatusSchema,
} from "../validators/cartValidator";

import {
  createCart,
  getUserCarts,
  getCartById,
  updateCartStatus,
  deleteCart,
} from "../controllers/cartController";

const router = Router();

// Create Cart
router.post("/", validate(createCartSchema), createCart);

// Get All Carts of User
router.get("/user/:userId", getUserCarts);

// Get Single Cart
router.get("/:cartId", getCartById);

// Update Cart Status
router.patch(
  "/:cartId/status",
  validate(updateCartStatusSchema),
  updateCartStatus,
);

// Delete Cart
router.delete("/:cartId", deleteCart);

export default router;
