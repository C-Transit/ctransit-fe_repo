import { useRef, useEffect, useState } from 'react';
import styles from './OTPInput.module.css';

/**
 * OTPInput - 6-digit OTP input with auto-focus and paste support
 */
export default function OTPInput({
  otp,
  onChange,
  error,
  disabled = false,
  onComplete,
}) {
  const inputRefs = useRef([]);
  const [shaking, setShaking] = useState(false);

  useEffect(() => {
    // Auto-focus first input on mount
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  useEffect(() => {
    // Trigger onComplete callback when all 6 digits are filled
    if (otp.length === 6 && otp.every(digit => digit !== '')) {
      if (onComplete) {
        onComplete(otp.join(''));
      }
    }
  }, [otp, onComplete]);

  const handleChange = (index, value) => {
    // Only allow numbers
    const numValue = value.replace(/[^0-9]/g, '');

    if (numValue.length > 1) return;

    const newOtp = [...otp];
    newOtp[index] = numValue;
    onChange(newOtp);

    // Auto-focus to next field
    if (numValue && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    // Backspace: move to previous field
    if (e.key === 'Backspace') {
      if (!otp[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    }

  
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text');
    const digits = pastedData.replace(/[^0-9]/g, '').slice(0, 6);

    if (digits.length > 0) {
      const newOtp = digits.split('').concat(Array(6 - digits.length).fill(''));
      onChange(newOtp);

      // Focus on the last filled field
      const lastFilledIndex = Math.min(digits.length, 5);
      setTimeout(() => {
        inputRefs.current[lastFilledIndex]?.focus();
      }, 0);
    }
  };

  const triggerShake = () => {
    setShaking(true);
    setTimeout(() => setShaking(false), 500);
  };

  // Trigger shake animation on error change
  useEffect(() => {
    if (error) {
      triggerShake();
    }
  }, [error]);

  return (
    <div className={styles.otpWrapper}>
      <div className={`${styles.otpContainer} ${shaking ? styles.shake : ''} ${error ? styles.errorState : ''}`} onPaste={handlePaste}>
        {otp.map((digit, index) => (
          <input
            key={index}
            ref={(el) => (inputRefs.current[index] = el)}
            type="number"
            inputMode="numeric"
            min="0"
            max="9"
            value={digit}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            disabled={disabled}
            className={`${styles.otpBox} ${digit ? styles.filled : ''} ${error ? styles.errorBox : ''}`}
            aria-label={`Digit ${index + 1} of 6`}
            autoComplete="off"
          />
        ))}
      </div>

      {error && (
        <p className={styles.errorMessage} role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
