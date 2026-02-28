import { Router } from "express";
import { validate } from "../middlewares/zodValidator";
import {
  wishlistSchema,
  getUserWishlistSchema,
  removeWishlistSchema,
} from "../validators/wishlistValidator";

import {
  toggleWishlist,
  getUserWishlist,
  removeWishlistItem,
  clearWishlist,
  checkWishlistStatus,
} from "../controllers/wishlistController";

const router = Router();

// Toggle (Add / Remove)
router.post("/toggle", validate(wishlistSchema), toggleWishlist);

// Get User Wishlist
router.get("/:userId", validate(getUserWishlistSchema), getUserWishlist);

// Remove specific item
router.delete(
  "/:userId/:productId",
  validate(removeWishlistSchema),
  removeWishlistItem,
);

// Clear Wishlist
router.delete("/:userId", clearWishlist);

// Check Status
router.post("/check", validate(wishlistSchema), checkWishlistStatus);

export default router;
