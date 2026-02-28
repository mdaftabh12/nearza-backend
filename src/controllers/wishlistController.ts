import { Request, Response } from "express";
import asyncHandler from "../utils/asyncHandler";
import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";
import { wishlistModel } from "../models/sql/wishlistModel";
import { userModel } from "../models/sql/userModel";
import { productModel } from "../models/sql/productModel";
import { sellerModel } from "../models/sql/sellerModel";
import { categoryModel } from "../models/sql/categoryModel";

// =============================================
// ❤️ Toggle Wishlist (Add / Remove)
// =============================================
export const toggleWishlist = asyncHandler(
  async (req: Request, res: Response) => {
    const { userId, productId } = req.body;

    // Check user
    const user = await userModel.findByPk(userId);
    if (!user) throw new ApiError(404, "User not found");

    // Check product
    const product = await productModel.findByPk(productId);
    if (!product) throw new ApiError(404, "Product not found");

    const existing = await wishlistModel.findOne({
      where: { userId, productId },
    });

    if (existing) {
      await existing.destroy();
      return res
        .status(200)
        .json(new ApiResponse(null, "Removed from wishlist"));
    }

    const wishlist = await wishlistModel.create({ userId, productId });

    return res.status(201).json(new ApiResponse(wishlist, "Added to wishlist"));
  },
);

// =============================================
// 📄 Get User Wishlist (Optimized Include)
// =============================================
export const getUserWishlist = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = Number(req.params.userId);

    const wishlist = await wishlistModel.findAll({
      where: { userId },
      include: [
        {
          model: productModel,
          as: "product",
          include: [
            { model: sellerModel, as: "seller" },
            { model: categoryModel, as: "category" },
          ],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    return res
      .status(200)
      .json(new ApiResponse(wishlist, "Wishlist fetched successfully"));
  },
);

// =============================================
// ❌ Remove Specific Wishlist Item
// =============================================
export const removeWishlistItem = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = Number(req.params.userId);
    const productId = Number(req.params.productId);

    const deleted = await wishlistModel.destroy({
      where: { userId, productId },
    });

    if (!deleted) throw new ApiError(404, "Wishlist item not found");

    return res.status(200).json(new ApiResponse(null, "Wishlist item removed"));
  },
);

// =============================================
// 🧹 Clear Entire Wishlist
// =============================================
export const clearWishlist = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = Number(req.params.userId);

    await wishlistModel.destroy({ where: { userId } });

    return res
      .status(200)
      .json(new ApiResponse(null, "Wishlist cleared successfully"));
  },
);

// =============================================
// 🔍 Check If Product Wishlisted
// =============================================
export const checkWishlistStatus = asyncHandler(
  async (req: Request, res: Response) => {
    const { userId, productId } = req.body;

    const exists = await wishlistModel.findOne({
      where: { userId, productId },
    });

    return res
      .status(200)
      .json(
        new ApiResponse({ isWishlisted: !!exists }, "Wishlist status checked"),
      );
  },
);
