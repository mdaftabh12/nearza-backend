import { z } from "zod";

// Add / Toggle Wishlist
export const wishlistSchema = z.object({
  body: z.object({
    userId: z.number().min(1, "User ID is required"),
    productId: z.number().min(1, "Product ID is required"),
  }),
});

// Get User Wishlist
export const getUserWishlistSchema = z.object({
  params: z.object({
    userId: z.string().regex(/^\d+$/, "User ID must be a number"),
  }),
});

// Remove Wishlist
export const removeWishlistSchema = z.object({
  params: z.object({
    userId: z.string().regex(/^\d+$/, "User ID must be a number"),
    productId: z.string().regex(/^\d+$/, "Product ID must be a number"),
  }),
});
