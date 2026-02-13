import { sellerModel } from "../models/sql/sellerModel";
import { Request, Response } from "express";
import { userModel } from "../models/sql/userModel";
import asyncHandler from "../utils/asyncHandler";
import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";

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

// 1. User apply for seller account
// Seller profile created with "PENDING" status
// Admin reviews application and updates status to "APPROVED", "REJECTED", or "SUSPENDED"

// 2. Admin update seller status
// "APPROVED", "REJECTED", "SUSPENDED"
// Approved -> can access seller dashboard, list products, view orders
// Update user status ["USER" ,"SELLER"] role
// Rejected -> cannot access seller dashboard, can re-apply after 30 days
// Suspended -> cannot access seller dashboard, cannot re-apply for 90 days

// 3. User can view their seller application status in their profile
// "Pending", "Approved", "Rejected", "Suspended"
// If approved, show link to seller dashboard

// export const getSellerApplications = asyncHandler(
//   async (req: Request, res: Response) => {
//     const { status, dateApplied, search, page = 1, limit = 10 } = req.query;

//     const whereClause: any = {};

//     if (status) {
//       whereClause.status = status;
//     }

//     if (dateApplied) {
//       const date = new Date(dateApplied as string);
//       whereClause.createdAt = {
//         [Op.gte]: date,
//       };
//     }

//     if (search) {
//       whereClause[Op.or] = [
//         { storeName: { [Op.iLike]: `%${search}%` } },
//         { "$user.email$": { [Op.iLike]: `%${search}%` } },
//       ];
//     }

//     const offset = (Number(page) - 1) * Number(limit);

//     const { rows: sellers, count } = await sellerModel.findAndCountAll({
//       where: whereClause,
//       include: [
//         {
//           model: userModel,
//           as: "user",
//           attributes: ["email"],
//         },
//       ],
//       limit: Number(limit),
//       offset,
//     });

//     return res.status(200).json(
//       new ApiResponse(
//         {
//           sellers,
//           pagination: {
//             total: count,
//             page: Number(page),
//             limit: Number(limit),
//             totalPages: Math.ceil(count / Number(limit)),
//           },
//         },
//         "Seller applications retrieved successfully",
//       ),
//     );
//   },
// );

// 4. Admin can view list of seller applications with filters (status, date applied) and search by store name or user email
// List of seller applications with pagination
// Filter by status (PENDING, APPROVED, REJECTED, SUSPENDED)
// Search by store name or user email

// 5. Get seller profile
// User can view their seller profile details and status
// Admin can view any seller profile details and status

// 6. Update seller profile
// User can update their seller profile details (store name, description, business email/phone, address)
// Admin can update any seller profile details and status

// 7. Delete seller profile
// User can delete their seller profile (soft delete, status set to "DELETED")
// Admin can delete any seller profile (soft delete, status set to "DELETED")
