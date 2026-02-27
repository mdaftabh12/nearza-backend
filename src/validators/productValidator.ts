import { z } from "zod";

/* ============================================================
   📦 CREATE PRODUCT SCHEMA
============================================================ */

export const createProductSchema = z.object({
  body: z
    .object({
      name: z
        .string()
        .min(3, "Product name must be at least 3 characters")
        .max(120)
        .trim(),

      description: z
        .string()
        .min(10, "Description must be at least 10 characters")
        .max(2000)
        .trim(),

      price: z.coerce
        .number()
        .positive("Price must be greater than 0")
        .multipleOf(0.01),

      discountPrice: z
        .union([
          z.coerce.number().min(0).multipleOf(0.01),
          z.literal("").transform(() => undefined),
        ])
        .optional(),

      brand: z.string().min(2).max(50).trim().optional(),

      categoryId: z.coerce.number().int().positive("Category ID must be valid"),

      stock: z.coerce.number().int().min(0).optional(),

      status: z.enum(["DRAFT", "PUBLISHED"]).optional(),
    })
    .refine(
      (data) =>
        data.discountPrice === undefined || data.discountPrice < data.price,
      {
        message: "Discount price must be less than actual price",
        path: ["discountPrice"],
      },
    ),
});

/* ============================================================
   🔄 UPDATE PRODUCT SCHEMA
============================================================ */

export const updateProductSchema = z.object({
  body: z
    .object({
      name: z.string().min(3).max(120).trim().optional(),
      description: z.string().min(10).max(2000).trim().optional(),

      price: z.coerce.number().positive().multipleOf(0.01).optional(),

      discountPrice: z.coerce.number().min(0).multipleOf(0.01).optional(),

      brand: z.string().min(2).max(50).trim().optional(),

      categoryId: z.coerce.number().int().positive().optional(),

      stock: z.coerce.number().int().min(0).optional(),
    })
    .refine(
      (data) =>
        !data.discountPrice || !data.price || data.discountPrice < data.price,
      {
        message: "Discount price must be less than actual price",
        path: ["discountPrice"],
      },
    ),
});

/* ============================================================
   📄 GET PRODUCTS QUERY SCHEMA
============================================================ */

export const getProductsQuerySchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(10),

    minPrice: z.coerce.number().min(0).optional(),
    maxPrice: z.coerce.number().min(0).optional(),

    categoryId: z.coerce.number().int().positive().optional(),

    brand: z.string().min(2).optional(),

    sort: z.enum(["lowToHigh", "highToLow", "latest", "trending"]).optional(),

    search: z.string().min(2).optional(),
  }),
});
