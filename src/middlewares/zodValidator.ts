import { ZodSchema, ZodError } from "zod";
import { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/ApiError";

export const validate =
  (schema: ZodSchema) => (req: Request, _res: Response, next: NextFunction) => {
    try {
      schema.parse(req.body);
      next();
    } catch (error: any) {
      if (error instanceof ZodError) {

        // Get the first error message
        const message = error.issues[0]?.message || "Invalid request data";

        // Create ApiError with detailed errors
        const apiError = new ApiError(400, message);
        next(apiError);
      } else {
        next(new ApiError(400, "Invalid request data"));
      }
    }
  };
