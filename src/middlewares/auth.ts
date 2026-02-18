import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/jwt";
import { ApiError } from "../utils/ApiError";
import asyncHandler from "../utils/asyncHandler";
import { JwtPayload } from "jsonwebtoken";

// =============================================
// 🔑 Extract token from header OR cookie
// =============================================
const getTokenFromRequest = (req: Request): string | null => {
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.split(" ")[1];
  }

  if (req.cookies?.token) {
    return req.cookies.token;
  }

  return null;
};

// =============================================
// 🔐 Authenticate any logged-in user
// =============================================
export const userAuth = asyncHandler(
  async (req: Request, _res: Response, next: NextFunction) => {
    const token = getTokenFromRequest(req);

    if (!token) {
      throw new ApiError(401, "Authentication required. Please log in.");
    }

    try {
      const decoded = verifyToken(token) as JwtPayload & {
        id?: string | number;
        roles?: string[] | string;
      };

      if (!decoded.roles) {
        throw new ApiError(
          403,
          "Access denied. User roles not found in token.",
        );
      }

      req.user = decoded; // ✅ TS happy
      next();
    } catch (error: any) {
      if (error.message === "Token has expired") {
        throw new ApiError(401, "Session expired. Please log in again.");
      }
      throw new ApiError(401, "Invalid authentication token.");
    }
  },
);

// =============================================
// 🛡️ Authenticate ADMIN only
// =============================================
export const adminAuth = asyncHandler(
  async (req: Request, _res: Response, next: NextFunction) => {
    const token = getTokenFromRequest(req);

    if (!token) {
      throw new ApiError(401, "Authentication required. Please log in.");
    }

    try {
      const decoded = verifyToken(token) as JwtPayload & {
        roles?: string[] | string;
      };

      const roles = Array.isArray(decoded.roles)
        ? decoded.roles
        : [decoded.roles];

      if (!roles?.includes("ADMIN")) {
        throw new ApiError(403, "Access denied. Admin privileges required.");
      }

      req.user = decoded; // ✅ TS happy
      next();
    } catch (error: any) {
      if (error instanceof ApiError) throw error;

      if (error.message === "Token has expired") {
        throw new ApiError(401, "Session expired. Please log in again.");
      }

      throw new ApiError(401, "Invalid authentication token.");
    }
  },
);

// =============================================
// 🏪 Authenticate SELLER only
// =============================================
export const sellerAuth = asyncHandler(
  async (req: Request, _res: Response, next: NextFunction) => {
    const token = getTokenFromRequest(req);

    if (!token) {
      throw new ApiError(401, "Authentication required. Please log in.");
    }

    try {
      const decoded = verifyToken(token) as JwtPayload & {
        roles?: string[] | string;
      };

      const roles = Array.isArray(decoded.roles)
        ? decoded.roles
        : [decoded.roles];

      if (!roles?.includes("SELLER")) {
        throw new ApiError(403, "Access denied. Seller privileges required.");
      }

      req.user = decoded;
      next();
    } catch (error: any) {
      if (error instanceof ApiError) throw error;

      if (error.message === "Token has expired") {
        throw new ApiError(401, "Session expired. Please log in again.");
      }

      throw new ApiError(401, "Invalid authentication token.");
    }
  },
);

// =============================================
// 🌍 Global Express Request Augmentation
// =============================================
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload & {
        id?: string | number;
        roles?: string[] | string;
      };
    }
  }
}

export {};
