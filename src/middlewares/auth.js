const { verifyToken } = require("../utils/jwt");
const { ApiError } = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");

// =============================================
//  🔑 Extract token from header OR cookie
// =============================================
const getTokenFromRequest = (req) => {
  // 1️⃣ From Authorization header (Bearer token)
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer ")
  ) {
    return req.headers.authorization.split(" ")[1];
  }

  // 2️⃣ From cookie
  if (req.cookies && req.cookies.token) {
    return req.cookies.token;
  }

  return null;
};

// =============================================
//  🔐 Authenticate any logged-in user
// =============================================
exports.userAuth = asyncHandler(async (req, res, next) => {
  const token = getTokenFromRequest(req);

  if (!token) {
    throw new ApiError(401, "Authentication required. Please log in.");
  }

  try {
    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    if (error.message === "Token has expired") {
      throw new ApiError(401, "Session expired. Please log in again.");
    }
    throw new ApiError(401, "Invalid authentication token.");
  }
});

// =============================================
// 🛡️ Authenticate ADMIN only
// =============================================
exports.adminAuth = asyncHandler(async (req, res, next) => {
  const token = getTokenFromRequest(req);

  if (!token) {
    throw new ApiError(401, "Authentication required. Please log in.");
  }

  try {
    const decoded = verifyToken(token);

    // Check if user has ADMIN role
    if (!decoded.roles || !decoded.roles.includes("ADMIN")) {
      throw new ApiError(403, "Access denied. Admin privileges required.");
    }

    req.user = decoded;
    next();
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    if (error.message === "Token has expired") {
      throw new ApiError(401, "Session expired. Please log in again.");
    }
    throw new ApiError(401, "Invalid authentication token.");
  }
});
