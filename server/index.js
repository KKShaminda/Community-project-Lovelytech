import express from "express";
import dotenv from "dotenv";
import "colors";
import connectDB from "./config/db.js";
import cors from "cors";

import userRoutes from "./routes/userRoute.js";
import productRoutes from "./routes/productRoutes.js";
import saleRoutes from "./routes/saleRoutes.js";
import repairRoutes from "./routes/repairRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";

import { notFound, errorHandler } from "./middleware/errorMiddleware.js";
import { seedInitialData } from "./utils/seedData.js";

const app = express();

// Load environment variables
dotenv.config();

// Connect to database
connectDB().then(() => {
  seedInitialData();
});

// Middleware
app.use(express.json());
app.use(cors({ origin: true, credentials: true }));
app.use('/uploads', express.static('uploads'));

// Routes
app.use("/api/users", userRoutes);
app.use("/api/products", productRoutes);
app.use("/api/sales", saleRoutes);
app.use("/api/repairs", repairRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/notifications", notificationRoutes);

// Test route  
app.get("/", (req, res) => {
  res.send({ message: "Welcome to the LovelyTech API" });
});

// Custom Error Handling Middlewares
app.use(notFound);
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || "development"} mode`.bgCyan.white);
  console.log(`Server is running on port ${PORT}`.bgCyan.white);
});
