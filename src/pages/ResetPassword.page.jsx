import { useState, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import SharedAuthLayout from '../components/Auth/SharedAuthLayout';
import OTPInput from '../components/Auth/OTPInput';
import PasswordInput from '../components/Auth/PasswordInput';
import AuthButton from '../components/Auth/AuthButton';
import { calculatePasswordStrength, getPasswordStrengthLabel } from '../utils/passwordUtils';
import styles from './ResetPassword.page.module.css';

/**
 * Reset Password Screen - Two part flow
 * Part 1: OTP verification (6-digit code)
 * Part 2: New password fields
 * Route: /auth/reset-password
 */
export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { resetPassword, isLoading } = useContext(AuthContext);

  const emailOrPhone = location.state?.emailOrPhone || '';
  const [part, setPart] = useState('otp'); // 'otp' or 'password'
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [otpError, setOtpError] = useState('');
  const [passwordData, setPasswordData] = useState({
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordErrors, setPasswordErrors] = useState({});
  const [toasts, setToasts] = useState([]);
  const [passwordStrength, setPasswordStrength] = useState({ strength: 'weak', level: 0 });

  const addToast = (message, type = 'info') => {
    const id = Math.random();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3500);
  };

  // ============ PART 1: OTP Verification ============

  const handleOtpChange = (newOtp) => {
    setOtp(newOtp);
    if (otpError) setOtpError('');
  };

  const handleVerifyOTP = async () => {
    const otpCode = otp.join('');

    if (otpCode.length !== 6) {
      setOtpError('Please enter all 6 digits');
      return;
    }

    // In real app, verify OTP first
    // For now, just move to password part
    setPart('password');
    addToast('OTP verified successfully', 'success');
  };

  // ============ PART 2: New Password ============

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value,
    }));

    // Update password strength
    if (name === 'newPassword') {
      const strength = calculatePasswordStrength(value);
      setPasswordStrength(strength);
    }

    // Clear error
    if (passwordErrors[name]) {
      setPasswordErrors(prev => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const validatePassword = () => {
    const newErrors = {};

    if (!passwordData.newPassword) {
      newErrors.newPassword = 'New password is required';
    } else if (passwordData.newPassword.length < 8) {
      newErrors.newPassword = 'Password must be at least 8 characters';
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setPasswordErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleResetPassword = async () => {
    if (!validatePassword()) return;

    const otpCode = otp.join('');
    const result = await resetPassword(emailOrPhone, otpCode, passwordData.newPassword);

    if (result.success) {
      addToast('Password reset successfully!', 'success');
      setTimeout(() => {
        navigate('/auth/login');
      }, 1500);
    } else {
      addToast(result.error || 'Failed to reset password. Please try again.', 'error');
    }
  };

  const handleBack = () => {
    if (part === 'password') {
      setPart('otp');
    } else {
      navigate('/auth/forgot-password');
    }
  };

  // ============ PART 1: OTP Input ============
  if (part === 'otp') {
    return (
      <SharedAuthLayout
        title="Enter Reset Code"
        subtitle={`Enter the 6-digit code sent to ${emailOrPhone}`}
      >
        <div className={styles.container}>
          <OTPInput
            otp={otp}
            onChange={handleOtpChange}
            error={otpError}
            demoOTP="654321"
            disabled={isLoading}
          />

          <AuthButton
            type="button"
            onClick={handleVerifyOTP}
            isLoading={isLoading}
            disabled={isLoading || otp.some(digit => digit === '')}
          >
            Verify Code
          </AuthButton>

          <button
            type="button"
            onClick={handleBack}
            className={styles.backButton}
            disabled={isLoading}
          >
            ← Back
          </button>
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

  // ============ PART 2: New Password Fields ============
  return (
    <SharedAuthLayout
      title="Create New Password"
      subtitle="Enter your new password"
    >
      <form onSubmit={(e) => { e.preventDefault(); handleResetPassword(); }} className={styles.form}>
        <PasswordInput
          label="New Password"
          placeholder="Create a strong password"
          name="newPassword"
          value={passwordData.newPassword}
          onChange={handlePasswordChange}
          error={passwordErrors.newPassword}
          required
          showStrengthMeter
          strengthLevel={passwordStrength.level}
          strengthLabel={getPasswordStrengthLabel(passwordData.newPassword)}
          autoComplete="new-password"
        />

        <PasswordInput
          label="Confirm Password"
          placeholder="Re-enter your password"
          name="confirmPassword"
          value={passwordData.confirmPassword}
          onChange={handlePasswordChange}
          error={passwordErrors.confirmPassword}
          required
          autoComplete="new-password"
        />

        <AuthButton
          type="submit"
          isLoading={isLoading}
          disabled={isLoading}
        >
          Reset Password
        </AuthButton>

        <button
          type="button"
          onClick={handleBack}
          className={styles.backButton}
          disabled={isLoading}
        >
          ← Back
        </button>
      </form>

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
