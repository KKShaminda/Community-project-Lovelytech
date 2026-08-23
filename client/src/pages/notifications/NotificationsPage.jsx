import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bell,
  Wrench,
  ShoppingBag,
  Package,
  UserCircle,
  CheckCheck,
  ChevronLeft,
  Inbox,
  CreditCard,
  Star,
  Trash2,
  ExternalLink,
} from "lucide-react";
import Layout from "../../components/layout/Layout";
import {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification,
} from "../../services/notificationServices";
import { getCurrentUser } from "../../services/authServices";

// ─── Type metadata & icons ───────────────────────────────────────────────────

const TYPE_META = {
  order: {
    label: "Order",
    Icon: ShoppingBag,
    iconClass: "text-amber-600",
    bgClass: "bg-amber-50",
    badgeClass: "bg-amber-100 text-amber-800",
    borderClass: "border-amber-200",
  },
  repair: {
    label: "Repair",
    Icon: Wrench,
    iconClass: "text-blue-600",
    bgClass: "bg-blue-50",
    badgeClass: "bg-blue-100 text-blue-800",
    borderClass: "border-blue-200",
  },
  payment: {
    label: "Payment",
    Icon: CreditCard,
    iconClass: "text-emerald-600",
    bgClass: "bg-emerald-50",
    badgeClass: "bg-emerald-100 text-emerald-800",
    borderClass: "border-emerald-200",
  },
  review: {
    label: "Review",
    Icon: Star,
    iconClass: "text-yellow-600",
    bgClass: "bg-yellow-50",
    badgeClass: "bg-yellow-100 text-yellow-800",
    borderClass: "border-yellow-200",
  },
  inventory: {
    label: "Inventory",
    Icon: Package,
    iconClass: "text-rose-600",
    bgClass: "bg-rose-50",
    badgeClass: "bg-rose-100 text-rose-800",
    borderClass: "border-rose-200",
  },
  account: {
    label: "Account",
    Icon: UserCircle,
    iconClass: "text-purple-600",
    bgClass: "bg-purple-50",
    badgeClass: "bg-purple-100 text-purple-800",
    borderClass: "border-purple-200",
  },
};

const FILTERS = [
  { key: "all", label: "All" },
  { key: "unread", label: "Unread" },
  { key: "order", label: "Orders" },
  { key: "repair", label: "Repairs" },
  { key: "payment", label: "Payments" },
  { key: "review", label: "Reviews" },
  { key: "inventory", label: "Inventory" },
  { key: "account", label: "Account" },
];

// ─── Target link resolver ────────────────────────────────────────────────────

function resolveLink(notification) {
  const user = getCurrentUser();
  const role = (user?.role || "").toLowerCase();
  const isStaff = role === "admin" || role === "receptionist";

  switch (notification.type) {
    case "order":
      if (isStaff && role === "admin") return "/admin/sales-log";
      return "/orders";
    case "repair":
      if (isStaff) {
        return role === "receptionist" ? "/receptionist/repair-orders" : "/admin/repair-orders";
      }
      return notification.referenceId ? `/repair/track` : "/repair/history";
    case "payment":
      if (isStaff) {
        return role === "receptionist" ? "/receptionist/sales-log" : "/admin/sales-log";
      }
      return "/orders";
    case "inventory":
      if (isStaff) {
        return role === "receptionist" ? "/receptionist/inventory" : "/admin/inventory";
      }
      return notification.referenceId ? `/products/${notification.referenceId}` : "/products";
    case "account":
      if (role === "admin") return "/admin/customers";
      return "/user/profile";
    case "review":
      return notification.referenceId ? `/products/${notification.referenceId}` : "/products";
    default:
      return null;
  }
}

// ─── Relative time formatter ──────────────────────────────────────────────────

function formatRelativeTime(dateStr) {
  if (!dateStr) return "Just now";
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60_000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
  });
}

// ─── Skeleton Loader ──────────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div className="flex animate-pulse gap-4 rounded-2xl border border-gray-100 bg-white p-4 shadow-xs">
      <div className="h-11 w-11 shrink-0 rounded-2xl bg-gray-200" />
      <div className="flex-1 space-y-2.5">
        <div className="flex justify-between">
          <div className="h-4 w-1/3 rounded-md bg-gray-200" />
          <div className="h-3 w-16 rounded-md bg-gray-200" />
        </div>
        <div className="h-3.5 w-4/5 rounded-md bg-gray-200" />
        <div className="h-3 w-20 rounded-md bg-gray-200" />
      </div>
    </div>
  );
}

// ─── Notifications Page Component ────────────────────────────────────────────

export function NotificationsPage() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("all");
  const [markingAll, setMarkingAll] = useState(false);

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (activeFilter === "unread") {
        params.unreadOnly = true;
      } else if (activeFilter !== "all") {
        params.type = activeFilter;
      }

      const res = await getNotifications(params);
      setNotifications(res?.notifications || []);
    } catch (err) {
      console.error("Failed to load notifications:", err.message);
    } finally {
      setLoading(false);
    }
  }, [activeFilter]);

  useEffect(() => {
    fetchNotifications();

    const handleUpdate = () => fetchNotifications();
    window.addEventListener("notification-updated", handleUpdate);
    return () => window.removeEventListener("notification-updated", handleUpdate);
  }, [fetchNotifications]);

  const handleNotificationClick = async (notification) => {
    if (!notification.isRead) {
      try {
        await markNotificationRead(notification._id);
        setNotifications((prev) =>
          prev.map((n) => (n._id === notification._id ? { ...n, isRead: true } : n))
        );
      } catch (err) {
        console.error("Failed to mark read:", err.message);
      }
    }

    const link = resolveLink(notification);
    if (link) {
      navigate(link);
    }
  };

  const handleMarkAllRead = async () => {
    setMarkingAll(true);
    try {
      await markAllNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (err) {
      console.error("Failed to mark all read:", err.message);
    } finally {
      setMarkingAll(false);
    }
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    try {
      await deleteNotification(id);
      setNotifications((prev) => prev.filter((n) => n._id !== id));
    } catch (err) {
      console.error("Failed to delete notification:", err.message);
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <Layout>
      <main className="min-h-screen bg-[#f7f8fa] px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          {/* Header Card */}
          <div className="flex flex-col gap-4 rounded-3xl border border-gray-200 bg-white p-6 shadow-xs sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3.5">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="flex h-10 w-10 items-center justify-center rounded-2xl border border-gray-200 text-gray-600 transition hover:bg-gray-100 hover:text-black"
                aria-label="Go back"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-[#ff2020]">
                <Bell className="h-6 w-6" />
              </div>
              <div>
                <div className="flex items-center gap-2.5">
                  <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">
                    Notifications
                  </h1>
                  {unreadCount > 0 && (
                    <span className="rounded-full bg-[#ff2020] px-2.5 py-0.5 text-xs font-bold text-white shadow-xs">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500 sm:text-sm">
                  Stay updated with orders, repairs, and store alerts
                </p>
              </div>
            </div>

            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllRead}
                disabled={markingAll}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-gray-200 bg-white px-4 py-2.5 text-xs font-bold text-gray-700 shadow-xs transition hover:border-[#ff2020] hover:bg-red-50/50 hover:text-[#ff2020] disabled:opacity-50 sm:text-sm"
              >
                <CheckCheck className="h-4 w-4 text-[#ff2020]" />
                {markingAll ? "Marking all..." : "Mark all as read"}
              </button>
            )}
          </div>

          {/* Filter Pills */}
          <div className="mt-6 flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {FILTERS.map(({ key, label }) => {
              const isActive = activeFilter === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setActiveFilter(key)}
                  className={`shrink-0 rounded-full px-5 py-2 text-xs font-bold transition sm:text-sm ${
                    isActive
                      ? "bg-[#ff2020] text-white shadow-sm"
                      : "border border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>

          {/* Notification List Section */}
          <div className="mt-6 space-y-3">
            {loading ? (
              <>
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
              </>
            ) : notifications.length === 0 ? (
              <div className="my-10 flex flex-col items-center justify-center rounded-3xl border border-dashed border-gray-200 bg-white py-16 text-center shadow-xs">
                <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-gray-50 text-gray-400">
                  <Inbox className="h-8 w-8" />
                </div>
                <h3 className="mt-4 text-base font-bold text-gray-800">
                  No notifications found
                </h3>
                <p className="mt-1 max-w-sm text-xs text-gray-500 sm:text-sm">
                  {activeFilter === "all"
                    ? "You are all caught up! When you have new orders, repairs, or updates, they will appear here."
                    : `No ${activeFilter} notifications right now.`}
                </p>
              </div>
            ) : (
              notifications.map((notification) => {
                const meta = TYPE_META[notification.type] || TYPE_META.account;
                const { Icon } = meta;
                const link = resolveLink(notification);

                return (
                  <article
                    key={notification._id}
                    onClick={() => handleNotificationClick(notification)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === "Enter" && handleNotificationClick(notification)}
                    className={`group relative flex cursor-pointer items-start gap-4 rounded-2xl border p-4 transition-all duration-200 hover:shadow-md sm:p-5 ${
                      notification.isRead
                        ? "border-gray-200 bg-white/80 text-gray-600 hover:bg-white"
                        : `border-l-4 border-[#ff2020] border-gray-200 bg-white shadow-xs ${meta.borderClass}`
                    }`}
                  >
                    {/* Icon Avatar */}
                    <div
                      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${meta.bgClass}`}
                    >
                      <Icon className={`h-5 w-5 ${meta.iconClass}`} />
                    </div>

                    {/* Notification Content */}
                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <h2
                            className={`text-sm leading-snug sm:text-base ${
                              notification.isRead
                                ? "font-semibold text-gray-800"
                                : "font-bold text-gray-950"
                            }`}
                          >
                            {notification.title}
                          </h2>
                          <span
                            className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${meta.badgeClass}`}
                          >
                            {meta.label}
                          </span>
                        </div>

                        {/* Unread indicator / time */}
                        <div className="flex items-center gap-2">
                          <span className="whitespace-nowrap text-[11px] font-medium text-gray-400">
                            {formatRelativeTime(notification.createdAt)}
                          </span>
                          {!notification.isRead && (
                            <span
                              className="h-2.5 w-2.5 shrink-0 rounded-full bg-[#ff2020]"
                              title="Unread"
                            />
                          )}
                        </div>
                      </div>

                      <p
                        className={`text-xs leading-relaxed sm:text-sm ${
                          notification.isRead ? "text-gray-500" : "text-gray-700"
                        }`}
                      >
                        {notification.message}
                      </p>

                      {/* Footer Actions Row */}
                      <div className="flex items-center justify-between pt-2">
                        {link ? (
                          <span className="inline-flex items-center gap-1 text-xs font-bold text-[#ff2020] transition group-hover:underline">
                            View details
                            <ExternalLink className="h-3 w-3" />
                          </span>
                        ) : (
                          <div />
                        )}

                        <button
                          type="button"
                          onClick={(e) => handleDelete(e, notification._id)}
                          title="Dismiss notification"
                          aria-label="Dismiss notification"
                          className="rounded-lg p-1.5 text-gray-400 opacity-0 transition hover:bg-gray-100 hover:text-red-600 group-hover:opacity-100"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })
            )}
          </div>
        </div>
      </main>
    </Layout>
  );
}

export default NotificationsPage;
