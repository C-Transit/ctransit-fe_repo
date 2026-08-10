<<<<<<< HEAD
import { FaHome, FaClock, FaWifi, FaCreditCard, FaUser } from "react-icons/fa";
import styles from "./BottomNav.module.css";

// ✅ Card tab now opens CardLinkingModal via onCardPress prop
// passed from DashboardLayout — no longer a dead no-op
export default function BottomNav({
  activePage = "home",
  onTabChange,
  onCardPress,
}) {
  const tabs = [
    { id: "home", label: "Home", icon: FaHome },
    { id: "history", label: "History", icon: FaClock },
    { id: "card", label: "Card", icon: FaWifi, special: true },
    { id: "wallet", label: "Wallet", icon: FaCreditCard },
    { id: "profile", label: "Profile", icon: FaUser },
  ];

  const handleTabClick = (tabId) => {
    if (tabId === "card") {
      // Open the card linking modal instead of navigating
      if (onCardPress) onCardPress();
=======
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

  const handleTabClick = (tabId) => {
    // If it's the special card tab, don't navigate
    if (tabId === 'card') {
>>>>>>> aecc261265f85cdc95c1b57529b2d5709129a3fe
      return;
    }
    onTabChange(tabId);
  };

  return (
    <nav className={styles.nav}>
<<<<<<< HEAD
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activePage?.toLowerCase() === tab.id;
=======
      {tabs.map(tab => {
        const Icon = tab.icon;
        // ✅ FIX: Case-insensitive comparison with null check
        const isActive = activePage && activePage.toLowerCase() === tab.id.toLowerCase();
>>>>>>> aecc261265f85cdc95c1b57529b2d5709129a3fe

        return (
          <button
            key={tab.id}
            className={styles.tab}
            onClick={() => handleTabClick(tab.id)}
          >
            {isActive && <div className={styles.activeDot} />}
<<<<<<< HEAD
            <Icon
              size={22}
              color={isActive ? "var(--primary)" : "var(--text-muted)"}
            />
            <span
              className={isActive ? styles.tabLabelActive : styles.tabLabel}
            >
=======
            <Icon 
              size={22} 
              color={isActive ? 'var(--primary)' : 'var(--text-muted)'} 
            />
            <span className={isActive ? styles.tabLabelActive : styles.tabLabel}>
>>>>>>> aecc261265f85cdc95c1b57529b2d5709129a3fe
              {tab.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
<<<<<<< HEAD
}
=======
}
>>>>>>> aecc261265f85cdc95c1b57529b2d5709129a3fe
