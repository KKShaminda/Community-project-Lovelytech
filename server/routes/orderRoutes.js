import express from "express";
import {
  createOrder,
  getOrders,
  getMyOrders,
  getOrderById,
  updateOrder,
  deleteOrder,
  getAllOrders,
  updateOrderStatus,
} from "../controllers/orderController.js";
import { requiredSignIn, isAdminOrReceptionist } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/my-orders", requiredSignIn, getMyOrders);
router.get("/", getOrders);
router.post("/", createOrder);
router.get("/all", requiredSignIn, isAdminOrReceptionist, getAllOrders);
router.get("/:id", getOrderById);
router.put("/:id", updateOrder);
router.delete("/:id", deleteOrder);
router.patch("/:id/status", requiredSignIn, isAdminOrReceptionist, updateOrderStatus);

export default router;
