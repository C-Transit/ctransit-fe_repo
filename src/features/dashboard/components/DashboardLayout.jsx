import { useState } from "react";
import SidebarDrawer from "./SidebarDrawer";
import HeaderBar from "./HeaderBar";
import BottomNav from "./BottomNav";
import CardLinkingModal from "../../../components/common/CardLinkingModal";
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

  return (
    <div className={styles.shell}>
      {/* Sidebar Drawer */}
      <SidebarDrawer
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        activePage={activePage} // ← Pass activePage correctly
        onNavigate={(page) => {
          onNavigate(page);
          setSidebarOpen(false);
        }}
        UserData={UserData}
      />

      {/* Dark Overlay Behind Sidebar */}
      {sidebarOpen && (
        <div className={styles.overlay} onClick={() => setSidebarOpen(false)} />
      )}

      {/* Fixed Top Header */}
      <HeaderBar
        onMenuClick={() => setSidebarOpen(true)}
        onSettingsClick={() => onNavigate("settings")}
        onNotificationsClick={() => onNavigate("notifications")}
        unreadCount={1}
      />

      {/* Scrollable Page Content */}
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
