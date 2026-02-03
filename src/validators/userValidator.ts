import { z } from "zod";

// =============================================
// 📩 Send OTP Request Validator
// =============================================
export const sendOtpSchema = z
  .object({
    email: z
      .string()
      .email({ message: "Please enter a valid email address" })
      .regex(
        /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.(com|org|in|net|edu|gov|co\.in|co\.uk)$/,
        "Email must end with valid domain extensions like .com, .org, .in, .net, .edu, .gov",
      )
      .optional()
      .or(z.literal("")),

    phone: z
      .string()
      .regex(
        /^[6-9][0-9]{9}$/,
        "Phone number must be a valid 10-digit Indian mobile number starting with 6-9",
      )
      .optional()
      .or(z.literal("")),
  })
  .refine((data) => data.email || data.phone, {
    message: "Either email or phone is required to generate OTP",
  })
  .refine((data) => !(data.email && data.phone), {
    message: "Provide only one: email OR phone, not both",
  });

// =============================================
// 🔐 Verify OTP & Authenticate Validator
// =============================================

export const verifyOtpSchema = z
  .object({
    email: z
      .string()
      .email("Please enter a valid email address")
      .optional()
      .transform((v) => (v === "" ? undefined : v)),

    phone: z
      .string()
      .regex(/^[6-9][0-9]{9}$/, "Phone number must be 10 digits")
      .optional()
      .transform((v) => (v === "" ? undefined : v)),

    otp: z.string().regex(/^[0-9]{6}$/, "OTP must be exactly 6 digits"),
  })
  .refine((data) => data.email || data.phone, {
    message: "Either email or phone is required to verify OTP",
  })
  .refine((data) => !(data.email && data.phone), {
    message: "Provide only one: email OR phone",
  });

// module.exports = { sendOtpValidator, verifyOtpAndAuthenticateValidator };

// =============================================
// 📩 Send OTP Request Validator
// =============================================
// const sendOtpValidator = async (req, res, next) => {
//   try {
//     const schema = Joi.object({
//       email: Joi.string()
//         .email({ minDomainSegments: 2, tlds: { allow: ["com", "in"] } })
//         .messages({
//           "string.email": "Please enter a valid email address",
//           "string.empty": "Email cannot be empty",
//         })
//         .optional(),

//       phone: Joi.string()
//         .pattern(/^[0-9]{10}$/)
//         .messages({
//           "string.pattern.base": "Phone number must be exactly 10 digits",
//           "string.empty": "Phone number cannot be empty",
//         })
//         .optional(),
//     });

//     // Validate schema
//     await schema.validateAsync(req.body || {}, { abortEarly: true });

//     // Custom validation: Either email OR phone required
//     if (!req.body || (!req.body.email && !req.body.phone)) {
//       throw new ApiError(
//         400,
//         "Either email or phone is required to generate OTP"
//       );
//     }

//     // Custom validation: Both email AND phone not allowed
//     if (req.body.email && req.body.phone) {
//       throw new ApiError(
//         400,
//         "Please provide either email or phone, not both"
//       );
//     }

//     next();
//   } catch (err) {
//     next(
//       err instanceof ApiError
//         ? err
//         : new ApiError(400, err.details?.[0]?.message)
//     );
//   }
// };

// =============================================
// 🔐 Verify OTP & Authenticate Validator
// =============================================
// const verifyOtpAndAuthenticateValidator = async (req, res, next) => {
//   try {
//     const schema = Joi.object({
//       email: Joi.string()
//         .email({ minDomainSegments: 2, tlds: { allow: ["com", "in"] } })
//         .messages({
//           "string.email": "Please enter a valid email address",
//           "string.empty": "Email cannot be empty",
//         })
//         .optional(),

//       phone: Joi.string()
//         .pattern(/^[0-9]{10}$/)
//         .messages({
//           "string.pattern.base": "Phone number must be exactly 10 digits",
//           "string.empty": "Phone number cannot be empty",
//         })
//         .optional(),

//       otp: Joi.string()
//         .length(6)
//         .pattern(/^[0-9]{6}$/)
//         .required()
//         .messages({
//           "any.required": "OTP is required",
//           "string.empty": "OTP cannot be empty",
//           "string.length": "OTP must be exactly 6 digits",
//           "string.pattern.base": "OTP must contain only numbers",
//         }),
//     });

//     // Validate schema
//     await schema.validateAsync(req.body || {}, { abortEarly: true });

//     // Custom validation: Either email OR phone required
//     if (!req.body || (!req.body.email && !req.body.phone)) {
//       throw new ApiError(
//         400,
//         "Either email or phone is required to verify OTP"
//       );
//     }

//     // Custom validation: Both email AND phone not allowed
//     if (req.body.email && req.body.phone) {
//       throw new ApiError(
//         400,
//         "Please provide either email or phone, not both"
//       );
//     }

//     next();
//   } catch (err) {
//     next(
//       err instanceof ApiError
//         ? err
//         : new ApiError(400, err.details?.[0]?.message)
//     );
//   }
// };

// =============================================
// 📝 Complete User Profile Validator
// =============================================
// const completeUserProfileValidator = async (req, res, next) => {
//   try {
//     const schema = Joi.object({
//       fullName: Joi.string()
//         .min(2)
//         .max(100)
//         .trim()
//         .messages({
//           "string.min": "Full name must be at least 2 characters long",
//           "string.max": "Full name cannot exceed 100 characters",
//           "string.empty": "Full name cannot be empty",
//         })
//         .optional(),

//       email: Joi.string()
//         .email({ minDomainSegments: 2, tlds: { allow: ["com", "in"] } })
//         .messages({
//           "string.email": "Please enter a valid email address",
//           "string.empty": "Email cannot be empty",
//         })
//         .optional(),

//       phone: Joi.string()
//         .pattern(/^[0-9]{10}$/)
//         .messages({
//           "string.pattern.base": "Phone number must be exactly 10 digits",
//           "string.empty": "Phone number cannot be empty",
//         })
//         .optional(),

//       profileImage: Joi.string()
//         .uri()
//         .messages({
//           "string.uri": "Profile image must be a valid URL",
//           "string.empty": "Profile image URL cannot be empty",
//         })
//         .optional(),

//       addresses: Joi.array()
//         .items(
//           Joi.object({
//             type: Joi.string()
//               .valid("home", "work", "other")
//               .messages({
//                 "any.only": "Address type must be home, work, or other",
//               })
//               .optional(),

//             street: Joi.string()
//               .min(5)
//               .max(200)
//               .trim()
//               .messages({
//                 "string.min": "Street address must be at least 5 characters",
//                 "string.max": "Street address cannot exceed 200 characters",
//                 "string.empty": "Street address cannot be empty",
//               })
//               .optional(),

//             city: Joi.string()
//               .min(2)
//               .max(50)
//               .trim()
//               .messages({
//                 "string.min": "City must be at least 2 characters",
//                 "string.max": "City cannot exceed 50 characters",
//                 "string.empty": "City cannot be empty",
//               })
//               .optional(),

//             state: Joi.string()
//               .min(2)
//               .max(50)
//               .trim()
//               .messages({
//                 "string.min": "State must be at least 2 characters",
//                 "string.max": "State cannot exceed 50 characters",
//                 "string.empty": "State cannot be empty",
//               })
//               .optional(),

//             pincode: Joi.string()
//               .pattern(/^[0-9]{6}$/)
//               .messages({
//                 "string.pattern.base": "Pincode must be exactly 6 digits",
//                 "string.empty": "Pincode cannot be empty",
//               })
//               .optional(),

//             country: Joi.string()
//               .min(2)
//               .max(50)
//               .trim()
//               .messages({
//                 "string.min": "Country must be at least 2 characters",
//                 "string.max": "Country cannot exceed 50 characters",
//               })
//               .optional(),

//             isDefault: Joi.boolean()
//               .messages({
//                 "boolean.base": "isDefault must be true or false",
//               })
//               .optional(),
//           })
//         )
//         .messages({
//           "array.base": "Addresses must be an array",
//         })
//         .optional(),
//     });

//     // Validate schema
//     await schema.validateAsync(req.body || {}, { abortEarly: true });

//     // Custom validation: At least one field should be provided
//     const hasData = Object.keys(req.body || {}).length > 0;
//     if (!hasData) {
//       throw new ApiError(
//         400,
//         "At least one field is required to update profile"
//       );
//     }

//     next();
//   } catch (err) {
//     next(
//       err instanceof ApiError
//         ? err
//         : new ApiError(400, err.details?.[0]?.message)
//     );
//   }
// };

// =============================================
// 🔄 Update User Status Validator (Admin)
// =============================================
// const updateUserStatusValidator = async (req, res, next) => {
//   try {
//     // Validate params
//     const paramsSchema = Joi.object({
//       userId: Joi.number()
//         .integer()
//         .positive()
//         .required()
//         .messages({
//           "any.required": "User ID is required",
//           "number.base": "User ID must be a number",
//           "number.integer": "User ID must be an integer",
//           "number.positive": "User ID must be a positive number",
//         }),
//     });

//     await paramsSchema.validateAsync(req.params, { abortEarly: true });

//     // Validate body
//     const bodySchema = Joi.object({
//       status: Joi.string()
//         .valid("ACTIVE", "DISABLED", "BLOCKED", "SUSPENDED")
//         .required()
//         .messages({
//           "any.required": "Status is required",
//           "any.only": "Status must be ACTIVE, DISABLED, BLOCKED, or SUSPENDED",
//           "string.empty": "Status cannot be empty",
//         }),
//     });

//     await bodySchema.validateAsync(req.body, { abortEarly: true });

//     next();
//   } catch (err) {
//     next(
//       err instanceof ApiError
//         ? err
//         : new ApiError(400, err.details?.[0]?.message)
//     );
//   }
// };

// =============================================
// 🗑️ Delete User Validator (Admin)
// =============================================
// const deleteUserValidator = async (req, res, next) => {
//   try {
//     const schema = Joi.object({
//       userId: Joi.number()
//         .integer()
//         .positive()
//         .required()
//         .messages({
//           "any.required": "User ID is required",
//           "number.base": "User ID must be a number",
//           "number.integer": "User ID must be an integer",
//           "number.positive": "User ID must be a positive number",
//         }),
//     });

//     await schema.validateAsync(req.params, { abortEarly: true });

//     next();
//   } catch (err) {
//     next(
//       err instanceof ApiError
//         ? err
//         : new ApiError(400, err.details?.[0]?.message)
//     );
//   }
// };

// =============================================
// 📋 Get All Users Query Validator (Admin)
// =============================================
// const getAllUsersValidator = async (req, res, next) => {
//   try {
//     const schema = Joi.object({
//       page: Joi.number()
//         .integer()
//         .min(1)
//         .messages({
//           "number.base": "Page must be a number",
//           "number.integer": "Page must be an integer",
//           "number.min": "Page must be at least 1",
//         })
//         .optional(),

//       limit: Joi.number()
//         .integer()
//         .min(1)
//         .max(100)
//         .messages({
//           "number.base": "Limit must be a number",
//           "number.integer": "Limit must be an integer",
//           "number.min": "Limit must be at least 1",
//           "number.max": "Limit cannot exceed 100",
//         })
//         .optional(),

//       search: Joi.string()
//         .min(1)
//         .max(100)
//         .trim()
//         .messages({
//           "string.min": "Search query must be at least 1 character",
//           "string.max": "Search query cannot exceed 100 characters",
//         })
//         .optional(),

//       role: Joi.string()
//         .valid("CUSTOMER", "SELLER", "ADMIN")
//         .messages({
//           "any.only": "Role must be CUSTOMER, SELLER, or ADMIN",
//         })
//         .optional(),

//       status: Joi.string()
//         .valid("ACTIVE", "DISABLED", "BLOCKED", "SUSPENDED")
//         .messages({
//           "any.only": "Status must be ACTIVE, DISABLED, BLOCKED, or SUSPENDED",
//         })
//         .optional(),
//     });

//     await schema.validateAsync(req.query, { abortEarly: true });

//     next();
//   } catch (err) {
//     next(
//       err instanceof ApiError
//         ? err
//         : new ApiError(400, err.details?.[0]?.message)
//     );
//   }
// };

// module.exports = {
//   sendOtpValidator,
//   verifyOtpAndAuthenticateValidator,
//   completeUserProfileValidator,
//   updateUserStatusValidator,
//   deleteUserValidator,
//   getAllUsersValidator,
// };
