import { FaChartPie, FaUserShield, FaUsers, FaMoneyCheckAlt, FaBell, FaUserCog, FaChevronLeft, FaChevronRight, FaTimes, FaIdCard, FaCar } from 'react-icons/fa';
import { motion } from 'framer-motion';
import styles from '../../styles/agent/AgentSidebar.module.css';

const navItems = [
  { id: 'overview', label: 'Overview', icon: FaChartPie },
  { id: 'kyc', label: 'KYC Management', icon: FaUserShield },
  { id: 'drivers', label: 'Driver Registration', icon: FaCar },
  { id: 'link-card', label: 'Link Card', icon: FaIdCard },
  { id: 'users', label: 'Users', icon: FaUsers, comingSoon: true },
  { id: 'transactions', label: 'Transactions', icon: FaMoneyCheckAlt, comingSoon: true },
  { id: 'notifications', label: 'Notifications', icon: FaBell, comingSoon: true },
  { id: 'settings', label: 'Settings', icon: FaUserCog, comingSoon: true },
];

export default function AgentSidebar({
  activeNav,
  onNavSelect,
  collapsed,
  onToggleCollapse,
  mobileOpen,
  onCloseMobile,
}) {
  return (
    <>
      {mobileOpen && <div className={styles.mobileBackdrop} onClick={onCloseMobile} />}

      <motion.aside
        className={`${styles.sidebar} ${collapsed ? styles.collapsed : ''} ${mobileOpen ? styles.mobileOpen : ''}`}
        initial={false}
        animate={{ x: mobileOpen ? 0 : undefined }}
        transition={{ duration: 0.24, ease: 'easeOut' }}
      >
        <div className={styles.logoSection}>
          <div className={styles.logoBadge}>CT</div>
          {!collapsed && <h1 className={styles.logoText}>C-Transit Agents</h1>}
          <button className={styles.mobileCloseBtn} onClick={onCloseMobile}>
            <FaTimes />
          </button>
        </div>

        <nav className={styles.navList}>
          {navItems.map(({ id, label, icon: Icon, comingSoon }) => (
            <button
              key={id}
              className={`${styles.navItem} ${activeNav === id ? styles.active : ''}`}
              onClick={() => {
                if (!comingSoon) {
                  onNavSelect(id);
                  if (mobileOpen) onCloseMobile();
                }
              }}
            >
              <Icon />
              {!collapsed && (
                <>
                  <span>{label}</span>
                  {comingSoon && <span className={styles.comingSoonBadge}>Soon</span>}
                </>
              )}
            </button>
          ))}
        </nav>

        <button className={styles.collapseBtn} onClick={onToggleCollapse}>
          {collapsed ? <FaChevronRight /> : <FaChevronLeft />}
          {!collapsed && <span>Collapse</span>}
        </button>
      </motion.aside>
    </>
  );
}