import { FaBell, FaMoon, FaSearch, FaSun, FaUserCircle, FaBars } from 'react-icons/fa';

import { motion } from 'framer-motion';

import styles from './Navbar.module.css';

export default function Navbar({
  searchValue,
  onSearchChange,
  darkMode,
  onToggleDarkMode,
  notificationCount,
  adminName,
  onToggleProfileMenu,
  onToggleMobileSidebar,
}) {
  return (
    <header className={styles.navbar}>
      <button className={styles.hamburgerBtn} onClick={onToggleMobileSidebar} aria-label="Open menu">
        <FaBars />
      </button>

      <div className={styles.searchWrap}>
        <FaSearch className={styles.searchIcon} />
        <input
          type="text"
          value={searchValue}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Search users, payments, reports..."
        />
      </div>

      <div className={styles.actions}>
        <button className={styles.iconBtn} onClick={onToggleDarkMode} aria-label="Toggle dark mode">
          {darkMode ? <FaSun /> : <FaMoon />}
        </button>

        <button className={styles.iconBtn} aria-label="Open notifications">
          <FaBell />
          {notificationCount > 0 && (
            <motion.span
              className={styles.badge}
              initial={{ scale: 0.7 }}
              animate={{ scale: [0.8, 1.05, 1] }}
              transition={{ duration: 0.4 }}
            >
              {notificationCount}
            </motion.span>
          )}
        </button>

        <button className={styles.profileBtn} onClick={onToggleProfileMenu}>
          <FaUserCircle />
          <span>{adminName}</span>
        </button>
      </div>
    </header>
  );
}
