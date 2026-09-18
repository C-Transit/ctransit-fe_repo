import { useState, useEffect, useCallback } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  History,
  Wallet,
  User,
  Bell,
  CreditCard,
  LogOut,
  Bus,
  Radio,
} from "lucide-react";
import useDriverAuth from "../../../hooks/useDriverAuth";
import {
  generateDriverDisplayId,
  generateTerminalDisplayId,
} from "../../../utils/identifierUtils";
import { fetchDriverNotifications, fetchDriverTerminalStatus } from "../../../api/driverApi";
import styles from "./DriverLayout.module.css";

export default function DriverLayout({ children }) {
  const { driver, logout } = useDriverAuth();
  const location = useLocation();

  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [terminalStatus, setTerminalStatus] = useState(driver?.terminalStatus || "ONLINE");
  const [terminalId, setTerminalId] = useState(driver?.terminalId || "TRM-01");

  useEffect(() => {
    if (driver?.terminalStatus) {
      setTerminalStatus(driver.terminalStatus);
    }
    if (driver?.terminalId) {
      setTerminalId(driver.terminalId);
    }
  }, [driver?.terminalStatus, driver?.terminalId]);

  const currentPath = location.pathname;

  // Load notification count and terminal status
  const loadHeaderData = useCallback(async () => {
    try {
      const notifRes = await fetchDriverNotifications({ limit: 20 });
      const list =
        notifRes?.data?.notifications ||
        notifRes?.notifications ||
        (Array.isArray(notifRes?.data) ? notifRes.data : []) ||
        (Array.isArray(notifRes) ? notifRes : []);

      const unread = list.filter((n) => !n.isRead && !n.read).length;
      setUnreadCount(unread);
    } catch {
      // Non-blocking
    }

    try {
      const termRes = await fetchDriverTerminalStatus(terminalId);
      const status =
        termRes?.status ||
        termRes?.data?.status ||
        termRes?.terminal?.status ||
        "ONLINE";
      setTerminalStatus(status);
      if (termRes?.terminalId || termRes?.id) {
        setTerminalId(termRes.terminalId || termRes.id);
      }
    } catch {
      // Default to driver's stored terminal status
    }
  }, [terminalId]);

  useEffect(() => {
    loadHeaderData();
    const interval = setInterval(loadHeaderData, 30000);
    return () => clearInterval(interval);
  }, [loadHeaderData]);

  const navItems = [
    { label: "Dashboard", path: "/driver", icon: LayoutDashboard },
    { label: "Ride Log", path: "/driver/history", icon: History },
    { label: "Withdrawals", path: "/driver/withdrawals", icon: Wallet },
    { label: "Profile", path: "/driver/profile", icon: User },
    { label: "Notifications", path: "/driver/notifications", icon: Bell },
    { label: "Link Card", path: "/driver/link-card", icon: CreditCard },
  ];

  const mobileNavItems = [
    { label: "Dashboard", path: "/driver", icon: LayoutDashboard },
    { label: "Ride Log", path: "/driver/history", icon: History },
    { label: "Withdraw", path: "/driver/withdrawals", icon: Wallet },
    { label: "Profile", path: "/driver/profile", icon: User },
  ];

  const driverDisplayId = generateDriverDisplayId(
    driver?.id || driver?.matricNumber || driver?.email || "CURRENT"
  );
  const terminalDisplayId = generateTerminalDisplayId(terminalId);

  const statusClass =
    terminalStatus?.toLowerCase() === "locked"
      ? styles.locked
      : terminalStatus?.toLowerCase() === "offline"
      ? styles.offline
      : styles.online;

  return (
    <div className={styles.layoutWrapper}>
      {/* Header Bar */}
      <header className={styles.header}>
        <Link to="/driver" className={styles.headerBrand}>
          <div className={styles.logoIcon}>
            <Bus size={22} />
          </div>
          <div className={styles.brandTextGroup}>
            <div className={styles.brandTitle}>
              C-Transit <span className={styles.brandBadge}>Driver</span>
            </div>
            <div className={styles.brandSubtitle}>Campus Transport Operations</div>
          </div>
        </Link>

        <div className={styles.headerActions}>
          {/* Terminal Status Pill */}
          <div className={styles.terminalStatusPill} title={`Assigned POS Terminal: ${terminalDisplayId}`}>
            <Radio size={14} />
            <span>{terminalDisplayId}</span>
            <span className={`${styles.statusDot} ${statusClass}`} />
            <span>{terminalStatus}</span>
          </div>

          {/* Notifications Button */}
          <Link
            to="/driver/notifications"
            className={styles.notifBtn}
            title="Driver Notifications"
          >
            <Bell size={18} />
            {unreadCount > 0 && <span className={styles.notifBadge}>{unreadCount > 9 ? "9+" : unreadCount}</span>}
          </Link>

          {/* Driver Chip */}
          <div className={styles.driverProfileChip}>
            <div className={styles.driverAvatar}>
              {(driver?.firstname?.[0] || "D").toUpperCase()}
            </div>
            <div className={styles.driverMeta}>
              <span className={styles.driverName}>
                {driver?.firstname || "Driver"} {driver?.lastname || ""}
              </span>
              <span className={styles.driverId}>{driverDisplayId}</span>
            </div>
          </div>

          {/* Logout Button */}
          <button
            type="button"
            className={styles.logoutBtn}
            onClick={() => setShowLogoutModal(true)}
            title="Sign out of Driver Portal"
          >
            <LogOut size={16} />
            <span>Exit</span>
          </button>
        </div>
      </header>

      {/* Desktop Navigation */}
      <nav className={styles.desktopNav}>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.path === "/driver"
              ? currentPath === "/driver" || currentPath === "/driver/"
              : currentPath.startsWith(item.path);

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`${styles.navLink} ${isActive ? styles.active : ""}`}
            >
              <Icon size={16} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Main Content Area */}
      <main className={styles.mainContent}>{children}</main>

      {/* Mobile Bottom Navigation */}
      <nav className={styles.mobileNav}>
        {mobileNavItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.path === "/driver"
              ? currentPath === "/driver" || currentPath === "/driver/"
              : currentPath.startsWith(item.path);

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`${styles.mobileNavLink} ${isActive ? styles.active : ""}`}
            >
              <Icon size={20} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className={styles.modalOverlay} onClick={() => setShowLogoutModal(false)}>
          <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
            <h3 className={styles.modalTitle}>Sign Out</h3>
            <p className={styles.modalDescription}>
              Are you sure you want to end your driver shift and sign out of the Driver Portal?
            </p>
            <div className={styles.modalActions}>
              <button
                type="button"
                className={styles.cancelBtn}
                onClick={() => setShowLogoutModal(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className={styles.confirmLogoutBtn}
                onClick={() => {
                  setShowLogoutModal(false);
                  logout();
                }}
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
