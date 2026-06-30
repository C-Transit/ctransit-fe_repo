import { useState } from 'react';
import { FaBars, FaWifi, FaCog, FaBell } from 'react-icons/fa';
import styles from './HeaderBar.module.css';

export default function HeaderBar({ onMenuClick, onSettingsClick, onNotificationsClick, unreadCount = 0 }) {
  return (
    <header className={styles.header}>
      {/* Left: Hamburger Menu */}
      <button className={styles.menuBtn} onClick={onMenuClick} aria-label="Open menu">
        <FaBars size={24} />
      </button>

      {/* Center: Logo */}
      <div className={styles.logo}>
        <FaWifi size={16} />
        <span>C-Transit</span>
      </div>

      {/* Right: Action Buttons */}
      <div className={styles.actions}>
        <button className={styles.iconBtn} aria-label="Settings" onClick={onSettingsClick}>
          <FaCog size={22} />
        </button>

        <div style={{ position: 'relative' }}>
          <button className={styles.iconBtn} aria-label="Notifications" onClick={onNotificationsClick}>
            <FaBell size={22} />
            {unreadCount > 0 && <div className={styles.notifBadge} />}
          </button>
        </div>
      </div>
    </header>
  );
}