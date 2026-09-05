import express from "express";
import {
  createOrder,
  getOrders,
  getOrderById,
  updateOrder,
  deleteOrder,
} from "../controllers/orderController.js";
import { validateOrderInput } from "../middleware/validationMiddleware.js";
import { optionalSignIn } from "../middlewares/authMiddleware.js";
import { uploadPaymentSlip } from "../middlewares/imageUploader.js";

const router = express.Router();

// Order routes
router
  .route("/")
  .get(optionalSignIn, getOrders)
  .post(optionalSignIn, uploadPaymentSlip, validateOrderInput, createOrder);

router
  .route("/:id")
  .get(getOrderById)
  .put(updateOrder)
  .delete(deleteOrder);

export default router;
