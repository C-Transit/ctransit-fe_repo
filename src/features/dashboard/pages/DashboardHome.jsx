import { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  FaWallet,
  FaWifi,
  FaTimes,
  FaEye,
  FaEyeSlash,
  FaSync,
} from "react-icons/fa";
import styles from "./DashboardHome.module.css";
import axios from "axios";
import { USER_API_URL } from "../../../api/api";

// ─── Status Config ────────────────────────────────────────────────────────────
const statusStyles = {
  success: styles.statusSuccess,
  failed: styles.statusFailed,
  pending: styles.statusPending,
};

const statusLabels = {
  success: "Success",
  failed: "Failed",
  pending: "Pending",
};

// ─── StatsCard Component ──────────────────────────────────────────────────────
function StatsCard({ label, value, subValue, badge, badgeColor }) {
  return (
    <div className={styles.statsCard}>
      <p className={styles.statsLabel}>{label}</p>
      <p className={styles.statsValue}>{value}</p>
      {subValue && <p className={styles.statsSubValue}>{subValue}</p>}
      {badge && (
        <span className={`${styles.badge} ${styles[badgeColor] ?? ""}`}>
          {badge}
        </span>
      )}
    </div>
  );
}

// ─── TapRow Component ──────────────────────────────────────────────────────
// TOPUP transactions (type === 'TOPUP' or terminal_id === 'SYSTEM_TERMINAL')
// are wallet credits — display as +₦ in green.
// RIDE transactions are fare deductions — display as -₦.
function TapRow({ tap }) {
  if (!tap) return null;

  const isCredit =
    tap.type === 'TOPUP' || tap.terminal_id === 'SYSTEM_TERMINAL';

  const displayAmount = isCredit
    ? `+₦${Math.abs(Number(tap.amount || 0)).toLocaleString('en-NG')}`
    : `-₦${Math.abs(Number(tap.amount || 0)).toLocaleString('en-NG')}`;

  const displayLabel = isCredit
    ? 'Wallet Top-Up'
    : tap.terminal || tap.location || `Fare — ${tap.terminal_id || 'Terminal'}`;

  const formattedDate = () => {
    if (!tap.createdAt) return tap.time || 'Recent';
    const d = new Date(tap.createdAt);
    return isNaN(d.getTime()) ? (tap.time || 'Recent') : d.toLocaleDateString('en-NG');
  };

  return (
    <div className={styles.tapRow}>
      <div className={styles.tapIcon}>
        <FaWifi />
      </div>
      <div className={styles.tapInfo}>
        <p className={styles.tapTerminal}>{displayLabel}</p>
        <p className={styles.tapTime}>{formattedDate()}</p>
      </div>
      <div className={styles.tapRight}>
        <p
          className={styles.tapAmount}
          style={{ color: isCredit ? '#16A34A' : undefined }}
        >
          {displayAmount}
        </p>
        <span
          className={`${styles.statusBadge} ${
            statusStyles[isCredit ? 'success' : (tap.status?.toLowerCase() || 'success')] ?? ''
          }`}
        >
          {isCredit ? 'Credit' : statusLabels[tap.status?.toLowerCase()] ?? 'Success'}
        </span>
      </div>
    </div>
  );
}

// ─── Main Dashboard Component ─────────────────────────────────────────────────
export default function DashboardHome({
  userData,
  recentTaps,
  onViewAll,
  onBalanceUpdate,
  // ✅ walletBalance is now passed from DashboardWrapper (read from Postgres
  // via /users/myprofile). Removed the separate /wallets/details call that
  // hit the payment provider and returned 500 for users without a virtual
  // account, causing the blank wallet area on the dashboard.
  walletBalance: walletBalanceProp = 0,
}) {
  const [activeChartData, setActiveChartData] = useState([]);
  const [walletBalance, setWalletBalance] = useState(walletBalanceProp);
  const [balanceLoading, setBalanceLoading] = useState(false);
  const [balanceError, setBalanceError] = useState(null);
  const [hideBalance, setHideBalance] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // ─── Top Up Modal States ──────────────────────────────────────────────────
  const [showTopUpModal, setShowTopUpModal] = useState(false);
  const [topUpAmount, setTopUpAmount] = useState("");
  const [topUpLoading, setTopUpLoading] = useState(false);
  const [topUpError, setTopUpError] = useState(null);
  const [topUpSuccess, setTopUpSuccess] = useState(false);

  // ─── Sync balance when prop updates (e.g. after DashboardWrapper refetch) ──
  useEffect(() => {
    setWalletBalance(walletBalanceProp);
  }, [walletBalanceProp]);

  // ─── Refresh fetches wallet balance only — not the full dashboard ───────────
  // Calls GET /api/wallets/details directly so only the balance updates.
  // The full dashboard re-fetch (fetchDashboardData in parent) is NOT triggered.
  const refreshBalance = async () => {
    setRefreshing(true);
    try {
      const token = localStorage.getItem("authToken");
      const res = await axios.get(`${USER_API_URL}/wallets/details`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Response: { success: true, data: { balance, accountNumber, bank, bankName } }
      const fresh =
        res.data?.data?.balance ?? res.data?.balance ?? walletBalance;
      setWalletBalance(fresh);
      if (onBalanceUpdate) onBalanceUpdate(fresh);
    } catch (err) {
      console.error("Balance refresh failed:", err);
    } finally {
      setRefreshing(false);
    }
  };

  // ─── Handle Top Up ──────────────────────────────────────────────────────────
  const handleTopUp = async () => {
    const amount = parseFloat(topUpAmount);
    if (!topUpAmount || isNaN(amount) || amount <= 0) {
      setTopUpError("Please enter a valid amount");
      return;
    }

    setTopUpLoading(true);
    setTopUpError(null);
    setTopUpSuccess(false);

    try {
      // Read token inline — authHeaders helper was removed in a prior fix
      const token = localStorage.getItem("authToken");
      const response = await axios.post(
        `${USER_API_URL}/payments/topup`,
        { amount },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Backend returns: { success, message, data: { reference, amount, newBalance } }
      const newBalance =
        response.data?.data?.newBalance ?? walletBalance + amount;
      setWalletBalance(newBalance);

      if (onBalanceUpdate) {
        onBalanceUpdate(newBalance);
      }

      setTopUpSuccess(true);
      setTopUpAmount("");

      setTimeout(() => {
        setShowTopUpModal(false);
        setTopUpSuccess(false);
      }, 2000);
    } catch (err) {
      console.error("Top up failed:", err);
      if (err.response?.status === 403) {
        setTopUpError(
          "Please complete your KYC verification to top up your wallet."
        );
      } else if (err.response?.status === 401) {
        setTopUpError("Session expired. Please login again.");
      } else if (err.response?.status === 404) {
        setTopUpError("Top up service is currently unavailable.");
      } else if (err.response?.status === 500) {
        setTopUpError("Server error. Please try again later.");
      } else {
        setTopUpError(
          err.response?.data?.message ||
            "Something went wrong. Please try again."
        );
      }
    } finally {
      setTopUpLoading(false);
    }
  };

  // Generate dynamic analytics points
  // Generate dynamic analytics points — exclude TOPUPs from fare chart
  useEffect(() => {
    const safeTaps = Array.isArray(recentTaps) ? recentTaps.filter(Boolean) : [];

    const dynamicPoints = safeTaps
      .filter(
        (tap) => tap && tap.type !== "TOPUP" && tap.terminal_id !== "SYSTEM_TERMINAL"
      )
      .map((tap) => {
        const d = tap.createdAt ? new Date(tap.createdAt) : null;
        const isValid = d && !isNaN(d.getTime());
        return {
          date: isValid
            ? d.toLocaleDateString("en-NG", {
                day: "numeric",
                month: "short",
              })
            : "Tap",
          amount: Number(tap.amount || 0),
        };
      })
      .reverse();

    setActiveChartData(dynamicPoints);
  }, [recentTaps]);

  const safeTaps = Array.isArray(recentTaps) ? recentTaps.filter(Boolean) : [];
  // Only count RIDE transactions as spending
  const totalSpendingThisMonth = safeTaps
    .filter(
      (tap) => tap && tap.type !== "TOPUP" && tap.terminal_id !== "SYSTEM_TERMINAL"
    )
    .reduce((sum, current) => sum + Number(current?.amount || 0), 0);

  // Only count RIDE transactions as trips
  const totalTripsThisMonth = safeTaps.filter(
    (tap) => tap && tap.type !== "TOPUP" && tap.terminal_id !== "SYSTEM_TERMINAL"
  ).length;

  return (
    <div className={styles.dashboardHome}>
      {/* ── Greeting ── */}
      <div className={styles.greeting}>
        <p className={styles.greetingTitle}>
          Hello, {userData?.firstName || userData?.firstname || "User"}
        </p>
        <p className={styles.greetingSubtitle}>Welcome back to C-Transit</p>
      </div>

      {/* ── Wallet Card ── */}
      <div className={styles.walletCard}>
        <div className={styles.walletHeader}>
          <p className={styles.walletLabel}>Wallet Balance</p>
          <div className={styles.walletIcons}>
            <button
              className={styles.iconBtn}
              onClick={() => setHideBalance(!hideBalance)}
              title={hideBalance ? "Show Balance" : "Hide Balance"}
            >
              {hideBalance ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
            </button>
            <button
              className={styles.iconBtn}
              onClick={refreshBalance}
              disabled={refreshing}
              title="Refresh Balance"
            >
              <FaSync size={16} className={refreshing ? styles.spinning : ""} />
            </button>
          </div>
        </div>

        <p className={styles.walletBalance}>
          {balanceLoading ? (
            "Loading..."
          ) : balanceError ? (
            <span style={{ color: "#EF4444", fontSize: "14px" }}>
              {balanceError}
            </span>
          ) : hideBalance ? (
            "••••••"
          ) : (
            `₦${(walletBalance || 0).toLocaleString("en-NG", {
              minimumFractionDigits: 2,
            })}`
          )}
        </p>
        <p className={styles.walletAvailable}>Available Balance</p>
        <div className={styles.walletActions}>
          <button
            className={styles.fundBtn}
            onClick={() => setShowTopUpModal(true)}
          >
            <FaWallet size={14} />
            Top Up
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
          value={userData?.matricNumber || "Not Set"}
          subValue="Verified Student ID"
          badge={userData?.matricNumber ? "Active Profile" : "Incomplete"}
          badgeColor={userData?.matricNumber ? "green" : "red"}
        />
        <StatsCard
          label="Monthly Spending"
          value={`₦${totalSpendingThisMonth.toLocaleString("en-NG", {
            minimumFractionDigits: 2,
          })}`}
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
            safeTaps
              .slice(0, 5)
              .map((tap, index) => (
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
                  formatter={(value) =>
                    `₦${Number(value).toLocaleString("en-NG")}`
                  }
                  contentStyle={{
                    borderRadius: 8,
                    border: "1px solid #E5E7EB",
                    fontSize: 12,
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="amount"
                  stroke="#1A56DB"
                  strokeWidth={2.5}
                  dot={{ fill: "#1A56DB", r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className={styles.emptyState}>
              No recent transaction analytics data available
            </p>
          )}
        </div>
      </div>

      {/* ─── TOP UP MODAL ────────────────────────────────────────────────────── */}
      {showTopUpModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContainer}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>Top Up Wallet</h3>
              <button
                onClick={() => {
                  setShowTopUpModal(false);
                  setTopUpError(null);
                  setTopUpAmount("");
                  setTopUpSuccess(false);
                }}
                className={styles.modalCloseBtn}
              >
                <FaTimes size={20} />
              </button>
            </div>

            {topUpSuccess ? (
              <div className={styles.successContent}>
                <div className={styles.successIconWrapper}>
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M20 6L9 17l-5-5"
                      stroke="#16A34A"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <h4 className={styles.successTitle}>Top Up Successful!</h4>
                <p className={styles.successAmount}>
                  ₦
                  {parseFloat(topUpAmount).toLocaleString("en-NG", {
                    minimumFractionDigits: 2,
                  })}{" "}
                  added to your wallet
                </p>
              </div>
            ) : (
              <>
                <div className={styles.modalBody}>
                  <p className={styles.modalDescription}>
                    Enter the amount you want to add to your wallet
                  </p>

                  <div className={styles.inputGroup}>
                    <span className={styles.currencySymbol}>₦</span>
                    <input
                      type="number"
                      className={styles.amountInput}
                      placeholder="0.00"
                      value={topUpAmount}
                      onChange={(e) => {
                        setTopUpAmount(e.target.value);
                        setTopUpError(null);
                      }}
                      min="0"
                      step="100"
                      autoFocus
                    />
                  </div>

                  <div className={styles.quickAmounts}>
                    <button
                      className={styles.quickAmountBtn}
                      onClick={() => {
                        setTopUpAmount("1000");
                        setTopUpError(null);
                      }}
                    >
                      ₦1,000
                    </button>
                    <button
                      className={styles.quickAmountBtn}
                      onClick={() => {
                        setTopUpAmount("2000");
                        setTopUpError(null);
                      }}
                    >
                      ₦2,000
                    </button>
                    <button
                      className={styles.quickAmountBtn}
                      onClick={() => {
                        setTopUpAmount("5000");
                        setTopUpError(null);
                      }}
                    >
                      ₦5,000
                    </button>
                  </div>

                  {topUpError && (
                    <div className={styles.errorContent}>{topUpError}</div>
                  )}
                </div>

                <div className={styles.modalFooter}>
                  <button
                    className={styles.cancelBtn}
                    onClick={() => {
                      setShowTopUpModal(false);
                      setTopUpError(null);
                      setTopUpAmount("");
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    className={styles.topUpBtn}
                    onClick={handleTopUp}
                    disabled={topUpLoading || !topUpAmount}
                  >
                    {topUpLoading ? "Processing..." : "Top Up"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
