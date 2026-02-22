import mongoose, { Schema, Document } from "mongoose";

export interface IReview extends Document {
  rating: number;
  comment?: string;
  images?: string[];
  productId: number;
  userId: number;
  createdAt: Date;
  updatedAt: Date;
}

const reviewSchema: Schema<IReview> = new Schema(
  {
    rating: {
      type: Number,
      required: [true, "Rating is required"],
      min: [1, "Rating must be at least 1"],
      max: [5, "Rating cannot exceed 5"],
    },
    comment: {
      type: String,
      trim: true,
      maxlength: [500, "Comment cannot exceed 500 characters"],
    },
    images: {
      type: [String],
      default: [],
    },
    productId: {
      type: Number,
      required: [true, "Product ID is required"],
    },
    userId: {
      type: Number,
      required: [true, "User ID is required"],
    },
  },
  {
    timestamps: true,
  },
);

reviewSchema.index({ productId: 1, userId: 1 }, { unique: true });

const reviewModel = mongoose.model<IReview>("Review", reviewSchema);
export default reviewModel;

/*

User → Review submit karta hai
         ↓
MongoDB mein save hota hai { productId: 5, userId: 9, rating: 4 }
         ↓
Product fetch karo SQL se (id: 5)
         ↓
reviewModel.find({ productId: 5 }) → MongoDB se reviews
         ↓
Dono merge karke response bhejo

*/
