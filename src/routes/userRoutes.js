const express = require("express");
const router = express.Router();
// const verifyToken = require("../middlewares/auth");
const {
  sendOtp,
  verifyOtpAndAuthenticate,
} = require("../controllers/userController");

const {
  sendOtpValidator,
  verifyOtpAndAuthenticateValidator,
} = require("../validators/userValidator");

// ✅ Protected route
router.post("/send-otp", sendOtpValidator, sendOtp);
router.post(
  "/verify-otp",
  verifyOtpAndAuthenticateValidator,
  verifyOtpAndAuthenticate,
);


// 🔒 Only ADMIN can access
// router.get("/getAllUsers", verifyToken, getAllUsers);

module.exports = router;
