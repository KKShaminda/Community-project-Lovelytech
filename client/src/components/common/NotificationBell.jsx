import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell } from "lucide-react";
import { getUnreadCount } from "../../services/notificationServices";
import { isAuthenticated } from "../../services/authServices";

const POLL_INTERVAL_MS = 30_000; // 30 seconds

/**
 * NotificationBell
 * Displays a bell icon with a red badge for unread notifications.
 * Polls the unread count every 30 s while the user is authenticated.
 * Clicking navigates to /notifications.
 */
export function NotificationBell() {
  const [count, setCount] = useState(0);
  const navigate = useNavigate();
  const intervalRef = useRef(null);

  const fetchCount = async () => {
    try {
      if (!isAuthenticated()) return;
      const data = await getUnreadCount();
      setCount(data?.count ?? 0);
    } catch {
      // Silently fail — badge simply shows 0
    }
  };

  useEffect(() => {
    fetchCount();
    intervalRef.current = setInterval(fetchCount, POLL_INTERVAL_MS);
    return () => clearInterval(intervalRef.current);
  }, []);

  return (
    <button
      id="notification-bell-btn"
      onClick={() => navigate("/notifications")}
      aria-label={`Notifications${count > 0 ? ` (${count} unread)` : ""}`}
      className="relative flex h-10 w-10 items-center justify-center rounded-full text-slate-600 transition-colors hover:bg-slate-100 hover:text-[#E4342F] focus:outline-none"
    >
      <Bell size={22} />
      {count > 0 && (
        <span
          aria-hidden="true"
          className="absolute -right-0.5 -top-0.5 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-[#E4342F] px-1 text-[10px] font-bold leading-none text-white shadow"
        >
          {count > 99 ? "99+" : count}
        </span>
      )}
    </button>
  );
}

export default NotificationBell;
