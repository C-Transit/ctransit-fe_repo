<<<<<<< HEAD
import { useState } from "react";
import SidebarDrawer from "./SidebarDrawer";
import HeaderBar from "./HeaderBar";
import BottomNav from "./BottomNav";
import CardLinkingModal from "../CardLinkingModal";
import styles from "./DashboardLayout.module.css";

export default function DashboardLayout({
  children,
  activePage = "home", // ← Keep as activePage
  onNavigate,
  UserData,
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  // ✅ Card modal state — opened when user taps Card in BottomNav
  const [showCardModal, setShowCardModal] = useState(false);
=======
import { useState } from 'react';
import SidebarDrawer from './SidebarDrawer';
import HeaderBar from './HeaderBar';
import BottomNav from './BottomNav';
import styles from './DashboardLayout.module.css';

export default function DashboardLayout({ 
  children, 
  activePage = 'home',  // ← Keep as activePage
  onNavigate, 
  UserData 
}) {
    
  const [sidebarOpen, setSidebarOpen] = useState(false);
>>>>>>> aecc261265f85cdc95c1b57529b2d5709129a3fe

  return (
    <div className={styles.shell}>
      {/* Sidebar Drawer */}
      <SidebarDrawer
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
<<<<<<< HEAD
        activePage={activePage} // ← Pass activePage correctly
=======
        activePage={activePage}  // ← Pass activePage correctly
>>>>>>> aecc261265f85cdc95c1b57529b2d5709129a3fe
        onNavigate={(page) => {
          onNavigate(page);
          setSidebarOpen(false);
        }}
        UserData={UserData}
      />

      {/* Dark Overlay Behind Sidebar */}
      {sidebarOpen && (
<<<<<<< HEAD
        <div className={styles.overlay} onClick={() => setSidebarOpen(false)} />
=======
        <div
          className={styles.overlay}
          onClick={() => setSidebarOpen(false)}
        />
>>>>>>> aecc261265f85cdc95c1b57529b2d5709129a3fe
      )}

      {/* Fixed Top Header */}
      <HeaderBar
        onMenuClick={() => setSidebarOpen(true)}
<<<<<<< HEAD
        onSettingsClick={() => onNavigate("settings")}
        onNotificationsClick={() => onNavigate("notifications")}
=======
        onSettingsClick={() => onNavigate('settings')}
        onNotificationsClick={() => onNavigate('notifications')}
>>>>>>> aecc261265f85cdc95c1b57529b2d5709129a3fe
        unreadCount={1}
      />

      {/* Scrollable Page Content */}
<<<<<<< HEAD
      <main className={styles.main}>{children}</main>

      {/* Fixed Bottom Nav */}
      <BottomNav
        activePage={activePage}
        onTabChange={onNavigate}
        onCardPress={() => setShowCardModal(true)}
      />

      {/* Card Linking Modal — opened from Card tab in BottomNav */}
      {showCardModal && (
        <CardLinkingModal onClose={() => setShowCardModal(false)} />
      )}
    </div>
  );
}
=======
      <main className={styles.main}>
        {children}
      </main>

      {/* Fixed Bottom Nav */}
      <BottomNav activePage={activePage} onTabChange={onNavigate} />
    </div>
  );
}
>>>>>>> aecc261265f85cdc95c1b57529b2d5709129a3fe
