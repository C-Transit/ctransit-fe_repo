import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaBell, FaTimes, FaCheck } from 'react-icons/fa';
import styles from './NotificationCenter.module.css';
import { NOT_API_URL } from '../config/api';

export default function NotificationCenter() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const getToken = () => localStorage.getItem('authToken');

  // Fetch notifications from backend
  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${NOT_API_URL}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${getToken()}`,
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();

      if (!response.ok) throw new Error(result.message || 'Failed to fetch notifications');

      const data = result.data || result.notifications || result || [];
      setNotifications(data);
      updateUnreadCount(data);
    } catch (err) {
      console.error('Failed to fetch notifications:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const updateUnreadCount = (notifList) => {
    const unread = notifList.filter((n) => !n.isRead).length;
    setUnreadCount(unread);
  };

  // Mark single notification as read
  const handleMarkAsRead = async (id) => {
    // Optimistic update
    const updated = notifications.map((n) =>
      n.id === id ? { ...n, isRead: true } : n
    );
    setNotifications(updated);
    updateUnreadCount(updated);

    try {
      const response = await fetch(`${NOT_API_URL}/mark-read`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${getToken()}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ notificationId: id }),
      });

      if (!response.ok) throw new Error('Failed to mark as read');
    } catch (err) {
      console.error('Mark as read failed:', err.message);
      // Revert on failure
      fetchNotifications();
    }
  };

  // Mark all as read
  const handleMarkAllAsRead = async () => {
    // Optimistic update
    const updated = notifications.map((n) => ({ ...n, isRead: true }));
    setNotifications(updated);
    updateUnreadCount(updated);

    try {
      const response = await fetch(`${NOT_API_URL}/mark-all-read`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${getToken()}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) throw new Error('Failed to mark all as read');
    } catch (err) {
      console.error('Mark all as read failed:', err.message);
      // Revert on failure
      fetchNotifications();
    }
  };

  // Delete notification
  const handleDeleteNotification = async (id) => {
    // Optimistic update
    const updated = notifications.filter((n) => n.id !== id);
    setNotifications(updated);
    updateUnreadCount(updated);

    try {
      const response = await fetch(`${NOT_API_URL}/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${getToken()}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) throw new Error('Failed to delete notification');
    } catch (err) {
      console.error('Delete failed:', err.message);
      // Revert on failure
      fetchNotifications();
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'bus': return '#3b82f6';
      case 'payment': return '#10b981';
      case 'trip': return '#f59e0b';
      case 'promo': return '#ec4899';
      case 'system': return '#6366f1';
      default: return '#64748b';
    }
  };

  const formatTime = (timestamp) => {
    const now = new Date();
    const diffMs = now - new Date(timestamp);
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return new Date(timestamp).toLocaleDateString();
  };

  return (
    <div className={styles.notificationCenter}>
      {/* Notification Bell Button */}
      <motion.button
        className={styles.bellBtn}
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        <FaBell />
        {unreadCount > 0 && (
          <motion.span
            className={styles.badge}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </motion.span>
        )}
      </motion.button>

      {/* Notification Drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className={styles.drawer}
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            {/* Header */}
            <div className={styles.drawerHeader}>
              <h3>Notifications</h3>
              <motion.button
                className={styles.closeBtn}
                onClick={() => setIsOpen(false)}
                whileHover={{ rotate: 90 }}
              >
                <FaTimes />
              </motion.button>
            </div>

            {/* Notifications List */}
            <div className={styles.notificationsList}>
              {loading ? (
                <div className={styles.empty}>
                  <p>Loading notifications...</p>
                </div>
              ) : notifications.length === 0 ? (
                <div className={styles.empty}>
                  <p>No notifications yet</p>
                  <span>You're all caught up! 🎉</span>
                </div>
              ) : (
                <AnimatePresence mode="popLayout">
                  {notifications.map((notif, index) => (
                    <motion.div
                      key={notif.id}
                      className={`${styles.notificationItem} ${
                        notif.isRead ? styles.read : styles.unread
                      }`}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <div className={styles.iconWrapper}>
                        <span className={styles.icon}>{notif.icon}</span>
                      </div>

                      <div
                        className={styles.content}
                        onClick={() => {
                          if (!notif.isRead) handleMarkAsRead(notif.id);
                          if (notif.actionUrl) {
                            window.location.href = notif.actionUrl;
                          }
                        }}
                      >
                        <div className={styles.titleRow}>
                          <h4>{notif.title}</h4>
                          {!notif.isRead && (
                            <div
                              className={styles.unreadDot}
                              style={{
                                backgroundColor: getNotificationColor(notif.type),
                              }}
                            />
                          )}
                        </div>
                        <p>{notif.message}</p>
                        <span className={styles.time}>
                          {formatTime(notif.timestamp)}
                        </span>
                      </div>

                      <motion.button
                        className={styles.deleteBtn}
                        onClick={() => handleDeleteNotification(notif.id)}
                        whileHover={{ scale: 1.2 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <FaTimes />
                      </motion.button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && unreadCount > 0 && (
              <div className={styles.drawerFooter}>
                <motion.button
                  className={styles.markAllBtn}
                  onClick={handleMarkAllAsRead}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <FaCheck /> Mark all as read
                </motion.button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className={styles.overlay}
            onClick={() => setIsOpen(false)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}