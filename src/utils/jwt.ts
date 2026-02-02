import jwt, { JwtPayload } from "jsonwebtoken";

interface JwtUserPayload {
  id: string;
  email?: string;
  roles?: string[] | string;
}

// =============================================
// Generate JWT Token
// =============================================
export const generateToken = (user: JwtUserPayload): string => {
  if (!user || !user.id) {
    throw new Error("User object with id is required to generate token");
  }

  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    throw new Error("JWT_SECRET is not defined");
  }

  const payload: JwtUserPayload = {
    id: user.id,
    email: user.email,
    roles: user.roles,
  };

  return jwt.sign(payload, jwtSecret, {
    expiresIn: process.env.JWT_EXPIRES_IN || "1d",
  });
};

// =============================================
// Verify JWT Token
// =============================================
export const verifyToken = (token: string): JwtPayload | string => {
  if (!token) {
    throw new Error("Token is required for verification");
  }

  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    throw new Error("JWT_SECRET is not defined");
  }

  try {
    return jwt.verify(token, jwtSecret);
  } catch (error: any) {
    if (error.name === "JsonWebTokenError") {
      throw new Error("Invalid token");
    } else if (error.name === "TokenExpiredError") {
      throw new Error("Token has expired");
    }
    throw error;
  }
};
