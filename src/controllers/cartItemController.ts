import { Request, Response } from "express";
import asyncHandler from "../utils/asyncHandler";
import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";
import { cartItemModel } from "../models/sql/cartItemModel";
import { cartModel } from "../models/sql/cartModel";
import { productModel } from "../models/sql/productModel";
import { sellerModel } from "../models/sql/sellerModel";

// =============================================
// ➕ Add Product To Cart
// =============================================
export const addItemToCart = asyncHandler(
  async (req: Request, res: Response) => {
    const { cartId, productId, sellerId, quantity } = req.body;

    // Check cart exists
    const cart = await cartModel.findByPk(cartId);
    if (!cart) throw new ApiError(404, "Cart not found");

    // Check product exists
    const product = await productModel.findByPk(productId);
    if (!product) throw new ApiError(404, "Product not found");

    // Check seller exists
    const seller = await sellerModel.findByPk(sellerId);
    if (!seller) throw new ApiError(404, "Seller not found");

    // Check if product already exists in cart
    const existingItem = await cartItemModel.findOne({
      where: { cartId, productId },
    });

    if (existingItem) {
      existingItem.quantity += quantity;
      await existingItem.save();

      return res
        .status(200)
        .json(new ApiResponse(existingItem, "Quantity updated"));
    }

    const item = await cartItemModel.create({
      cartId,
      productId,
      sellerId,
      quantity,
      priceAtTime: product.price, // store price snapshot
    });

    return res.status(201).json(new ApiResponse(item, "Product added to cart"));
  },
);

// =============================================
// 🔄 Update Quantity
// =============================================
export const updateCartItem = asyncHandler(
  async (req: Request, res: Response) => {
    const cartItemId = Number(req.params.cartItemId);
    const { quantity } = req.body;

    const item = await cartItemModel.findByPk(cartItemId);
    if (!item) throw new ApiError(404, "Cart item not found");

    item.quantity = quantity;
    await item.save();

    return res
      .status(200)
      .json(new ApiResponse(item, "Quantity updated successfully"));
  },
);

// =============================================
// ❌ Remove Item From Cart
// =============================================
export const removeCartItem = asyncHandler(
  async (req: Request, res: Response) => {
    const cartItemId = Number(req.params.cartItemId);

    const item = await cartItemModel.findByPk(cartItemId);
    if (!item) throw new ApiError(404, "Cart item not found");

    await item.destroy();

    return res
      .status(200)
      .json(new ApiResponse(null, "Item removed from cart"));
  },
);

// =============================================
// 📦 Get Items of a Cart
// =============================================
export const getCartItems = asyncHandler(
  async (req: Request, res: Response) => {
    const { cartId } = req.params;

    const items = await cartItemModel.findAll({
      where: { cartId },
      include: [
        { model: productModel, as: "product" },
        { model: sellerModel, as: "seller" },
      ],
    });

    // Calculate total
    const totalAmount = items.reduce((acc, item) => {
      return acc + Number(item.priceAtTime) * item.quantity;
    }, 0);

    return res.status(200).json(
      new ApiResponse(
        {
          items,
          totalAmount,
        },
        "Cart items fetched successfully",
      ),
    );
  },
);
