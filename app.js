require("dotenv").config();
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");

// =============================================
// 🧩 Database Connections
// =============================================
const connectMongoDB = require("./src/config/mongoose");
const { connectMySQL, sequelize } = require("./src/config/sequelize");
const seedAdmin = require("./src/utils/seedAdmin");

// =============================================
// 🧠 Routes Import
// =============================================
// SQL-based routes
const userRoutes = require("./src/routes/userRoutes");

// MongoDB-based routes
// const categoryRoutes = require("./routes/categoryRouter");

// =============================================
// 🚀 Express App Initialization
// =============================================
const app = express();

// =============================================
// ⚙️ Middleware Configuration
// =============================================
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "*", // Allow CORS from frontend
    credentials: true,
  })
);

app.use(express.json({ limit: "20kb" })); // Parse incoming JSON payloads
app.use(express.urlencoded({ extended: true, limit: "20kb" })); // Handle URL-encoded data
app.use(express.static("public")); // Serve static files (e.g., images, uploads)
app.use(cookieParser()); // Parse cookies
const errorHandler = require("./src/middlewares/errorHandler");


// =============================================
// 🗄️ Database Initialization & Sync
// =============================================
(async () => {
  try {
    // 🔗 Connect MongoDB
    await connectMongoDB();

    // 🔗 Connect MySQL
    await connectMySQL();

    // 🔄 Sync all Sequelize Models (safe sync)
    // await sequelize.sync(); // Use { force: true } ONLY in development
    // console.log("✅ SQL Models synchronized successfully");

    await sequelize.sync({ alter: true });
    console.log("✔ Tables updated safely without deleting data.");

    // 👑 Seed Default Admin User
    await seedAdmin();
    
  } catch (error) {
    console.error("❌ Database connection/sync error:", error.message);
  }
})();

// =============================================
// 🌐 API Routes
// =============================================
app.use("/api/users", userRoutes); // User CRUD & Authentication
// app.use("/api/categories", categoryRoutes); // Category management

// =============================================
// 💚 Health Check Route
// =============================================
app.get("/", (req, res) => {
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
module.exports = app;
