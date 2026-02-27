import { Request, Response } from "express";
import { productModel } from "../models/sql/productModel";
import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";
import asyncHandler from "../utils/asyncHandler";
import {
  uploadOnCloudinary,
  deleteFromCloudinary,
} from "../services/cloudinary";
import { generateSKU } from "../helpers/skuHelper";
import { cleanupTempFiles } from "../helpers/fileCleanupHelper";
import { Op } from "sequelize";

/* ============================================================
   🛒 Create Product
============================================================ */

export const createProduct = asyncHandler(
  async (req: Request, res: Response) => {
    // 🔐 Auth Check
    const sellerId = Number(req.user?.id);

    const {
      name,
      description,
      price,
      discountPrice,
      brand,
      categoryId,
      stock,
      status,
    } = req.body as {
      name: string;
      description: string;
      price: string;
      discountPrice?: string;
      brand?: string;
      categoryId: string;
      stock?: string;
      status?: "DRAFT" | "PUBLISHED";
    };

    const files = req.files as Express.Multer.File[];
    const ALLOWED_MIME_TYPES = [
      "image/png",
      "image/jpeg",
      "image/jpg",
      "image/webp",
      "image/svg+xml",
    ];

    if (!files || files.length === 0) {
      throw new ApiError(400, "At least one product image is required");
    }

    for (const file of files) {
      if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
        cleanupTempFiles(files);
        throw new ApiError(
          400,
          "Invalid image format. Allowed: PNG, JPG, JPEG, WEBP, SVG",
        );
      }
    }

    const imageUrls: string[] = [];

    try {
      for (const file of files) {
        const result = await uploadOnCloudinary(file.path);

        if (!result?.secure_url) {
          throw new ApiError(500, "Image upload failed");
        }

        imageUrls.push(result.secure_url);
      }
    } catch (err) {
      await Promise.allSettled(
        imageUrls.map((url) => deleteFromCloudinary(url)),
      );
      throw err;
    } finally {
      // Always clean multer temp files regardless of success/failure
      cleanupTempFiles(files);
    }

    const parsedPrice = Number(price);
    const parsedStock = stock ? Number(stock) : 0;
    const parsedCategoryId = Number(categoryId);

    const parsedDiscount =
      discountPrice !== undefined && discountPrice !== ""
        ? Number(discountPrice)
        : null;

    // finalPrice = discountPrice agar valid & lower hai, warna original price
    const computedFinalPrice =
      parsedDiscount !== null && parsedDiscount < parsedPrice
        ? parsedDiscount
        : parsedPrice;

    const sku = generateSKU(name);

    const product = await productModel.create({
      sellerId,
      categoryId: parsedCategoryId,
      name,
      description,
      sku,
      price: parsedPrice,
      discountPrice: parsedDiscount,
      finalPrice: computedFinalPrice,
      brand: brand?.trim() || null,
      stock: parsedStock,
      productImage: imageUrls,
      status: status,
    });

    return res
      .status(201)
      .json(new ApiResponse(product, "Product created successfully"));
  },
);

// Get all published products with filters, search, pagination, and sorting
export const getProducts = asyncHandler(async (req: Request, res: Response) => {
  const {
    brand,
    categoryId,
    search,
    minPrice,
    maxPrice,
    sort,
    page = "1",
    limit = "10",
  } = req.query;

  //  📄 Pagination Setup
  const currentPage = Math.max(Number(page), 1);
  const pageLimit = Math.max(Number(limit), 1);
  const offset = (currentPage - 1) * pageLimit;

  //  🎯 Base Filters
  const where: any = {
    status: "PUBLISHED",
    isActive: true,
  };

  //  🏷️ Brand Filter
  if (brand) {
    where.brand = {
      [Op.like]: `%${String(brand).trim()}%`,
    };
  }

  //  📂 Category Filter
  if (categoryId) {
    where.categoryId = Number(categoryId);
  }

  //  🔎 Search (Name + Description)
  if (search) {
    where[Op.or] = [
      {
        name: {
          [Op.like]: `%${String(search).trim()}%`,
        },
      },
      {
        description: {
          [Op.like]: `%${String(search).trim()}%`,
        },
      },
    ];
  }

  //  💰 Price Range Filter
  if (minPrice || maxPrice) {
    where.finalPrice = {};

    if (minPrice) {
      where.finalPrice[Op.gte] = Number(minPrice);
    }

    if (maxPrice) {
      where.finalPrice[Op.lte] = Number(maxPrice);
    }
  }

  //  🔄 Sorting
  let order: any = [["createdAt", "DESC"]]; // default latest

  switch (sort) {
    case "lowToHigh":
      order = [["finalPrice", "ASC"]];
      break;

    case "highToLow":
      order = [["finalPrice", "DESC"]];
      break;

    case "latest":
      order = [["createdAt", "DESC"]];
      break;

    case "trending":
      order = [["ratings", "DESC"]];
      break;
  }

  //  📦 Fetch Products
  const { count, rows } = await productModel.findAndCountAll({
    where,
    order,
    limit: pageLimit,
    offset,
    include: [
      {
        association: "seller",
        attributes: ["id", "name", "storeName"],
      },
      {
        association: "category",
        attributes: ["id", "name", "slug"],
      },
    ],
  });

  //  📤 Response
  return res.status(200).json(
    new ApiResponse(
      {
        totalProducts: count,
        currentPage,
        totalPages: Math.ceil(count / pageLimit),
        products: rows,
      },
      "Products retrieved successfully",
    ),
  );
});

// This is for sellers to view their own products (all statuses)
export const getSellerProducts = asyncHandler(
  async (req: Request, res: Response) => {
    const sellerId = Number(req.user?.id);
    const { status, page = "1", limit = "10" } = req.query;
    const currentPage = Math.max(Number(page), 1);
    const pageLimit = Math.max(Number(limit), 1);
    const offset = (currentPage - 1) * pageLimit;
    const where: any = { sellerId };

    if (status) {
      where.status = String(status).toUpperCase();
    }

    const { count, rows } = await productModel.findAndCountAll({
      where,
      order: [["createdAt", "DESC"]],
      limit: pageLimit,
      offset,
      include: [
        {
          association: "category",
          attributes: ["id", "name", "slug"],
        },
      ],
    });
    return res.status(200).json(
      new ApiResponse(
        {
          totalProducts: count,
          currentPage,
          totalPages: Math.ceil(count / pageLimit),
          products: rows,
        },
        "Seller products retrieved successfully",
      ),
    );
  },
);

// Get single product by ID (only if published and active)
export const getProductById = asyncHandler(
  async (req: Request, res: Response) => {
    const productId = req.params.productId;
    const product = await productModel.findOne({
      where: { id: productId, status: "PUBLISHED", isActive: true },
      include: [
        {
          association: "seller",
          attributes: ["id", "name", "storeName"],
        },
        {
          association: "category",
          attributes: ["id", "name", "slug"],
        },
      ],
    });

    if (!product) {
      throw new ApiError(404, "Product not found");
    }
    return res
      .status(200)
      .json(new ApiResponse(product, "Product details retrieved successfully"));
  },
);

// Toggle product status (DRAFT <-> PUBLISHED) - seller only
export const toggleProductStatus = asyncHandler(
  async (req: Request, res: Response) => {
    const sellerId = Number(req.user?.id);
    const productId = req.params.productId;

    const product = await productModel.findOne({
      where: { id: productId, sellerId },
    });

    if (!product) {
      throw new ApiError(404, "Product not found");
    }

    if (product.status === "DRAFT") {
      if (!product.productImage || product.productImage.length === 0) {
        throw new ApiError(
          400,
          "Cannot publish product without at least one image",
        );
      }
      if (product.stock <= 0) {
        throw new ApiError(400, "Cannot publish product with zero stock");
      }
      if (product.price <= 0) {
        throw new ApiError(400, "Cannot publish product with zero price");
      }
      product.status = "PUBLISHED";
      product.isActive = true;
    } else {
      product.status = "DRAFT";
      product.isActive = false;
    }
    await product.save();

    return res
      .status(200)
      .json(
        new ApiResponse(
          product,
          `Product ${product.status.toLowerCase()} successfully`,
        ),
      );
  },
);

// Update product details - seller only (except status toggle)
export const updateProduct = asyncHandler(
  async (req: Request, res: Response) => {
    const sellerId = Number(req.user?.id);
    const productId = req.params.productId;
    const {
      name,
      description,
      price,
      discountPrice,
      brand,
      categoryId,
      stock,
    } = req.body as {
      name?: string;
      description?: string;
      price?: string;
      discountPrice?: string;
      brand?: string;
      categoryId?: string;
      stock?: string;
    };

    const product = await productModel.findOne({
      where: { id: productId, sellerId },
    });
    if (!product) {
      throw new ApiError(404, "Product not found");
    }
    if (name) product.name = name;
    if (description) product.description = description;
    if (price) product.price = Number(price);
    if (discountPrice) product.discountPrice = Number(discountPrice);
    if (brand) product.brand = brand.trim();
    if (categoryId) product.categoryId = Number(categoryId);
    if (stock) product.stock = Number(stock);

    if (req.files && (req.files as Express.Multer.File[]).length > 0) {
      const files = req.files as Express.Multer.File[];
      const ALLOWED_MIME_TYPES = [
        "image/png",
        "image/jpeg",
        "image/jpg",
        "image/webp",
        "image/svg+xml",
      ];
      for (const file of files) {
        if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
          cleanupTempFiles(files);
          throw new ApiError(
            400,
            "Invalid image format. Allowed: PNG, JPG, JPEG, WEBP, SVG",
          );
        }
      }

      const imageUrls: string[] = [];
      try {
        for (const file of files) {
          const result = await uploadOnCloudinary(file.path);
          if (!result?.secure_url) {
            throw new ApiError(500, "Image upload failed");
          }
          imageUrls.push(result.secure_url);
        }

        // Append new images to existing ones
        product.productImage = [...(product.productImage || []), ...imageUrls];
      } catch (err) {
        await Promise.allSettled(
          imageUrls.map((url) => deleteFromCloudinary(url)),
        );
        throw err;
      } finally {
        // Always clean multer temp files regardless of success/failure
        cleanupTempFiles(files);
      }
    }

    // Recompute finalPrice if price or discountPrice changed
    if (price || discountPrice) {
      const computedFinalPrice =
        product.discountPrice !== null && product.discountPrice < product.price
          ? product.discountPrice
          : product.price;
      product.finalPrice = computedFinalPrice;
    }

    await product.save();

    return res
      .status(200)
      .json(new ApiResponse(product, "Product updated successfully"));
  },
);

// Delete product - seller only (soft delete)
export const deleteProduct = asyncHandler(
  async (req: Request, res: Response) => {
    const sellerId = Number(req.user?.id);
    const productId = req.params.productId;
    const product = await productModel.findOne({
      where: { id: productId, sellerId },
    });
    if (!product) {
      throw new ApiError(404, "Product not found");
    }
    product.isActive = false;
    await product.save();
    return res
      .status(200)
      .json(new ApiResponse(null, "Product deleted successfully"));
  },
);

// Admin can view all products with filters and pagination (including drafts and inactive)
export const adminGetProducts = asyncHandler(
  async (req: Request, res: Response) => {
    const {
      sellerId,
      categoryId,
      status,
      isActive,
      page = "1",
      limit = "10",
    } = req.query;
    const currentPage = Math.max(Number(page), 1);
    const pageLimit = Math.max(Number(limit), 1);
    const offset = (currentPage - 1) * pageLimit;
    const where: any = {};

    if (sellerId) {
      where.sellerId = Number(sellerId);
    }
    if (categoryId) {
      where.categoryId = Number(categoryId);
    }
    if (status) {
      where.status = String(status).toUpperCase();
    }
    if (isActive) {
      where.isActive = isActive === "true";
    }

    const { count, rows } = await productModel.findAndCountAll({
      where,
      order: [["createdAt", "DESC"]],
      limit: pageLimit,
      offset,
      include: [
        {
          association: "seller",
          attributes: ["id", "name", "storeName"],
        },
        {
          association: "category",
          attributes: ["id", "name", "slug"],
        },
      ],
    });
    return res.status(200).json(
      new ApiResponse(
        {
          totalProducts: count,
          currentPage,
          totalPages: Math.ceil(count / pageLimit),
          products: rows,
        },
        "Admin products retrieved successfully",
      ),
    );
  },
);

// Admin can hard delete any product
export const adminDeleteProduct = asyncHandler(
  async (req: Request, res: Response) => {
    const productId = req.params.productId;
    const product = await productModel.findOne({
      where: { id: productId },
    });
    if (!product) {
      throw new ApiError(404, "Product not found");
    }
    await product.destroy();
    return res
      .status(200)
      .json(new ApiResponse(null, "Product permanently deleted successfully"));
  },
);
