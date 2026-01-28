const { ApiError } = require("../utils/ApiError");

const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal Server Error";

  // ✅ Joi validation error
  if (err.isJoi) {
    statusCode = 400;
    message = err.details[0].message;
  }

  // ✅ Mongoose validation error
  if (err.name === "ValidationError") {
    statusCode = 400;
    message = Object.values(err.errors)[0].message;
  }

  // ✅ Mongo duplicate key
  if (err.code === 11000) {
    statusCode = 409;
    message = "Duplicate value already exists";
  }

  return res.status(statusCode).json({
    success: false,
    message,
  });
};

module.exports = errorHandler;
