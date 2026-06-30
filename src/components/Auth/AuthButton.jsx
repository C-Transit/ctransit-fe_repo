import { FaSpinner } from 'react-icons/fa';
import styles from './AuthButton.module.css';

/**
 * AuthButton - Reusable button for auth forms
 */
export default function AuthButton({
  type = 'submit',
  variant = 'primary',
  children,
  isLoading = false,
  disabled = false,
  onClick,
  fullWidth = true,
  ariaLabel,
  className,
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || isLoading}
      className={`${styles.button} ${styles[variant]} ${fullWidth ? styles.fullWidth : ''} ${className || ''}`}
      aria-label={ariaLabel || children}
      aria-busy={isLoading}
    >
      {isLoading ? (
        <>
          <FaSpinner className={styles.spinner} />
          <span>Please wait...</span>
        </>
      ) : (
        children
      )}
    </button>
  );
}
