import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { FaWallet, FaWifi } from 'react-icons/fa';
import { USER_API_URL } from '../../config/api';
import styles from './DashboardHome.module.css';

// ─── Status Config ────────────────────────────────────────────────────────────
const statusStyles = {
  success: styles.statusSuccess,
  failed:  styles.statusFailed,
  pending: styles.statusPending,
};

const statusLabels = {
  success: 'Success',
  failed:  'Failed',
  pending: 'Pending',
};

// ─── StatsCard Component ──────────────────────────────────────────────────────
function StatsCard({ label, value, subValue, badge, badgeColor }) {
  return (
    <div className={styles.statsCard}>
      <p className={styles.statsLabel}>{label}</p>
      <p className={styles.statsValue}>{value}</p>
      {subValue && <p className={styles.statsSubValue}>{subValue}</p>}
      {badge && (
        <span className={`${styles.badge} ${styles[badgeColor] ?? ''}`}>
          {badge}
        </span>
      )}
    </div>
  );
}

// ─── TapRow Component ──────────────────────────────────────────────────────
function TapRow({ tap }) {
  const normalizedStatus = tap.status?.toLowerCase() || 'success';

  return (
    <div className={styles.tapRow}>
      <div className={styles.tapIcon}>
        <FaWifi />
      </div>
      <div className={styles.tapInfo}>
        {/* Real Dynamic Terminal Locations from API */}
        <p className={styles.tapTerminal}>{tap.terminal || tap.location || 'Transit Terminal'}</p>
        <p className={styles.tapTime}>
          {tap.createdAt ? new Date(tap.createdAt).toLocaleDateString('en-NG') : tap.time || 'Recent'}
        </p>
      </div>
      <div className={styles.tapRight}>
        <p className={styles.tapAmount}>
          -₦{Number(tap.amount || 0).toLocaleString('en-NG')}
        </p>
        <span className={`${styles.statusBadge} ${statusStyles[normalizedStatus] ?? ''}`}>
          {statusLabels[normalizedStatus] ?? tap.status}
        </span>
      </div>
    </div>
  );
}

// ─── Main Dashboard Component ─────────────────────────────────────────────────
export default function DashboardHome({
  userData,
  recentTaps,
  onFundWallet,
  onViewAll,
}) {
  const [activeChartData, setActiveChartData] = useState([]);
  const [walletBalance, setWalletBalance] = useState(0);
  const [balanceLoading, setBalanceLoading] = useState(true);

  // ─── Auth header helper (matches WalletPage's pattern) ───────────────────
  const authHeaders = useCallback(() => {
    const token = localStorage.getItem('authToken');
    return { Authorization: `Bearer ${token}` };
  }, []);

  // ─── Fetch wallet balance directly (self-contained, like WalletPage) ─────
  const fetchWalletBalance = useCallback(async () => {
    try {
      const res = await axios.get(`${USER_API_URL}/api/wallets/balance`, {
        headers: authHeaders(),
      });
      setWalletBalance(res.data.balance || 0);
      // Note: response also includes matricNumber, but userData.matricNumber
      // (passed down from parent) already covers display needs here, so we
      // don't overwrite it — avoids a second source of truth for that field.
    } catch (err) {
      console.error('Failed to fetch wallet balance:', err);
    } finally {
      setBalanceLoading(false);
    }
  }, [authHeaders]);

  useEffect(() => {
    fetchWalletBalance();
  }, [fetchWalletBalance]);

  // Generate dynamic, real analytics points based on the actual history payload
  useEffect(() => {
    const safeTaps = Array.isArray(recentTaps) ? recentTaps : [];
    
    // Map real tap records into the chart system structure
    const dynamicPoints = safeTaps.map(tap => ({
      date: tap.createdAt ? new Date(tap.createdAt).toLocaleDateString('en-NG', { day: 'numeric', month: 'short' }) : 'Tap',
      amount: Number(tap.amount || 0)
    })).reverse(); // Reverse so older items show up on the left side

    setActiveChartData(dynamicPoints);
  }, [recentTaps]);

  const safeTaps = Array.isArray(recentTaps) ? recentTaps : [];

 
  const totalTripsThisMonth = safeTaps.length;
  const totalSpendingThisMonth = safeTaps.reduce((sum, current) => sum + Number(current.amount || 0), 0);

  return (
    <div className={styles.dashboardHome}>

      {/* ── Greeting ── */}
      <div className={styles.greeting}>
        <p className={styles.greetingTitle}>
          Hello, {userData?.firstName || 'User'}
        </p>
        <p className={styles.greetingSubtitle}>Welcome back to C-Transit</p>
      </div>

      {/* ── Wallet Card ── */}
      <div className={styles.walletCard}>
        <p className={styles.walletLabel}>Wallet Balance</p>
        <p className={styles.walletBalance}>
          {balanceLoading
            ? 'Loading...'
            : `₦${(walletBalance || 0).toLocaleString('en-NG', { minimumFractionDigits: 2 })}`}
        </p>
        <p className={styles.walletAvailable}>Available Balance</p>
        <div className={styles.walletActions}>
          <button className={styles.fundBtn} onClick={onFundWallet ?? (() => {})}>
            <FaWallet size={14} />
            Fund Wallet
          </button>
        </div>
      </div>

      {/* ── Stats Row ── */}
      <div className={styles.statsRow}>
        <StatsCard
          label="Total Trips"
          value={totalTripsThisMonth}
          subValue="Real-time Counter"
        />
        <StatsCard
          label="Matric Number"
          value={userData?.matricNumber || 'Not Set'}
          subValue="Verified Student ID"
          badge={userData?.matricNumber ? "Active Profile" : "Incomplete"}
          badgeColor={userData?.matricNumber ? "green" : "red"}
        />
        <StatsCard
          label="Monthly Spending"
          value={`₦${totalSpendingThisMonth.toLocaleString('en-NG', { minimumFractionDigits: 2 })}`}
          subValue="Calculated Total"
        />
      </div>

      {/* ── Recent Tap Activity ── */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <h3 className={styles.sectionTitle}>Recent Tap Activity</h3>
          <button className={styles.viewAll} onClick={onViewAll ?? (() => {})}>
            View All
          </button>
        </div>

        <div className={styles.tapActivityList}>
          {safeTaps.length > 0 ? (
            safeTaps.slice(0, 5).map((tap, index) => (
              <TapRow key={tap._id || tap.id || index} tap={tap} />
            ))
          ) : (
            <p className={styles.emptyState}>No recent tap activity</p>
          )}
        </div>
      </div>

      {/* ── Fare Analytics ── */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <h3 className={styles.sectionTitle}>Fare Analytics</h3>
        </div>

        <div className={styles.chartCard}>
          {activeChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={activeChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="date" fontSize={10} stroke="#9CA3AF" />
                <YAxis fontSize={10} stroke="#9CA3AF" />
                <Tooltip
                  formatter={(value) => `₦${Number(value).toLocaleString('en-NG')}`}
                  contentStyle={{ borderRadius: 8, border: '1px solid #E5E7EB', fontSize: 12 }}
                />
                <Line
                  type="monotone"
                  dataKey="amount"
                  stroke="#1A56DB"
                  strokeWidth={2.5}
                  dot={{ fill: '#1A56DB', r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className={styles.emptyState}>No recent transaction analytics data available</p>
          )}
        </div>
      </div>

    </div>
  );
}