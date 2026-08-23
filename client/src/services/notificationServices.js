import { getAuthHeaders } from "./authServices";

const normalizeUrlPart = (value = "") => value.replace(/\/+$/, "");

const rawBaseUrl = (import.meta.env.VITE_API_BASE_URL || "http://localhost:5000").trim();
const normalizedBaseUrl = normalizeUrlPart(rawBaseUrl.replace(/\/api$/i, ""));
const API_URL = `${normalizedBaseUrl}/api/notifications`;

const parseResponse = async (response) => {
  const text = await response.text();
  if (!text) return {};

  try {
    return JSON.parse(text);
  } catch {
    return { message: text };
  }
};

const request = async (url, options = {}) => {
  const headers = {
    ...getAuthHeaders(),
    ...(options.headers || {}),
  };

  const response = await fetch(url, {
    ...options,
    headers,
    credentials: "include",
  });

  const data = await parseResponse(response);

  if (!response.ok) {
    const message = data?.message || data?.error || response.statusText || "Request failed";
    throw new Error(message);
  }

  return data;
};

/**
 * Fetch all notifications for current authenticated user.
 * @param {Object} params - e.g. { type: "order"|"repair"|"payment"|"inventory"|"account"|"review", unreadOnly: true }
 */
export const getNotifications = async (params = {}) => {
  const query = new URLSearchParams();
  if (params.type && params.type !== "all") query.append("type", params.type);
  if (params.unreadOnly) query.append("unreadOnly", "true");
  const qs = query.toString();
  return request(`${API_URL}${qs ? `?${qs}` : ""}`, { method: "GET" });
};

/**
 * Get count of unread notifications for badge.
 */
export const getUnreadCount = async () => {
  return request(`${API_URL}/unread-count`, { method: "GET" });
};

/**
 * Mark a single notification as read.
 */
export const markNotificationRead = async (id) => {
  const res = await request(`${API_URL}/${encodeURIComponent(id)}/read`, { method: "PATCH" });
  window.dispatchEvent(new Event("notification-updated"));
  return res;
};

/**
 * Mark all unread notifications as read.
 */
export const markAllNotificationsRead = async () => {
  const res = await request(`${API_URL}/read-all`, { method: "PATCH" });
  window.dispatchEvent(new Event("notification-updated"));
  return res;
};

/**
 * Delete a single notification.
 */
export const deleteNotification = async (id) => {
  const res = await request(`${API_URL}/${encodeURIComponent(id)}`, { method: "DELETE" });
  window.dispatchEvent(new Event("notification-updated"));
  return res;
};
