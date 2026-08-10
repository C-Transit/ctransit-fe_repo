import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import SharedAuthLayout from '../components/Auth/SharedAuthLayout';
import InputField from '../components/Auth/InputField';
import OTPInput from '../components/Auth/OTPInput';
import AuthButton from '../components/Auth/AuthButton';
import { validateEmail } from '../utils/validation';
import styles from './ResetPassword.page.module.css';

/**
 * Complete Forgot & Reset Password Flow - 3-Step Single Page Wizard
 * Step 1: Input Email & Request Code
 * Step 2: Input & Validate OTP Code Locally
 * Step 3: Input New Passwords & Submit to Backend
 */
export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const { forgotPassword, resetPassword, isLoading } = useContext(AuthContext);

  // Wizard tracking states: 'input_email' | 'verify_otp' | 'change_password'
  const [currentStep, setCurrentStep] = useState('input_email'); 
  
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [toasts, setToasts] = useState([]);

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

  // --- STEP 1: Requesting the Code ---
  const handleRequestCode = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) {
      setError('Email address is required.');
      return;
    }

    if (!validateEmail(email.trim())) {
      setError('Please enter a valid institutional email address.');
      return;
    }

    const result = await forgotPassword(email.trim());

    if (result.success) {
      addToast('Verification code sent to your email!', 'success');
      setCurrentStep('verify_otp'); // Advance to OTP step
    } else {
      setError(result.error || 'Failed to send reset code. Please try again.');
    }
  };

  // --- STEP 2: Confirming Code Locally ---
  const handleVerifyCodeStep = (e) => {
    e.preventDefault();
    setError('');

    const otpCode = otp.join('');
    if (otpCode.length !== 6) {
      setError('Please enter the complete 6-digit code.');
      return;
    }

    // Advance to password creation step
    setCurrentStep('change_password');
    addToast('Code checked! Please set your new password.', 'success');
  };
// --- STEP 3: Submitting everything to backend ---
  const handleSubmitFinalReset = async (e) => {
    e.preventDefault();
    setError('');

    const otpCode = otp.join('');
    const sanitizedEmail = email.trim().toLowerCase();


    if (!newPassword || newPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    // Call context handler
    const result = await resetPassword(sanitizedEmail, otpCode, newPassword);



    if (result.success) {
      addToast('Password updated successfully!', 'success');
      setTimeout(() => {
        navigate('/auth/login', { replace: true });
      }, 1500);
    } else {
    
      setError(result.error || 'Reset failed. Your verification code may be invalid or expired.');
      setCurrentStep('verify_otp'); 
    }
  };

  const handleBack = () => {
    setError('');
    if (currentStep === 'change_password') {
      setCurrentStep('verify_otp');
    } else if (currentStep === 'verify_otp') {
      setCurrentStep('input_email');
    } else {
      navigate('/auth/login');
    }
  };

  // Dynamic layout definitions based on step state
  const getLayoutDetails = () => {
    switch (currentStep) {
      case 'verify_otp':
        return {
          title: "Verify Reset Code",
          subtitle: `Enter the 6-digit security code sent to ${email}`
        };
      case 'change_password':
        return {
          title: "Create New Password",
          subtitle: "Please secure your account with a fresh password"
        };
      case 'input_email':
      default:
        return {
          title: "Forgot Password?",
          subtitle: "Enter your institutional email to begin the reset process"
        };
    }
  };

  const layoutDetails = getLayoutDetails();

  return (
    <SharedAuthLayout title={layoutDetails.title} subtitle={layoutDetails.subtitle}>
      <div className={styles.container}>
        {error && <div className={styles.errorMessage}>{error}</div>}

        {/* 🛠️ STEP 1: Email Request View */}
        {currentStep === 'input_email' && (
          <form onSubmit={handleRequestCode} className={styles.form}>
            <InputField
              label="Email Address"
              placeholder="student@st.futminna.edu"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (error) setError('');
              }}
              required
              inputMode="email"
              autoComplete="email"
              disabled={isLoading}
            />
            <AuthButton type="submit" isLoading={isLoading} disabled={isLoading}>
              Send Reset Code
            </AuthButton>
          </form>
        )}

        {/* 🛠️ STEP 2: Input Verification Code View */}
        {currentStep === 'verify_otp' && (
          <form onSubmit={handleVerifyCodeStep} className={styles.form}>
            <div className={styles.otpGroup}>
              <label className={styles.label}>Enter 6-Digit OTP</label>
              <OTPInput
                otp={otp}
                onChange={handleOtpChange}
                disabled={isLoading}
              />
            </div>
            <AuthButton type="submit" disabled={isLoading || otp.some(digit => digit === '')}>
              Verify Code
            </AuthButton>
          </form>
        )}

        {/* 🛠️ STEP 3: Changing Password View */}
        {currentStep === 'change_password' && (
          <form onSubmit={handleSubmitFinalReset} className={styles.form}>
            <InputField
              label="New Password"
              type="password"
              placeholder="••••••••"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              disabled={isLoading}
            />
            <InputField
              label="Confirm New Password"
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              disabled={isLoading}
            />
            <AuthButton type="submit" isLoading={isLoading} disabled={isLoading}>
              Update Password
            </AuthButton>
          </form>
        )}

        <button
          type="button"
          onClick={handleBack}
          className={styles.backButton}
          disabled={isLoading}
        >
          &larr; {
            currentStep === 'change_password' ? "Back to OTP" : 
            currentStep === 'verify_otp' ? "Change Email" : "Back to Login"
          }
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