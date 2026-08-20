import express from "express";
import { requiredSignIn, isAdminOrReceptionist } from "../middlewares/authMiddleware.js";
import { createSale, deleteSale, getSales, updateSale } from "../controllers/saleController.js";

const router = express.Router();

router.get("/", requiredSignIn, isAdminOrReceptionist, getSales);
router.post("/", requiredSignIn, isAdminOrReceptionist, createSale);
router.put("/:id", requiredSignIn, isAdminOrReceptionist, updateSale);
router.delete("/:id", requiredSignIn, isAdminOrReceptionist, deleteSale);

export default router;