const Joi = require("joi");
const { ApiError } = require("../utils/ApiError");

// =============================================
// 📩 Send OTP Request Validator
// =============================================
const sendOtpValidator = async (req, res, next) => {
  try {
    const schema = Joi.object({
      email: Joi.string()
        .email({ minDomainSegments: 2, tlds: { allow: ["com", "in"] } })
        .messages({
          "string.email": "Please enter a valid email address",
        })
        .optional(),

      phone: Joi.string()
        .pattern(/^[0-9]{10}$/)
        .messages({
          "string.pattern.base": "Phone number must be exactly 10 digits",
        })
        .optional(),
    });

    await schema.validateAsync(req.body || {}, { abortEarly: true });

    // ✅ Manual missing check (THIS IS THE FIX)
    if (!req.body || (!req.body.email && !req.body.phone)) {
      throw new ApiError(
        400,
        "Either email or phone is required to generate OTP",
      );
    }

    next();
  } catch (err) {
    next(
      err instanceof ApiError
        ? err
        : new ApiError(400, err.details?.[0]?.message),
    ); // 🔥 VERY IMPORTANT
  }
};

// =============================================
// 🔐 Verify OTP & Authenticate Validator
// =============================================

const verifyOtpAndAuthenticateValidator = async (req, res, next) => {
  try {
    const schema = Joi.object({
      email: Joi.string()
        .email({ minDomainSegments: 2, tlds: { allow: ["com", "in"] } })
        .messages({
          "string.email": "Please enter a valid email address",
        })
        .optional(),

      phone: Joi.string()
        .pattern(/^[0-9]{10}$/)
        .messages({
          "string.pattern.base": "Phone number must be exactly 10 digits",
        })
        .optional(),

      otp: Joi.string()
        .length(6)
        .pattern(/^[0-9]{6}$/)
        .required()
        .messages({
          "any.required": "OTP is required",
          "string.length": "OTP must be exactly 6 digits",
          "string.pattern.base": "OTP must contain only numbers",
        }),
    });

    await schema.validateAsync(req.body || {}, { abortEarly: true });

    if (!req.body || (!req.body.email && !req.body.phone)) {
      throw new ApiError(
        400,
        "Either email or phone is required to verify OTP",
      );
    }

    next();
  } catch (err) {
    next(
      err instanceof ApiError
        ? err
        : new ApiError(400, err.details?.[0]?.message),
    );
  }
};

module.exports = { sendOtpValidator, verifyOtpAndAuthenticateValidator };

/*


const userRegisterValidator = async (req, res, next) => {
  try {
    const data = req.body;

    const schema = Joi.object({
      email: Joi.string()
        .email({ minDomainSegments: 2, tlds: { allow: ["com", "in"] } })
        .required()
        .messages({
          "string.email": "Please enter a valid email address",
          "any.required": "Email is required",
          "string.empty": "Email cannot be empty",
        }),

      password: Joi.string().length(8).required().messages({
        "string.length": "Password must be exactly 8 characters long",
        "any.required": "Password is required",
        "string.empty": "Password cannot be empty",
      }),

      confirmPassword: Joi.string()
        .valid(Joi.ref("password"))
        .required()
        .messages({
          "any.only": "Confirm password must match with password",
          "any.required": "Confirm password is required",
        }),

      fullName: Joi.string().min(3).max(256).optional().messages({
        "string.min": "Full name must be at least 3 characters",
        "string.max": "Full name cannot exceed 256 characters",
      }),
    });

    await schema.validateAsync(data, { abortEarly: true });
    next();
  } catch (err) {
    return res.status(400).json({
      success: false,
      message: err.details[0].message,
    });
  }
};

*/
