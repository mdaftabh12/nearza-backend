import mongoose from "mongoose";

const connectMongoDB = async (): Promise<void> => {
  try {
    const mongoUri = process.env.MONGOURI as string;

    if (!mongoUri) {
      throw new Error("MONGOURI is not defined in environment variables");
    }

    await mongoose.connect(mongoUri);
    console.log("✅ MongoDB connected successfully");
  } catch (error: any) {
    console.error("❌ MongoDB connection failed:", error.message);
    process.exit(1); // Exit process with failure
  }
};

export default connectMongoDB;
