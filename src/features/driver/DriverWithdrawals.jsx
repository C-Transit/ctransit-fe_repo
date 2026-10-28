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
  Eye,
  EyeOff,
  Loader2,
  Pencil,
} from "lucide-react";
import useDriverAuth from "../../hooks/useDriverAuth";
import {
  fetchDriverWithdrawals,
  requestDriverWithdrawal,
  fetchDriverDashboard,
  fetchDriverBanks,
  resolveDriverBank,
  verifyDriverBank,
} from "../../api/driverApi";
import DriverLayout from "./components/DriverLayout";
import BankPicker from "./components/BankPicker";
import styles from "./DriverWithdrawals.module.css";

const MIN_WITHDRAWAL = 1000;
const FEE_RATE = 0.04;

const formatNaira = (value) =>
  `₦${Number(value || 0).toLocaleString("en-NG", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const formatDate = (isoStr) => {
  if (!isoStr) return "N/A";
  const date = new Date(isoStr);
  if (Number.isNaN(date.getTime())) return isoStr;
  return date.toLocaleString("en-NG", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const maskAccount = (value) => {
  const digits = String(value || "").replace(/\D/g, "");
  return digits.length > 4 ? `••••${digits.slice(-4)}` : digits || "—";
};

const friendlyWithdrawalFailure = (reason) => {
  const text = String(reason || "").toLowerCase();
  if (text.includes("whitelist") || text.includes("unauthorized")) {
    return "Payouts are temporarily unavailable. Your money has been returned to your wallet. Please contact support with your withdrawal reference.";
  }
  if (text.includes("insufficient")) {
    return "The payout provider could not complete this withdrawal. Your money has been returned to your wallet. Please try again later.";
  }
  return "The bank could not complete this payout. Your money has been returned to your wallet. Please try again.";
};

export default function DriverWithdrawals() {
  const { driver } = useDriverAuth();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState("");

  const [availableBalance, setAvailableBalance] = useState(0);
  const [withdrawals, setWithdrawals] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  // Withdrawal form
  const [amount, setAmount] = useState("");
  const [remarks, setRemarks] = useState("");
  const [withdrawPin, setWithdrawPin] = useState("");
  const [showWithdrawPin, setShowWithdrawPin] = useState(false);

  // Payout account form
  const [banks, setBanks] = useState([]);
  const [banksLoading, setBanksLoading] = useState(true);
  const [banksError, setBanksError] = useState("");
  const [selectedBank, setSelectedBank] = useState(null);
  const [accountNumber, setAccountNumber] = useState("");
  const [resolvedName, setResolvedName] = useState("");
  const [resolving, setResolving] = useState(false);
  const [resolveError, setResolveError] = useState("");
  const [bankError, setBankError] = useState("");
  const [bankPin, setBankPin] = useState("");
  const [showBankPin, setShowBankPin] = useState(false);
  const [savingBank, setSavingBank] = useState(false);
  const [savedBank, setSavedBank] = useState(null);
  const [editingBank, setEditingBank] = useState(false);

  const activeBank =
    savedBank ||
    (driver?.bankVerified
      ? {
          bankCode: driver.bankCode,
          bankName: driver.bankName,
          accountNumber: driver.accountNumber,
          accountName: driver.accountName,
        }
      : null);

  const verified = Boolean(
    activeBank?.accountNumber && activeBank?.accountName
  );
  const bankFormVisible = !verified || editingBank;

  const gross = Number(amount) || 0;
  const fee = Math.round(gross * FEE_RATE * 100) / 100;
  const net = Math.max(0, Math.round((gross - fee) * 100) / 100);

  // Pull the bank list once. The driver never types or sees a bank code.
  useEffect(() => {
    let cancelled = false;

    (async () => {
      setBanksLoading(true);
      setBanksError("");
      try {
        const res = await fetchDriverBanks();
        const list = res?.data || res?.banks || [];
        if (!cancelled) setBanks(Array.isArray(list) ? list : []);
      } catch (err) {
        if (!cancelled) {
          setBanksError(
            err.userMessage ||
              err.response?.data?.message ||
              err.response?.data?.error ||
              "Could not load the bank list. Check your connection and try again."
          );
        }
      } finally {
        if (!cancelled) setBanksLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  // Keep the form in sync when the profile arrives from the server.
  useEffect(() => {
    if (driver?.bankCode) {
      setSelectedBank(
        (prev) => prev || { code: driver.bankCode, name: driver.bankName || "" }
      );
    }
    if (driver?.accountNumber) {
      setAccountNumber((prev) => prev || driver.accountNumber);
    }
    if (driver?.accountName) {
      setResolvedName((prev) => prev || driver.accountName);
    }
  }, [
    driver?.bankCode,
    driver?.bankName,
    driver?.accountNumber,
    driver?.accountName,
  ]);

  // Resolve the account name automatically once bank + 10 digits are present.
  useEffect(() => {
    if (!bankFormVisible || !selectedBank?.code || accountNumber.length !== 10) {
      setResolving(false);
      setResolveError("");
      return;
    }

    let cancelled = false;
    setResolving(true);
    setResolveError("");

    const timer = setTimeout(async () => {
      try {
        const res = await resolveDriverBank({
          bankCode: selectedBank.code,
          accountNumber,
        });
        const data = res?.data || res;
        const name = data?.accountName || data?.account_name;

        if (cancelled) return;
        if (!name) throw new Error("No account name was returned.");
        setResolvedName(name);
      } catch (err) {
        if (cancelled) return;
        setResolvedName("");
        setResolveError(
          err.userMessage ||
            err.response?.data?.message ||
            err.response?.data?.error ||
            err.message ||
            "Could not check this account. Confirm the bank and number."
        );
      } finally {
        if (!cancelled) setResolving(false);
      }
    }, 500);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [bankFormVisible, selectedBank?.code, accountNumber]);

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
          d.availableBalance ??
            d.withdrawableBalance ??
            d.wallet?.balance ??
            d.balance ??
            d.todayEarnings ??
            0
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
          date:
            w.createdAt || w.created_at || w.date || new Date().toISOString(),
          reference: w.reference || w.txnRef || w.id || "N/A",
          remarks: w.remarks || "Direct driver settlement",
          failureReason: w.failureReason || w.failure_reason || "",
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

  const handleSaveBank = async (event) => {
    event.preventDefault();
    setBankError("");
    setSuccessMsg("");

    if (!selectedBank?.code) {
      setBankError("Choose your bank first.");
      return;
    }
    if (accountNumber.length !== 10) {
      setBankError("Enter the 10-digit account number.");
      return;
    }
    if (!resolvedName) {
      setBankError("Wait for the account name to appear, then try again.");
      return;
    }
    if (!/^\d{4}$/.test(bankPin)) {
      setBankError("Enter your 4-digit PIN to save this account.");
      return;
    }

    setSavingBank(true);
    try {
      const res = await verifyDriverBank({
        bankCode: selectedBank.code,
        accountNumber,
        pin: bankPin,
      });
      const data = res?.data || res;
      const bank = {
        bankCode: data?.bankCode || selectedBank.code,
        bankName: data?.bankName || selectedBank.name,
        accountNumber: data?.accountNumber || accountNumber,
        accountName: data?.accountName || resolvedName,
      };

      setSavedBank(bank);
      setEditingBank(false);
      setBankPin("");
      setSuccessMsg(
        `Payout account saved: ${bank.bankName} • ${maskAccount(
          bank.accountNumber
        )} • ${bank.accountName}`
      );
    } catch (err) {
      setBankError(
        err.userMessage ||
          err.response?.data?.message ||
          err.response?.data?.error ||
          err.message ||
          "Could not save this account. Please try again."
      );
    } finally {
      setSavingBank(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);
    setSuccessMsg("");

    const numAmount = Number(amount);
    if (!numAmount || Number.isNaN(numAmount)) {
      setError("Enter the amount you want to withdraw.");
      return;
    }
    if (numAmount < MIN_WITHDRAWAL) {
      setError(
        `Minimum withdrawal is ₦${MIN_WITHDRAWAL.toLocaleString("en-NG")}.`
      );
      return;
    }
    if (numAmount > availableBalance) {
      setError(`You can withdraw up to ${formatNaira(availableBalance)}.`);
      return;
    }
    if (!verified) {
      setError("Save your payout account before withdrawing.");
      return;
    }
    if (!/^\d{4}$/.test(withdrawPin)) {
      setError("Enter your 4-digit PIN to confirm the withdrawal.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await requestDriverWithdrawal({
        amount: numAmount,
        pin: withdrawPin,
        remarks: remarks.trim() || undefined,
      });
      const data = res?.data || res?.withdrawal || res || {};

      setWithdrawPin("");
      setAmount("");
      setRemarks("");

      if (data.status === "FAILED") {
        setError(friendlyWithdrawalFailure(data.failureReason));
      } else {
        setSuccessMsg(
          `Withdrawal sent. ${formatNaira(
            Number(data.netAmount ?? numAmount * (1 - FEE_RATE))
          )} is on its way to ${activeBank?.bankName || "your bank"}.`
        );
      }

      loadWithdrawalData();
    } catch (err) {
      setError(
        err.userMessage ||
          err.response?.data?.message ||
          err.response?.data?.error ||
          err.message ||
          "Could not submit the withdrawal. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const statusClass = (status) => {
    if (status === "SUCCESS" || status === "COMPLETED") {
      return styles.statusCompleted;
    }
    if (status === "PROCESSING") return styles.statusProcessing;
    if (status === "FAILED") return styles.statusFailed;
    if (status === "CANCELLED") return styles.statusCancelled;
    return styles.statusPending;
  };

  return (
    <DriverLayout>
      <div className={styles.pageContainer}>
        <div className={styles.pageHeader}>
          <h1 className={styles.title}>Withdraw your money</h1>
          <p className={styles.subtitle}>
            Send your fare earnings to your bank account. We charge 4% per
            withdrawal.
          </p>
        </div>

        {error && (
          <div className={styles.bannerError}>
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className={styles.bannerSuccess}>
            <CheckCircle2 size={18} />
            <span>{successMsg}</span>
          </div>
        )}

        <div className={styles.grid}>
          {/* Left: withdraw money */}
          <div className={styles.card}>
            <div className={styles.balanceBanner}>
              <span className={styles.balanceLabel}>
                Money available to withdraw
              </span>
              <div className={styles.balanceValue}>
                {formatNaira(availableBalance)}
              </div>
              <span className={styles.balanceSub}>
                Minimum ₦1,000 • 4% fee per withdrawal
              </span>
            </div>

            {!verified && (
              <div className={styles.notice}>
                <Info size={18} />
                <span>
                  Add your bank account first. You only need to do this once.
                </span>
              </div>
            )}

            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.formGroup}>
                <label className={styles.label} htmlFor="withdraw-amount">
                  How much do you want to withdraw?
                </label>
                <div className={styles.amountBox}>
                  <span className={styles.amountCurrency}>₦</span>
                  <input
                    id="withdraw-amount"
                    type="number"
                    inputMode="numeric"
                    min={MIN_WITHDRAWAL}
                    max={availableBalance || undefined}
                    step="1"
                    placeholder="0"
                    value={amount}
                    onChange={(event) => setAmount(event.target.value)}
                    className={styles.amountInput}
                    disabled={!verified}
                    required
                  />
                </div>
              </div>

              <div className={styles.amountGrid}>
                {[1000, 2000, 5000, 10000, 20000, 50000].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    className={`${styles.amountTile} ${
                      Number(amount) === preset ? styles.amountTileActive : ""
                    }`}
                    onClick={() => setAmount(String(preset))}
                    disabled={!verified || preset > availableBalance}
                  >
                    ₦{preset.toLocaleString("en-NG")}
                  </button>
                ))}
                {availableBalance >= MIN_WITHDRAWAL && (
                  <button
                    type="button"
                    className={`${styles.amountTile} ${styles.amountTileAll} ${
                      Number(amount) === Math.floor(availableBalance)
                        ? styles.amountTileActive
                        : ""
                    }`}
                    onClick={() =>
                      setAmount(String(Math.floor(availableBalance)))
                    }
                    disabled={!verified}
                  >
                    <span>All my money</span>
                    <small>
                      ₦{Math.floor(availableBalance).toLocaleString("en-NG")}
                    </small>
                  </button>
                )}
              </div>

              {gross > 0 && (
                <div className={styles.feeBox}>
                  <div className={styles.feeRow}>
                    <span>You withdraw</span>
                    <strong>{formatNaira(gross)}</strong>
                  </div>
                  <div className={styles.feeRow}>
                    <span>Service fee (4%)</span>
                    <strong>-{formatNaira(fee)}</strong>
                  </div>
                  <div className={`${styles.feeRow} ${styles.feeTotal}`}>
                    <span>You receive</span>
                    <strong>{formatNaira(net)}</strong>
                  </div>
                </div>
              )}

              <div className={styles.formGroup}>
                <label className={styles.label} htmlFor="withdraw-remarks">
                  Note (optional)
                </label>
                <input
                  id="withdraw-remarks"
                  type="text"
                  placeholder="e.g. Monday shift"
                  value={remarks}
                  onChange={(event) => setRemarks(event.target.value)}
                  className={styles.inputPlain}
                  disabled={!verified}
                />
              </div>

              {verified && (
                <div className={styles.formGroup}>
                  <label className={styles.label} htmlFor="withdraw-pin">
                    Enter your 4-digit PIN to confirm
                  </label>
                  <div className={styles.pinRow}>
                    <input
                      id="withdraw-pin"
                      type={showWithdrawPin ? "text" : "password"}
                      inputMode="numeric"
                      maxLength={4}
                      autoComplete="off"
                      placeholder="••••"
                      value={withdrawPin}
                      onChange={(event) =>
                        setWithdrawPin(
                          event.target.value.replace(/\D/g, "").slice(0, 4)
                        )
                      }
                      className={styles.pinInput}
                    />
                    <button
                      type="button"
                      className={styles.pinToggle}
                      onClick={() => setShowWithdrawPin((prev) => !prev)}
                      aria-label={
                        showWithdrawPin ? "Hide PIN" : "Show PIN"
                      }
                    >
                      {showWithdrawPin ? (
                        <EyeOff size={18} />
                      ) : (
                        <Eye size={18} />
                      )}
                    </button>
                  </div>
                  <p className={styles.fieldHint}>
                    This is the same PIN you use to log in.
                  </p>
                </div>
              )}

              <button
                type="submit"
                className={styles.submitBtn}
                disabled={
                  submitting || !verified || availableBalance < MIN_WITHDRAWAL
                }
              >
                {submitting ? (
                  <>
                    <Loader2 size={18} className={styles.spinner} />
                    <span>Sending...</span>
                  </>
                ) : (
                  <>
                    <Wallet size={18} />
                    <span>
                      Withdraw {gross > 0 ? formatNaira(net) : "money"}
                    </span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Right: payout account */}
          <div className={styles.card}>
            <div className={styles.sectionHeader}>
              <div className={styles.bankHeader}>
                <Building2 size={20} />
                <span>Your payout account</span>
              </div>
              {verified && (
                <span className={styles.verifiedBadge}>
                  <ShieldCheck size={14} />
                  Verified
                </span>
              )}
            </div>

            {verified && !editingBank ? (
              <>
                <div className={styles.accountCard}>
                  <span className={styles.accountLabel}>Bank</span>
                  <span className={styles.accountValue}>
                    {activeBank.bankName}
                  </span>
                  <span className={styles.accountLabel}>Account number</span>
                  <span className={styles.accountValue}>
                    {maskAccount(activeBank.accountNumber)}
                  </span>
                  <span className={styles.accountLabel}>Account name</span>
                  <span className={styles.accountName}>
                    {activeBank.accountName}
                  </span>
                </div>

                <button
                  type="button"
                  className={styles.changeBtn}
                  onClick={() => {
                    setEditingBank(true);
                    setBankPin("");
                    setShowBankPin(false);
                    setBankError("");
                    setResolveError("");
                    setSuccessMsg("");
                  }}
                >
                  <Pencil size={16} />
                  Change payout account
                </button>

                <div className={styles.helperBox}>
                  <ShieldCheck size={18} />
                  <span>
                    Your money is sent only to this account. To change it, we
                    ask for your PIN.
                  </span>
                </div>
              </>
            ) : (
              <form onSubmit={handleSaveBank} className={styles.form}>
                {verified && editingBank && (
                  <button
                    type="button"
                    className={styles.cancelBtn}
                    onClick={() => {
                      setEditingBank(false);
                      setBankPin("");
                      setShowBankPin(false);
                      setBankError("");
                      setResolveError("");
                    }}
                  >
                    Cancel change
                  </button>
                )}

                <div className={styles.formGroup}>
                  <label className={styles.label}>1. Choose your bank</label>
                  <BankPicker
                    banks={banks}
                    value={selectedBank?.code || ""}
                    onChange={(bank) => {
                      setSelectedBank(bank);
                      setResolvedName("");
                      setResolveError("");
                      setBankError("");
                    }}
                    loading={banksLoading}
                    error={banksError}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label} htmlFor="account-number">
                    2. Enter your 10-digit account number
                  </label>
                  <input
                    id="account-number"
                    type="text"
                    inputMode="numeric"
                    maxLength={10}
                    placeholder="0123456789"
                    value={accountNumber}
                    onChange={(event) => {
                      setAccountNumber(
                        event.target.value.replace(/\D/g, "").slice(0, 10)
                      );
                      setResolvedName("");
                      setResolveError("");
                      setBankError("");
                    }}
                    className={styles.inputPlain}
                  />
                  {accountNumber.length > 0 && accountNumber.length < 10 && (
                    <p className={styles.fieldHint}>
                      {10 - accountNumber.length} more digit
                      {10 - accountNumber.length === 1 ? "" : "s"} needed.
                    </p>
                  )}
                </div>

                {resolving && (
                  <div className={styles.resolveStatus}>
                    <Loader2 size={16} className={styles.spinner} />
                    <span>Checking the account name...</span>
                  </div>
                )}

                {!resolving && resolvedName && (
                  <div className={styles.resolveOk}>
                    <CheckCircle2 size={18} />
                    <span>
                      Account name: <strong>{resolvedName}</strong>
                    </span>
                  </div>
                )}

                {!resolving && resolveError && (
                  <div className={styles.resolveErr}>
                    <AlertCircle size={18} />
                    <span>{resolveError}</span>
                  </div>
                )}

                {resolvedName && (
                  <div className={styles.formGroup}>
                    <label className={styles.label} htmlFor="bank-pin">
                      3. Enter your 4-digit PIN to save
                    </label>
                    <div className={styles.pinRow}>
                      <input
                        id="bank-pin"
                        type={showBankPin ? "text" : "password"}
                        inputMode="numeric"
                        maxLength={4}
                        autoComplete="off"
                        placeholder="••••"
                        value={bankPin}
                        onChange={(event) =>
                          setBankPin(
                            event.target.value.replace(/\D/g, "").slice(0, 4)
                          )
                        }
                        className={styles.pinInput}
                      />
                      <button
                        type="button"
                        className={styles.pinToggle}
                        onClick={() => setShowBankPin((prev) => !prev)}
                        aria-label={showBankPin ? "Hide PIN" : "Show PIN"}
                      >
                        {showBankPin ? (
                          <EyeOff size={18} />
                        ) : (
                          <Eye size={18} />
                        )}
                      </button>
                    </div>
                    <p className={styles.fieldHint}>
                      This is the same PIN you use to log in.
                    </p>
                  </div>
                )}

                {bankError && (
                  <div className={styles.resolveErr}>
                    <AlertCircle size={18} />
                    <span>{bankError}</span>
                  </div>
                )}

                <button
                  type="submit"
                  className={styles.submitBtn}
                  disabled={
                    savingBank ||
                    !selectedBank?.code ||
                    accountNumber.length !== 10 ||
                    !resolvedName ||
                    bankPin.length !== 4
                  }
                >
                  {savingBank ? (
                    <>
                      <Loader2 size={18} className={styles.spinner} />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck size={18} />
                      <span>Save payout account</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Withdrawal history */}
        <section className={styles.historySection}>
          <div className={styles.historyHeader}>
            <h2 className={styles.sectionTitle}>Withdrawal history</h2>
            <button
              type="button"
              onClick={loadWithdrawalData}
              disabled={loading}
              className={styles.refreshBtn}
            >
              <RefreshCw
                size={13}
                className={loading ? styles.spinner : undefined}
              />
              <span>{loading ? "Refreshing..." : "Refresh"}</span>
            </button>
          </div>

          <div className={styles.historyList}>
            {withdrawals.length > 0 ? (
              withdrawals.map((w) => (
                <div key={w.id} className={styles.historyItem}>
                  <div className={styles.historyLeft}>
                    <span className={styles.historyAmount}>
                      {formatNaira(w.amount)}
                    </span>
                    <span className={styles.historyDate}>
                      {formatDate(w.date)} • Ref: {w.reference}
                    </span>
                    {w.status === "FAILED" && w.failureReason && (
                      <span className={styles.historyReason}>
                        {friendlyWithdrawalFailure(w.failureReason)}
                      </span>
                    )}
                  </div>

                  <span
                    className={`${styles.statusPill} ${statusClass(w.status)}`}
                  >
                    {w.status}
                  </span>
                </div>
              ))
            ) : (
              <div className={styles.emptyHistory}>
                <Clock
                  size={32}
                  color="#cbd5e1"
                  style={{ margin: "0 auto 0.5rem" }}
                />
                <p>No withdrawal requests yet.</p>
              </div>
            )}
          </div>
        </section>
      </div>
    </DriverLayout>
  );
}
