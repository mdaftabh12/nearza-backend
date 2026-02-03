import mongoose, { Schema, Document, Model } from "mongoose";

export interface IOtp extends Document {
  email?: string;
  phone?: string;
  otp: string;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const otpSchema: Schema<IOtp> = new Schema(
  {
    email: {
      type: String,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email address"],
    },
    phone: {
      type: String,
      trim: true,
      match: [/^[0-9]{10}$/, "Phone number must be exactly 10 digits"],
    },
    otp: {
      type: String,
      required: [true, "OTP is required"],
    },
    expiresAt: {
      type: Date,
      required: [true, "OTP expiry time is required"],
    },
  },
  {
    timestamps: true,
  }
);

const otpModel = mongoose.model<IOtp>("OTP", otpSchema);
export default otpModel;
