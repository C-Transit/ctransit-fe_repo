import { useContext, useState } from 'react';
import { AuthContext } from '../../../context/AuthContext';
import {
  FaTimes,
  FaHome,
  FaWallet,
  FaHistory,
  FaBell,
  FaUser,
  FaCog,
  FaQuestionCircle,
  FaSignOutAlt
} from 'react-icons/fa';
import styles from './SidebarDrawer.module.css';

export default function SidebarDrawer({
  isOpen,
  onClose,
  activePage,
  onNavigate,
  UserData
}) {
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);
  const { logout } = useContext(AuthContext);

  const firstName = UserData?.firstName || UserData?.firstname || '';
  const lastName = UserData?.lastName || UserData?.lastname || '';
  const displayName = [firstName, lastName].filter(Boolean).join(' ') || UserData?.fullname || 'User';
  const userInitials = String(displayName)
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(n => n.charAt(0).toUpperCase())
    .join('') || 'U';

  const navItems = [
    { id: 'home', label: 'Dashboard', icon: FaHome },
    { id: 'wallet', label: 'Wallet', icon: FaWallet },
    { id: 'history', label: 'Tap History', icon: FaHistory },
    { id: 'notifications', label: 'Notifications', icon: FaBell },
    { id: 'profile', label: 'Profile', icon: FaUser },
    { id: 'settings', label: 'Settings', icon: FaCog },
    { id: 'help', label: 'Help & Support', icon: FaQuestionCircle },
  ];

  const handleLogout = () => {
    setIsLogoutDialogOpen(true);
  };

  const confirmLogout = () => {
    setIsLogoutDialogOpen(false);

    logout();
    onClose();
  };

  return (
    <>
      {isOpen && ( <div className={styles.overlay} onClick={onClose} /> )}
      <aside className={`${styles.drawer} ${isOpen ? styles.drawerOpen : ''}`}>
        <button
          className={styles.closeBtn}
          onClick={onClose}
          aria-label="Close sidebar"
        >
          <FaTimes />
        </button>

        <div className={styles.userSection}>
          <div className={styles.avatar}>{userInitials}</div>
          <p className={styles.userName}>{displayName}</p>
          <p className={styles.userEmail}>
            {UserData?.email || 'user@ctransit.com'}
          </p>
          <span className={styles.roleBadge}>Passenger</span>
        </div>

        <nav className={styles.navSection}>
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activePage && activePage.toLowerCase() === item.id.toLowerCase();

            return (
              <button
                key={item.id}
                className={`${styles.navItem} ${
                  isActive ? styles.navItemActive : ''
                }`}
                onClick={() => {
                  onNavigate(item.id);
                  onClose();
                }}
              >
                <Icon size={20} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className={styles.logoutSection}>
          <button className={styles.logoutBtn} onClick={handleLogout}>
            <FaSignOutAlt size={20} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {isLogoutDialogOpen && (
        <div
          className={styles.dialogOverlay}
          role="presentation"
          onClick={() => setIsLogoutDialogOpen(false)}
        >
          <div
            className={styles.dialog}
            role="dialog"
            aria-modal="true"
            aria-labelledby="logout-dialog-title"
            aria-describedby="logout-dialog-description"
            onClick={(event) => event.stopPropagation()}
          >
            <h2 id="logout-dialog-title">Log out</h2>
            <p id="logout-dialog-description">
              Are you sure you want to log out of your account?
            </p>
            <div className={styles.dialogActions}>
              <button
                type="button"
                className={styles.cancelBtn}
                onClick={() => setIsLogoutDialogOpen(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className={styles.confirmLogoutBtn}
                onClick={confirmLogout}
              >
                Log out
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}