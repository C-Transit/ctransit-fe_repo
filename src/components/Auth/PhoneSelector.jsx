import { useState } from 'react';
import { FaChevronDown } from 'react-icons/fa';
import { formatPhoneNumber, COUNTRY_CODES, getCountryByCode } from '../../utils/phoneUtils';
import styles from './PhoneSelector.module.css';

/**
 * PhoneSelector - Country code selector + phone number input
 */
export default function PhoneSelector({
  countryCode = '+234',
  phoneNumber = '',
  onChange,
  onCountryChange,
  error,
  disabled = false,
  required = false,
  ariaLabel,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const currentCountry = getCountryByCode(countryCode);

  const handleCountrySelect = (code) => {
    setIsOpen(false);
    if (onCountryChange) {
      onCountryChange(code);
    }
  };

  const handlePhoneChange = (e) => {
    const value = e.target.value;
    const digits = value.replace(/\D/g, '');
    const formatted = formatPhoneNumber(digits, countryCode);
    
    if (onChange) {
      onChange({
        countryCode,
        phoneNumber: digits,
        displayNumber: formatted,
      });
    }
  };

  const inputId = 'phone-number';
  const errorId = error ? `${inputId}-error` : undefined;

  return (
    <div className={styles.fieldWrapper}>
      <label className={styles.label}>
        Phone Number
        {required && <span className={styles.required}>*</span>}
      </label>

      <div className={styles.phoneInputBox}>
        {/* Country Code Selector */}
        <div className={styles.countrySelector}>
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className={styles.countryButton}
            disabled={disabled}
            aria-haspopup="listbox"
            aria-expanded={isOpen}
            aria-label="Select country code"
          >
            <span className={styles.flag}>{currentCountry.flag}</span>
            <span className={styles.code}>{currentCountry.code}</span>
            <FaChevronDown className={`${styles.chevron} ${isOpen ? styles.open : ''}`} />
          </button>

          {isOpen && (
            <div className={styles.dropdown} role="listbox">
              {COUNTRY_CODES.map((country) => (
                <button
                  key={country.code}
                  type="button"
                  onClick={() => handleCountrySelect(country.code)}
                  className={`${styles.option} ${countryCode === country.code ? styles.selected : ''}`}
                  role="option"
                  aria-selected={countryCode === country.code}
                >
                  <span className={styles.flag}>{country.flag}</span>
                  <span className={styles.label}>{country.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Phone Number Input */}
        <input
          id={inputId}
          type="tel"
          inputMode="numeric"
          placeholder="800 123 4567"
          value={formatPhoneNumber(phoneNumber, countryCode)}
          onChange={handlePhoneChange}
          disabled={disabled}
          className={`${styles.input} ${error ? styles.errorInput : ''}`}
          aria-label={ariaLabel || 'Phone number'}
          aria-describedby={errorId}
          aria-invalid={!!error}
        />
      </div>

      {error && (
        <p id={errorId} className={styles.errorMessage} role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
