import jwt, { JwtPayload, Secret, SignOptions } from "jsonwebtoken";

interface JwtUserPayload {
  id: string | number;
  email?: string;
  roles?: string[] | string;
}

// =============================================
// Generate JWT Token
// =============================================
export const generateToken = (user: JwtUserPayload): string => {
  if (!user?.id) {
    throw new Error("User object with id is required to generate token");
  }

  const jwtSecret = process.env.JWT_SECRET as Secret;
  if (!jwtSecret) {
    throw new Error("JWT_SECRET is not defined");
  }

  const options: SignOptions = {
    expiresIn: (process.env.JWT_EXPIRES_IN ?? "1d") as SignOptions["expiresIn"],
  };

  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      roles: user.roles,
    },
    jwtSecret,
    options
  );
};

// =============================================
// Verify JWT Token
// =============================================
export const verifyToken = (token: string): JwtPayload => {
  if (!token) {
    throw new Error("Token is required for verification");
  }

  const jwtSecret = process.env.JWT_SECRET as Secret;
  if (!jwtSecret) {
    throw new Error("JWT_SECRET is not defined");
  }

  try {
    return jwt.verify(token, jwtSecret) as JwtPayload;
  } catch (error: any) {
    if (error.name === "JsonWebTokenError") {
      throw new Error("Invalid token");
    }
    if (error.name === "TokenExpiredError") {
      throw new Error("Token has expired");
    }
    throw error;
  }
};
