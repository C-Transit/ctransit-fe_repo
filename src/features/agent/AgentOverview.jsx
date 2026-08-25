import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaUsers, FaClock, FaArrowRight, FaCar, FaBroadcastTower, FaClipboardList, FaIdCard } from 'react-icons/fa';
import { fetchPendingKYC, fetchDrivers, fetchTerminals, fetchAgentUsers } from '../../api/agentApi';
import styles from './AgentOverview.module.css';

export default function AgentOverview({ agentData }) {
  const [stats, setStats] = useState({
    totalUsers: 0,
    pendingKYC: 0,
    totalDrivers: 0,
    totalTerminals: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const loadOverviewData = async () => {
      setLoading(true);
      try {
        const [kycRes, driversRes, terminalsRes, usersRes] = await Promise.allSettled([
          fetchPendingKYC(),
          fetchDrivers(),
          fetchTerminals(),
          fetchAgentUsers({ page: 1, limit: 1 }),
        ]);

        if (isMounted) {
          const kycQueue = kycRes.status === 'fulfilled' ? (kycRes.value?.queue || kycRes.value?.data || []) : [];
          const driversList = driversRes.status === 'fulfilled' ? (driversRes.value?.drivers || driversRes.value?.data || []) : [];
          const terminalsList = terminalsRes.status === 'fulfilled' ? (terminalsRes.value?.terminals || terminalsRes.value?.data || []) : [];
          const usersTotal = usersRes.status === 'fulfilled' ? (usersRes.value?.total || (Array.isArray(usersRes.value?.students) ? usersRes.value.students.length : 0)) : 0;

          setStats({
            totalUsers: Number(usersTotal || 0),
            pendingKYC: Array.isArray(kycQueue) ? kycQueue.length : 0,
            totalDrivers: Array.isArray(driversList) ? driversList.length : 0,
            totalTerminals: Array.isArray(terminalsList) ? terminalsList.length : 0,
          });
        }
      } catch (err) {
        console.warn('Agent overview error:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadOverviewData();
    return () => {
      isMounted = false;
    };
  }, []);

  const statCards = [
    {
      id: 'pendingKYC',
      label: 'Pending KYC',
      value: stats.pendingKYC,
      icon: FaClock,
      color: '#d97706',
      bg: '#fef3c7',
    },
    {
      id: 'totalDrivers',
      label: 'Registered Drivers',
      value: stats.totalDrivers,
      icon: FaCar,
      color: '#16a34a',
      bg: '#dcfce7',
    },
    {
      id: 'totalTerminals',
      label: 'Active Terminals',
      value: stats.totalTerminals,
      icon: FaBroadcastTower,
      color: '#3b82f6',
      bg: '#dbeafe',
    },
    {
      id: 'totalUsers',
      label: 'Registered Students',
      value: stats.totalUsers,
      icon: FaUsers,
      color: '#8b5cf6',
      bg: '#ede9fe',
    },
  ];

  const quickActions = [
    { label: 'Review Pending KYC', tab: 'kyc', icon: FaClipboardList },
    { label: 'Register New Driver', tab: 'drivers', icon: FaCar },
    { label: 'Link Student Transit Card', tab: 'link-card', icon: FaIdCard },
    { label: 'Student Directory & Records', tab: 'users', icon: FaUsers },
  ];

  return (
    <div className={styles.overview}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.pageTitle}>Welcome back, {agentData?.firstname || agentData?.name || 'Agent'}</h1>
          <p className={styles.pageSubtitle}>Real-time field operations summary and queue status</p>
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
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <button
                key={action.tab}
                className={styles.actionCard}
                onClick={() => {
                  const tabChangeEvent = new CustomEvent('tabChange', { detail: { tab: action.tab } });
                  document.dispatchEvent(tabChangeEvent);
                }}
              >
                <span className={styles.actionIcon}><Icon /></span>
                <span className={styles.actionLabel}>{action.label}</span>
                <FaArrowRight className={styles.actionArrow} />
              </button>
            );
          })}
        </div>
      </div>

      <div className={styles.recentActivity}>
        <h2 className={styles.sectionTitle}>Agent Operational Status</h2>
        <div className={styles.activityList}>
          <div className={styles.activityItem}>
            <span className={styles.activityDot} style={{ background: '#fcd34d' }} />
            <div className={styles.activityContent}>
              <p className={styles.activityText}>KYC Verification Queue: {stats.pendingKYC} pending review</p>
              <span className={styles.activityTime}>Live Status</span>
            </div>
          </div>
          <div className={styles.activityItem}>
            <span className={styles.activityDot} style={{ background: '#34d399' }} />
            <div className={styles.activityContent}>
              <p className={styles.activityText}>Driver Fleet: {stats.totalDrivers} registered drivers ready for dispatch</p>
              <span className={styles.activityTime}>Active Fleet</span>
            </div>
          </div>
          <div className={styles.activityItem}>
            <span className={styles.activityDot} style={{ background: '#60a5fa' }} />
            <div className={styles.activityContent}>
              <p className={styles.activityText}>Terminal Network: {stats.totalTerminals} terminals synced and active</p>
              <span className={styles.activityTime}>Field Units</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
