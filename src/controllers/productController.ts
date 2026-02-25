import { Request, Response } from "express";
import fs from "fs";
import { productModel } from "../models/sql/productModel";
import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";
import asyncHandler from "../utils/asyncHandler";
import {
  uploadOnCloudinary,
  deleteFromCloudinary,
} from "../services/cloudinary";
import { Op } from "sequelize";

export const createProduct = asyncHandler(
  async (req: Request, res: Response) => {
    const { name, description, price, categoryId, stock } = req.body as {
      name: string;
      description: string;
      price: number;
      categoryId?: number;
      stock?: number;
    };

    const sellerId = Number(req.user?.id);

    if (!sellerId) throw new ApiError(401, "Unauthorized");

    let imageUrls: string[] = [];

    if (req.files && Array.isArray(req.files)) {
      for (const file of req.files) {
        const result = await uploadOnCloudinary(file.path);
        if (!result?.secure_url) {
          throw new ApiError(500, "Image upload failed");
        }
        imageUrls.push(result.secure_url);
        fs.unlinkSync(file.path);
      }
    }

    const product = await productModel.create({
      name,
      description,
      price: Number(price),
      categoryId: categoryId,
      sellerId,
      stock: stock ? Number(stock) : 0,
      productImage: imageUrls,
    });

    return res
      .status(201)
      .json(new ApiResponse(product, "Product created successfully"));
  },
);

export const getAllProducts = asyncHandler(
  async (req: Request, res: Response) => {
    const {
      page = "1",
      limit = "10",
      categoryId,
      minPrice,
      maxPrice,
    } = req.query;

    const where: any = { isActive: true };

    if (categoryId) {
      where.categoryId = Number(categoryId);
    }

    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price[Op.gte] = Number(minPrice);
      if (maxPrice) where.price[Op.lte] = Number(maxPrice);
    }

    const pageNumber = Number(page);
    const limitNumber = Number(limit);

    const { rows, count } = await productModel.findAndCountAll({
      where,
      limit: limitNumber,
      offset: (pageNumber - 1) * limitNumber,
      order: [["createdAt", "DESC"]],
    });

    return res.json(
      new ApiResponse(
        {
          products: rows,
          pagination: {
            total: count,
            page: pageNumber,
            limit: limitNumber,
            totalPages: Math.ceil(count / limitNumber),
          },
        },
        "Products fetched successfully",
      ),
    );
  },
);

export const getProductById = asyncHandler(
  async (req: Request, res: Response) => {
    const productId = Number(req.params.id);
    const product = await productModel.findOne({
      where: { id: productId, isActive: true },
    });

    if (!product) {
      throw new ApiError(404, "Product not found");
    }

    return res.json(
      new ApiResponse(product, "Product details fetched successfully"),
    );
  },
);

export const getProductDetailsForSeller = asyncHandler(
  async (req: Request, res: Response) => {
    const productId = Number(req.params.id);
    const sellerId = Number(req.user?.id);
    const product = await productModel.findOne({
      where: { id: productId, sellerId },
    });

    if (!product) {
      throw new ApiError(404, "Product not found or access denied");
    }

    return res.json(
      new ApiResponse(product, "Product details fetched successfully"),
    );
  },
);

export const getProductsBySellerId = asyncHandler(
  async (req: Request, res: Response) => {
    const sellerId = Number(req.params.sellerId);
    const authenticatedSellerId = Number(req.user?.id);
    if (sellerId !== authenticatedSellerId) {
      throw new ApiError(
        403,
        "Access denied. You can only view your own products.",
      );
    }
    const products = await productModel.findAll({
      where: { sellerId },
    });

    return res.json(new ApiResponse(products, "Products fetched successfully"));
  },
);

export const getProductsByCategoryId = asyncHandler(
  async (req: Request, res: Response) => {
    const categoryId = Number(req.params.categoryId);
    const products = await productModel.findAll({
      where: { categoryId, isActive: true },
    });

    return res.json(new ApiResponse(products, "Products fetched successfully"));
  },
);

export const updateProduct = asyncHandler(
  async (req: Request, res: Response) => {
    const productId = Number(req.params.id);
    const sellerId = Number(req.user?.id);

    const product = await productModel.findOne({
      where: { id: productId, sellerId },
    });

    if (!product) {
      throw new ApiError(404, "Product not found or access denied");
    }

    let imageUrls = product.productImage || [];

    if (req.files && Array.isArray(req.files)) {
      // Delete old images
      for (const url of imageUrls) {
        await deleteFromCloudinary(url);
      }

      imageUrls = [];

      for (const file of req.files) {
        const result = await uploadOnCloudinary(file.path);
        if (!result?.secure_url) {
          throw new ApiError(500, "Image upload failed");
        }
        imageUrls.push(result.secure_url);
        fs.unlinkSync(file.path);
      }
    }

    await product.update({
      name: req.body.name ?? product.name,
      description: req.body.description ?? product.description,
      price:
        req.body.price !== undefined ? Number(req.body.price) : product.price,
      categoryId:
        req.body.categoryId !== undefined
          ? Number(req.body.categoryId)
          : product.categoryId,
      stock:
        req.body.stock !== undefined ? Number(req.body.stock) : product.stock,
      productImage: imageUrls,
    });

    return res.json(new ApiResponse(product, "Product updated successfully"));
  },
);

export const deleteProduct = asyncHandler(
  async (req: Request, res: Response) => {
    const productId = Number(req.params.id);
    const sellerId = Number(req.user?.id);
    const product = await productModel.findOne({
      where: { id: productId, sellerId },
    });

    if (!product) {
      throw new ApiError(404, "Product not found or access denied");
    }
    await product.update({ isActive: false });
    return res.json(new ApiResponse(null, "Product deleted successfully"));
  },
);

export const hardDeleteProduct = asyncHandler(
  async (req: Request, res: Response) => {
    const productId = Number(req.params.id);

    const product = await productModel.findByPk(productId);

    if (!product) {
      throw new ApiError(404, "Product not found");
    }

    // delete cloud images
    const images = product.productImage || [];
    for (const url of images) {
      await deleteFromCloudinary(url);
    }

    await product.destroy();

    return res.json(new ApiResponse(null, "Product permanently deleted"));
  },
);

export const restoreProduct = asyncHandler(
  async (req: Request, res: Response) => {
    const productId = Number(req.params.id);
    const sellerId = Number(req.user?.id);
    const product = await productModel.findOne({
      where: { id: productId, sellerId, isActive: false },
    });

    if (!product) {
      throw new ApiError(404, "Product not found or access denied");
    }

    await product.update({ isActive: true });
    return res.json(new ApiResponse(product, "Product restored successfully"));
  },
);
