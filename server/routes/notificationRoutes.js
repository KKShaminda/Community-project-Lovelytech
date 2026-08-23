import express from "express";
import {
  getMyNotifications,
  getUnreadCount,
  markAsRead,
  markAllRead,
  deleteNotification,
} from "../controllers/notificationController.js";
import { requiredSignIn } from "../middlewares/authMiddleware.js";

const router = express.Router();

// All notification routes require authentication
router.use(requiredSignIn);

// GET notifications for logged-in user
router.get("/", getMyNotifications);

// GET unread count for badge
router.get("/unread-count", getUnreadCount);

// PATCH mark all as read (placed before /:id/read)
router.patch("/read-all", markAllRead);

// PATCH mark single notification as read
router.patch("/:id/read", markAsRead);

// DELETE dismiss notification
router.delete("/:id", deleteNotification);

export default router;
