import { buildUrl, request } from "./api.js";

const API_URL = buildUrl("/notifications");

/**
 * Fetch notifications for the current user.
 * @param {Object} params - Optional: { type: "repair"|"sale"|"inventory"|"account", unreadOnly: true }
 */
export const getNotifications = async (params = {}) => {
  const query = new URLSearchParams();
  if (params.type) query.append("type", params.type);
  if (params.unreadOnly) query.append("unreadOnly", "true");
  const qs = query.toString();
  return request(`${API_URL}${qs ? `?${qs}` : ""}`, { method: "GET" });
};

/**
 * Get the count of unread notifications for the current user.
 * Returns { success: true, count: N }
 */
export const getUnreadCount = async () =>
  request(`${API_URL}/unread-count`, { method: "GET" });

/**
 * Mark a single notification as read.
 * @param {string} id - Notification _id
 */
export const markNotificationRead = async (id) =>
  request(`${API_URL}/${id}/read`, { method: "PATCH" });

/**
 * Mark all unread notifications as read for the current user.
 */
export const markAllNotificationsRead = async () =>
  request(`${API_URL}/read-all`, { method: "PATCH" });
