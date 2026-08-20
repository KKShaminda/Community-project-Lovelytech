import express from "express";
import {
  getMyNotifications,
  getUnreadCount,
  markAsRead,
  markAllRead,
} from "../controllers/notificationController.js";
import { requiredSignIn } from "../middlewares/authMiddleware.js";

const router = express.Router();

// All notification routes require authentication
router.use(requiredSignIn);

// GET all notifications for logged-in user (optional ?type= ?unreadOnly=true)
router.get("/", getMyNotifications);

// GET unread badge count
router.get("/unread-count", getUnreadCount);

// PATCH mark all as read (must come BEFORE /:id/read to avoid route conflict)
router.patch("/read-all", markAllRead);

// PATCH mark single notification as read
router.patch("/:id/read", markAsRead);

export default router;
