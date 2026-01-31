const jwt = require("jsonwebtoken");

// =============================================
// Generate JWT Token
// =============================================
const generateToken = (user) => {
  if (!user || !user.id) {
    throw new Error("User object with id is required to generate token");
  }

  const payload = {
    id: user.id,
    email: user.email,
    roles: user.roles, // ✅ role-based access ready
  };

  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "1d",
  });
};

// =============================================
// Verify JWT Token
// =============================================
const verifyToken = (token) => {
  if (!token) {
    throw new Error("Token is required for verification");
  }

  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      throw new Error("Invalid token");
    } else if (error.name === "TokenExpiredError") {
      throw new Error("Token has expired");
    }
    throw error;
  }
};

module.exports = {
  generateToken,
  verifyToken,
};
