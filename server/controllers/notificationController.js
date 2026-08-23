import Notification from "../models/Notification.js";
import User from "../models/User.js";

// ─────────────────────────────────────────────────────────────
// INTERNAL HELPERS (Safe helpers that never throw)
// ─────────────────────────────────────────────────────────────

/**
 * Create a notification for a specific user ID.
 */
export const createNotificationForUser = async (userId, payload) => {
  try {
    if (!userId) return null;
    return await Notification.create({ recipientId: userId, ...payload });
  } catch (err) {
    console.error("[Notification] createNotificationForUser error:", err.message);
    return null;
  }
};

/**
 * Find a registered user by email and create a notification for them.
 */
export const createNotificationForEmail = async (email, payload) => {
  try {
    if (!email) return null;
    const user = await User.findOne({ email: email.toLowerCase().trim() }).select("_id");
    if (!user) return null;
    return await Notification.create({ recipientId: user._id, ...payload });
  } catch (err) {
    console.error("[Notification] createNotificationForEmail error:", err.message);
    return null;
  }
};

/**
 * Create a notification for all active users with the specified role(s).
 * @param {string|string[]} roles - e.g. "admin", "Receptionist", or ["admin", "Receptionist"]
 */
export const createNotificationsForRole = async (roles, payload) => {
  try {
    const roleList = Array.isArray(roles) ? roles : [roles];
    const users = await User.find({
      role: { $in: roleList },
      isSuspended: false,
    }).select("_id");

    if (!users.length) return;
    const docs = users.map((u) => ({ recipientId: u._id, ...payload }));
    await Notification.insertMany(docs, { ordered: false });
  } catch (err) {
    console.error(`[Notification] createNotificationsForRole error:`, err.message);
  }
};

// ─────────────────────────────────────────────────────────────
// ROUTE HANDLERS
// ─────────────────────────────────────────────────────────────

/**
 * GET /api/notifications
 * Optional query params:
 *   ?type=order|repair|payment|inventory|account|review
 *   ?unreadOnly=true
 */
export const getMyNotifications = async (req, res) => {
  try {
    const { type, unreadOnly, limit = 100 } = req.query;

    const filter = { recipientId: req.user._id };
    if (type && type !== "all") {
      filter.type = type;
    }
    if (unreadOnly === "true") {
      filter.isRead = false;
    }

    const notifications = await Notification.find(filter)
      .sort({ createdAt: -1 })
      .limit(Number(limit));

    res.status(200).json({
      success: true,
      count: notifications.length,
      notifications,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch notifications",
      error: error.message,
    });
  }
};

/**
 * GET /api/notifications/unread-count
 * Returns the number of unread notifications for the logged-in user.
 */
export const getUnreadCount = async (req, res) => {
  try {
    const count = await Notification.countDocuments({
      recipientId: req.user._id,
      isRead: false,
    });

    res.status(200).json({
      success: true,
      count,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch unread count",
      error: error.message,
    });
  }
};

/**
 * PATCH /api/notifications/:id/read
 * Marks a single notification as read.
 */
export const markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, recipientId: req.user._id },
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }

    res.status(200).json({
      success: true,
      notification,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to mark notification as read",
      error: error.message,
    });
  }
};

/**
 * PATCH /api/notifications/read-all
 * Marks all notifications for the current user as read.
 */
export const markAllRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { recipientId: req.user._id, isRead: false },
      { isRead: true }
    );

    res.status(200).json({
      success: true,
      message: "All notifications marked as read",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to mark all notifications as read",
      error: error.message,
    });
  }
};

/**
 * DELETE /api/notifications/:id
 * Dismisses/deletes a single notification.
 */
export const deleteNotification = async (req, res) => {
  try {
    const notification = await Notification.findOneAndDelete({
      _id: req.params.id,
      recipientId: req.user._id,
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Notification deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete notification",
      error: error.message,
    });
  }
};
