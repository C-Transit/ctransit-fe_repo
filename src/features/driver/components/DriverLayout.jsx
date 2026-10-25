import { useState, useEffect, useCallback, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  History,
  Wallet,
  User,
  Bell,
  CreditCard,
  Radio,
} from "lucide-react";
import useDriverAuth from "../../../hooks/useDriverAuth";
import {
  generateDriverDisplayId,
  generateTerminalDisplayId,
} from "../../../utils/identifierUtils";
import {
  fetchDriverNotifications,
  fetchDriverProfile,
} from "../../../api/driverApi";
import logo from "../../../assets/images/c-transit-icon.svg"
import styles from "./DriverLayout.module.css";

const HEADER_POLL_INTERVAL_MS = 3 * 60 * 1000;

export default function DriverLayout({ children }) {
  const { driver, logout } = useDriverAuth();
  const location = useLocation();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [terminal, setTerminal] = useState({
    id: driver?.terminalId || "TRM-01",
    status: (driver?.terminalStatus || "ONLINE").toUpperCase(),
  });
  const lastHeaderFetchRef = useRef(0);

  const currentPath = location.pathname;
  const terminalStatus = terminal.status;
  const terminalId = terminal.id;

  useEffect(() => {
    if (!driver?.terminalId && !driver?.terminalStatus) return;

    setTerminal((prev) => ({
      id: driver.terminalId || prev.id,
      status: (driver.terminalStatus || prev.status).toUpperCase(),
    }));
  }, [driver?.terminalId, driver?.terminalStatus]);

  // Poll the unread count; refresh terminal status from /drivers/me occasionally.
  const loadHeaderData = useCallback(
    async ({ refreshProfile = false } = {}) => {
      if (document.visibilityState === "hidden") return;

      lastHeaderFetchRef.current = Date.now();

      const [notifRes, profileRes] = await Promise.allSettled([
        fetchDriverNotifications({ limit: 20 }),
        refreshProfile ? fetchDriverProfile() : Promise.resolve(null),
      ]);

      if (notifRes.status === "fulfilled") {
        const payload = notifRes.value;
        const list =
          payload?.data?.notifications ||
          payload?.notifications ||
          (Array.isArray(payload?.data) ? payload.data : []) ||
          (Array.isArray(payload) ? payload : []);

        const unread = list.filter((n) => !n.isRead && !n.read).length;
        setUnreadCount(unread);
      }

      if (profileRes.status === "fulfilled" && profileRes.value) {
        const profile =
          profileRes.value?.data?.profile ||
          profileRes.value?.data?.driver ||
          profileRes.value?.data?.user ||
          profileRes.value?.profile ||
          profileRes.value?.driver ||
          profileRes.value?.data ||
          profileRes.value;

        const nextId = profile?.terminalId || profile?.terminal_id;
        const nextStatus =
          profile?.terminalStatus || profile?.terminal_status;

        if (nextId || nextStatus) {
          setTerminal((prev) => ({
            id: nextId || prev.id,
            status: (nextStatus || prev.status).toUpperCase(),
          }));
        }
      }
    },
    []
  );

  useEffect(() => {
    loadHeaderData();
    const interval = setInterval(
      () => loadHeaderData({ refreshProfile: true }),
      HEADER_POLL_INTERVAL_MS
    );

    const handleVisibilityChange = () => {
      const canRefresh =
        Date.now() - lastHeaderFetchRef.current > 30 * 1000;
      if (document.visibilityState === "visible" && canRefresh) {
        loadHeaderData({ refreshProfile: true });
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
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
    { label: "Link Card", path: "/driver/link-card", icon: CreditCard },
    { label: "Notifications", path: "/driver/notifications", icon: Bell },
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
            <img src = {logo} alt = "Ctransit logo"/>
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
