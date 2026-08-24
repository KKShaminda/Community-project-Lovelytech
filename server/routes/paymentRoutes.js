import express from "express";
import {
  createPayment,
  getMyPayments,
  getPaymentById,
  getAllPayments,
} from "../controllers/paymentController.js";
import { requiredSignIn, isAdminOrReceptionist } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/", requiredSignIn, createPayment);
router.get("/my-payments", requiredSignIn, getMyPayments);
router.get("/all", requiredSignIn, isAdminOrReceptionist, getAllPayments);
router.get("/:id", requiredSignIn, getPaymentById);

export default router;
