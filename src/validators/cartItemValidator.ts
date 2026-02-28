import { z } from "zod";

// =============================================
// ➕ Add Item To Cart
// =============================================
export const addCartItemSchema = z.object({
  body: z.object({
    cartId: z
      .number()
      .min(1, "Cart ID is required"),

    productId: z
      .number()
      .min(1, "Product ID is required"),

    sellerId: z
      .number()
      .min(1, "Seller ID is required"),

    quantity: z
      .number()
      .min(1, "Quantity must be at least 1")
      .optional()
      .default(1),
  }),
});

// =============================================
// 🔄 Update Quantity
// =============================================
export const updateCartItemSchema = z.object({
  params: z.object({
    itemId: z.string().regex(/^\d+$/, "Item ID must be numeric"),
  }),
  body: z.object({
    quantity: z.number().min(1, "Quantity must be at least 1"),
  }),
});

// =============================================
// ❌ Delete Item
// =============================================
export const deleteCartItemSchema = z.object({
  params: z.object({
    itemId: z.string().regex(/^\d+$/, "Item ID must be numeric"),
  }),
});