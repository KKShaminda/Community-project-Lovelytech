import express from "express";
import {
  getProducts,
  getProductFacets,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../controllers/productController.js";
import { uploadProductImages } from "../middlewares/imageUploader.js";
import { requiredSignIn, isAdminOrReceptionist } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Public routes for product catalog browsing
router.get("/", getProducts);
router.get("/facets", getProductFacets);
router.get("/:id", getProductById);

// Admin & Receptionist routes for product inventory & images management
router.post("/", requiredSignIn, isAdminOrReceptionist, uploadProductImages, createProduct);
router.put("/:id", requiredSignIn, isAdminOrReceptionist, uploadProductImages, updateProduct);
router.delete("/:id", requiredSignIn, isAdminOrReceptionist, deleteProduct);

export default router;