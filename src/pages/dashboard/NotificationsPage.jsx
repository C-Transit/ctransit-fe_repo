import { useState, useEffect } from 'react';
import { FaArrowLeft, FaEllipsisV } from 'react-icons/fa';
import styles from './NotificationsPage.module.css';
import { NOT_API_URL } from '../../config/api';

export default function NotificationsPage({ onBack }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const getToken = () => localStorage.getItem('authToken');

  // Fetch notifications
  const fetchNotifications = async () => {
    setLoading(true);
    setError('');
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
    } catch (err) {
      setError(err.message || 'Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  // Mark as read
  const handleMarkAsRead = async (id) => {
    // Optimistic update
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );

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
      console.error(err.message);
      fetchNotifications(); // revert on failure
    }
  };

  // Delete notification
  const handleDeleteNotification = async (id) => {
    // Optimistic update
    setNotifications(prev => prev.filter(n => n.id !== id));

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
      console.error(err.message);
      fetchNotifications(); // revert on failure
    }
  };

  // Split into Today vs Earlier based on createdAt timestamp
  const isToday = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffHours = diffMs / 3600000;
    return diffHours < 24;
  };

  const todayNotifications = notifications.filter(n => isToday(n.createdAt || n.timestamp));
  const earlierNotifications = notifications.filter(n => !isToday(n.createdAt || n.timestamp));

  const formatTime = (timestamp) => {
    const now = new Date();
    const diffMs = now - new Date(timestamp);
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minutes ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    if (diffDays < 7) return `${diffDays} days ago`;
    return new Date(timestamp).toLocaleDateString();
  };

  const renderNotification = (notif) => (
    <div
      key={notif.id}
      className={`${styles.notificationRow} ${!notif.read ? styles.unread : ''} ${styles[`type-${notif.type}`]}`}
    >
      <div className={styles.notificationIcon}>
        <span className={styles.iconBadge}></span>
      </div>
      <div className={styles.notificationContent}>
        <p className={styles.notificationTitle}>{notif.title}</p>
        <p className={styles.notificationMessage}>{notif.message}</p>
        <p className={styles.notificationTime}>
          {formatTime(notif.createdAt || notif.timestamp)}
        </p>
      </div>
      <div className={styles.notificationActions}>
        <button
          className={styles.moreBtn}
          onClick={() =>
            !notif.read
              ? handleMarkAsRead(notif.id)
              : handleDeleteNotification(notif.id)
          }
        >
          <FaEllipsisV size={16} />
        </button>
      </div>
    </div>
  );

  return (
    <div className={styles.notificationPage}>
      {/* Header */}
      <div className={styles.pageHeader}>
        <button className={styles.backBtn} onClick={onBack}>
          <FaArrowLeft size={20} />
        </button>
        <h1 className={styles.pageTitle}>Notifications</h1>
      </div>

      {/* Loading */}
      {loading && (
        <div className={styles.emptyState}>
          <p className={styles.emptyMessage}>Loading notifications...</p>
        </div>
      )}

      {/* Error */}
      {error && !loading && (
        <div className={styles.emptyState}>
          <p className={styles.emptyTitle}>Something went wrong</p>
          <p className={styles.emptyMessage}>{error}</p>
        </div>
      )}

      {/* Today */}
      {!loading && !error && todayNotifications.length > 0 && (
        <div className={styles.notificationGroup}>
          <p className={styles.groupTitle}>Today</p>
          <div className={styles.notificationList}>
            {todayNotifications.map(renderNotification)}
          </div>
        </div>
      )}

      {/* Earlier */}
      {!loading && !error && earlierNotifications.length > 0 && (
        <div className={styles.notificationGroup}>
          <p className={styles.groupTitle}>Earlier</p>
          <div className={styles.notificationList}>
            {earlierNotifications.map(renderNotification)}
          </div>
        </div>
      )}

      {/* Empty */}
      {!loading && !error && notifications.length === 0 && (
        <div className={styles.emptyState}>
          <p className={styles.emptyTitle}>No Notifications</p>
          <p className={styles.emptyMessage}>You're all caught up!</p>
        </div>
      )}
    </div>
  );
}