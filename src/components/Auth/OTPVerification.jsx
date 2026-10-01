import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { LoadingSpinner } from '../AnimatedIcons';
import { AUTH_API_URL } from '../../config/api';
import styles from './OTPVerification.module.css';

/**
 * OTPVerification Component
 * 
 * Modal that appears after user submits registration form.
 * Handles OTP code verification sent to user's email.
 * 
 * BACKEND INTEGRATION POINTS:
 * 1. POST /api/auth/verify-otp - Verify the OTP code
 * 2. POST /api/auth/resend-otp - Resend OTP to email
 */
export default function OTPVerification({ isOpen, email, onClose, onSuccess }) {
  // OTP Input: 6 separate digit fields
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(0);
  const [otpSent, setOtpSent] = useState(false);
  const inputRefs = useRef([]);

  // Countdown timer for resend button
  useEffect(() => {
    if (resendCountdown <= 0) return;

    const timer = setInterval(() => {
      setResendCountdown((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [resendCountdown]);

  // Handle OTP digit input
  const handleOtpChange = (index, value) => {
    // Only allow numbers
    const numValue = value.replace(/[^0-9]/g, '');

    if (numValue.length > 1) return;

    const newOtp = [...otp];
    newOtp[index] = numValue;
    setOtp(newOtp);

    // Clear error on user input
    if (error) setError('');

    // Auto-focus to next field
    if (numValue && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-focus to previous field on backspace
    if (!numValue && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // Handle keydown for better UX
  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === 'ArrowRight' && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // Mask email for display (e.g., alimi@campus.edu → ali***@campus.edu)
  const maskEmail = (email) => {
    const [localPart, domain] = email.split('@');
    const masked = localPart.substring(0, 3) + '***';
    return `${masked}@${domain}`;
  };

  // BACKEND INTEGRATION: POST /api/auth/verify-otp
  // Expected endpoint: `${AUTH_API_URL}/verify-otp`
  // Send: { email, otp: "123456" }
  // Response success: { token: "jwt_token", user: { firstname, lastname, email } }
  // Response error: { message: "Invalid OTP" } or { message: "OTP expired" }
  const handleVerifyOtp = async () => {
    const otpCode = otp.join('');

    if (otpCode.length !== 6) {
      setError('Please enter all 6 digits');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // TODO: Replace with actual API endpoint when backend is ready
      const response = await fetch(`${AUTH_API_URL}/verify-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          otp: otpCode,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle different error types
        if (response.status === 400) {
          setError(data.message || 'Invalid OTP code');
        } else if (response.status === 429) {
          setError('Too many attempts. Please try again later.');
        } else if (response.status === 410) {
          setError('OTP has expired. Please request a new one.');
        } else {
          setError(data.message || 'Verification failed');
        }
        return;
      }

      // Success! Notify the parent so it can route the user back to login.
      // BACKEND RESPONSE EXPECTED:
      // { token: "jwt_token_here", user: { firstname, lastname, email, matricNumber } }
      onSuccess(data);
    } catch (err) {
      console.error('OTP verification error:', err);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // BACKEND INTEGRATION: POST /api/auth/resend-otp
  // Expected endpoint: `${AUTH_API_URL}/resend-otp`
  // Send: { email }
  // Response: { success: true, message: "OTP sent to your email" }
  const handleResendOtp = async () => {
    setLoading(true);
    setError('');

    try {
      // TODO: Replace with actual API endpoint when backend is ready
      const response = await fetch(`${AUTH_API_URL}/resend-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Failed to resend OTP');
        return;
      }

      // Success! Reset form and start countdown
      setOtp(['', '', '', '', '', '']);
      setResendCountdown(60); // 60 second countdown
      setOtpSent(true);

      // Clear success message after 2 seconds
      setTimeout(() => setOtpSent(false), 2000);

      // Auto-focus first input
      inputRefs.current[0]?.focus();
    } catch (err) {
      console.error('Resend OTP error:', err);
      setError('Failed to resend OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const otpFilled = otp.every((digit) => digit !== '');

  return (
    <motion.div
      className={styles.modalOverlay}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className={styles.modalContent}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        {/* Close button */}
        <motion.button
          className={styles.closeBtn}
          onClick={() => !loading && onClose()}
          whileHover={{ rotate: 90 }}
          whileTap={{ scale: 0.9 }}
          disabled={loading}
        >
          ✕
        </motion.button>

        {/* Header */}
        <div className={styles.header}>
          <h2>Verify Your Email</h2>
          <p>
            We sent a verification code to
            <br />
            <strong>{maskEmail(email)}</strong>
          </p>
        </div>

        {/* OTP Input Fields */}
        <motion.div
          className={styles.otpContainer}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <label className={styles.label}>Enter 6-digit code</label>
          <div className={styles.otpInputs}>
            {otp.map((digit, index) => (
              <motion.input
                key={index}
                ref={(el) => (inputRefs.current[index] = el)}
                type="text"
                inputMode="numeric"
                maxLength="1"
                value={digit}
                onChange={(e) => handleOtpChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className={`${styles.otpInput} ${error ? styles.invalid : ''} ${digit ? styles.filled : ''}`}
                disabled={loading}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                autoFocus={index === 0}
              />
            ))}
          </div>
        </motion.div>

        {/* Error Message */}
        {error && (
          <motion.div
            className={styles.errorMessage}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {error}
          </motion.div>
        )}

        {/* Success Message */}
        {otpSent && (
          <motion.div
            className={styles.successMessage}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            ✓ OTP sent successfully!
          </motion.div>
        )}

        {/* Verify Button */}
        <motion.button
          className={styles.verifyBtn}
          onClick={handleVerifyOtp}
          disabled={!otpFilled || loading}
          whileHover={!loading && otpFilled ? { scale: 1.02 } : {}}
          whileTap={!loading && otpFilled ? { scale: 0.98 } : {}}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {loading ? (
            <>
              <LoadingSpinner />
              Verifying...
            </>
          ) : (
            'Verify & Continue'
          )}
        </motion.button>

        {/* Resend OTP Section */}
        <div className={styles.resendSection}>
          <p>Didn't receive the code?</p>
          <motion.button
            className={styles.resendBtn}
            onClick={handleResendOtp}
            disabled={resendCountdown > 0 || loading}
            whileHover={resendCountdown === 0 && !loading ? { scale: 1.05 } : {}}
            whileTap={resendCountdown === 0 && !loading ? { scale: 0.95 } : {}}
          >
            {resendCountdown > 0
              ? `Resend in ${resendCountdown}s`
              : 'Resend Code'}
          </motion.button>
        </div>

        {/* Help Text */}
        <div className={styles.helpText}>
          <p>Check your spam folder if you don't see the email</p>
        </div>
      </motion.div>
    </motion.div>
  );
}
