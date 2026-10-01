import { useState, useEffect, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import SharedAuthLayout from '../components/Auth/SharedAuthLayout';
import OTPInput from '../components/Auth/OTPInput';
import AuthButton from '../components/Auth/AuthButton';
import styles from './VerifyPhone.page.module.css'; // You can rename this file to VerifyOtp.page.module.css later if needed

export default function VerifyOtpPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { verifyOTP, resendOTP, isLoading } = useContext(AuthContext);

  // Strictly look for email passed from registration router state
  const email = location.state?.email || '';
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [resendCountdown, setResendCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [toasts, setToasts] = useState([]);

  // Fail-safe protection: If no email was routed, reject the view
  useEffect(() => {
    if (!email) {
      setError('Session context lost. Please return to the registration screen.');
    }
  }, [email]);

  // Countdown timer logic
  useEffect(() => {
    if (resendCountdown <= 0) {
      setCanResend(true);
      return;
    }

    const timer = setInterval(() => {
      setResendCountdown(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [resendCountdown]);

  const addToast = (message, type = 'info') => {
    const id = Math.random();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3500);
  };

  const handleOtpChange = (newOtp) => {
    setOtp(newOtp);
    if (error) setError('');
  };

  const handleVerify = async () => {
    const otpCode = otp.join('');

    if (!email) {
      setError('Unable to verify: Missing email context.');
      return;
    }

    if (otpCode.length !== 6) {
      setError('Please enter all 6 digits');
      return;
    }

    const result = await verifyOTP(email, otpCode);

    if (result.success) {
      addToast('OTP verified successfully!', 'success');
      setTimeout(() => {
        navigate('/login');
      }, 800);
    } else {
      setError(result.error || 'Invalid OTP. Please try again.');
    }
  };

  const handleResendCode = async () => {
    if (!email) {
      addToast('Cannot request code: Missing user details', 'error');
      return;
    }

    const result = await resendOTP(email);

    if (result.success) {
      setCanResend(false);
      setResendCountdown(60);
      addToast('Code resent successfully', 'success');
    } else {
      addToast(result.error || 'Failed to resend code. Please try again.', 'error');
    }
  };

  const handleBack = () => {
    navigate('/auth/register');
  };

  const formatCountdown = () => {
    const minutes = Math.floor(resendCountdown / 60);
    const seconds = resendCountdown % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <SharedAuthLayout
      title="Verify Your One-Time Code"
      subtitle={`Enter the 6-digit code sent to ${email || 'your email'}`}
    >
      <div className={styles.container}>
        <OTPInput
          otp={otp}
          onChange={handleOtpChange}
          error={error}
          disabled={isLoading || !email}
        />

        <div className={styles.resendSection}>
          {canResend ? (
            <button
              type="button"
              onClick={handleResendCode}
              className={styles.resendLink}
              disabled={isLoading || !email}
            >
              Resend Code
            </button>
          ) : (
            <p className={styles.countdown}>
              Resend code in {formatCountdown()}
            </p>
          )}
        </div>

        <div className={styles.actionContainer}>
          <AuthButton
            type="button"
            onClick={handleVerify}
            isLoading={isLoading}
            disabled={isLoading || !email || otp.some(digit => digit === '')}
          >
            Verify
          </AuthButton>

          <button
            type="button"
            onClick={handleBack}
            className={styles.backButton}
            disabled={isLoading}
          >
            &larr; Back
          </button>
        </div>
      </div>

      {toasts.length > 0 && (
        <div className={styles.toastContainer}>
          {toasts.map(toast => (
            <div key={toast.id} className={`${styles.toast} ${styles[toast.type]}`}>
              {toast.message}
            </div>
          ))}
        </div>
      )}
    </SharedAuthLayout>
  );
}