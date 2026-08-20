import express from "express";
import {
  createOrder,
  getOrders,
  getOrderById,
  updateOrder,
  deleteOrder,
} from "../controllers/orderController.js";
import { validateOrderInput } from "../middleware/validationMiddleware.js";

const router = express.Router();

// Order routes
router
  .route("/")
  .get(getOrders)
  .post(validateOrderInput, createOrder);

router
  .route("/:id")
  .get(getOrderById)
  .put(updateOrder)
  .delete(deleteOrder);

export default router;
