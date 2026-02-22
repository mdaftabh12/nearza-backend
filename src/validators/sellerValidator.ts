import { z } from "zod";

// =============================================
// Seller Status Enum
// =============================================
// enum SellerStatusEnum {
//   PENDING = "PENDING",
//   APPROVED = "APPROVED",
//   REJECTED = "REJECTED",
//   SUSPENDED = "SUSPENDED",
// }

// =============================================
// 📝 Apply for Seller Account Validator
// =============================================
// export const applyForSellerAccountSchema = z.object({
//   body: z.object({
//     storeName: z
//       .string()
//       .min(3, "Store name must be at least 3 characters")
//       .max(100, "Store name cannot exceed 100 characters")
//       .trim(),

//     storeSlug: z
//       .string()
//       .min(3, "Store slug must be at least 3 characters")
//       .max(100, "Store slug cannot exceed 100 characters")
//       .regex(
//         /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
//         "Store slug must be lowercase alphanumeric with hyphens only",
//       )
//       .trim(),

//     description: z
//       .string()
//       .min(10, "Description must be at least 10 characters")
//       .max(500, "Description cannot exceed 500 characters")
//       .trim()
//       .optional(),

//     businessEmail: z
//       .string()
//       .email("Invalid business email address")
//       .regex(
//         /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.(com|org|in|net|edu|gov|co\.in|co\.uk)$/,
//         "Business email must end with valid domain extensions",
//       )
//       .trim(),

//     businessPhone: z
//       .string()
//       .regex(
//         /^[6-9][0-9]{9}$/,
//         "Business phone must be a valid 10-digit Indian mobile number",
//       ),

//     address: z
//       .object({
//         street: z
//           .string()
//           .min(5, "Street address must be at least 5 characters")
//           .max(200, "Street address cannot exceed 200 characters"),
//         city: z
//           .string()
//           .min(2, "City must be at least 2 characters")
//           .max(50, "City cannot exceed 50 characters"),
//         state: z
//           .string()
//           .min(2, "State must be at least 2 characters")
//           .max(50, "State cannot exceed 50 characters"),
//         pincode: z
//           .string()
//           .regex(/^[0-9]{6}$/, "Pincode must be a valid 6-digit number"),
//         country: z
//           .string()
//           .min(2, "Country must be at least 2 characters")
//           .max(50, "Country cannot exceed 50 characters")
//           .default("India"),
//       })
//       .optional(),

//     gstNumber: z
//       .string()
//       .regex(
//         /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/,
//         "Invalid GST number format",
//       )
//       .optional()
//       .or(z.literal("")),

//     panNumber: z
//       .string()
//       .regex(
//         /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/,
//         "Invalid PAN number format (e.g., ABCDE1234F)",
//       )
//       .optional()
//       .or(z.literal("")),
//   }),
// });

// =============================================
// ✏️ Update My Seller Profile Validator
// =============================================
// export const updateMySellerProfileSchema = z.object({
//   body: z
//     .object({
//       storeName: z
//         .string()
//         .min(3, "Store name must be at least 3 characters")
//         .max(100, "Store name cannot exceed 100 characters")
//         .trim()
//         .optional(),

//       storeSlug: z
//         .string()
//         .min(3, "Store slug must be at least 3 characters")
//         .max(100, "Store slug cannot exceed 100 characters")
//         .regex(
//           /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
//           "Store slug must be lowercase alphanumeric with hyphens only",
//         )
//         .trim()
//         .optional(),

//       description: z
//         .string()
//         .min(10, "Description must be at least 10 characters")
//         .max(500, "Description cannot exceed 500 characters")
//         .trim()
//         .optional(),

//       businessEmail: z
//         .string()
//         .email("Invalid business email address")
//         .regex(
//           /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.(com|org|in|net|edu|gov|co\.in|co\.uk)$/,
//           "Business email must end with valid domain extensions",
//         )
//         .trim()
//         .optional(),

//       businessPhone: z
//         .string()
//         .regex(
//           /^[6-9][0-9]{9}$/,
//           "Business phone must be a valid 10-digit Indian mobile number",
//         )
//         .optional(),

//       address: z
//         .object({
//           street: z
//             .string()
//             .min(5, "Street address must be at least 5 characters")
//             .max(200, "Street address cannot exceed 200 characters")
//             .optional(),
//           city: z
//             .string()
//             .min(2, "City must be at least 2 characters")
//             .max(50, "City cannot exceed 50 characters")
//             .optional(),
//           state: z
//             .string()
//             .min(2, "State must be at least 2 characters")
//             .max(50, "State cannot exceed 50 characters")
//             .optional(),
//           pincode: z
//             .string()
//             .regex(/^[0-9]{6}$/, "Pincode must be a valid 6-digit number")
//             .optional(),
//           country: z
//             .string()
//             .min(2, "Country must be at least 2 characters")
//             .max(50, "Country cannot exceed 50 characters")
//             .optional(),
//         })
//         .optional(),

//       gstNumber: z
//         .string()
//         .regex(
//           /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/,
//           "Invalid GST number format",
//         )
//         .optional()
//         .or(z.literal("")),

//       panNumber: z
//         .string()
//         .regex(
//           /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/,
//           "Invalid PAN number format (e.g., ABCDE1234F)",
//         )
//         .optional()
//         .or(z.literal("")),
//     })
//     .refine((data) => Object.keys(data).length > 0, {
//       message: "At least one field is required to update seller profile",
//     }),
// });

// =============================================
// 🔄 Resubmit Seller Application Validator
// =============================================
// export const resubmitSellerApplicationSchema = z.object({
//   body: z
//     .object({
//       storeName: z
//         .string()
//         .min(3, "Store name must be at least 3 characters")
//         .max(100, "Store name cannot exceed 100 characters")
//         .trim()
//         .optional(),

//       storeSlug: z
//         .string()
//         .min(3, "Store slug must be at least 3 characters")
//         .max(100, "Store slug cannot exceed 100 characters")
//         .regex(
//           /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
//           "Store slug must be lowercase alphanumeric with hyphens only",
//         )
//         .trim()
//         .optional(),

//       description: z
//         .string()
//         .min(10, "Description must be at least 10 characters")
//         .max(500, "Description cannot exceed 500 characters")
//         .trim()
//         .optional(),

//       businessEmail: z
//         .string()
//         .email("Invalid business email address")
//         .regex(
//           /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.(com|org|in|net|edu|gov|co\.in|co\.uk)$/,
//           "Business email must end with valid domain extensions",
//         )
//         .trim()
//         .optional(),

//       businessPhone: z
//         .string()
//         .regex(
//           /^[6-9][0-9]{9}$/,
//           "Business phone must be a valid 10-digit Indian mobile number",
//         )
//         .optional(),

//       address: z
//         .object({
//           street: z.string().min(5).max(200).optional(),
//           city: z.string().min(2).max(50).optional(),
//           state: z.string().min(2).max(50).optional(),
//           pincode: z
//             .string()
//             .regex(/^[0-9]{6}$/)
//             .optional(),
//           country: z.string().min(2).max(50).optional(),
//         })
//         .optional(),

//       gstNumber: z
//         .string()
//         .regex(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/)
//         .optional()
//         .or(z.literal("")),

//       panNumber: z
//         .string()
//         .regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/)
//         .optional()
//         .or(z.literal("")),
//     })
//     .optional(),
// });

// =============================================
// ADMIN VALIDATORS
// =============================================

// =============================================
// 🔄 Update Seller Status Validator (Admin)
// =============================================
// export const updateSellerStatusSchema = z.object({
//   params: z.object({
//     sellerId: z.coerce
//       .number()
//       .int()
//       .positive("Seller ID must be a valid positive number"),
//   }),

//   body: z.object({
//     status: z.nativeEnum(SellerStatusEnum, {
//       errorMap: () => ({
//         message: "Status must be PENDING, APPROVED, REJECTED, or SUSPENDED",
//       }),
//     }),
//   }),
// });

// =============================================
// 🗂️ Get Seller Applications Validator (Admin)
// =============================================
// export const getSellerApplicationsSchema = z.object({
//   query: z.object({
//     page: z.coerce.number().int().min(1).optional().default(1),
//     limit: z.coerce.number().int().min(1).max(100).optional().default(10),
//     search: z.string().min(1).max(100).optional(),
//     status: z.nativeEnum(SellerStatusEnum).optional(),
//   }),
// });

// =============================================
// 🗂️ Get Seller By ID Validator (Admin)
// =============================================
// export const getSellerByIdSchema = z.object({
//   params: z.object({
//     sellerId: z.coerce
//       .number()
//       .int()
//       .positive("Seller ID must be a valid positive number"),
//   }),
// });

// =============================================
// 🗑️ Delete Seller Validator (Admin)
// =============================================
// export const deleteSellerSchema = z.object({
//   params: z.object({
//     sellerId: z.coerce
//       .number()
//       .int()
//       .positive("Seller ID must be a valid positive number"),
//   }),
// });

// =============================================
// ♻️ Restore Seller Validator (Admin)
// =============================================
// export const restoreSellerSchema = z.object({
//   params: z.object({
//     sellerId: z.coerce
//       .number()
//       .int()
//       .positive("Seller ID must be a valid positive number"),
//   }),
// });
