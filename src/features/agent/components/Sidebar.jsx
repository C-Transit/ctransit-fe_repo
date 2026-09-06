import {
  FaChartPie,
  FaUserShield,
  FaUsers,
  FaBroadcastTower,
  FaChevronLeft,
  FaChevronRight,
  FaTimes,
  FaIdCard,
  FaCar,
  FaUserCog,
  FaRoute,
  FaBusAlt,
  FaMoneyBillWave,
} from 'react-icons/fa';
import { motion } from 'framer-motion';
import styles from './Sidebar.module.css';

const agentNavItems = [
  { id: 'overview', label: 'Overview', icon: FaChartPie },
  { id: 'kyc', label: 'KYC Management', icon: FaUserShield },
  { id: 'drivers', label: 'Driver Registration', icon: FaCar },
  { id: 'link-card', label: 'Link Card', icon: FaIdCard },
  { id: 'users', label: 'Student Accounts', icon: FaUsers },
  { id: 'terminals', label: 'Field Terminals', icon: FaBroadcastTower },
  { id: 'settings', label: 'Agent Profile', icon: FaUserCog },
];

const driverNavItems = [
  { id: 'driver-trips', label: 'Driver Trips', icon: FaRoute, badge: 'Driver' },
  { id: 'driver-vehicle', label: 'Vehicle & Bus', icon: FaBusAlt, badge: 'Driver' },
  { id: 'driver-earnings', label: 'Driver Earnings', icon: FaMoneyBillWave, badge: 'Driver' },
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
          {!collapsed && <h1 className={styles.logoText}>Agent & Driver</h1>}
          <button className={styles.mobileCloseBtn} onClick={onCloseMobile}>
            <FaTimes />
          </button>
        </div>

        <nav className={styles.navList}>
          {!collapsed && (
            <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: '#94a3b8', padding: '12px 14px 4px', letterSpacing: '0.05em' }}>
              Agent Operations
            </div>
          )}
          {agentNavItems.map(({ id, label, icon: Icon, comingSoon }) => (
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

          {!collapsed && (
            <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: '#94a3b8', padding: '16px 14px 4px', letterSpacing: '0.05em', borderTop: '1px solid #f1f5f9', marginTop: '8px' }}>
              Driver Portal (Phase 2)
            </div>
          )}
          {driverNavItems.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              className={`${styles.navItem} ${activeNav === id ? styles.active : ''}`}
              onClick={() => {
                onNavSelect(id);
                if (mobileOpen) onCloseMobile();
              }}
            >
              <Icon />
              {!collapsed && (
                <>
                  <span>{label}</span>
                  <span className={styles.comingSoonBadge} style={{ background: '#e0f2fe', color: '#0369a1' }}>Preview</span>
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