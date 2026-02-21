import { ZodSchema, ZodError } from "zod";
import { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/ApiError";

export const validate =
  (schema: ZodSchema) => (req: Request, _res: Response, next: NextFunction) => {
    try {
     const result = schema.parse({
        body: req.body,
        params: req.params,
        query: req.query,
      }) as { body?: any; params?: any; query?: any };

      // console.log("Validated Result:", result);   // ✅ log full result
      // console.log("Validated Body:", result.body); // ✅ log only body

      req.body = result.body ?? req.body;
      req.params = result.params ?? req.params;
      Object.assign(req.query, result.query ?? req.query);

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
