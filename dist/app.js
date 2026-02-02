"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
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
app.use(cors({
    origin: process.env.CORS_ORIGIN || "*", // Allow CORS from frontend
    credentials: true,
}));
app.use(express.json({ limit: "20kb" })); // Parse incoming JSON payloads
app.use(express.urlencoded({ extended: true, limit: "20kb" })); // Handle URL-encoded data
app.use(express.static("public")); // Serve static files (e.g., images, uploads)
app.use(cookieParser()); // Parse cookies
const errorHandler = require("./src/middlewares/errorHandler");
// =============================================
// 🗄️ Database Initialization & Sync
// =============================================
(() => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // 🔗 Connect MongoDB
        yield connectMongoDB();
        // 🔗 Connect MySQL
        yield connectMySQL();
        // 🔄 Sync all Sequelize Models (safe sync)
        // await sequelize.sync(); // Use { force: true } ONLY in development
        // console.log("✅ SQL Models synchronized successfully");
        yield sequelize.sync({ alter: true });
        console.log("✔ Tables updated safely without deleting data.");
        // 👑 Seed Default Admin User
        yield seedAdmin();
    }
    catch (error) {
        console.error("❌ Database connection/sync error:", error.message);
    }
}))();
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
