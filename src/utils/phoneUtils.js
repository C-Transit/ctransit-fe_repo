/**
 * Phone number utilities for formatting, validation, and country code handling
 */

export const COUNTRY_CODES = [
  { code: '+234', country: 'Nigeria', flag: '🇳🇬', label: 'NG +234' },
  { code: '+233', country: 'Ghana', flag: '🇬🇭', label: 'GH +233' },
  { code: '+254', country: 'Kenya', flag: '🇰🇪', label: 'KE +254' },
  { code: '+27', country: 'South Africa', flag: '🇿🇦', label: 'ZA +27' },
  { code: '+44', country: 'United Kingdom', flag: '🇬🇧', label: 'GB +44' },
  { code: '+1', country: 'United States', flag: '🇺🇸', label: 'US +1' },
];

/**
 * Format phone number with country code
 * @param {string} phoneNumber - Raw phone number digits
 * @param {string} countryCode - Country code (e.g., '+234')
 * @returns {string} Formatted phone number (e.g., '+234 800 123 4567')
 */
export const formatPhoneNumber = (phoneNumber, countryCode = '+234') => {
  // Remove all non-digits
  const digits = phoneNumber.replace(/\D/g, '');
  
  // Format based on country code
  if (countryCode === '+234' || countryCode === '+233' || countryCode === '+254') {
    // African format: +234 XXX XXX XXXX
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `${digits.slice(0, 3)} ${digits.slice(3)}`;
    return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6, 10)}`;
  } else if (countryCode === '+27') {
    // South Africa: +27 XX XXX XXXX
    if (digits.length <= 2) return digits;
    if (digits.length <= 5) return `${digits.slice(0, 2)} ${digits.slice(2)}`;
    return `${digits.slice(0, 2)} ${digits.slice(2, 5)} ${digits.slice(5, 9)}`;
  } else {
    // Default US format: +1 (XXX) XXX-XXXX
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
  }
};

/**
 * Validate phone number
 * @param {string} phoneNumber - Phone number to validate (digits only)
 * @returns {boolean} Whether phone number is valid (min 10 digits)
 */
export const validatePhoneNumber = (phoneNumber) => {
  const digits = phoneNumber.replace(/\D/g, '');
  return digits.length >= 10;
};

/**
 * Get country code object by code
 * @param {string} code - Country code (e.g., '+234')
 * @returns {object} Country code object
 */
export const getCountryByCode = (code) => {
  return COUNTRY_CODES.find(c => c.code === code) || COUNTRY_CODES[0]; // Default to Nigeria
};

/**
 * Combine country code with phone number
 * @param {string} countryCode - Country code
 * @param {string} phoneNumber - Phone number digits
 * @returns {string} Full phone number with country code
 */
export const combinePhoneNumber = (countryCode, phoneNumber) => {
  const digits = phoneNumber.replace(/\D/g, '');
  return `${countryCode} ${formatPhoneNumber(digits, countryCode)}`;
};
