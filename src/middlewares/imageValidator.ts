import { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/ApiError";
import { cleanupTempFiles } from "../helpers/fileCleanupHelper";

interface ImageValidatorOptions {
  required?: boolean;
  maxCount?: number;
  allowedMimeTypes?: string[];
}

export const validateImages = (options?: ImageValidatorOptions) => {
  const {
    required = true,
    maxCount = 5,
    allowedMimeTypes = [
      "image/png",
      "image/jpeg",
      "image/jpg",
      "image/webp",
      "image/svg+xml",
    ],
  } = options || {};

  return (req: Request, res: Response, next: NextFunction) => {
    let files: Express.Multer.File[] = [];

    // 🔥 Handle single file
    if (req.file) {
      files = [req.file];
    }

    // 🔥 Handle array
    else if (Array.isArray(req.files)) {
      files = req.files;
    }

    // 🔥 Handle fields()
    else if (req.files && typeof req.files === "object") {
      files = Object.values(req.files).flat() as Express.Multer.File[];
    }

    // 🔐 Required Check
    if (required && files.length === 0) {
      return next(new ApiError(400, "At least one image is required"));
    }

    if (!required && files.length === 0) {
      return next();
    }

    // 🔢 Max Count Check
    if (files.length > maxCount) {
      cleanupTempFiles(files);
      return next(new ApiError(400, `Maximum ${maxCount} images allowed`));
    }

    // 🎯 MIME Type Check
    for (const file of files) {
      if (!allowedMimeTypes.includes(file.mimetype)) {
        cleanupTempFiles(files);
        return next(
          new ApiError(
            400,
            "Invalid image format. Allowed: PNG, JPG, JPEG, WEBP, SVG",
          ),
        );
      }
    }

    next();
  };
};
