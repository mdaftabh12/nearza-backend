import { Router } from "express";
import { validate } from "../middlewares/zodValidator";
import {
  createAddressSchema,
  updateAddressSchema,
} from "../validators/addressValidator";
import {
  createAddress,
  getUserAddresses,
  updateAddress,
  deleteAddress,
} from "../controllers/addressController";

const router = Router();

// Create
router.post("/", validate(createAddressSchema), createAddress);

// Get user addresses
router.get("/:userId", getUserAddresses);

// Update
router.put("/:addressId", validate(updateAddressSchema), updateAddress);

// Delete
router.delete("/:addressId", deleteAddress);

export default router;
