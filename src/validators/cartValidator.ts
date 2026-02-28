import { z } from "zod";

// =============================================
// 🛒 Create Cart Validator
// =============================================
export const createCartSchema = z.object({
  body: z.object({
    userId: z.number().min(1, "User ID is required"),
  }),
});

// =============================================
// 🔄 Update Cart Status Validator
// =============================================
export const updateCartStatusSchema = z.object({
  params: z.object({
    cartId: z.string().regex(/^\d+$/, "Cart ID must be a number"),
  }),
  body: z.object({
    status: z.enum(["ACTIVE", "ORDERED", "ABANDONED"]),
  }),
});
