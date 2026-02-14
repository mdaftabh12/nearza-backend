import { sellerModel } from "../models/sql/sellerModel";
import { Request, Response } from "express";
import { userModel } from "../models/sql/userModel";
import asyncHandler from "../utils/asyncHandler";
import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";
import { Op } from "sequelize";

// =============================================
// 📝 Apply for Seller Account (User)
// =============================================
export const applyForSellerAccount = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = Number(req.user?.id);

    if (!userId) {
      throw new ApiError(401, "Unauthorized");
    }

    const {
      storeName,
      storeSlug,
      description,
      businessEmail,
      businessPhone,
      address,
      gstNumber,
      panNumber,
    } = req.body;

    const existingSeller = await sellerModel.findOne({ where: { userId } });
    if (existingSeller) {
      throw new ApiError(400, "Seller profile already exists");
    }

    const newSeller = await sellerModel.create({
      userId,
      storeName,
      storeSlug,
      description,
      businessEmail,
      businessPhone,
      address,
      gstNumber,
      panNumber,
    });

    return res
      .status(201)
      .json(
        new ApiResponse(newSeller, "Seller application submitted successfully"),
      );
  },
);

// =============================================
// 👤 Get My Seller Profile
// =============================================
export const getMySellerProfile = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = Number(req.user?.id);

    const seller = await sellerModel.findOne({
      where: { userId },
      include: [
        {
          model: userModel,
          as: "user",
          attributes: ["email", "roles", "status"],
        },
      ],
    });

    if (!seller) {
      throw new ApiError(404, "Seller profile not found");
    }

    return res
      .status(200)
      .json(new ApiResponse(seller, "Seller profile retrieved successfully"));
  },
);

// =============================================
// ✏️ Update My Seller Profile (Approved Only)
// =============================================
export const updateMySellerProfile = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = Number(req.user?.id);

    const seller = await sellerModel.findOne({ where: { userId } });

    if (!seller) {
      throw new ApiError(404, "Seller not found");
    }

    if (seller.status !== "APPROVED") {
      throw new ApiError(400, "Only approved sellers can update profile");
    }

    await seller.update(req.body);

    return res
      .status(200)
      .json(new ApiResponse(seller, "Seller profile updated successfully"));
  },
);

// =============================================
// 🗑️ Delete My Seller Profile (Approved Only)
// =============================================
export const deleteMySellerProfile = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = Number(req.user?.id);
    const seller = await sellerModel.findOne({ where: { userId } });

    if (!seller) {
      throw new ApiError(404, "Seller not found");
    }
    if (seller.status !== "APPROVED") {
      throw new ApiError(400, "Only approved sellers can delete profile");
    }
    await seller.destroy(); // Soft delete (paranoid)

    return res
      .status(200)
      .json(new ApiResponse(null, "Seller profile deleted successfully"));
  },
);

// =============================================
// ♻️ Restore My Seller Profile (Approved Only)
// =============================================
export const restoreMySellerProfile = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = Number(req.user?.id);
    const seller = await sellerModel.findOne({
      where: { userId },
      paranoid: false, // Include soft-deleted records
    });

    if (!seller) {
      throw new ApiError(404, "Seller not found");
    }
    if (seller.status !== "APPROVED") {
      throw new ApiError(400, "Only approved sellers can restore profile");
    }
    await seller.restore(); // Restore soft-deleted record

    return res
      .status(200)
      .json(new ApiResponse(null, "Seller profile restored successfully"));
  },
);

// =============================================
// 🧑‍💼✨ Seller Resubmit Application 🔄📄
// =============================================
export const resubmitSellerApplication = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = Number(req.user?.id);
    const seller = await sellerModel.findOne({ where: { userId } });

    if (!seller) {
      throw new ApiError(404, "Seller not found");
    }
    if (seller.status !== "REJECTED") {
      throw new ApiError(400, "Only rejected sellers can resubmit application");
    }
    await seller.update({ ...req.body, status: "PENDING" });

    return res
      .status(200)
      .json(
        new ApiResponse(seller, "Seller application resubmitted successfully"),
      );
  },
);

// =============================================
// ADMIN CONTROLLERS
// =============================================

// =============================================
// 🔄 Update Seller Status (Admin Only)
// =============================================
export const updateSellerStatus = asyncHandler(
  async (req: Request, res: Response) => {
    const sellerId = Number(req.params.sellerId);
    const { status } = req.body;

    const seller = await sellerModel.findByPk(sellerId);

    if (!seller) {
      throw new ApiError(404, "Seller not found");
    }

    // Update seller status using instance (better than Model.update)
    await seller.update({ status });

    const user = await userModel.findByPk(seller.userId);
    if (!user) {
      throw new ApiError(404, "Associated user not found");
    }

    let roles = [...(user.roles || [])];

    if (status === "APPROVED") {
      if (!roles.includes("SELLER")) {
        roles.push("SELLER");
      }
    }

    if (status === "REJECTED" || status === "SUSPENDED") {
      roles = roles.filter((role) => role !== "SELLER");
    }

    await user.update({ roles });

    return res
      .status(200)
      .json(new ApiResponse(seller, "Seller status updated successfully"));
  },
);

// =============================================
// 🗂️ Get Seller Applications (Admin Only)
// =============================================
export const getSellerApplications = asyncHandler(
  async (req: Request, res: Response) => {
    const { status, search, page = 1, limit = 10 } = req.query;

    // Build where clause
    const whereClause: any = {};

    if (status) {
      whereClause.status = status;
    }

    if (search) {
      whereClause[Op.or] = [
        { storeName: { [Op.iLike]: `%${search}%` } },
        { "$user.email$": { [Op.iLike]: `%${search}%` } },
      ];
    }

    // Calculate pagination
    const pageNumber = Number(page);
    const limitNumber = Number(limit);
    const offset = (pageNumber - 1) * limitNumber;

    // Fetch seller applications with pagination
    const { rows: sellers, count } = await sellerModel.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: userModel,
          as: "user",
          attributes: ["email"],
          required: false, // Use LEFT JOIN to include sellers even without user data
        },
      ],
      limit: limitNumber,
      offset,
      order: [["createdAt", "DESC"]], // Add default ordering
      distinct: true, // Ensure accurate count with joins
    });

    return res.status(200).json(
      new ApiResponse(
        {
          sellers,
          pagination: {
            total: count,
            page: pageNumber,
            limit: limitNumber,
            totalPages: Math.ceil(count / limitNumber),
          },
        },
        "Seller applications retrieved successfully",
      ),
    );
  },
);

// =============================================
// 🗂️ Get Seller Profile (Admin Only)
// =============================================
export const getSellerById = asyncHandler(
  async (req: Request, res: Response) => {
    const sellerId = Number(req.params.sellerId);
    const seller = await sellerModel.findByPk(sellerId, {
      include: [
        {
          model: userModel,
          as: "user",
          attributes: ["email", "roles", "status"],
        },
      ],
    });

    if (!seller) {
      throw new ApiError(404, "Seller not found");
    }

    return res
      .status(200)
      .json(new ApiResponse(seller, "Seller profile retrieved successfully"));
  },
);

// =============================================
// 🗑️ Delete Seller Profile (Admin Only)
// =============================================
export const deleteSeller = asyncHandler(
  async (req: Request, res: Response) => {
    const sellerId = Number(req.params.sellerId);

    const seller = await sellerModel.findByPk(sellerId);

    if (!seller) throw new ApiError(404, "Seller not found");

    await seller.destroy(); // Soft delete (paranoid)

    return res.status(200).json(new ApiResponse(null, "Seller deleted"));
  },
);

// =============================================
// ♻️ Restore Seller (Admin Only)
// =============================================
export const restoreSeller = asyncHandler(
  async (req: Request, res: Response) => {
    const sellerId = Number(req.params.sellerId);

    const seller = await sellerModel.findByPk(sellerId, { paranoid: false });

    await sellerModel.restore({
      where: { id: req.params.id },
    });

    return res.status(200).json(new ApiResponse(null, "Seller restored"));
  },
);
