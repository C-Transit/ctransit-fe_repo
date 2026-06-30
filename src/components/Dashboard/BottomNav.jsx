import { FaHome, FaClock, FaWifi, FaCreditCard, FaUser } from 'react-icons/fa';
import styles from './BottomNav.module.css';

export default function BottomNav({ activePage = 'home', onTabChange }) {
  const tabs = [
    { id: 'home', label: 'Home', icon: FaHome },
    { id: 'history', label: 'History', icon: FaClock },
    { id: 'card', label: 'Card', icon: FaWifi, special: true },
    { id: 'wallet', label: 'Wallet', icon: FaCreditCard },
    { id: 'profile', label: 'Profile', icon: FaUser },
  ];

  return (
    <nav className={styles.nav}>
      {tabs.map(tab => {
        const Icon = tab.icon;
        const isActive = activePage === tab.id;

        if (tab.special) {
         
        }

        return (
          <button
            key={tab.id}
            className={styles.tab}
            onClick={() => onTabChange(tab.id)}
          >
            {isActive && <div className={styles.activeDot} />}
            <Icon size={22} color={isActive ? 'var(--primary)' : 'var(--text-muted)'} />
            <span className={isActive ? styles.tabLabelActive : styles.tabLabel}>{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
