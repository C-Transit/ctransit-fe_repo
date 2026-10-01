import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AgentSidebar from './Sidebar';
import AgentHeader from './Header';
import styles from './agentLayout.module.css';

export default function AgentLayout({ children, activeTab, onTabChange, agentData }) {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('agentToken');
    localStorage.removeItem('agentData');
    localStorage.removeItem('agentSession');
    navigate('/agent/login');
  };

  const toggleCollapse = () => {
    setCollapsed(!collapsed);
  };

  return (
    <div className={styles.layout}>
      <AgentSidebar
        activeNav={activeTab}
        onNavSelect={onTabChange}
        collapsed={collapsed}
        onToggleCollapse={toggleCollapse}
        mobileOpen={sidebarOpen}
        onCloseMobile={() => setSidebarOpen(false)}
      />

      <div className={styles.mainContent}>
        <AgentHeader
          onMenuClick={() => setSidebarOpen(true)}
          agentData={agentData}
          onLogout={handleLogout}
        />
        <main className={styles.content}>
          {children}
        </main>
      </div>
    </div>
  );
}