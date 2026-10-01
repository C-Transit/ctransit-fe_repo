import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Bell,
  CheckCheck,
  Wallet,
  Radio,
  ShieldAlert,
  Info,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import {
  fetchDriverNotifications,
  markDriverNotificationAsRead,
  markAllDriverNotificationsAsRead,
} from "../../api/driverApi";
import DriverLayout from "./components/DriverLayout";
import styles from "./DriverNotifications.module.css";

export default function DriverNotifications() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState("ALL");

  const loadNotifications = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchDriverNotifications({ page: 1, limit: 50 });
      const rawList =
        res?.data?.notifications ||
        res?.notifications ||
        (Array.isArray(res?.data) ? res.data : []) ||
        (Array.isArray(res) ? res : []);

      const normalized = (Array.isArray(rawList) ? rawList : []).map((n) => ({
        id: n.id || n._id || `NOTIF-${Math.random()}`,
        title: n.title || n.subject || "System Notification",
        message: n.message || n.body || n.content || "",
        type: (n.type || n.category || "SYSTEM").toUpperCase(),
        isRead: Boolean(n.isRead || n.read),
        timestamp: n.createdAt || n.created_at || n.timestamp || new Date().toISOString(),
      }));

      setNotifications(normalized);
    } catch {
      setError("Unable to retrieve latest notifications from server.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  const handleMarkAsRead = async (id) => {
    try {
      await markDriverNotificationAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to mark notification as read.");
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllDriverNotificationsAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to mark all notifications as read.");
    }
  };

  const filteredNotifications = useMemo(() => {
    if (filter === "UNREAD") {
      return notifications.filter((n) => !n.isRead);
    }
    return notifications;
  }, [notifications, filter]);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const getIconForType = (type) => {
    if (type.includes("WITHDRAW") || type.includes("PAYOUT") || type.includes("SETTLEMENT")) {
      return { icon: <Wallet size={20} />, bg: "#dcfce7", color: "#15803d" };
    }
    if (type.includes("TERMINAL") || type.includes("POS") || type.includes("DEVICE")) {
      return { icon: <Radio size={20} />, bg: "#e0f2fe", color: "#0284c7" };
    }
    if (type.includes("ALERT") || type.includes("SECURITY") || type.includes("WARNING")) {
      return { icon: <ShieldAlert size={20} />, bg: "#fee2e2", color: "#b91c1c" };
    }
    return { icon: <Info size={20} />, bg: "#f1f5f9", color: "#475569" };
  };

  const formatTimestamp = (isoStr) => {
    if (!isoStr) return "Just now";
    const d = new Date(isoStr);
    if (isNaN(d.getTime())) return isoStr;
    return d.toLocaleString("en-NG", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <DriverLayout>
      <div className={styles.pageContainer}>
        {/* Header */}
        <div className={styles.pageHeader}>
          <div>
            <h1 className={styles.title}>Shift Notifications</h1>
            <p className={styles.subtitle}>
              Real-time settlement notices, terminal status alerts & operational broadcasts
            </p>
          </div>

          <div className={styles.headerActions}>
            <button
              type="button"
              className={styles.actionBtn}
              onClick={handleMarkAllAsRead}
              disabled={unreadCount === 0}
            >
              <CheckCheck size={16} />
              <span>Mark all as read</span>
            </button>
            <button
              type="button"
              className={styles.actionBtn}
              onClick={loadNotifications}
              disabled={loading}
            >
              <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {error && (
          <div style={{ padding: "0.85rem 1.25rem", background: "#fee2e2", border: "1px solid #fca5a5", borderRadius: "10px", color: "#b91c1c", display: "flex", alignItems: "center", gap: "8px" }}>
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {/* Notifications Card */}
        <div className={styles.notifCard}>
          <div className={styles.filterTabs}>
            <button
              type="button"
              className={`${styles.tab} ${filter === "ALL" ? styles.active : ""}`}
              onClick={() => setFilter("ALL")}
            >
              All Notifications ({notifications.length})
            </button>
            <button
              type="button"
              className={`${styles.tab} ${filter === "UNREAD" ? styles.active : ""}`}
              onClick={() => setFilter("UNREAD")}
            >
              Unread ({unreadCount})
            </button>
          </div>

          <div className={styles.notifList}>
            {filteredNotifications.length > 0 ? (
              filteredNotifications.map((n) => {
                const iconMeta = getIconForType(n.type);
                return (
                  <div
                    key={n.id}
                    className={`${styles.notifItem} ${!n.isRead ? styles.unread : ""}`}
                  >
                    <div
                      className={styles.notifIconCircle}
                      style={{ background: iconMeta.bg, color: iconMeta.color }}
                    >
                      {iconMeta.icon}
                    </div>

                    <div className={styles.notifBody}>
                      <div className={styles.notifTitleRow}>
                        <h4 className={styles.notifTitle}>{n.title}</h4>
                        <span className={styles.notifTime}>{formatTimestamp(n.timestamp)}</span>
                      </div>
                      <p className={styles.notifMessage}>{n.message}</p>
                      {!n.isRead && (
                        <button
                          type="button"
                          className={styles.markReadBtn}
                          onClick={() => handleMarkAsRead(n.id)}
                        >
                          Mark as read
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className={styles.emptyBox}>
                <Bell size={36} color="#cbd5e1" />
                <p>No notifications found in this view.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </DriverLayout>
  );
}
