import express from "express";
import {
  getProducts,
  getProductFacets,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../controllers/productController.js";
import { upload } from "../middlewares/imageUploader.js";

const router = express.Router();

router.get("/", getProducts);
router.get("/facets", getProductFacets);
router.get("/:id", getProductById);

router.post("/", upload.array("images", 5), createProduct);
router.put("/:id", upload.array("images", 5), updateProduct);
router.delete("/:id", deleteProduct);

export default router;