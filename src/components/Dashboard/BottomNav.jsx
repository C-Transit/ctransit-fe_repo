import { FaHome, FaClock, FaWifi, FaCreditCard, FaUser } from 'react-icons/fa';
import styles from './BottomNav.module.css';

export default function BottomNav({ activePage = 'home', onTabChange }) {
  const tabs = [
    { id: 'home', label: 'Home', icon: FaHome },
    { id: 'history', label: 'History', icon: FaClock },
  
    { id: 'wallet', label: 'Wallet', icon: FaCreditCard },
    { id: 'profile', label: 'Profile', icon: FaUser },
  ];

  const handleTabClick = (tabId) => {
    // If it's the special card tab, don't navigate
    if (tabId === 'card') {
      return;
    }
    onTabChange(tabId);
  };

  return (
    <nav className={styles.nav}>
      {tabs.map(tab => {
        const Icon = tab.icon;
        const isActive = activePage && activePage.toLowerCase() === tab.id.toLowerCase();

        return (
          <button
            key={tab.id}
            className={styles.tab}
            onClick={() => handleTabClick(tab.id)}
          >
            {isActive && <div className={styles.activeDot} />}
            <Icon 
              size={22} 
              color={isActive ? 'var(--primary)' : 'var(--text-muted)'} 
            />
            <span className={isActive ? styles.tabLabelActive : styles.tabLabel}>
              {tab.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}