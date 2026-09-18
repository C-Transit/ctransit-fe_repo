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
<<<<<<< HEAD
    { id: 'home', label: 'Home', icon: FaHome },
    { id: 'history', label: 'History', icon: FaClock },
  
    { id: 'wallet', label: 'Wallet', icon: FaCreditCard },
    { id: 'profile', label: 'Profile', icon: FaUser },
=======
    { id: "home", label: "Home", icon: FaHome },
    { id: "history", label: "History", icon: FaClock },
    { id: "card", label: "Card", icon: FaWifi, special: true },
    { id: "wallet", label: "Wallet", icon: FaCreditCard },
    { id: "profile", label: "Profile", icon: FaUser },
>>>>>>> d321500ae8dd39d8350efcece51626e221c11140
  ];

  const handleTabClick = (tabId) => {
    if (tabId === "card") {
      // Open the card linking modal instead of navigating
      if (onCardPress) onCardPress();
      return;
    }
    onTabChange(tabId);
  };

  return (
    <nav className={styles.nav}>
      {tabs.map((tab) => {
        const Icon = tab.icon;
<<<<<<< HEAD
        const isActive = activePage && activePage.toLowerCase() === tab.id.toLowerCase();
=======
        const isActive = activePage?.toLowerCase() === tab.id;
>>>>>>> d321500ae8dd39d8350efcece51626e221c11140

        return (
          <button
            key={tab.id}
            className={styles.tab}
            onClick={() => handleTabClick(tab.id)}
          >
            {isActive && <div className={styles.activeDot} />}
            <Icon
              size={22}
              color={isActive ? "var(--primary)" : "var(--text-muted)"}
            />
            <span
              className={isActive ? styles.tabLabelActive : styles.tabLabel}
            >
              {tab.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
