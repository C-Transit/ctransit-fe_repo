import { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
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
   
const { logout } = useContext(AuthContext);

const userInitials = (UserData?.firstName  || 'User')
.split(' ')
.slice(0, 2)
.map(n => n[0].toUpperCase())
.join('');

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
logout();
onClose();
};

return (
<>
{isOpen && ( <div className={styles.overlay} onClick={onClose} />
)}
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
      <p className={styles.userName}>{UserData?.firstName || 'User'}</p>
      <p className={styles.userEmail}>
        {UserData?.email || 'user@ctransit.com'}
      </p>
      <span className={styles.roleBadge}>Passenger</span>
    </div>

    <nav className={styles.navSection}>
      {navItems.map(item => {
        const Icon = item.icon;
        const isActive = activePage === item.id;

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
</>

);
}
