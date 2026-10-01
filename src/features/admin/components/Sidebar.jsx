import {
  FaChartPie,
  FaUsers,
  FaUserShield,
  FaMoneyCheckAlt,
  FaBell,
  FaHeadset,
  FaFileInvoiceDollar,
  FaUserCog,
  FaChevronLeft,
  FaChevronRight,
  FaTimes,
} from 'react-icons/fa';

import styles from './Sidebar.module.css';

import logo from '../../../assets/images/new-c-transit-logo.png'

const navItems = [
  { id: 'overview', label: 'Overview', icon: FaChartPie },
  { id: 'users', label: 'Users', icon: FaUsers },
  { id: 'agents', label: 'Agents', icon: FaUserShield },
  { id: 'payments', label: 'Payments', icon: FaMoneyCheckAlt },
  { id: 'notifications', label: 'Notifications', icon: FaBell },
  { id: 'support', label: 'Support', icon: FaHeadset },
  { id: 'reports', label: 'Reports', icon: FaFileInvoiceDollar },
  { id: 'roles', label: 'Roles & Permissions', icon: FaUserCog },
];

export default function Sidebar({
  activeNav,
  onNavSelect,
  collapsed,
  onToggleCollapse,
  mobileOpen,
  onCloseMobile,
}) {
  return (
    <>
      {mobileOpen && <div className={styles.mobileBackdrop} onClick={onCloseMobile} aria-hidden="true" />}

      <aside
        className={`${styles.sidebar} ${collapsed ? styles.collapsed : ''} ${mobileOpen ? styles.mobileOpen : ''}`.trim()}
      >
        <div className={styles.logoSection}>
          <div className={styles.logoBadge}>
            <img src={logo} alt="c-transit logo" className={styles.logoImage}/>
          </div>
          {!collapsed && <h1 className={styles.logoText}>C-Transit Admin</h1>}
          <button type="button" className={styles.mobileCloseBtn} onClick={onCloseMobile} aria-label="Close sidebar">
            <FaTimes />
          </button>
        </div>

        <nav className={styles.navList}>
          {navItems.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              className={`${styles.navItem} ${activeNav === id ? styles.active : ''}`.trim()}
              onClick={() => onNavSelect(id)}
            >
              <Icon />
              {!collapsed && <span>{label}</span>}
            </button>
          ))}
        </nav>

        <button type="button" className={styles.collapseBtn} onClick={onToggleCollapse} aria-label="Toggle sidebar">
          {collapsed ? <FaChevronRight /> : <FaChevronLeft />}
          {!collapsed && <span>Collapse</span>}
        </button>
      </aside>
    </>
  );
}
