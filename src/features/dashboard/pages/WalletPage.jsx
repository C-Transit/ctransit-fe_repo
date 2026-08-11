import { useState, useEffect, useCallback } from 'react';
import { FaArrowLeft, FaWifi, FaWallet, FaArrowRight, FaCopy, FaTimes } from 'react-icons/fa';
import axios from 'axios';
import styles from './WalletPage.module.css';
import { USER_API_URL } from '../../../api/api';

export default function WalletPage({ walletBalance, onBack, onBalanceUpdate }) {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [virtualAccount, setVirtualAccount] = useState(null);
  const [vaLoading, setVaLoading] = useState(false);
  const [vaError, setVaError] = useState(null);
  const [showFundModal, setShowFundModal] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [creditedAmount, setCreditedAmount] = useState(0);
  const [showKycRequired, setShowKycRequired] = useState(false);

  // ─── Auth Headers ──────────────────────────────────────────────────────────
  const authHeaders = () => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      return {};
    }
    return { Authorization: `Bearer ${token}` };
  };

  // ─── Fetch Transactions ────────────────────────────────────────────────────
  const fetchTransactions = useCallback(async () => {
    try {
      setLoading(true);
      const headers = authHeaders();

      const res = await axios.get(
        `${USER_API_URL}/transactions/history`,
        { 
          headers, 
          params: { page: 1, limit: 5 } 
        }
      );

      const resData = res.data;
      const tripsData = resData?.data?.transactions 
        || resData?.transactions 
        || (Array.isArray(resData?.data) ? resData.data : null)
        || (Array.isArray(resData) ? resData : []);

      if (Array.isArray(tripsData)) {
        const normalized = tripsData.map(t => ({
          id: `${t.terminal_id || 'T'}-${t.synced_at || Date.now()}-${t.amount || 0}`,
          title: t.type === 'RIDE' ? `Fare Payment - ${t.terminal_id || 'Terminal'}` : 'Wallet Funded',
          date: t.synced_at || t.createdAt || new Date().toISOString(),
          amount: t.type === 'RIDE' ? -Math.abs(Number(t.amount || 0)) : Math.abs(Number(t.amount || 0)),
          type: t.type === 'RIDE' ? 'fare' : 'fund',
        }));
        setTransactions(normalized);
        setError(null);
      } else {
        setTransactions([]);
      }
    } catch (err) {
      if (err.response?.status === 401) {
        setError('Session expired. Please login again.');
      } else if (err.response?.status === 404) {
        setTransactions([]);
        setError(null);
      } else {
        setError('Failed to load transactions. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // ─── GET Virtual Account ──────────────────────────────────────────────────
  const fetchVirtualAccount = useCallback(async () => {
    try {
      const headers = authHeaders();
      
      const res = await axios.get(
        `${USER_API_URL}/payments/fetch`,
        { headers }
      );
      
      if (res.data && res.data.data) {
        setVirtualAccount(res.data.data);
        setVaError(null);
      }
    } catch (err) {
      if (err.response?.status === 404 || err.response?.status === 403) {
        setVirtualAccount(null);
      } else {
        setVirtualAccount(null);
      }
    }
  }, []);

  // ─── POST Create Virtual Account ──────────────────────────────────────────
  const handleFundWallet = async () => {
    setVaLoading(true);
    setVaError(null);
    setShowKycRequired(false);
    
    try {
      const headers = authHeaders();
      const url = `${USER_API_URL}/payments/create`;
      
      const res = await axios.post(url, {}, { headers });
      
      if (res.data && res.data.data) {
        setVirtualAccount(res.data.data);
        setShowFundModal(true);
        setVaError(null);
        setShowKycRequired(false);
      } else {
        throw new Error('Invalid response from server');
      }
      
    } catch (err) {
      if (err.response?.status === 403) {
        setShowKycRequired(true);
        setShowFundModal(true);
        setVaError(null);
      } 
      else if (err.response?.status === 401) {
        setVaError('Please login again to fund your wallet.');
        setShowFundModal(true);
      } 
      else if (err.response?.status === 404) {
        setVaError('Funding service is currently unavailable.');
        setShowFundModal(true);
      } 
      else if (err.response?.status === 500) {
        setVaError('Server error. Please try again later.');
        setShowFundModal(true);
      } 
      else {
        setVaError(err.response?.data?.message || 'Something went wrong. Please try again.');
        setShowFundModal(true);
      }
    } finally {
      setVaLoading(false);
    }
  };

  // ─── Close Modal ──────────────────────────────────────────────────────────
  const closeFundModal = () => {
    setShowFundModal(false);
    setShowSuccess(false);
    setCreditedAmount(0);
    setVaError(null);
    setShowKycRequired(false);
  };

  // ─── Copy Account Number ──────────────────────────────────────────────────
  const copyAccountNumber = () => {
    if (virtualAccount?.accountNumber) {
      navigator.clipboard.writeText(virtualAccount.accountNumber);
    }
  };

  // ─── Load data on mount ────────────────────────────────────────────────────
  useEffect(() => {
    fetchTransactions();
    fetchVirtualAccount();
  }, [fetchTransactions, fetchVirtualAccount]);

  // ─── Balance Polling ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!showFundModal || showSuccess || showKycRequired) return;

    let pollCount = 0;
    const MAX_POLLS = 60;

    const pollBalance = async () => {
      try {
        pollCount++;
        const headers = authHeaders();
        
        const res = await axios.get(
          `${USER_API_URL}/wallets/details`,
          { headers }
        );
        
        const newBalance = res.data.balance || res.data.data?.balance || 0;
        
        if (newBalance > walletBalance) {
          const amountCredited = newBalance - walletBalance;
          setCreditedAmount(amountCredited);
          onBalanceUpdate?.(newBalance);
          setShowSuccess(true);
        }
        
        if (pollCount >= MAX_POLLS) {
          closeFundModal();
        }
      } catch (err) {
        // Silent fail for polling errors
      }
    };

    pollBalance();
    const intervalId = setInterval(pollBalance, 5000);
    return () => clearInterval(intervalId);
  }, [showFundModal, showSuccess, showKycRequired, walletBalance, onBalanceUpdate]);

  // ─── Auto-close success modal after 3 seconds ────────────────────────────
  useEffect(() => {
    if (!showSuccess) return;
    const timeoutId = setTimeout(() => closeFundModal(), 3000);
    return () => clearTimeout(timeoutId);
  }, [showSuccess]);

  return (
    <div className={styles.WalletPage}>
      {/* ─── Page Header ───────────────────────────────────────────────────── */}
      <div className={styles.pageHeader}>
        <button className={styles.backBtn} onClick={onBack}>
          <FaArrowLeft size={20} />
        </button>
        <h1 className={styles.pageTitle}>Wallet</h1>
      </div>

      {/* ─── C-transit Card Visual ────────────────────────────────────────── */}
      <div className={styles.nfcCard}>
        <div className={styles.cardTop}>
          <FaWifi size={20} color="white" />
          <span className={styles.cardBadge}>Active</span>
        </div>
        <div className={styles.cardBottom}>
          <p className={styles.balanceAmount}>
            ₦{(walletBalance || 0).toLocaleString('en-NG', { minimumFractionDigits: 2 })}
          </p>
          <p className={styles.balanceText}>Balance Amount</p>
        </div>
      </div>

      {/* ─── Account Box ───────────────────────────────────────────────────── */}
      {!loading && virtualAccount && virtualAccount.accountNumber ? (
        <div className={styles.accountBox}>
          <p className={styles.accountBoxTitle}>Your Permanent Funding Details</p>
          <div className={styles.accountBoxContent}>
            <div>
              <span className={styles.accountBoxBank}>{virtualAccount.bankName || 'Bank Name'}</span>
              <p className={styles.accountBoxNumber}>{virtualAccount.accountNumber}</p>
            </div>
            <button onClick={copyAccountNumber} className={styles.accountBoxCopyBtn}>
              <FaCopy size={12} /> Copy
            </button>
          </div>
        </div>
      ) : !loading && (
        <div className={styles.accountBoxEmpty}>
          <p className={styles.accountBoxEmptyText}>No virtual account yet</p>
          <p className={styles.accountBoxEmptySub}>Click "Fund Wallet" below to create one</p>
        </div>
      )}

      {/* ─── FUND WALLET BUTTON ───────────────────────────────────────────── */}
      <button
        className={styles.fundWalletBtn}
        onClick={handleFundWallet}
        disabled={vaLoading}
      >
        <FaWallet size={16} className={styles.fundWalletIcon} />
        {vaLoading ? 'Creating Account...' : ' Fund Wallet'}
      </button>

      {/* ─── Recent Transactions ──────────────────────────────────────────── */}
      <div className={styles.transactionSection}>
        <h3 className={styles.transactionTitle}>Recent Transactions</h3>

        {loading && <p>Loading...</p>}
        {error && <p className={styles.errorText}>{error}</p>}
        {!loading && !error && transactions.length === 0 && (
          <p className={styles.emptyState}>No transactions yet.</p>
        )}

        <div className={styles.transactionList}>
          {transactions.map(tx => (
            <div key={tx.id} className={styles.transactionRow}>
              <div className={styles.txIcon}>
                {tx.type === 'fund' ? <FaWallet /> : <FaArrowRight />}
              </div>
              <div className={styles.txInfo}>
                <p className={styles.txTitle}>{tx.title}</p>
                <p className={styles.txDate}>
                  {(() => {
                    if (!tx.date) return 'Recently';
                    const d = new Date(tx.date);
                    return isNaN(d.getTime()) ? 'Recently' : d.toLocaleString('en-NG', { dateStyle: 'medium', timeStyle: 'short' });
                  })()}
                </p>
              </div>
              <div className={styles.txAmount}>
                <p className={tx.amount > 0 ? styles.txCredit : styles.txDebit}>
                  {tx.amount > 0 ? '+' : ''} ₦{Math.abs(tx.amount).toLocaleString('en-NG')}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ─── FUND MODAL ────────────────────────────────────────────────────── */}
      {showFundModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContainer}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>Fund Your Wallet</h3>
              <button onClick={closeFundModal} className={styles.modalCloseBtn}>
                <FaTimes size={20} />
              </button>
            </div>

            {showKycRequired && (
              <div className={styles.kycContent}>
                <div className={styles.kycIconWrapper}>
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#D97706" strokeWidth="2">
                    <path d="M12 9v4M12 17h.01" strokeLinecap="round" />
                    <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
                  </svg>
                </div>
                <h4 className={styles.kycTitle}>KYC Verification Required</h4>
                <p className={styles.kycDescription}>
                  You need to complete your KYC verification before you can fund your wallet.
                </p>
                <p className={styles.kycInstruction}>
                  Please go to <a href="/dashboard/settings" style={{ color: '#1A56DB', fontWeight: 600, textDecoration: 'underline' }}>
                    Profile &gt; KYC
                  </a> to complete verification.
                </p>
                <button onClick={closeFundModal} className={styles.kycButton}>
                  Got it
                </button>
              </div>
            )}

            {vaError && !showKycRequired && (
              <div className={styles.errorContent}>{vaError}</div>
            )}

            {virtualAccount && virtualAccount.accountNumber && !showKycRequired && !showSuccess && (
              <div className={styles.vaContent}>
                <p className={styles.vaLabel}>Transfer to this account to fund your wallet:</p>
                <div className={styles.vaCard}>
                  <p className={styles.vaAccountLabel}>Account Number</p>
                  <div className={styles.vaAccountRow}>
                    <p className={styles.vaAccountNumber}>{virtualAccount.accountNumber}</p>
                    <button onClick={copyAccountNumber} className={styles.vaCopyBtn}>
                      <FaCopy size={12} /> Copy
                    </button>
                  </div>
                  <p className={styles.vaBankLabel}>Bank Name</p>
                  <p className={styles.vaBankName}>{virtualAccount.bankName || 'N/A'}</p>
                </div>
                <p className={styles.vaChecking}>
                  <span className={styles.vaPulse} /> Checking for payment...
                </p>
              </div>
            )}

            {showSuccess && (
              <div className={styles.successContent}>
                <div className={styles.successIconWrapper}>
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                    <path d="M20 6L9 17l-5-5" stroke="#16A34A" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <h4 className={styles.successTitle}>Payment Successful!</h4>
                <p className={styles.successAmount}>
                  ₦{creditedAmount.toLocaleString('en-NG', { minimumFractionDigits: 2 })} added to your wallet
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}