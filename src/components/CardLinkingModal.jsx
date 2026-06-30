import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaCheckCircle, FaLock, FaTimes } from 'react-icons/fa';
import styles from './CardLinkingModal.module.css';
import { AUTH_API_URL } from '../config/api';

export default function CardLinkingModal({ isOpen, onClose }) {
  const [pin, setPin] = useState('');
  const [isSuccessful, setIsSuccessful] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isOpen) {
      setPin('');
      setIsSuccessful(false);
      setError('');
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isSuccessful) return undefined;

    const timer = window.setTimeout(() => {
      onClose();
    }, 1600);

    return () => window.clearTimeout(timer);
  }, [isSuccessful, onClose]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!/^\d{6}$/.test(pin)) return;

    const token = localStorage.getItem('authToken');
    if (!token) {
      setError('Session expired. Please log in again.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${AUTH_API_URL}/confirm-card`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ otp: pin }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to link card. Please try again.');
      }

      sessionStorage.setItem('authSuccessMessage', 'Card linked successfully. You can now use wallet funding tools.');
      setIsSuccessful(true);
    } catch (err) {
      setError(err.message || 'Failed to link card. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className={styles.overlay}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.section
            className={styles.modal}
            initial={{ opacity: 0, scale: 0.94, y: 18 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ type: 'spring', stiffness: 260, damping: 24 }}
            onClick={(event) => event.stopPropagation()}
            aria-modal="true"
            role="dialog"
            aria-label="Card linking"
          >
            <button type="button" className={styles.closeBtn} onClick={onClose} aria-label="Close card linking modal">
              <FaTimes />
            </button>

            <div className={styles.header}>
              <span className={styles.badge}>Wallet Setup</span>
              <h2>Link Your Card</h2>
              <p>Enter the 6-digit OTP to complete linking.</p>
            </div>

            {/* Error */}
            <AnimatePresence>
              {error && (
                <motion.div
                  className={styles.errorBox}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            {isSuccessful ? (
              <div className={styles.successBox}>
                <FaCheckCircle />
                <h3>Card linked successfully</h3>
                <p>Returning to your dashboard in a moment.</p>
              </div>
            ) : (
              <form className={styles.form} onSubmit={handleSubmit}>
                <label>
                  <span>
                    <FaLock /> 6-digit OTP
                  </span>
                  <input
                    value={pin}
                    onChange={(event) =>
                      setPin(event.target.value.replace(/[^0-9]/g, '').slice(0, 6))
                    }
                    placeholder="Enter 6-digit OTP"
                    inputMode="numeric"
                    maxLength={6}
                    pattern="\d{6}"
                  />
                </label>
                <button
                  className={styles.submitBtn}
                  type="submit"
                  disabled={!/^\d{6}$/.test(pin) || loading}
                >
                  {loading ? 'Linking...' : 'Link Card'}
                </button>
              </form>
            )}
          </motion.section>
        </motion.div>
      )}
    </AnimatePresence>
  );
}