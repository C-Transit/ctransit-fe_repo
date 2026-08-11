import { useState } from 'react';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import styles from './PasswordInput.module.css';

/**
 * PasswordInput - Password field with show/hide toggle
 */
export default function PasswordInput({
  label,
  placeholder,
  name,
  value,
  onChange,
  onBlur,
  error,
  disabled = false,
  showStrengthMeter = false,
  strengthLevel = 0,
  strengthLabel = '',
  required = false,
  autoComplete = 'password',
  ariaLabel,
  ariaDescribedBy,
}) {
  const [showPassword, setShowPassword] = useState(false);
  const inputId = `password-${label?.replace(/\s+/g, '-').toLowerCase()}`;
  const errorId = error ? `${inputId}-error` : undefined;

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className={styles.fieldWrapper}>
      {label && (
        <label htmlFor={inputId} className={styles.label}>
          {label}
          {required && <span className={styles.required}>*</span>}
        </label>
      )}

      <div className={styles.passwordInputBox}>
        <input
          id={inputId}
          name={name}
          type={showPassword ? 'text' : 'password'}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          disabled={disabled}
          autoComplete={autoComplete}
          className={`${styles.input} ${error ? styles.errorInput : ''}`}
          aria-label={ariaLabel || label}
          aria-describedby={ariaDescribedBy || errorId}
          aria-invalid={!!error}
        />

        <button
          type="button"
          onClick={togglePasswordVisibility}
          className={styles.toggleButton}
          aria-label={showPassword ? 'Hide password' : 'Show password'}
          tabIndex={0}
        >
          {showPassword ? (
            <FaEyeSlash className={styles.icon} />
          ) : (
            <FaEye className={styles.icon} />
          )}
        </button>
      </div>

      {showStrengthMeter && (
        <div className={styles.strengthMeterBox}>
          <div className={styles.strengthBar}>
            <div
              className={`${styles.strengthFill} ${styles[`level${strengthLevel}`]}`}
              style={{
                width: `${(strengthLevel / 4) * 100}%`,
              }}
            ></div>
          </div>
          {strengthLabel && (
            <span className={`${styles.strengthLabel} ${styles[`text${strengthLevel}`]}`}>
              {strengthLabel}
            </span>
          )}
        </div>
      )}

      {error && (
        <p id={errorId} className={styles.errorMessage} role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
