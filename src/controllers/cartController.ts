import { Request, Response } from "express";
import asyncHandler from "../utils/asyncHandler";
import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";
import { cartModel } from "../models/sql/cartModel";
import { userModel } from "../models/sql/userModel";
import { cartItemModel } from "../models/sql/cartItemModel";

// =============================================
// 🛒 Create Cart
// =============================================
export const createCart = asyncHandler(async (req: Request, res: Response) => {
  const { userId } = req.body;

  // Check user exists
  const user = await userModel.findByPk(userId);
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const cart = await cartModel.create({
    userId,
    status: "ACTIVE",
  });

  return res
    .status(201)
    .json(new ApiResponse(cart, "Cart created successfully"));
});

// =============================================
// 📦 Get All Carts of a User
// =============================================
export const getUserCarts = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = Number(req.params.userId);

    const carts = await cartModel.findAll({
      where: { userId },
      include: [
        {
          model: cartItemModel,
          as: "items",
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    return res
      .status(200)
      .json(new ApiResponse(carts, "User carts fetched successfully"));
  },
);

// =============================================
// 🔍 Get Single Cart
// =============================================
export const getCartById = asyncHandler(async (req: Request, res: Response) => {
  const cartId = Number(req.params.cartId);

  const cart = await cartModel.findByPk(cartId, {
    include: [
      {
        model: cartItemModel,
        as: "items",
      },
    ],
  });

  if (!cart) {
    throw new ApiError(404, "Cart not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(cart, "Cart fetched successfully"));
});

// =============================================
// 🔄 Update Cart Status
// =============================================
export const updateCartStatus = asyncHandler(
  async (req: Request, res: Response) => {
    const cartId = Number(req.params.cartId);
    const { status } = req.body;

    const cart = await cartModel.findByPk(cartId);

    if (!cart) {
      throw new ApiError(404, "Cart not found");
    }

    cart.status = status;
    await cart.save();

    return res
      .status(200)
      .json(new ApiResponse(cart, "Cart status updated successfully"));
  },
);

// =============================================
// ❌ Delete Cart
// =============================================
export const deleteCart = asyncHandler(async (req: Request, res: Response) => {
  const cartId = Number(req.params.cartId);

  const cart = await cartModel.findByPk(cartId);

  if (!cart) {
    throw new ApiError(404, "Cart not found");
  }

  await cart.destroy();

  return res
    .status(200)
    .json(new ApiResponse(null, "Cart deleted successfully"));
});
