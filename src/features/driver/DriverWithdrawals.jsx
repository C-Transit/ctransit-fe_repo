import { useState, useEffect, useCallback } from "react";
import {
  Wallet,
  Building2,
  AlertCircle,
  CheckCircle2,
  Clock,
  RefreshCw,
  Info,
  ShieldCheck,
} from "lucide-react";
import useDriverAuth from "../../hooks/useDriverAuth";
import {
  fetchDriverWithdrawals,
  requestDriverWithdrawal,
  fetchDriverDashboard,
} from "../../api/driverApi";
import DriverLayout from "./components/DriverLayout";
import styles from "./DriverWithdrawals.module.css";

export default function DriverWithdrawals() {
  const { driver } = useDriverAuth();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState("");

  const [availableBalance, setAvailableBalance] = useState(0);
  const [withdrawals, setWithdrawals] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [amount, setAmount] = useState("");
  const [remarks, setRemarks] = useState("");
  const [customBankName, setCustomBankName] = useState(driver?.bankName || "");
  const [customAccountNumber, setCustomAccountNumber] = useState(driver?.accountNumber || "");

  const minWithdrawal = 1000;

  // Driver Settlement Bank Details
  const bankDetails = {
    bankName: driver?.bankName || customBankName || "Pending Configuration",
    accountNumber: driver?.accountNumber
      ? `••••${driver.accountNumber.slice(-4)}`
      : customAccountNumber
      ? `••••${customAccountNumber.slice(-4)}`
      : "Not on file",
    accountName: `${driver?.firstname || "Driver"} ${driver?.lastname || ""}`.trim().toUpperCase() || "AUTHORIZED DRIVER",
  };

  const loadWithdrawalData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [dashRes, withRes] = await Promise.allSettled([
        fetchDriverDashboard(),
        fetchDriverWithdrawals({ page: 1, limit: 30 }),
      ]);

      if (dashRes.status === "fulfilled" && dashRes.value) {
        const d = dashRes.value?.data || dashRes.value;
        const bal = Number(
          d.availableBalance ?? d.withdrawableBalance ?? d.wallet?.balance ?? d.balance ?? d.todayEarnings ?? 0
        );
        setAvailableBalance(bal);
      }

      if (withRes.status === "fulfilled" && withRes.value) {
        const rawWith =
          withRes.value?.data?.withdrawals ||
          withRes.value?.withdrawals ||
          (Array.isArray(withRes.value?.data) ? withRes.value.data : []) ||
          (Array.isArray(withRes.value) ? withRes.value : []);

        const normalized = (Array.isArray(rawWith) ? rawWith : []).map((w) => ({
          id: w.id || w._id || w.reference || `WTH-${Date.now()}`,
          amount: Number(w.amount || 0),
          status: (w.status || "PENDING").toUpperCase(),
          date: w.createdAt || w.created_at || w.date || new Date().toISOString(),
          reference: w.reference || w.txnRef || w.id || "N/A",
          remarks: w.remarks || "Direct driver settlement",
        }));

        setWithdrawals(normalized);
      }
    } catch {
      setError("Unable to load withdrawal records from server.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadWithdrawalData();
  }, [loadWithdrawalData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg("");

    const numAmount = Number(amount);
    if (!numAmount || isNaN(numAmount)) {
      setError("Please enter a valid withdrawal amount.");
      return;
    }

    if (numAmount < minWithdrawal) {
      setError(`Minimum withdrawal amount is ₦${minWithdrawal.toLocaleString("en-NG")}.`);
      return;
    }

    if (numAmount > availableBalance) {
      setError(`Requested amount exceeds your available balance of ₦${availableBalance.toLocaleString("en-NG")}.`);
      return;
    }

    const targetBankName = (driver?.bankName || customBankName || "").trim();
    const targetAccountNumber = (driver?.accountNumber || customAccountNumber || "").trim();

    if (!targetBankName || !targetAccountNumber) {
      setError("Please specify your settlement bank name and 10-digit account number.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await requestDriverWithdrawal({
        amount: numAmount,
        bankName: targetBankName,
        accountNumber: targetAccountNumber,
        accountName: bankDetails.accountName,
        remarks: remarks.trim() || undefined,
      });

      if (res?.success || res?.status === "success" || res?.data) {
        setSuccessMsg(`Withdrawal request of ₦${numAmount.toLocaleString("en-NG")} submitted successfully!`);
        setAmount("");
        setRemarks("");
        loadWithdrawalData();
      } else {
        throw new Error(res?.message || "Withdrawal request failed.");
      }
    } catch (err) {
      if (err.response?.status === 404 || err.response?.status === 501) {
        setError("Settlement service is not yet connected on the backend server.");
      } else {
        setError(
          err.response?.data?.message ||
          err.message ||
          "Unable to submit withdrawal request. Please verify connection."
        );
      }
    } finally {
      setSubmitting(false);
    }
  };

  const formatNaira = (val) => {
    return `₦${Number(val || 0).toLocaleString("en-NG", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const formatDate = (isoStr) => {
    if (!isoStr) return "N/A";
    const d = new Date(isoStr);
    if (isNaN(d.getTime())) return isoStr;
    return d.toLocaleString("en-NG", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <DriverLayout>
      <div className={styles.pageContainer}>
        {/* Header */}
        <div className={styles.pageHeader}>
          <h1 className={styles.title}>Withdrawal & Settlement</h1>
          <p className={styles.subtitle}>
            Transfer your verified fare earnings directly to your registered bank account
          </p>
        </div>

        {error && (
          <div style={{ padding: "0.85rem 1.25rem", background: "#fee2e2", border: "1px solid #fca5a5", borderRadius: "10px", color: "#b91c1c", display: "flex", alignItems: "center", gap: "8px" }}>
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div style={{ padding: "0.85rem 1.25rem", background: "#dcfce7", border: "1px solid #86efac", borderRadius: "10px", color: "#15803d", display: "flex", alignItems: "center", gap: "8px" }}>
            <CheckCircle2 size={18} />
            <span>{successMsg}</span>
          </div>
        )}

        {/* 2-Column Grid: Form & Settlement Account */}
        <div className={styles.grid}>
          {/* Left Column: Balance & Request Form */}
          <div className={styles.card}>
            <div className={styles.balanceBanner}>
              <span className={styles.balanceLabel}>Available Withdrawable Balance</span>
              <div className={styles.balanceValue}>{formatNaira(availableBalance)}</div>
              <span className={styles.balanceSub}>
                • Minimum payout threshold: ₦{minWithdrawal.toLocaleString("en-NG")} • Automatic daily settlement available
              </span>
            </div>

            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Withdrawal Amount (₦)</label>
                <div className={styles.inputWrapper}>
                  <span className={styles.currencyPrefix}>₦</span>
                  <input
                    type="number"
                    min={minWithdrawal}
                    max={availableBalance || 1000000}
                    step="100"
                    placeholder="Enter amount (e.g. 5000)"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className={styles.input}
                    required
                  />
                </div>
              </div>

              {/* Preset Chips */}
              <div className={styles.presetChips}>
                {[1000, 5000, 10000].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    className={styles.chip}
                    onClick={() => setAmount(String(preset))}
                    disabled={preset > availableBalance}
                  >
                    ₦{preset.toLocaleString("en-NG")}
                  </button>
                ))}
                {availableBalance >= minWithdrawal && (
                  <button
                    type="button"
                    className={styles.chip}
                    style={{ background: "#e0f2fe", color: "#0369a1", borderColor: "#7dd3fc" }}
                    onClick={() => setAmount(String(Math.floor(availableBalance)))}
                  >
                    Max (₦{Math.floor(availableBalance).toLocaleString("en-NG")})
                  </button>
                )}
              </div>

              {(!driver?.bankName || !driver?.accountNumber) && (
                <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem", padding: "0.85rem", background: "#f8fafc", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Settlement Commercial Bank</label>
                    <input
                      type="text"
                      placeholder="e.g. First Bank, Access Bank, GTBank"
                      value={customBankName}
                      onChange={(e) => setCustomBankName(e.target.value)}
                      style={{
                        padding: "0.65rem 0.85rem",
                        borderRadius: "8px",
                        border: "1px solid #cbd5e1",
                        fontSize: "0.88rem",
                      }}
                      required
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>10-Digit NUBAN Account Number</label>
                    <input
                      type="text"
                      maxLength={10}
                      placeholder="e.g. 0123456789"
                      value={customAccountNumber}
                      onChange={(e) => setCustomAccountNumber(e.target.value.replace(/\D/g, ""))}
                      style={{
                        padding: "0.65rem 0.85rem",
                        borderRadius: "8px",
                        border: "1px solid #cbd5e1",
                        fontSize: "0.88rem",
                      }}
                      required
                    />
                  </div>
                </div>
              )}

              <div className={styles.formGroup}>
                <label className={styles.label}>Optional Settlement Remarks</label>
                <input
                  type="text"
                  placeholder="e.g. Shift settlement for Monday"
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  style={{
                    padding: "0.65rem 0.85rem",
                    borderRadius: "8px",
                    border: "1px solid #cbd5e1",
                    fontSize: "0.88rem",
                  }}
                />
              </div>

              <button
                type="submit"
                className={styles.submitBtn}
                disabled={submitting || availableBalance < minWithdrawal}
              >
                <Wallet size={16} />
                <span>{submitting ? "Processing Settlement..." : "Confirm & Withdraw"}</span>
              </button>
            </form>
          </div>

          {/* Right Column: Bank Details & Rules */}
          <div className={styles.card}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontWeight: "700", color: "#0f172a", fontSize: "1.05rem" }}>
              <Building2 size={20} color="#0284c7" />
              <span>Registered Bank Account</span>
            </div>

            <div className={styles.bankInfoBox}>
              <div className={styles.bankRow}>
                <span className={styles.bankLabel}>Bank Name</span>
                <span className={styles.bankVal}>{bankDetails.bankName}</span>
              </div>
              <div className={styles.bankRow}>
                <span className={styles.bankLabel}>Account Number</span>
                <span className={styles.bankVal}>{bankDetails.accountNumber}</span>
              </div>
              <div className={styles.bankRow}>
                <span className={styles.bankLabel}>Account Name</span>
                <span className={styles.bankVal}>{bankDetails.accountName}</span>
              </div>
            </div>

            <div style={{ padding: "1rem", background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: "10px", display: "flex", gap: "0.75rem", fontSize: "0.82rem", color: "#166534" }}>
              <ShieldCheck size={20} style={{ flexShrink: 0 }} />
              <div>
                <strong>Secure Direct Payouts</strong>
                <p style={{ marginTop: "0.25rem", lineHeight: "1.4" }}>
                  Funds are settled straight to your registered commercial bank account via NIBSS instant transfer.
                </p>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "flex-start", gap: "0.5rem", fontSize: "0.78rem", color: "#64748b" }}>
              <Info size={16} style={{ flexShrink: 0, marginTop: "2px" }} />
              <span>
                To change your bank account details, contact your Campus Transport Supervisor or Field Agent.
              </span>
            </div>
          </div>
        </div>

        {/* Withdrawal History Log */}
        <section className={styles.historySection}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <h2 style={{ fontSize: "1.1rem", fontWeight: "700", color: "#0f172a" }}>
              Withdrawal History & Status
            </h2>
            <button
              type="button"
              onClick={loadWithdrawalData}
              disabled={loading}
              style={{ background: "none", border: "none", color: "#0284c7", fontSize: "0.82rem", fontWeight: "600", cursor: "pointer", display: "flex", alignItems: "center", gap: "4px" }}
            >
              <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
              <span>{loading ? "Refreshing..." : "Refresh"}</span>
            </button>
          </div>

          <div className={styles.historyList}>
            {withdrawals.length > 0 ? (
              withdrawals.map((w) => (
                <div key={w.id} className={styles.historyItem}>
                  <div className={styles.historyLeft}>
                    <span className={styles.historyAmount}>{formatNaira(w.amount)}</span>
                    <span className={styles.historyDate}>
                      {formatDate(w.date)} • Ref: {w.reference}
                    </span>
                  </div>

                  <span
                    className={`${styles.statusPill} ${
                      w.status === "COMPLETED"
                        ? styles.statusCompleted
                        : w.status === "PROCESSING"
                        ? styles.statusProcessing
                        : w.status === "FAILED"
                        ? styles.statusFailed
                        : styles.statusPending
                    }`}
                  >
                    {w.status}
                  </span>
                </div>
              ))
            ) : (
              <div style={{ textAlign: "center", padding: "2rem", color: "#64748b" }}>
                <Clock size={32} color="#cbd5e1" style={{ margin: "0 auto 0.5rem" }} />
                <p>No withdrawal requests found in your history.</p>
              </div>
            )}
          </div>
        </section>
      </div>
    </DriverLayout>
  );
}
