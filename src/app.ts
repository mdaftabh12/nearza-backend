import dotenv from "dotenv";
dotenv.config();
import express, { Application, Request, Response } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

// =============================================
// 🧩 Database Connections
// =============================================
import connectMongoDB from "./config/mongoose";
import { connectMySQL, sequelize } from "./config/sequelize";
import seedAdmin from "./utils/seedAdmin";
import "./models/sql/associations";

// =============================================
// 🧠 Routes Import
// =============================================
// SQL-based routes
import userRoutes from "./routes/userRoutes";
import sellerRoutes from "./routes/sellerRoutes";
import categoryRoutes from "./routes/categoryRoutes";
import productRoutes from "./routes/productRoutes";
import cartRoutes from "./routes/cartRoutes";
import cartItemRoutes from "./routes/cartItemRoutes";
import wishlistRoutes from "./routes/wishlistRoutes";


// MongoDB-based routes
// import userRoutes from "./src/routes/userRoutes";

// =============================================
// 🚀 Express App Initialization
// =============================================
const app: Application = express();

// =============================================
// ⚙️ Middleware Configuration
// =============================================
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "*", // Allow CORS from frontend
    credentials: true,
  }),
);
app.use(express.json({ limit: "20kb" })); // Parse incoming JSON payloads
app.use(express.urlencoded({ extended: true, limit: "20kb" })); // Handle URL-encoded data
app.use(express.static("public")); // Serve static files (e.g., images, uploads)
app.use(cookieParser()); // Parse cookies

// Error handler
import errorHandler from "./middlewares/errorHandler";

// =============================================
// 🗄️ Database Initialization & Sync
// =============================================
(async (): Promise<void> => {
  try {
    // 🔗 Connect MongoDB
    await connectMongoDB();

    // 🔗 Connect MySQL
    await connectMySQL();

    // 🔄 Sync Sequelize Models (safe sync)
    const isDevelopment = process.env.NODE_ENV === "development";

    if (isDevelopment) {
      // await sequelize.sync({ force: true }); // ⚠️ sirf ek baar
      await sequelize.sync(); // ✅ normal
    } else {
      await sequelize.authenticate();
    }

    console.log("✔ Tables synced successfully");

    // 👑 Seed Default Admin User
    await seedAdmin();
  } catch (error: any) {
    console.error("❌ Database connection/sync error:", error.message);
  }
})();

// =============================================
// 🌐 API Routes
// =============================================
app.use("/api/users", userRoutes); // User CRUD & Authentication
app.use("/api/sellers", sellerRoutes); // Seller application & management
app.use("/api/categories", categoryRoutes); // Product categories
app.use("/api/products", productRoutes); // Product CRUD & listing
app.use("/api/carts", cartRoutes); // Cart management
app.use("/api/cart-items", cartItemRoutes); // Cart item management
app.use("/api/wishlist", wishlistRoutes); // Wishlist management

// =============================================
// 💚 Health Check Route
// =============================================
app.get("/", (req: Request, res: Response) => {
  res.status(200).json({
    status: "success",
    message: "🚀 Nearza API is running successfully!",
  });
});

// =============================================
// ❌ Global Error Handler (MUST BE LAST)
// =============================================
app.use(errorHandler);

// =============================================
// 📦 Export App
// =============================================
export default app;
