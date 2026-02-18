import { Request, Response } from "express";
import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";
import asyncHandler from "../utils/asyncHandler";
import { categoryModel } from "../models/sql/categoryModel";
import {
  uploadOnCloudinary,
  deleteFromCloudinary,
} from "../services/cloudinary";

export const createCategory = asyncHandler(
  async (req: Request, res: Response) => {
    const { name, description } = req.body as {
      name: string;
      description?: string;
    };
    let categoryImage: string | null = null;

    if (req?.file) {
      const uploadResult = await uploadOnCloudinary(req?.file?.path);
      categoryImage = uploadResult?.url || null;
    }

    const category = await categoryModel.create({
      name,
      description: description || null,
      categoryImage,
    });

    if (!category) {
      throw new ApiError(500, "Unable to create category. Please try again.");
    }

    return res
      .status(201)
      .json(
        new ApiResponse(category, "Category has been created successfully."),
      );
  },
);

export const getAllCategories = asyncHandler(
  async (req: Request, res: Response) => {
    const categories = await categoryModel.findAll({
      where: { isDisabled: false },
      order: [["createdAt", "DESC"]],
    });

    if (!categories.length) {
      throw new ApiError(404, "No categories available.");
    }

    return res
      .status(200)
      .json(new ApiResponse(categories, "Categories retrieved successfully."));
  },
);

export const getCategoryById = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const category = await categoryModel.findOne({
      where: { id, isDisabled: false },
    });

    if (!category) {
      throw new ApiError(404, "The requested category was not found.");
    }
    return res
      .status(200)
      .json(
        new ApiResponse(category, "Category details retrieved successfully."),
      );
  },
);

export const deleteCategory = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const category = await categoryModel.findOne({ where: { id } });

    if (!category) {
      throw new ApiError(404, "The requested category does not exist.");
    }

    if (category.categoryImage) {
      await deleteFromCloudinary(category.categoryImage);
    }

    await category.destroy();

    return res
      .status(200)
      .json(new ApiResponse(null, "Category has been deleted successfully."));
  },
);

export const isDisableCategory = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const category = await categoryModel.findOne({ where: { id } });

    if (!category) {
      throw new ApiError(404, "The requested category does not exist.");
    }

    category.isDisabled = !category.isDisabled;
    await category.save();

    return res
      .status(200)
      .json(
        new ApiResponse(
          category,
          category.isDisabled
            ? "Category has been disabled successfully."
            : "Category has been enabled successfully.",
        ),
      );
  },
);
