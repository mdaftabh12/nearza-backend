import { Router } from "express";
import { validate } from "../middlewares/zodValidator";

import {
  addCartItemSchema,
  updateCartItemSchema,
  deleteCartItemSchema,
} from "../validators/cartItemValidator";

import {
  addItemToCart,
  updateCartItem,
  removeCartItem,
  getCartItems,
} from "../controllers/cartItemController";

const router = Router();

// Add product
router.post("/", validate(addCartItemSchema), addItemToCart);

// Get cart items
router.get("/cart/:cartId", getCartItems);

// Update quantity
router.patch("/:itemId", validate(updateCartItemSchema), updateCartItem);

// Delete item
router.delete("/:itemId", validate(deleteCartItemSchema), removeCartItem);

export default router;
