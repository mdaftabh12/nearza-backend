import { sellerModel } from "../models/sql/sellerModel";
import { Request, Response } from "express";
import { userModel } from "../models/sql/userModel";
import asyncHandler from "../utils/asyncHandler";
import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";

export const applyForSellerAccount = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = Number(req.params.userId);
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
      throw new ApiError(400, "Seller profile already exists for this user");
    }

    const user = await userModel.findByPk(userId);
    if (!user) {
      throw new ApiError(404, "User not found");
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
      .json(new ApiResponse(newSeller, "Registered as seller successfully"));
  },
);

export const updateSellerStatus = asyncHandler(
  async (req: Request, res: Response) => {
    const sellerId = Number(req.params.sellerId);
    const { status } = req.body;

    const seller = await sellerModel.findByPk(sellerId);
    if (!seller) {
      throw new ApiError(404, "Seller not found");
    }

    const updateSeller = await sellerModel.update(
      { status },
      { where: { id: sellerId }, returning: true },
    );

    // TODO: APP

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