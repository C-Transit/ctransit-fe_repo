import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Coins,
  Wallet,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  ArrowRight,
  RefreshCw,
  AlertCircle,
  Radio,
  HelpCircle,
} from "lucide-react";
import useDriverAuth from "../../hooks/useDriverAuth";
import {
  fetchDriverDashboard,
  fetchDriverRides,
  fetchDriverWithdrawals,
  verifyDriverPayment,
  fetchDriverTerminalStatus,
} from "../../api/driverApi";
import {
  generateStudentDisplayId,
  generateTransactionDisplayId,
  generateTerminalDisplayId,
} from "../../utils/identifierUtils";
import DriverLayout from "./components/DriverLayout";
import styles from "./DriverDashboard.module.css";

export default function DriverDashboard() {
  const { driver } = useDriverAuth();

  // State
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Financial Figures & Stats
  const [todayEarnings, setTodayEarnings] = useState(0);
  const [todayRidesCount, setTodayRidesCount] = useState(0);
  const [availableBalance, setAvailableBalance] = useState(0);
  const [latestWithdrawal, setLatestWithdrawal] = useState(null);
  const [recentRides, setRecentRides] = useState([]);
  const [terminalInfo, setTerminalInfo] = useState({
    id: driver?.terminalId || "TRM-01",
    status: driver?.terminalStatus || "ONLINE",
    lastSync: "Just now",
  });

  // Quick Payment Verification Widget State
  const [verifyQuery, setVerifyQuery] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [verifyResult, setVerifyResult] = useState(null);

  const loadDashboardData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // 1. Fetch dashboard / earnings / transactions
      const [dashRes, ridesRes, withRes, termRes] = await Promise.allSettled([
        fetchDriverDashboard(),
        fetchDriverRides({ page: 1, limit: 6 }),
        fetchDriverWithdrawals({ page: 1, limit: 1 }),
        fetchDriverTerminalStatus(driver?.terminalId),
      ]);

      let currentEarnings = 0;

      // Process Dashboard / Earnings
      if (dashRes.status === "fulfilled" && dashRes.value) {
        const d = dashRes.value?.data || dashRes.value;
        currentEarnings = Number(
          d.todayEarnings ?? d.earningsToday ?? d.today_earnings ?? d.balance ?? 0
        );
        const ridesCount = Number(
          d.todayRides ?? d.ridesCountToday ?? d.today_rides ?? d.totalRides ?? 0
        );
        const balance = Number(
          d.availableBalance ?? d.withdrawableBalance ?? d.wallet?.balance ?? d.balance ?? currentEarnings
        );

        setTodayEarnings(currentEarnings);
        setTodayRidesCount(ridesCount);
        setAvailableBalance(balance);

        if (d.terminalId || d.terminalStatus) {
          setTerminalInfo((prev) => ({
            ...prev,
            ...(d.terminalId ? { id: d.terminalId } : {}),
            ...(d.terminalStatus ? { status: d.terminalStatus.toUpperCase() } : {}),
          }));
        }
      }

      // Process Recent Rides
      if (ridesRes.status === "fulfilled" && ridesRes.value) {
        const rawRides =
          ridesRes.value?.data?.rides ||
          ridesRes.value?.rides ||
          ridesRes.value?.data?.transactions ||
          ridesRes.value?.transactions ||
          (Array.isArray(ridesRes.value?.data) ? ridesRes.value.data : []) ||
          (Array.isArray(ridesRes.value) ? ridesRes.value : []);

        const normalized = (Array.isArray(rawRides) ? rawRides : []).map((r) => {
          const rawStatus = (r.status || (r.type === "RIDE" ? "PAID" : "PENDING")).toUpperCase();
          const cleanStatus = ["PAID", "SUCCESS", "COMPLETED"].includes(rawStatus)
            ? "PAID"
            : ["FAILED", "REJECTED"].includes(rawStatus)
            ? "FAILED"
            : ["DISPUTE", "DISPUTED"].includes(rawStatus)
            ? "DISPUTED"
            : "PENDING";

          return {
            id: r.id || r._id || r.transactionId || r.reference || `TXN-${Date.now()}`,
            amount: Number(r.amount || 0),
            passengerId: r.studentMatric || r.matricNumber || r.studentId || r.userId || r.passenger || "Passenger",
            terminalId: r.terminal_id || r.terminalId || "TRM-01",
            timestamp: r.synced_at || r.createdAt || r.timestamp || new Date().toISOString(),
            status: cleanStatus,
          };
        });

        setRecentRides(normalized.slice(0, 6));

        // If today's earnings wasn't returned explicitly by backend, compute from today's rides
        if (currentEarnings === 0 && normalized.length > 0) {
          const todayRides = normalized.filter((r) => {
            const d = new Date(r.timestamp);
            const now = new Date();
            return (
              d.getDate() === now.getDate() &&
              d.getMonth() === now.getMonth() &&
              d.getFullYear() === now.getFullYear()
            );
          });
          const sum = todayRides.reduce((acc, curr) => acc + Math.abs(curr.amount), 0);
          if (sum > 0) {
            setTodayEarnings(sum);
            setTodayRidesCount(todayRides.length);
          }
        }
      }

      // Process Latest Withdrawal
      if (withRes.status === "fulfilled" && withRes.value) {
        const rawWith =
          withRes.value?.data?.withdrawals ||
          withRes.value?.withdrawals ||
          (Array.isArray(withRes.value?.data) ? withRes.value.data : []) ||
          (Array.isArray(withRes.value) ? withRes.value : []);

        if (Array.isArray(rawWith) && rawWith.length > 0) {
          const first = rawWith[0];
          setLatestWithdrawal({
            id: first.id || first._id || first.reference,
            amount: Number(first.amount || 0),
            date: first.createdAt || first.created_at || first.date || new Date().toISOString(),
            status: (first.status || "PENDING").toUpperCase(),
          });
        }
      }

      // Process Terminal Status
      if (termRes.status === "fulfilled" && termRes.value) {
        const t = termRes.value?.data || termRes.value?.terminal || termRes.value;
        setTerminalInfo({
          id: t.terminalId || t.id || driver?.terminalId || "TRM-01",
          status: (t.status || "ONLINE").toUpperCase(),
          lastSync: t.lastSync || "Just now",
        });
      }

      if (dashRes.status === "rejected" && ridesRes.status === "rejected") {
        setError("Unable to synchronize latest driver records. Tap refresh to retry.");
      }
    } catch (err) {
      setError("Unable to synchronize latest driver records. Tap refresh to retry.");
    } finally {
      setLoading(false);
    }
  }, [driver?.terminalId]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  // Handle Quick Payment Verification
  const handleVerify = async (e) => {
    e.preventDefault();
    if (!verifyQuery.trim()) return;

    setVerifying(true);
    setVerifyResult(null);

    try {
      const res = await verifyDriverPayment(verifyQuery.trim());
      const record = res?.data || res?.transaction || res;

      if (record && (record.status || record.amount)) {
        const status = (record.status || "PAID").toUpperCase();
        setVerifyResult({
          found: true,
          status: ["SUCCESS", "PAID", "COMPLETED"].includes(status) ? "PAID" : status,
          amount: Number(record.amount || 0),
          passenger: record.studentMatric || record.matricNumber || record.studentId || verifyQuery.trim(),
          time: record.synced_at || record.createdAt || "Just now",
          reference: record.id || verifyQuery.trim(),
        });
      } else {
        // Search in local recent rides
        const matched = recentRides.find(
          (r) =>
            String(r.passengerId).toLowerCase().includes(verifyQuery.trim().toLowerCase()) ||
            String(r.id).toLowerCase().includes(verifyQuery.trim().toLowerCase())
        );

        if (matched) {
          setVerifyResult({
            found: true,
            status: matched.status,
            amount: matched.amount,
            passenger: matched.passengerId,
            time: matched.timestamp,
            reference: matched.id,
          });
        } else {
          setVerifyResult({
            found: false,
            status: "UNKNOWN",
            message: `No payment record found for "${verifyQuery.trim()}". Ensure passenger tapped the terminal.`,
          });
        }
      }
    } catch {
      // Check local cache
      const matched = recentRides.find(
        (r) =>
          String(r.passengerId).toLowerCase().includes(verifyQuery.trim().toLowerCase()) ||
          String(r.id).toLowerCase().includes(verifyQuery.trim().toLowerCase())
      );

      if (matched) {
        setVerifyResult({
          found: true,
          status: matched.status,
          amount: matched.amount,
          passenger: matched.passengerId,
          time: matched.timestamp,
          reference: matched.id,
        });
      } else {
        setVerifyResult({
          found: false,
          status: "UNKNOWN",
          message: `Unable to verify "${verifyQuery.trim()}". No transaction matched on this shift.`,
        });
      }
    } finally {
      setVerifying(false);
    }
  };

  const formatNaira = (val) => {
    return `₦${Number(val || 0).toLocaleString("en-NG", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const formatDate = (isoStr) => {
    if (!isoStr) return "Recent";
    const d = new Date(isoStr);
    if (isNaN(d.getTime())) return isoStr;
    return d.toLocaleTimeString("en-NG", { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <DriverLayout>
      <div className={styles.dashboardContainer}>
        {/* Welcome Section */}
        <div className={styles.welcomeSection}>
          <div className={styles.greetingRow}>
            <div>
              <h1 className={styles.welcomeTitle}>
                Hello, {driver?.firstname || "Driver"}
              </h1>
              <p className={styles.welcomeSubtitle}>
                Campus Shuttle Shift Overview • {new Date().toLocaleDateString("en-NG", { weekday: "long", month: "short", day: "numeric" })}
              </p>
            </div>
            <button
              type="button"
              className={styles.refreshBtn}
              onClick={loadDashboardData}
              disabled={loading}
              title="Refresh Shift Data"
            >
              <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
              <span>{loading ? "Updating..." : "Refresh"}</span>
            </button>
          </div>
        </div>

        {error && (
          <div className={styles.errorBanner}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
            <button type="button" className={styles.retrySmallBtn} onClick={loadDashboardData}>
              Retry
            </button>
          </div>
        )}

        {/* ─── 4 CORE QUESTIONS HERO GRID ─── */}
        <div className={styles.heroGrid}>
          {/* Question 1: How much have I made today? */}
          <motion.div
            className={styles.heroCard}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className={styles.cardHeader}>
              <span className={styles.questionBadge}>Today's Earnings</span>
              <div className={styles.iconCircle} style={{ background: "#e0f2fe", color: "#0284c7" }}>
                <Coins size={18} />
              </div>
            </div>
            <div className={styles.cardTitle}>Shift Total Revenue</div>
            <div className={styles.primaryAmount}>{formatNaira(todayEarnings)}</div>
            <div className={styles.subMeta}>
              <CheckCircle2 size={14} color="#16a34a" />
              <span>{todayRidesCount} passenger ride{todayRidesCount === 1 ? "" : "s"} today</span>
            </div>
          </motion.div>

          {/* Question 3: Can I withdraw my money? */}
          <motion.div
            className={styles.heroCard}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: 0.05 }}
          >
            <div className={styles.cardHeader}>
              <span className={styles.questionBadge}>Available for Withdrawal</span>
              <div className={styles.iconCircle} style={{ background: "#dcfce7", color: "#16a34a" }}>
                <Wallet size={18} />
              </div>
            </div>
            <div className={styles.cardTitle}>Withdrawable Balance</div>
            <div className={styles.primaryAmount}>{formatNaira(availableBalance)}</div>
            <div className={styles.actionRow}>
              <Link to="/driver/withdrawals" className={styles.withdrawBtn}>
                <span>Request Payout</span>
                <ArrowRight size={14} />
              </Link>
            </div>
          </motion.div>

          {/* Question 4: Has my withdrawal been processed? */}
          <motion.div
            className={styles.heroCard}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: 0.1 }}
          >
            <div className={styles.cardHeader}>
              <span className={styles.questionBadge}>Latest Withdrawal</span>
              <div className={styles.iconCircle} style={{ background: "#fef3c7", color: "#d97706" }}>
                <Clock size={18} />
              </div>
            </div>
            <div className={styles.cardTitle}>Most Recent Payout Request</div>
            {latestWithdrawal ? (
              <>
                <div className={styles.primaryAmount}>{formatNaira(latestWithdrawal.amount)}</div>
                <div className={styles.subMeta}>
                  <span
                    className={`${styles.statusPill} ${
                      latestWithdrawal.status === "COMPLETED"
                        ? styles.statusCompleted
                        : latestWithdrawal.status === "PROCESSING"
                        ? styles.statusProcessing
                        : latestWithdrawal.status === "FAILED"
                        ? styles.statusFailed
                        : styles.statusPending
                    }`}
                  >
                    {latestWithdrawal.status}
                  </span>
                  <span style={{ marginLeft: "6px" }}>{new Date(latestWithdrawal.date).toLocaleDateString("en-NG")}</span>
                </div>
              </>
            ) : (
              <>
                <div className={styles.primaryAmount} style={{ fontSize: "1.3rem", color: "#64748b" }}>
                  No requests yet
                </div>
                <div className={styles.subMeta}>
                  <span>Ready for direct bank settlement</span>
                </div>
              </>
            )}
          </motion.div>

          {/* Assigned Terminal Status */}
          <motion.div
            className={styles.heroCard}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: 0.15 }}
          >
            <div className={styles.cardHeader}>
              <span className={styles.questionBadge}>Assigned POS</span>
              <div className={styles.iconCircle} style={{ background: "#f1f5f9", color: "#475569" }}>
                <Radio size={18} />
              </div>
            </div>
            <div className={styles.cardTitle}>Vehicle Tap Terminal</div>
            <div className={styles.primaryAmount} style={{ fontSize: "1.45rem" }}>
              {generateTerminalDisplayId(terminalInfo.id)}
            </div>
            <div className={styles.subMeta}>
              <span
                className={`${styles.statusPill} ${
                  terminalInfo.status === "ONLINE"
                    ? styles.statusCompleted
                    : terminalInfo.status === "LOCKED"
                    ? styles.statusPending
                    : styles.statusFailed
                }`}
              >
                ● {terminalInfo.status}
              </span>
              <span style={{ marginLeft: "6px" }}>{terminalInfo.lastSync}</span>
            </div>
          </motion.div>
        </div>

        {/* ─── QUESTION 2: DID THIS PASSENGER PAY? (QUICK VERIFICATION TOOL) ─── */}
        <section className={styles.verificationSection}>
          <div className={styles.sectionHeader}>
            <div>
              <h2 className={styles.sectionTitle}>
                <Search size={18} color="#0284c7" /> Instant Payment Verification
              </h2>
              <p className={styles.sectionSubtitle}>
                Verify if a passenger's tap was approved on your terminal
              </p>
            </div>
          </div>

          <form onSubmit={handleVerify} className={styles.verifyInputGroup}>
            <input
              type="text"
              placeholder="Enter Passenger Matric No., Card UID, or Transaction ID..."
              value={verifyQuery}
              onChange={(e) => setVerifyQuery(e.target.value)}
              className={styles.verifyInput}
            />
            <button
              type="submit"
              className={styles.verifyBtn}
              disabled={verifying || !verifyQuery.trim()}
            >
              <Search size={16} />
              <span>{verifying ? "Checking..." : "Verify Payment"}</span>
            </button>
          </form>

          {verifyResult && (
            <motion.div
              className={styles.verifyResultBox}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <div className={styles.resultInfo}>
                <div
                  className={styles.resultIcon}
                  style={{
                    background:
                      verifyResult.status === "PAID"
                        ? "#dcfce7"
                        : verifyResult.status === "PENDING"
                        ? "#fef3c7"
                        : verifyResult.status === "FAILED"
                        ? "#fee2e2"
                        : "#f1f5f9",
                    color:
                      verifyResult.status === "PAID"
                        ? "#15803d"
                        : verifyResult.status === "PENDING"
                        ? "#b45309"
                        : verifyResult.status === "FAILED"
                        ? "#b91c1c"
                        : "#64748b",
                  }}
                >
                  {verifyResult.status === "PAID" ? (
                    <CheckCircle2 size={24} />
                  ) : verifyResult.status === "FAILED" ? (
                    <XCircle size={24} />
                  ) : (
                    <HelpCircle size={24} />
                  )}
                </div>
                <div className={styles.resultDetails}>
                  <div className={styles.resultTitle}>
                    {verifyResult.found
                      ? `Payment Status: ${verifyResult.status}`
                      : "No Record Found"}
                  </div>
                  <div className={styles.resultMeta}>
                    {verifyResult.found ? (
                      <>
                        Passenger: <strong>{generateStudentDisplayId(verifyResult.passenger, verifyResult.passenger)}</strong> •{" "}
                        Fare: <strong>{formatNaira(verifyResult.amount)}</strong> •{" "}
                        Time: {formatDate(verifyResult.time)}
                      </>
                    ) : (
                      verifyResult.message
                    )}
                  </div>
                </div>
              </div>

              <span
                className={`${styles.statusPill} ${
                  verifyResult.status === "PAID"
                    ? styles.statusCompleted
                    : verifyResult.status === "FAILED"
                    ? styles.statusFailed
                    : styles.statusPending
                }`}
              >
                {verifyResult.status}
              </span>
            </motion.div>
          )}
        </section>

        {/* ─── RECENT RIDES FEED ─── */}
        <section className={styles.tableContainer}>
          <div className={styles.tableHeaderRow}>
            <div>
              <h2 className={styles.sectionTitle}>Recent Passenger Rides</h2>
              <p className={styles.sectionSubtitle}>
                Live tap confirmations from your assigned vehicle terminal
              </p>
            </div>
            <Link to="/driver/history" className={styles.viewAllLink}>
              <span>Full Ride Log</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          {recentRides.length > 0 ? (
            <div className={styles.ridesList}>
              {recentRides.map((ride) => (
                <div key={ride.id} className={styles.rideItem}>
                  <div className={styles.rideLeft}>
                    <div className={styles.rideIcon}>
                      <CheckCircle2 size={20} />
                    </div>
                    <div className={styles.rideMeta}>
                      <span className={styles.passengerId}>
                        {generateStudentDisplayId(ride.passengerId, ride.passengerId)}
                      </span>
                      <span className={styles.rideTime}>
                        {formatDate(ride.timestamp)} • {generateTransactionDisplayId(ride.id)}
                      </span>
                    </div>
                  </div>

                  <div className={styles.rideRight}>
                    <span className={styles.rideFare}>+{formatNaira(ride.amount)}</span>
                    <span
                      className={`${styles.statusPill} ${
                        ride.status === "PAID"
                          ? styles.statusCompleted
                          : ride.status === "FAILED"
                          ? styles.statusFailed
                          : styles.statusPending
                      }`}
                    >
                      {ride.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className={styles.emptyBox}>
              <CheckCircle2 size={36} color="#94a3b8" />
              <p>No passenger rides recorded yet on this shift.</p>
            </div>
          )}
        </section>
      </div>
    </DriverLayout>
  );
}
