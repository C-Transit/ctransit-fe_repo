import styles from './InputField.module.css';

/**
 * InputField - Reusable input component with label, error state, and focus styling
 */
export default function InputField({
  label,
  placeholder,
  name,
  type = 'text',
  value,
  onChange,
  onBlur,
  error,
  disabled = false,
  autoComplete,
  inputMode,
  required = false,
  ariaLabel,
  ariaDescribedBy,
}) {
  const inputId = `input-${label?.replace(/\s+/g, '-').toLowerCase()}`;
  const errorId = error ? `${inputId}-error` : undefined;

  return (
    <div className={styles.fieldWrapper}>
      {label && (
        <label htmlFor={inputId} className={styles.label}>
          {label}
          {required && <span className={styles.required}>*</span>}
        </label>
      )}
      
      <input
        id={inputId}
        name={name}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        disabled={disabled}
        autoComplete={autoComplete}
        inputMode={inputMode}
        className={`${styles.input} ${error ? styles.errorInput : ''}`}
        aria-label={ariaLabel || label}
        aria-describedby={ariaDescribedBy || errorId}
        aria-invalid={!!error}
      />

      {error && (
        <p id={errorId} className={styles.errorMessage} role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
