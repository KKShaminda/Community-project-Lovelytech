import express from "express";
import dotenv from "dotenv";
import "colors";
import connectDB from "./config/db.js";
import cors from "cors";

import userRoutes from "./routes/userRoute.js";
import productRoutes from "./routes/productRoutes.js";

const app = express();

// Load environment variables
dotenv.config();

// Connect to database
connectDB();

// Middleware
app.use(express.json());
app.use(cors({ origin: true, credentials: true }));
app.use('/uploads', express.static('uploads'));

// Routes
app.use("/api/users", userRoutes);
app.use("/api/products", productRoutes);

// Test route  
app.get("/", (req, res) => {
  res.send({ message: "Welcome to the LovelyTech API" });
});

// Start server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode`.bgCyan.white);
  console.log(`Server is running on port ${PORT}`.bgCyan.white);
});
