import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FaArrowLeft,
  FaShieldAlt,
  FaTrash,
  FaCog,
  FaBell,
  FaDownload,
  FaCheckCircle,
  FaLock,
  FaUsers,
  FaInfoCircle,
  FaIdCard,
  FaCreditCard,
  FaArrowRight,
  FaWifi,
  FaTimesCircle,
} from 'react-icons/fa';
import styles from './SettingsPage.module.css';
import KYCModal from '../../components/KYCModal';
import { USER_API_URL, KYC_API_URL } from '../../config/api';


export default function Settings() {
  const navigate = useNavigate();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showActionModal, setShowActionModal] = useState(false);
  const [actionModal, setActionModal] = useState({ title: '', message: '' });
  const [successMessage, setSuccessMessage] = useState('');
  const toastTimerRef = useRef(null);

  const [preferences, setPreferences] = useState({
    language: 'english',
    theme: 'light',
    currency: 'NGN',
    emailNotif: true,
    pushNotif: true,
    smsNotif: false,
    busAlerts: true,
    paymentAlerts: true,
    tripReminders: true,
    promos: false,
  });

  useEffect(() => {
    const savedTheme    = localStorage.getItem('user_theme');
    const savedLanguage = localStorage.getItem('user_language');
    const savedCurrency = localStorage.getItem('user_currency');
    if (savedTheme || savedLanguage || savedCurrency) {
      setPreferences(prev => ({
        ...prev,
        ...(savedTheme    ? { theme: savedTheme }       : {}),
        ...(savedLanguage ? { language: savedLanguage } : {}),
        ...(savedCurrency ? { currency: savedCurrency } : {}),
      }));
    }
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = preferences.theme;
    localStorage.setItem('user_theme',    preferences.theme);
    localStorage.setItem('user_language', preferences.language);
    localStorage.setItem('user_currency', preferences.currency);
  }, [preferences.theme, preferences.language, preferences.currency]);

  // FIX 3: cleanup timer on unmount to avoid state update on unmounted component
  useEffect(() => {
    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
  }, []);

  const handleSavePreferences = (key, value) => {
    setPreferences(prev => ({ ...prev, [key]: value }));
  };

  const showToast = (message) => {
    setSuccessMessage(message);
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => setSuccessMessage(''), 2500);
  };

  const openActionModal = (title, message) => {
    setActionModal({ title, message });
    setShowActionModal(true);
  };

  const handleDeleteAccount = () => {
    setShowDeleteConfirm(false);
    showToast('Delete request captured. Your account removal flow would continue here.');
  };

  const handleDownloadData = () => {
    // API not ready yet — toast only
    showToast('Your data export has been prepared.');
  };

  const containerVariants = {
    hidden:  { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.2 } },
  };

  const itemVariants = {
    hidden:  { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  };


  return (
    <motion.div
      className={styles.settingsPage}
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <div className={styles.header}>
        <motion.button
          className={styles.backBtn}
          onClick={() => navigate('/dashboard')}
          whileHover={{ x: -4 }}
        >
          <FaArrowLeft /> Back
        </motion.button>
        <h1>Settings & Preferences</h1>
      </div>

      {successMessage && (
        <motion.div
          className={styles.toast}
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <FaCheckCircle /> {successMessage}
        </motion.div>
      )}

      <div className={styles.container}>
        <motion.div variants={itemVariants}>
          <GeneralSettings preferences={preferences} onSave={handleSavePreferences} />
        </motion.div>
        <motion.div variants={itemVariants}>
          <NotificationSettings preferences={preferences} onSave={handleSavePreferences} />
        </motion.div>
        <motion.div variants={itemVariants}>
          <CardLinking onShowInfo={openActionModal} onToast={showToast} />
        </motion.div>
        <motion.div variants={itemVariants}>
          <KYCSection onToast={showToast} />
        </motion.div>
        <motion.div variants={itemVariants}>
          <PrivacySettings
            onDownload={handleDownloadData}
            onDelete={() => setShowDeleteConfirm(true)}
            onShowInfo={openActionModal}
          />
        </motion.div>
      </div>

      {showDeleteConfirm && (
        <DeleteConfirmModal
          onConfirm={handleDeleteAccount}
          onCancel={() => setShowDeleteConfirm(false)}
        />
      )}
      {showActionModal && (
        <ActionInfoModal
          title={actionModal.title}
          message={actionModal.message}
          onClose={() => setShowActionModal(false)}
        />
      )}
    </motion.div>
  );
}


/* ── General Settings ──────────────────────────────────────────────────────── */
function GeneralSettings({ preferences, onSave }) {
  return (
    <motion.div className={styles.settingsCard} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <h2>General Settings</h2>

      <div className={styles.settingItem}>
        <div className={styles.settingLabel}>
          <label>Language</label>
          <p>Choose your preferred language</p>
        </div>
        <select value={preferences.language} onChange={e => onSave('language', e.target.value)} className={styles.select}>
          <option value="english">English</option>
        </select>
      </div>

      <div className={styles.settingItem}>
        <div className={styles.settingLabel}>
          <label>Theme</label>
          <p>Choose your preferred theme</p>
        </div>
        <div className={styles.themeButtons}>
          <motion.button
            type="button"
            className={`${styles.themeBtn} ${preferences.theme === 'light' ? styles.active : ''}`}
            onClick={() => onSave('theme', 'light')}
            whileHover={{ scale: 1.05 }}
          > Light</motion.button>
          <motion.button
            type="button"
            className={`${styles.themeBtn} ${preferences.theme === 'dark' ? styles.active : ''}`}
            onClick={() => onSave('theme', 'dark')}
            whileHover={{ scale: 1.05 }}
          > Dark</motion.button>
        </div>
      </div>

      <div className={styles.settingItem}>
        <div className={styles.settingLabel}>
          <label>Currency</label>
          <p>All amounts are displayed in Nigerian Naira (₦)</p>
        </div>
        <select value={preferences.currency} className={styles.select} disabled>
          <option value="NGN">Nigerian Naira (₦)</option>
        </select>
      </div>
    </motion.div>
  );
}

/* ── Notification Settings ─────────────────────────────────────────────────── */
function NotificationSettings({ preferences, onSave }) {
  const methods = [
    { key: 'emailNotif', label: 'Email Notifications', desc: 'Receive updates via email' },
    { key: 'pushNotif',  label: 'Push Notifications',  desc: 'Receive app notifications' },
    { key: 'smsNotif',   label: 'SMS Alerts',           desc: 'Receive text messages' },
  ];

  const types = [
    { key: 'busAlerts',     label: ' Bus Arrival Alerts',    desc: 'Get notified when bus is near' },
    { key: 'paymentAlerts', label: ' Payment Confirmations', desc: 'Confirm after each transaction' },
    { key: 'tripReminders', label: ' Trip Reminders',        desc: 'Remind before your scheduled trips' },
    { key: 'promos',        label: ' Promotions & Offers',   desc: 'Latest deals and special offers' },
  ];

  return (
    <motion.div className={styles.settingsCard} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <h2>Notification Preferences</h2>

      <div className={styles.sectionGroup}>
        <h3>Notification Methods</h3>
        {methods.map(m => (
          <div key={m.key} className={styles.toggleItem}>
            <div className={styles.toggleLabel}>
              <label>{m.label}</label>
              <p>{m.desc}</p>
            </div>
            <label className={styles.toggle}>
              <input type="checkbox" checked={preferences[m.key]} onChange={e => onSave(m.key, e.target.checked)} />
              <span className={styles.slider}></span>
            </label>
          </div>
        ))}
      </div>

      <div className={styles.sectionGroup}>
        <h3>Notification Types</h3>
        {types.map(t => (
          <div key={t.key} className={styles.toggleItem}>
            <div className={styles.toggleLabel}>
              <label>{t.label}</label>
              <p>{t.desc}</p>
            </div>
            <label className={styles.toggle}>
              <input type="checkbox" checked={preferences[t.key]} onChange={e => onSave(t.key, e.target.checked)} />
              <span className={styles.slider}></span>
            </label>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

/* ── Card Linking ──────────────────────────────────────────────────────────── */
const OTP_LENGTH = 6;

function CardLinking({ onShowInfo, onToast }) {
  const [cards, setCards] = useState([
    { id: 1, uid: 'NFC-4A2F-9B1C', label: 'My Transit Card', linked: true, linkedAt: '2024-11-10' },
  ]);
  const [showLinkForm, setShowLinkForm] = useState(false);
  const [otp, setOtp] = useState(Array(OTP_LENGTH).fill(''));
  const [verifying, setVerifying] = useState(false);
  const [linkError, setLinkError] = useState('');
  const otpRefs = useRef([]);

  const resetOtp = () => {
    setOtp(Array(OTP_LENGTH).fill(''));
    setLinkError('');
  };

  const handleOtpChange = (index, value) => {
    const digit = value.replace(/\D/g, '').slice(-1); // only last digit, numbers only
    const next = [...otp];
    next[index] = digit;
    setOtp(next);
    setLinkError('');

    if (digit && index < OTP_LENGTH - 1) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH);
    if (!pasted) return;
    e.preventDefault();
    const next = Array(OTP_LENGTH).fill('');
    pasted.split('').forEach((d, i) => { next[i] = d; });
    setOtp(next);
    otpRefs.current[Math.min(pasted.length, OTP_LENGTH - 1)]?.focus();
  };

  const handleVerify = async () => {
    const code = otp.join('');
    if (code.length !== OTP_LENGTH || verifying) return;

    setVerifying(true);
    setLinkError('');

    try {
      // TODO(backend): replace with your real card-linking endpoint once ready
      const response = await fetch(`${USER_API_URL}/confirm-card`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('authtoken')}`,
        },
        body: JSON.stringify({ otp: code }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Could not verify this code. Please try again.');
      }

      // Expected backend shape: { status: 'linked' | 'pending', card: { uid, label, linkedAt } }
      if (result.status === 'linked') {
        setCards(prev => [...prev, {
          id: Date.now(),
          uid: result.card?.uid || 'UNKNOWN',
          label: result.card?.label || 'My NFC Card',
          linked: true,
          linkedAt: result.card?.linkedAt || new Date().toISOString().split('T')[0],
        }]);
        onToast('Card linked successfully.');
        setShowLinkForm(false);
        resetOtp();
      } else if (result.status === 'pending') {
        onToast('Card linking is pending. We will notify you once confirmed.');
        setShowLinkForm(false);
        resetOtp();
      } else {
        setLinkError('Invalid code. Please check and try again.');
      }
    } catch (err) {
      setLinkError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setVerifying(false);
    }
  };

  const handleUnlink = (id) => {
    setCards(prev => prev.filter(c => c.id !== id));
    onToast('Card unlinked from your account.');
  };

  return (
    <motion.div className={styles.settingsCard} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className={styles.cardSectionHeader}>
        <div>
          <h2>C-transit Card Linking</h2>
          <p className={styles.cardSectionDesc}>Manage physical NFC transit cards linked to your account.</p>
        </div>
        <motion.button
          className={styles.linkCardBtn}
          onClick={() => { setShowLinkForm(v => !v); resetOtp(); }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <FaWifi /> Link New Card
        </motion.button>
      </div>

      {showLinkForm && (
        <motion.div
          className={styles.linkForm}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <p className={styles.linkHint}>Enter the OTP code sent to your registered device to link your card.</p>

          <div className={styles.otpRow}>
            {otp.map((digit, i) => (
              <input
                key={i}
                ref={el => (otpRefs.current[i] = el)}
                className={styles.otpInput}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={e => handleOtpChange(i, e.target.value)}
                onKeyDown={e => handleOtpKeyDown(i, e)}
                onPaste={handleOtpPaste}
              />
            ))}
          </div>

          {linkError && <p className={styles.fieldError}>{linkError}</p>}

          <div className={styles.linkFormActions}>
            <button className={styles.cancelBtn} onClick={() => { setShowLinkForm(false); resetOtp(); }}>
              Cancel
            </button>
            <motion.button
              className={styles.actionBtn}
              onClick={handleVerify}
              disabled={otp.join('').length !== OTP_LENGTH || verifying}
              whileHover={{ scale: 1.02 }}
            >
              <FaWifi /> {verifying ? 'Verifying...' : 'Verify & Link'}
            </motion.button>
          </div>
        </motion.div>
      )}

    </motion.div>
  );
}

/* ── KYC Section ───────────────────────────────────────────────────────────── */
function KYCSection({ onToast }) {
  const [showKYCModal, setShowKYCModal] = useState(false);
  const [kycStatus, setKycStatus] = useState('unverified');
  const [statusLoading, setStatusLoading] = useState(true);

  //  Fetch real KYC status on mount
  useEffect(() => {
    const fetchKYCStatus = async () => {
      const token = localStorage.getItem('authToken');
      if (!token) {
        setStatusLoading(false);
        return;
      }

      try {
        const response = await fetch(`${KYC_API_URL}/status`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        const result = await response.json();

        if (!response.ok) throw new Error(result.message || 'Failed to fetch KYC status');

        // 👇 adjust this based on what your backend returns
        const status = result.data?.status || result.status || 'unverified';
        setKycStatus(status);
      } catch (err) {
        console.error('KYC status fetch failed:', err.message);
      } finally {
        setStatusLoading(false);
      }
    };

    fetchKYCStatus();
  }, []);

  const statusConfig = {
    unverified: {
      label: 'Not Verified',
      color: styles.kycBadgeRed,
      icon: <FaTimesCircle />,
      desc: 'Your identity has not been verified. Verify now to unlock full account features.',
    },
    pending: {
      label: 'Verification Pending',
      color: styles.kycBadgeYellow,
      icon: <FaInfoCircle />,
      desc: 'Your documents are under review. This usually takes 1–2 business days.',
    },
    verified: {
      label: 'Verified',
      color: styles.kycBadgeGreen,
      icon: <FaCheckCircle />,
      desc: 'Your identity has been successfully verified.',
    },
  };

  const config = statusConfig[kycStatus] || statusConfig['unverified'];

  const handleKYCClose = (result) => {
    setShowKYCModal(false);
    if (result?.success) {
      setKycStatus('pending');
      onToast(result.message || 'KYC submitted successfully.');
    }
  };

  // 👇 Show loading while fetching status
  if (statusLoading) {
    return (
      <motion.div className={styles.settingsCard} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h2>Identity Verification (KYC)</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Loading verification status...</p>
      </motion.div>
    );
  }

  return (
    <>
      <motion.div className={styles.settingsCard} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h2>Identity Verification (KYC)</h2>

        <div className={styles.kycStatusCard}>
          <div className={`${styles.kycBadge} ${config.color}`}>
            {config.icon} {config.label}
          </div>
          <p className={styles.kycDesc}>{config.desc}</p>

          {kycStatus !== 'verified' && (
            <div className={styles.kycFeatures}>
              <p className={styles.kycFeaturesTitle}>Verification unlocks:</p>
              <ul>
                <li><FaCheckCircle /> Higher wallet limits</li>
                <li><FaCheckCircle /> Transfer to other users</li>
                <li><FaCheckCircle /> Full transaction history</li>
                <li><FaCheckCircle /> Priority support</li>
              </ul>
            </div>
          )}
        </div>

        {kycStatus === 'unverified' && (
          <motion.button
            className={styles.kycBtn}
            onClick={() => setShowKYCModal(true)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <FaIdCard /> Start Verification <FaArrowRight />
          </motion.button>
        )}

        {kycStatus === 'pending' && (
          <div className={styles.kycPendingNote}>
            Your submission is being reviewed. We'll notify you once it's complete.
          </div>
        )}
      </motion.div>

      {showKYCModal && (
        <KYCModal onClose={handleKYCClose} />
      )}
    </>
  );
}


/* ── Privacy Settings ──────────────────────────────────────────────────────── */
function PrivacySettings({ onDownload, onDelete, onShowInfo }) {
  return (
    <motion.div className={styles.settingsCard} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <h2>Privacy & Security</h2>

      <div className={styles.sectionGroup}>
        <h3>Two-Factor Authentication</h3>
        <div className={styles.actionItem}>
          <div>
            <label>Enable 2FA</label>
            <p>Add extra security to your account</p>
          </div>
          <motion.button
            className={styles.actionBtn}
            onClick={() => onShowInfo('Two-Factor Authentication', '2FA setup would connect to the backend here.')}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <FaLock /> Set Up 2FA
          </motion.button>
        </div>
      </div>

      <div className={styles.sectionGroup}>
        <h3>Active Sessions</h3>
        <div className={styles.actionItem}>
          <div>
            <label>View Active Sessions</label>
            <p>Manage devices where you're logged in</p>
          </div>
          <motion.button
            className={styles.actionBtn}
            onClick={() => onShowInfo('Active Sessions', 'This section would list devices, IPs, and login timestamps once connected to the API.')}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <FaUsers /> View Sessions
          </motion.button>
        </div>
      </div>

      <div className={styles.sectionGroup}>
        <h3>Data Management</h3>
        <div className={styles.actionItem}>
          <div>
            <label> Download Your Data</label>
            <p>Get a copy of all your data</p>
          </div>
          <motion.button className={styles.actionBtn} onClick={onDownload} whileHover={{ scale: 1.02 }}>
            <FaDownload /> Download
          </motion.button>
        </div>
        <div className={styles.actionItem}>
          <div>
            <label> Delete Account</label>
            <p>Permanently delete your account and all data</p>
          </div>
          <motion.button
            className={`${styles.actionBtn} ${styles.dangerBtn}`}
            onClick={onDelete}
            whileHover={{ scale: 1.02 }}
          >
            <FaTrash /> Delete
          </motion.button>
        </div>
      </div>

      <div className={styles.sectionGroup}>
        <h3>Legal</h3>
        <div className={styles.legalLinks}>
          <a href="/policy" className={styles.link}> Privacy Policy</a>
          <a href="/terms" className={styles.link}> Terms & Conditions</a>
        </div>
      </div>
    </motion.div>
  );
}

/* ── Modals ────────────────────────────────────────────────────────────────── */

// FIX 7: apply singleAction class so the single Close button isn't left-aligned
function ActionInfoModal({ title, message, onClose }) {
  return (
    <motion.div className={styles.modalOverlay} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <motion.div className={styles.modal} initial={{ scale: 0.9 }} animate={{ scale: 1 }}>
        <h2>{title}</h2>
        <p className={styles.infoText}><FaInfoCircle /> {message}</p>
        <div className={`${styles.modalActions} ${styles.singleAction}`}>
          <motion.button className={styles.cancelBtn} onClick={onClose} whileHover={{ scale: 1.02 }}>
            Close
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// FIX 5: password validation — require minimum 6 characters to match a real password
function DeleteConfirmModal({ onConfirm, onCancel }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleConfirm = () => {
    if (password.length < 6) {
      setError('Please enter your full account password.');
      return;
    }
    setError('');
    onConfirm(password);
  };

  return (
    <motion.div className={styles.modalOverlay} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <motion.div className={styles.modal} initial={{ scale: 0.8 }} animate={{ scale: 1 }}>
        <h2>Delete Account</h2>
        <p className={styles.warningText}>
           This action is permanent and cannot be undone. All your data will be deleted.
        </p>
        <div className={styles.formGroup}>
          <label>Enter your password to confirm</label>
          <input
            type="password"
            value={password}
            onChange={e => { setPassword(e.target.value); setError(''); }}
            placeholder="Enter password"
            className={styles.input}
          />
          {error && <p className={styles.fieldError}>{error}</p>}
        </div>
        <div className={styles.modalActions}>
          <motion.button className={styles.cancelBtn} onClick={onCancel} whileHover={{ scale: 1.02 }}>
            Cancel
          </motion.button>
          <motion.button
            className={`${styles.submitBtn} ${styles.dangerBtn}`}
            onClick={handleConfirm}
            disabled={!password}
            whileHover={{ scale: 1.02 }}
          >
            Delete Account
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}