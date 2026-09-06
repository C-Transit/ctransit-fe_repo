import { FaBars, FaBell, FaSignOutAlt } from 'react-icons/fa';
import styles from './Header.module.css';

export default function AgentHeader({ onMenuClick, agentData, onLogout }) {
  return (
    <header className={styles.header}>
      <button className={styles.menuBtn} onClick={onMenuClick}>
        <FaBars size={20} />
      </button>

      <div className={styles.headerBrand}>
        <span className={styles.brandText}>C-Transit Agents</span>
      </div>

      <div className={styles.headerRight}>
        <button className={styles.notificationBtn}>
          <FaBell size={18} />
          <span className={styles.notificationDot} />
        </button>
        
        <div className={styles.userMenu}>
          <span className={styles.userName}>{agentData?.name || 'Agent'}</span>
          <button className={styles.logoutBtn} onClick={onLogout}>
            <FaSignOutAlt size={16} />
          </button>
        </div>
      </div>
    </header>
  );
}