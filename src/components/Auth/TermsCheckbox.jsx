import { FaCheck } from 'react-icons/fa';
import styles from './TermsCheckbox.module.css';

/**
 * TermsCheckbox - Custom checkbox with clickable policy links
 */
export default function TermsCheckbox({
  checked,
  onChange,
  onTermsClick,
  onPrivacyClick,
  error,
  disabled = false,
  required = false,
}) {
  const handleCheckboxChange = (e) => {
    if (onChange) {
      onChange(e.target.checked);
    }
  };

  return (
    <div className={styles.checkboxWrapper}>
      <div className={styles.checkboxContainer}>
        <input
          type="checkbox"
          id="terms-checkbox"
          checked={checked}
          onChange={handleCheckboxChange}
          disabled={disabled}
          className={styles.hiddenCheckbox}
          aria-describedby="terms-description"
          aria-invalid={!!error}
        />

        <label htmlFor="terms-checkbox" className={styles.label}>
          <div className={`${styles.customCheckbox} ${checked ? styles.checked : ''}`}>
            {checked && <FaCheck className={styles.checkIcon} />}
          </div>

          <span className={styles.labelText}>
            I agree to the{' '}
            <button
              type="button"
              onClick={onTermsClick}
              className={styles.link}
              disabled={disabled}
            >
              Terms & Conditions
            </button>
            {' '}and{' '}
            <button
              type="button"
              onClick={onPrivacyClick}
              className={styles.link}
              disabled={disabled}
            >
              Privacy Policy
            </button>
          </span>
        </label>
      </div>

      {error && (
        <p id="terms-description" className={styles.errorMessage} role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
