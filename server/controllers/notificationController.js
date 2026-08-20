import Notification from "../models/Notification.js";
import User from "../models/User.js";

// ─────────────────────────────────────────────────────────────
// INTERNAL HELPERS  (not exported as route handlers)
// ─────────────────────────────────────────────────────────────

/**
 * Create a single notification for one known user _id.
 * Returns the saved document (or null on failure — never throws so
 * callers don't abort their own transactions on notification errors).
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
 * Silently skips if no matching account exists (walk-in customers).
 */
export const createNotificationForEmail = async (email, payload) => {
  try {
    if (!email) return null;
    const user = await User.findOne({ email: email.toLowerCase() }).select("_id");
    if (!user) return null;
    return await Notification.create({ recipientId: user._id, ...payload });
  } catch (err) {
    console.error("[Notification] createNotificationForEmail error:", err.message);
    return null;
  }
};

/**
 * Create one notification for every user that has the given role.
 * Safe to call without awaiting from within transactions — uses Promise.allSettled.
 */
export const createNotificationsForRole = async (role, payload) => {
  try {
    const users = await User.find({ role, isSuspended: false }).select("_id");
    if (!users.length) return;
    const docs = users.map((u) => ({ recipientId: u._id, ...payload }));
    await Notification.insertMany(docs, { ordered: false });
  } catch (err) {
    console.error(`[Notification] createNotificationsForRole(${role}) error:`, err.message);
  }
};

// ─────────────────────────────────────────────────────────────
// ROUTE HANDLERS
// ─────────────────────────────────────────────────────────────

/**
 * GET /api/notifications
 * Optional query params:
 *   ?type=repair|sale|inventory|account
 *   ?unreadOnly=true
 */
export const getMyNotifications = async (req, res) => {
  try {
    const { type, unreadOnly } = req.query;

    const filter = { recipientId: req.user._id };
    if (type) filter.type = type;
    if (unreadOnly === "true") filter.isRead = false;

    const notifications = await Notification.find(filter)
      .sort({ createdAt: -1 })
      .limit(100);

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
 * Returns the number of unread notifications for the current user.
 */
export const getUnreadCount = async (req, res) => {
  try {
    const count = await Notification.countDocuments({
      recipientId: req.user._id,
      isRead: false,
    });

    res.status(200).json({ success: true, count });
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
 * Marks a single notification as read (only if it belongs to req.user).
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

    res.status(200).json({ success: true, notification });
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
 * Marks ALL unread notifications as read for the current user.
 */
export const markAllRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { recipientId: req.user._id, isRead: false },
      { isRead: true }
    );

    res.status(200).json({ success: true, message: "All notifications marked as read" });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to mark all notifications as read",
      error: error.message,
    });
  }
};
