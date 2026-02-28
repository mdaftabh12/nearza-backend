import { z } from "zod";

/* =============================================
   📍 Create Address Validator
============================================= */
export const createAddressSchema = z.object({
  body: z.object({
    userId: z.number().min(1, "User ID is required"),
    fullName: z.string().min(2),
    phone: z.string().min(10),
    addressLine: z.string().min(5),
    landmark: z.string().optional(),
    city: z.string().min(2),
    state: z.string().min(2),
    postalCode: z.string().min(4),
    country: z.string().optional(),
    type: z.enum(["HOME", "WORK", "OTHER"]).optional(),
    isDefault: z.boolean().optional(),
  }),
});

/* =============================================
   📍 Update Address Validator
============================================= */
export const updateAddressSchema = z.object({
  params: z.object({
    addressId: z.string().regex(/^\d+$/, "Address ID must be a number"),
  }),
  body: z.object({
    fullName: z.string().optional(),
    phone: z.string().optional(),
    addressLine: z.string().optional(),
    landmark: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    postalCode: z.string().optional(),
    country: z.string().optional(),
    type: z.enum(["HOME", "WORK", "OTHER"]).optional(),
    isDefault: z.boolean().optional(),
  }),
});
