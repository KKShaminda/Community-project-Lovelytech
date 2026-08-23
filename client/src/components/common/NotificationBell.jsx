import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell } from "lucide-react";
import { getUnreadCount } from "../../services/notificationServices";
import { isAuthenticated } from "../../services/authServices";

const POLL_INTERVAL_MS = 20_000; // 20 seconds

export function NotificationBell({ className = "" }) {
  const [count, setCount] = useState(0);
  const navigate = useNavigate();
  const intervalRef = useRef(null);

  const fetchCount = async () => {
    try {
      if (!isAuthenticated()) {
        setCount(0);
        return;
      }
      const data = await getUnreadCount();
      setCount(data?.count ?? 0);
    } catch {
      // Silently ignore network failures during background polling
    }
  };

  useEffect(() => {
    fetchCount();

    intervalRef.current = setInterval(fetchCount, POLL_INTERVAL_MS);

    const handleUpdate = () => fetchCount();
    window.addEventListener("notification-updated", handleUpdate);
    window.addEventListener("focus", handleUpdate);
    window.addEventListener("storage", handleUpdate);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      window.removeEventListener("notification-updated", handleUpdate);
      window.removeEventListener("focus", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, []);

  return (
    <button
      id="notification-bell-btn"
      type="button"
      onClick={() => navigate("/notifications")}
      aria-label={`Notifications${count > 0 ? ` (${count} unread)` : ""}`}
      className={`relative flex h-10 w-10 items-center justify-center rounded-full border border-[#ff2020] p-2 text-[#ff2020] transition-all duration-200 hover:bg-[#ff2020] hover:text-white focus:outline-none ${className}`}
    >
      <Bell className="h-5 w-5" />
      {count > 0 && (
        <span
          aria-hidden="true"
          className="absolute -right-1 -top-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-[#ff2020] px-1 text-[10px] font-bold leading-none text-white shadow-md ring-2 ring-white animate-pulse"
        >
          {count > 99 ? "99+" : count}
        </span>
      )}
    </button>
  );
}

export default NotificationBell;
