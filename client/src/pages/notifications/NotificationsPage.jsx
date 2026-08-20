import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bell,
  Wrench,
  ShoppingCart,
  Package,
  UserCircle,
  CheckCheck,
  LogOut,
  ChevronLeft,
  Inbox,
} from "lucide-react";
import {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from "../../services/notificationServices";
import { getCurrentUser, logoutUser } from "../../services/authServices";

// ─── Type metadata ────────────────────────────────────────────────────────────

const TYPE_META = {
  repair: {
    label: "Repairs",
    Icon: Wrench,
    iconClass: "text-blue-500",
    bgClass: "bg-blue-50",
    borderClass: "border-blue-200",
  },
  sale: {
    label: "Sales",
    Icon: ShoppingCart,
    iconClass: "text-emerald-500",
    bgClass: "bg-emerald-50",
    borderClass: "border-emerald-200",
  },
  inventory: {
    label: "Inventory",
    Icon: Package,
    iconClass: "text-amber-500",
    bgClass: "bg-amber-50",
    borderClass: "border-amber-200",
  },
  account: {
    label: "Account",
    Icon: UserCircle,
    iconClass: "text-purple-500",
    bgClass: "bg-purple-50",
    borderClass: "border-purple-200",
  },
};

const FILTERS = [
  { key: "all", label: "All" },
  { key: "unread", label: "Unread" },
  { key: "repair", label: "Repairs" },
  { key: "sale", label: "Sales" },
  { key: "inventory", label: "Inventory" },
  { key: "account", label: "Account" },
];

// ─── Navigation helper: where does clicking a notification go? ────────────────

function resolveLink(notification) {
  const user = getCurrentUser();
  const role = user?.role;

  switch (notification.referenceType) {
    case "Repair":
      if (role === "admin") return "/admin/repair-orders";
      if (role === "Receptionist") return "/admin/repair-orders";
      return "/user/dashboard";
    case "Sale":
      return "/admin/sales-log";
    case "Product":
      if (role === "admin") return "/admin/inventory";
      return "/products";
    case "User":
      return "/user/dashboard";
    default:
      return null;
  }
}

// ─── Relative time helper ─────────────────────────────────────────────────────

function relativeTime(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

// ─── Skeleton loader ──────────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div className="flex animate-pulse gap-4 rounded-2xl border border-slate-100 bg-white p-4">
      <div className="h-10 w-10 shrink-0 rounded-full bg-slate-100" />
      <div className="flex-1 space-y-2 pt-1">
        <div className="h-3.5 w-2/5 rounded-full bg-slate-100" />
        <div className="h-3 w-3/4 rounded-full bg-slate-100" />
        <div className="h-3 w-1/2 rounded-full bg-slate-100" />
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function NotificationsPage() {
  const navigate = useNavigate();
  const user = getCurrentUser();

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("all");
  const [markingAll, setMarkingAll] = useState(false);

  const loadNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (activeFilter === "unread") {
        params.unreadOnly = true;
      } else if (activeFilter !== "all") {
        params.type = activeFilter;
      }
      const data = await getNotifications(params);
      setNotifications(data.notifications || []);
    } catch (err) {
      console.error("Failed to load notifications:", err.message);
    } finally {
      setLoading(false);
    }
  }, [activeFilter]);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    loadNotifications();
  }, [loadNotifications]);

  const handleClick = async (notification) => {
    // Mark as read
    if (!notification.isRead) {
      try {
        await markNotificationRead(notification._id);
        setNotifications((prev) =>
          prev.map((n) => (n._id === notification._id ? { ...n, isRead: true } : n))
        );
      } catch (err) {
        console.error("Failed to mark notification read:", err.message);
      }
    }
    // Navigate
    const link = resolveLink(notification);
    if (link) navigate(link);
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

  const handleLogout = async () => {
    try {
      await logoutUser();
    } catch {}
    navigate("/login");
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;
  const hasUnread = unreadCount > 0;

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800">
      {/* ── Navbar ─────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="flex h-9 w-9 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition"
              aria-label="Go back"
            >
              <ChevronLeft size={20} />
            </button>
            <div className="flex items-center gap-2">
              <Bell size={20} className="text-[#E4342F]" />
              <h1 className="text-lg font-bold tracking-tight text-slate-900">
                Notifications
              </h1>
              {hasUnread && (
                <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-[#E4342F] px-1.5 text-[10px] font-bold text-white">
                  {unreadCount}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            {hasUnread && (
              <button
                onClick={handleMarkAllRead}
                disabled={markingAll}
                className="flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
              >
                <CheckCheck size={14} />
                {markingAll ? "Marking…" : "Mark all read"}
              </button>
            )}
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition"
            >
              <LogOut size={14} />
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* ── Main ────────────────────────────────────────────────────── */}
      <main className="mx-auto max-w-3xl px-6 py-8">

        {/* Filter tabs */}
        <div className="mb-6 flex flex-wrap gap-2">
          {FILTERS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setActiveFilter(key)}
              className={`rounded-full px-4 py-1.5 text-sm font-semibold transition ${
                activeFilter === key
                  ? "bg-[#E4342F] text-white shadow-sm"
                  : "bg-white border border-slate-200 text-slate-600 hover:border-slate-300 hover:text-slate-800"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Notification list */}
        <section className="space-y-3">
          {loading ? (
            <>
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-slate-300">
                <Inbox size={36} />
              </div>
              <h2 className="mt-5 text-base font-bold text-slate-700">
                No notifications here
              </h2>
              <p className="mt-1 text-sm text-slate-400">
                {activeFilter === "all"
                  ? "You're all caught up! Check back after new activity."
                  : `No ${activeFilter} notifications to show.`}
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
                  onClick={() => handleClick(notification)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === "Enter" && handleClick(notification)}
                  className={`group flex cursor-pointer gap-4 rounded-2xl border p-4 transition-all focus:outline-none focus:ring-2 focus:ring-[#E4342F] focus:ring-offset-2 ${
                    notification.isRead
                      ? "border-slate-100 bg-white hover:bg-slate-50"
                      : `border-l-4 border-[#E4342F] bg-white shadow-sm hover:shadow-md ${meta.borderClass}`
                  }`}
                >
                  {/* Type icon */}
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${meta.bgClass}`}
                  >
                    <Icon size={20} className={meta.iconClass} />
                  </div>

                  {/* Content */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <p
                        className={`text-sm leading-snug ${
                          notification.isRead
                            ? "font-medium text-slate-700"
                            : "font-bold text-slate-900"
                        }`}
                      >
                        {notification.title}
                      </p>
                      {!notification.isRead && (
                        <span className="mt-0.5 h-2.5 w-2.5 shrink-0 rounded-full bg-[#E4342F]" />
                      )}
                    </div>
                    <p className="mt-0.5 text-sm text-slate-500 leading-snug">
                      {notification.message}
                    </p>
                    <div className="mt-2 flex items-center gap-3">
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${meta.bgClass} ${meta.iconClass}`}
                      >
                        {meta.label}
                      </span>
                      <span className="text-xs text-slate-400">
                        {relativeTime(notification.createdAt)}
                      </span>
                      {link && (
                        <span className="ml-auto text-xs font-semibold text-[#E4342F] opacity-0 transition-opacity group-hover:opacity-100">
                          View →
                        </span>
                      )}
                    </div>
                  </div>
                </article>
              );
            })
          )}
        </section>
      </main>
    </div>
  );
}

export default NotificationsPage;
