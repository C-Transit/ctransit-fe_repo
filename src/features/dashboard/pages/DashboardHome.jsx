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
  FaCopy,
  FaCheck,
  FaExclamationTriangle,
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
  walletBalance: walletBalanceProp = 0,
}) {
  const [activeChartData, setActiveChartData] = useState([]);
  const [walletBalance, setWalletBalance] = useState(walletBalanceProp);
  const [balanceError, setBalanceError] = useState(null);
  const [hideBalance, setHideBalance] = useState(false);

  // ─── Virtual Account Funding Modal States ──────────────────────────────────
  const [showFundModal, setShowFundModal] = useState(false);
  const [virtualAccount, setVirtualAccount] = useState(null);
  const [vaLoading, setVaLoading] = useState(false);
  const [vaError, setVaError] = useState(null);
  const [showKycRequired, setShowKycRequired] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [creditedAmount, setCreditedAmount] = useState(0);
  const [copied, setCopied] = useState(false);

  // ─── Sync balance when prop updates (e.g. after DashboardWrapper refetch) ──
  useEffect(() => {
    setWalletBalance(walletBalanceProp);
  }, [walletBalanceProp]);

  // ─── Auth Header Helper ───────────────────────────────────────────────────
  const getAuthHeader = () => {
    const token = localStorage.getItem("authToken") || localStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  // ─── Keep the wallet balance current without a manual refresh button ───────
  useEffect(() => {
    let isCancelled = false;

    const syncBalance = async () => {
      try {
        const res = await axios.get(`${USER_API_URL}/wallets/details`, {
          headers: getAuthHeader(),
        });
        const fresh = res.data?.data?.balance ?? res.data?.balance;

        if (isCancelled || fresh === undefined) return;

        setWalletBalance(fresh);
        setBalanceError(null);
        if (onBalanceUpdate) onBalanceUpdate(fresh);
      } catch {
        if (!isCancelled) setBalanceError("Unable to update balance");
      }
    };

    syncBalance();
    const intervalId = setInterval(syncBalance, 30000);

    return () => {
      isCancelled = true;
      clearInterval(intervalId);
    };
  }, [onBalanceUpdate]);

  // ─── Handle Open Funding (Kora Virtual Account Flow) ───────────────────────
  const handleOpenFunding = async () => {
    setShowFundModal(true);
    setVaLoading(true);
    setVaError(null);
    setShowKycRequired(false);
    setShowSuccess(false);

    try {
      const headers = getAuthHeader();
      // Try to fetch existing virtual account first
      try {
        const fetchRes = await axios.get(`${USER_API_URL}/payments/fetch`, { headers });
        const fetchedData = fetchRes.data?.data;
        if (fetchedData?.accountNumber) {
          setVirtualAccount(fetchedData);
          setVaLoading(false);
          return;
        }
      } catch {
        // Fall back to creating one
      }

      const res = await axios.post(`${USER_API_URL}/payments/create`, {}, { headers });
      if (res.data?.data) {
        setVirtualAccount(res.data.data);
      } else {
        throw new Error("Could not generate virtual account");
      }
    } catch (err) {
      if (err.response?.status === 403) {
        setShowKycRequired(true);
      } else if (err.response?.status === 401) {
        setVaError("Session expired. Please login again.");
      } else {
        setVaError(
          err.response?.data?.message ||
            "Failed to load virtual account funding details."
        );
      }
    } finally {
      setVaLoading(false);
    }
  };

  const handleCopyAccount = () => {
    if (virtualAccount?.accountNumber) {
      navigator.clipboard.writeText(virtualAccount.accountNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // ─── Polling for incoming payment credit ───────────────────────────────────
  useEffect(() => {
    if (!showFundModal || showSuccess || showKycRequired) return;

    let pollCount = 0;
    const MAX_POLLS = 60;

    const pollBalance = async () => {
      try {
        pollCount++;
        const res = await axios.get(`${USER_API_URL}/wallets/details`, {
          headers: getAuthHeader(),
        });

        const newBalance = res.data?.data?.balance ?? res.data?.balance ?? 0;

        if (newBalance > walletBalance) {
          const diff = newBalance - walletBalance;
          setCreditedAmount(diff);
          setWalletBalance(newBalance);
          if (onBalanceUpdate) onBalanceUpdate(newBalance);
          setShowSuccess(true);
        }

        if (pollCount >= MAX_POLLS) {
          // Stop polling after 5 minutes
        }
      } catch {
        // Silent fail for polling errors
      }
    };

    const intervalId = setInterval(pollBalance, 5000);
    return () => clearInterval(intervalId);
  }, [showFundModal, showSuccess, showKycRequired, walletBalance, onBalanceUpdate]);

  useEffect(() => {
    if (!showSuccess) return;
    const timeoutId = setTimeout(() => {
      setShowFundModal(false);
      setShowSuccess(false);
      setCreditedAmount(0);
    }, 3500);
    return () => clearTimeout(timeoutId);
  }, [showSuccess]);

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
        </div>

        <button
          type="button"
          className={styles.walletBalance}
          onClick={() => setHideBalance(!hideBalance)}
          aria-label={hideBalance ? "Show wallet balance" : "Hide wallet balance"}
          title={hideBalance ? "Show balance" : "Hide balance"}
        >
          {balanceError ? (
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
        </button>
        <p className={styles.walletAvailable}>Available Balance</p>
        <div className={styles.walletActions}>
          <button
            className={styles.fundBtn}
            onClick={handleOpenFunding}
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

      {/* ─── VIRTUAL ACCOUNT FUNDING MODAL ────────────────────────────────── */}
      {showFundModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContainer}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>Fund Wallet</h3>
              <button
                onClick={() => {
                  setShowFundModal(false);
                  setVaError(null);
                  setShowKycRequired(false);
                }}
                className={styles.modalCloseBtn}
              >
                <FaTimes size={20} />
              </button>
            </div>

            {showSuccess ? (
              <div className={styles.successContent}>
                <div className={styles.successIconWrapper}>
                  <FaCheck size={28} color="#16A34A" />
                </div>
                <h4 className={styles.successTitle}>Wallet Funded!</h4>
                <p className={styles.successAmount}>
                  ₦
                  {Number(creditedAmount || 0).toLocaleString("en-NG", {
                    minimumFractionDigits: 2,
                  })}{" "}
                  added to your available balance
                </p>
              </div>
            ) : showKycRequired ? (
              <div className={styles.kycContent}>
                <div className={styles.kycIconWrapper}>
                  <FaExclamationTriangle size={28} color="#D97706" />
                </div>
                <h4 className={styles.kycTitle}>Verification Required</h4>
                <p className={styles.kycDesc}>
                  Please complete student identity verification (KYC) before activating your dedicated bank transfer funding account.
                </p>
                <button
                  className={styles.kycBtn}
                  onClick={() => {
                    setShowFundModal(false);
                  }}
                >
                  Close
                </button>
              </div>
            ) : (
              <div className={styles.modalBody}>
                <p className={styles.modalDescription}>
                  Transfer funds to this dedicated virtual account from your bank app. Your C-Transit wallet will be credited automatically.
                </p>

                {vaLoading ? (
                  <p style={{ textAlign: "center", padding: "24px 0", color: "#6B7280" }}>
                    Generating your dedicated funding account...
                  </p>
                ) : vaError ? (
                  <div className={styles.errorContent}>{vaError}</div>
                ) : virtualAccount ? (
                  <div className={styles.vaCard}>
                    <p className={styles.vaBankLabel}>Account Number</p>
                    <div className={styles.vaAccountRow}>
                      <span className={styles.vaAccountNumber}>
                        {virtualAccount.accountNumber || "—"}
                      </span>
                      <button
                        className={styles.vaCopyBtn}
                        onClick={handleCopyAccount}
                      >
                        <FaCopy size={12} />
                        {copied ? "Copied!" : "Copy"}
                      </button>
                    </div>

                    <p className={styles.vaBankLabel}>Bank Name</p>
                    <p className={styles.vaBankName}>
                      {virtualAccount.bankName || virtualAccount.bank || "Provider Bank"}
                    </p>

                    <div className={styles.vaChecking}>
                      <span className={styles.vaPulse}></span>
                      Listening for incoming transfer...
                    </div>
                  </div>
                ) : null}

                <div className={styles.modalFooter} style={{ marginTop: "16px" }}>
                  <button
                    className={styles.cancelBtn}
                    onClick={() => {
                      setShowFundModal(false);
                      setVaError(null);
                    }}
                  >
                    Done
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
