import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaUsers, FaUserCheck, FaUserTimes, FaClock, FaArrowRight } from 'react-icons/fa';
import styles from './AgentOverview.module.css';

export default function AgentOverview({ agentData }) {
  const [stats, setStats] = useState({
    totalUsers: 0,
    pendingKYC: 0,
    approvedKYC: 0,
    rejectedKYC: 0,
    totalDrivers: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setStats({
        totalUsers: 156,
        pendingKYC: 12,
        approvedKYC: 45,
        rejectedKYC: 8,
        totalDrivers: 23,
      });
      setLoading(false);
    }, 500);
  }, []);

  const statCards = [
    {
      id: 'totalUsers',
      label: 'Total Users',
      value: stats.totalUsers,
      icon: FaUsers,
      color: '#3b82f6',
      bg: '#dbeafe',
    },
    {
      id: 'pendingKYC',
      label: 'Pending KYC',
      value: stats.pendingKYC,
      icon: FaClock,
      color: '#d97706',
      bg: '#fef3c7',
    },
    {
      id: 'approvedKYC',
      label: 'Approved KYC',
      value: stats.approvedKYC,
      icon: FaUserCheck,
      color: '#16a34a',
      bg: '#dcfce7',
    },
    {
      id: 'rejectedKYC',
      label: 'Rejected KYC',
      value: stats.rejectedKYC,
      icon: FaUserTimes,
      color: '#dc2626',
      bg: '#fee2e2',
    },
  ];

  const quickActions = [
    { label: 'Review Pending KYC', tab: 'kyc', icon: '📋' },
    { label: 'Register New Driver', tab: 'drivers', icon: '🚗' },
    { label: 'Link User Card', tab: 'link-card', icon: '💳' },
  ];

  return (
    <div className={styles.overview}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.pageTitle}>Welcome back, {agentData?.name || 'Agent'}</h1>
          <p className={styles.pageSubtitle}>Here's your performance summary for today</p>
        </div>
        <div className={styles.headerDate}>
          {new Date().toLocaleDateString('en-NG', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </div>
      </div>

      <div className={styles.statsGrid}>
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.id}
              className={styles.statCard}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <div className={styles.statIconWrapper} style={{ background: stat.bg }}>
                <Icon style={{ color: stat.color, fontSize: '20px' }} />
              </div>
              <div className={styles.statInfo}>
                <p className={styles.statValue}>
                  {loading ? '...' : stat.value.toLocaleString()}
                </p>
                <p className={styles.statLabel}>{stat.label}</p>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className={styles.quickActionsSection}>
        <h2 className={styles.sectionTitle}>Quick Actions</h2>
        <div className={styles.actionGrid}>
          {quickActions.map((action) => (
            <button
              key={action.tab}
              className={styles.actionCard}
              onClick={() => {
                const tabChangeEvent = new CustomEvent('tabChange', { detail: { tab: action.tab } });
                document.dispatchEvent(tabChangeEvent);
              }}
            >
              <span className={styles.actionIcon}>{action.icon}</span>
              <span className={styles.actionLabel}>{action.label}</span>
              <FaArrowRight className={styles.actionArrow} />
            </button>
          ))}
        </div>
      </div>

      <div className={styles.recentActivity}>
        <h2 className={styles.sectionTitle}>Recent Activity</h2>
        <div className={styles.activityList}>
          <div className={styles.activityItem}>
            <span className={styles.activityDot} style={{ background: '#fcd34d' }} />
            <div className={styles.activityContent}>
              <p className={styles.activityText}>3 new KYC submissions pending review</p>
              <span className={styles.activityTime}>10 minutes ago</span>
            </div>
          </div>
          <div className={styles.activityItem}>
            <span className={styles.activityDot} style={{ background: '#34d399' }} />
            <div className={styles.activityContent}>
              <p className={styles.activityText}>KYC approved for John Doe</p>
              <span className={styles.activityTime}>1 hour ago</span>
            </div>
          </div>
          <div className={styles.activityItem}>
            <span className={styles.activityDot} style={{ background: '#f87171' }} />
            <div className={styles.activityContent}>
              <p className={styles.activityText}>KYC rejected for Jane Smith</p>
              <span className={styles.activityTime}>3 hours ago</span>
            </div>
          </div>
          <div className={styles.activityItem}>
            <span className={styles.activityDot} style={{ background: '#60a5fa' }} />
            <div className={styles.activityContent}>
              <p className={styles.activityText}>New driver registered: Michael Okafor</p>
              <span className={styles.activityTime}>5 hours ago</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}