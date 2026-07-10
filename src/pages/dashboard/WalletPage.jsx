import { useState, useEffect, useCallback } from 'react';
import { FaArrowLeft, FaEllipsisV, FaWifi, FaWallet, FaArrowRight, FaCopy, FaTimes } from 'react-icons/fa';
import axios from 'axios';
import styles from './WalletPage.module.css';
import { USER_API_URL } from '../../config/api';

export default function WalletPage({ walletBalance, onBack, onBalanceUpdate })  {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [virtualAccount, setVirtualAccount] = useState(null);
  const [vaLoading, setVaLoading] = useState(false);
  const [vaError, setVaError] = useState(null);
  const [showFundModal, setShowFundModal] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [creditedAmount, setCreditedAmount] = useState(0);


  const fetchTransactions = useCallback(async () => {
    try {
      setLoading(true);
      const headers = authHeaders();

      const res = await axios.get(
        `${USER_API_URL}/transactions/history`,
        { headers, params: { page: 1, limit: 5 } } // wallet page only needs a short recent list
      );

      const tripsData = res.data.data.transactions;
      const normalized = tripsData.map(t => ({
        id: `${t.terminal_id}-${t.synced_at}-${t.amount}`, // composite key, no real id from backend yet
        title: t.type === 'RIDE' ? `Fare Payment - ${t.terminal_id}` : 'Wallet Funded',
        date: t.synced_at,
        amount: t.type === 'RIDE' ? -Math.abs(Number(t.amount)) : Math.abs(Number(t.amount)),
        type: t.type === 'RIDE' ? 'fare' : 'fund',
      }));

      setTransactions(normalized);
      setError(null);
    } catch (err) {
      console.error('Failed to load wallet transactions:', err);
      setError('Failed to load transactions');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchVirtualAccount = useCallback(async () => {
  try {
    const res = await axios.get(
      `${USER_API_URL}/payments/virtual-account`,
      { headers: authHeaders() }
    );
    setVirtualAccount(res.data.data);
  } catch (err) {
    // 404 just means no account created yet — that's fine, not a real error
    if (err.response?.status !== 404) {
      console.error('Failed to fetch virtual account:', err);
    }
    setVirtualAccount(null);
  }
}, []);


const handleFundWallet = async () => {
  setVaLoading(true);
  setVaError(null);
  try {
    const res = await axios.post(
      `${USER_API_URL}/payments/virtual-account`,
      {}, // no body needed — identity comes from JWT
      { headers: authHeaders() }
    );
    setVirtualAccount(res.data.data);
    setShowFundModal(true);
  } catch (err) {
    if (err.response?.status === 403) {
      setVaError('Your KYC must be approved and wallet activated before you can fund your wallet.');
    } else {
      setVaError('Something went wrong. Please try again.');
    }
    console.error('Failed to request virtual account:', err);
    setShowFundModal(true); // show modal so the error is visible too
  } finally {
    setVaLoading(false);
  }
};

const closeFundModal = () => {
  setShowFundModal(false);
  setShowSuccess(false);
  setCreditedAmount(0);
};

const copyAccountNumber = () => {
  if (virtualAccount?.accountNumber) {
    navigator.clipboard.writeText(virtualAccount.accountNumber);
  }
};
  //add authHeader function
  const authHeaders = () => {
    const token = localStorage.getItem('authToken');
    return { Authorization: `Bearer ${token}` };
  };

  
useEffect(() => {
  fetchTransactions();
  fetchVirtualAccount();
}, [fetchTransactions, fetchVirtualAccount]);

useEffect(() => {
  if (!showFundModal || showSuccess) return;

  const pollBalance = async () => {
    try {
      const res = await axios.get(
        `${USER_API_URL}/wallets/balance`,
        { headers: authHeaders() }
      );
      const newBalance = res.data.balance;

      if (newBalance > walletBalance) {
        setCreditedAmount(newBalance - walletBalance);
        onBalanceUpdate?.(newBalance);
        setShowSuccess(true);
      }
    } catch (err) {
      console.error('Balance poll failed:', err);
    }
  };

  const intervalId = setInterval(pollBalance, 5000);
  return () => clearInterval(intervalId);
}, [showFundModal, showSuccess, walletBalance, onBalanceUpdate]);

useEffect(() => {
  if (!showSuccess) return;

  const timeoutId = setTimeout(() => {
    closeFundModal();
  }, 3000);

  return () => clearTimeout(timeoutId);
}, [showSuccess]);

  return (
    <div className={styles.WalletPage}>
      {/* Page Header */}
      <div className={styles.pageHeader}>
        <button className={styles.backBtn} onClick={onBack}>
          <FaArrowLeft size={20} />
        </button>
        <h1 className={styles.pageTitle}>Wallet</h1>
      </div>

      {/* C-transit Card Visual */}
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
      <button
  className={styles.fundBtn ?? styles.backBtn}
  onClick={handleFundWallet}
  disabled={vaLoading}
>
  <FaWallet size={14} style={{ marginRight: 6 }} />
  {vaLoading ? 'Loading...' : 'Fund Wallet'}
</button>

    
      {/* Recent Transactions */}
      <div className={styles.transactionSection}>
        <h3 className={styles.transactionTitle}>Recent Transactions</h3>

        {loading && <p>Loading...</p>}
        {error && <p>{error}</p>}
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
                  {new Date(tx.date).toLocaleString('en-NG', { dateStyle: 'medium', timeStyle: 'short' })}
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
      {showFundModal && (
  <div style={{
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
  }}>
    <div style={{ background: '#fff', borderRadius: 12, padding: 24, width: '90%', maxWidth: 360 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ margin: 0 }}>Fund Your Wallet</h3>
        <button onClick={closeFundModal} style={{ border: 'none', background: 'none' }}>
          <FaTimes />
        </button>
      </div>

      {vaError && <p style={{ color: '#DC2626', marginTop: 12 }}>{vaError}</p>}

      {!vaError && virtualAccount && !showSuccess && (
        <div style={{ marginTop: 16 }}>
          <p style={{ color: '#6B7280', fontSize: 13 }}>Transfer to this account to fund your wallet:</p>
          <div style={{ background: '#F3F4F6', borderRadius: 8, padding: 12, marginTop: 8 }}>
            <p style={{ margin: 0, fontSize: 12, color: '#6B7280' }}>Account Number</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <p style={{ margin: 0, fontSize: 18, fontWeight: 600 }}>{virtualAccount.accountNumber}</p>
              <button onClick={copyAccountNumber} style={{ border: 'none', background: 'none', cursor: 'pointer' }}>
                <FaCopy size={14} />
              </button>
            </div>
            <p style={{ margin: '8px 0 0', fontSize: 12, color: '#6B7280' }}>Bank Name</p>
            <p style={{ margin: 0, fontWeight: 600 }}>{virtualAccount.bankName}</p>
          </div>
          <p style={{ fontSize: 12, color: '#1A56DB', marginTop: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{
              width: 8, height: 8, borderRadius: '50%', background: '#1A56DB',
              display: 'inline-block', animation: 'ctPulse 1.5s infinite'
            }} />
            Checking for payment...
          </p>
        </div>
      )}

      {showSuccess && (
        <div style={{ marginTop: 16, textAlign: 'center', padding: '20px 0' }}>
          <div style={{
            width: 56, height: 56, borderRadius: '50%', background: '#DCFCE7',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 12px', animation: 'ctScaleIn 0.3s ease-out'
          }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
              <path d="M20 6L9 17l-5-5" stroke="#16A34A" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <p style={{ margin: 0, fontWeight: 700, fontSize: 16, color: '#16A34A' }}>Payment Successful!</p>
          <p style={{ margin: '4px 0 0', color: '#6B7280', fontSize: 13 }}>
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