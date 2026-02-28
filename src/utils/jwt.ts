import jwt, { JwtPayload, Secret, SignOptions } from "jsonwebtoken";
import { ApiError } from "../utils/ApiError";

interface JwtUserPayload {
  id: string | number;
  email?: string;
  phone?: string;
  roles?: string[];
}

// =============================================
// Generate JWT Token
// =============================================
export const generateToken = (user: JwtUserPayload): string => {
  if (!user?.id) {
    throw new ApiError(
      400,
      "Unable to generate access token. Invalid user information provided.",
    );
  }

  const jwtSecret = process.env.JWT_SECRET as Secret;
  if (!jwtSecret) {
    throw new ApiError(
      500,
      "Server configuration error. Please try again later.",
    );
  }

  const options: SignOptions = {
    expiresIn: (process.env.JWT_EXPIRES_IN ?? "1d") as SignOptions["expiresIn"],
  };

  return jwt.sign(user, jwtSecret, options);
};

// =============================================
// Verify JWT Token
// =============================================
export const verifyToken = (token: string): JwtPayload => {
  if (!token) {
    throw new ApiError(
      401,
      "Access token is required. Please log in to continue.",
    );
  }

  const jwtSecret = process.env.JWT_SECRET as Secret;
  if (!jwtSecret) {
    throw new ApiError(
      500,
      "Server configuration error. Please try again later.",
    );
  }

  try {
    return jwt.verify(token, jwtSecret) as JwtPayload;
  } catch (error: any) {
    if (error.name === "JsonWebTokenError") {
      throw new ApiError(
        401,
        "Invalid authentication token. Please log in again.",
      );
    }
    if (error.name === "TokenExpiredError") {
      throw new ApiError(
        401,
        "Your session has expired. Please log in again to continue.",
      );
    }
    throw new ApiError(
      500,
      "Token verification failed. Please try again later.",
    );
  }
};
