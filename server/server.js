import express from "express";
import dotenv from "dotenv";
import "colors";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

import connectDB from "./config/db.js";
import { notFound, errorHandler } from "./middleware/errorMiddleware.js";
import { seedInitialData } from "./utils/seedData.js";

import userRoutes from "./routes/userRoute.js";
import productRoutes from "./routes/productRoutes.js";
import repairRoutes from "./routes/repairRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import saleRoutes from "./routes/saleRoutes.js";

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const app = express();

// Connect to Database
connectDB().then(() => {
  seedInitialData();
});

// Middleware
app.use(express.json());
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);

app.use("/uploads", express.static(uploadsDir));

// API Routes
app.use("/api/users", userRoutes);
app.use("/api/products", productRoutes);
app.use("/api/repairs", repairRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/sales", saleRoutes);

// Health check / welcome route
app.get("/", (req, res) => {
  res.send({
    message: "Welcome to LovelyTech Backend API",
    status: "Active",
    modules: ["Users", "Products", "Repairs", "Orders"],
  });
});

// Custom Error Handling Middlewares
app.use(notFound);
app.use(errorHandler);

// Start Server if called directly
const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== "test") {
  app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV || "development"} mode`.bgCyan.white);
    console.log(`Server is running on http://localhost:${PORT}`.bgCyan.white);
  });
}

export default app;
