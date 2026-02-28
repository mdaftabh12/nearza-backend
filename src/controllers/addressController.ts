import { Request, Response } from "express";
import asyncHandler from "../utils/asyncHandler";
import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";
import { addressModel } from "../models/sql/addressModel";

/* =============================================
   📍 Create Address
============================================= */
export const createAddress = asyncHandler(
  async (req: Request, res: Response) => {
    const {
      userId,
      fullName,
      phone,
      addressLine,
      landmark,
      city,
      state,
      postalCode,
      country,
      type,
      isDefault,
    } = req.body;

    // If default → remove previous default
    if (isDefault) {
      await addressModel.update({ isDefault: false }, { where: { userId } });
    }

    const address = await addressModel.create({
      userId,
      fullName,
      phone,
      addressLine,
      landmark,
      city,
      state,
      postalCode,
      country,
      type,
      isDefault,
    });

    return res
      .status(201)
      .json(new ApiResponse(address, "Address created successfully"));
  },
);

/* =============================================
   📍 Get User Addresses
============================================= */
export const getUserAddresses = asyncHandler(
  async (req: Request, res: Response) => {
    const { userId } = req.params;

    const addresses = await addressModel.findAll({
      where: { userId },
      order: [["isDefault", "DESC"]],
    });

    return res.json(
      new ApiResponse(addresses, "Addresses fetched successfully"),
    );
  },
);

/* =============================================
   📍 Update Address
============================================= */
export const updateAddress = asyncHandler(
  async (req: Request, res: Response) => {
    const addressId = Number(req.params.addressId);

    const address = await addressModel.findByPk(addressId);
    if (!address) {
      throw new ApiError(404, "Address not found");
    }

    if (req.body.isDefault) {
      await addressModel.update(
        { isDefault: false },
        { where: { userId: address.userId } },
      );
    }

    await address.update(req.body);

    return res.json(new ApiResponse(address, "Address updated successfully"));
  },
);

/* =============================================
   📍 Delete Address
============================================= */
export const deleteAddress = asyncHandler(
  async (req: Request, res: Response) => {
    const addressId = Number(req.params.addressId);

    const address = await addressModel.findByPk(addressId);
    if (!address) {
      throw new ApiError(404, "Address not found");
    }

    await address.destroy();

    return res.json(new ApiResponse(null, "Address deleted successfully"));
  },
);
