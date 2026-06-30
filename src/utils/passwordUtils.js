/**
 * Password utilities for strength calculation and validation
 */

/**
 * Calculate password strength
 * Weak: < 6 chars
 * Fair: >= 6 chars
 * Good: >= 8 chars + has number or special char
 * Strong: >= 10 chars + has uppercase + number + special char
 * 
 * @param {string} password - Password to evaluate
 * @returns {object} { strength: 'weak'|'fair'|'good'|'strong', level: 1-4 }
 */
export const calculatePasswordStrength = (password) => {
  if (!password) return { strength: 'weak', level: 0 };
  
  const length = password.length;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
  
  // Weak: less than 6 characters
  if (length < 6) {
    return { strength: 'weak', level: 1, color: '#E02424' };
  }
  
  // Fair: 6-7 characters
  if (length < 8) {
    return { strength: 'fair', level: 2, color: '#F59E0B' };
  }
  
  // Good: 8+ chars AND (number OR special char)
  if ((hasNumber || hasSpecialChar) && length >= 8) {
    return { strength: 'good', level: 3, color: '#1A56DB' };
  }
  
  // Strong: 10+ chars AND uppercase AND number AND special char
  if (length >= 10 && hasUpperCase && hasNumber && hasSpecialChar) {
    return { strength: 'strong', level: 4, color: '#0E9F6E' };
  }
  
  // Default to fair if length >= 8
  return { strength: 'fair', level: 2, color: '#F59E0B' };
};

/**
 * Validate password meets minimum requirements
 * @param {string} password - Password to validate
 * @returns {boolean} Whether password is valid (min 8 characters)
 */
export const validatePassword = (password) => {
  return password && password.length >= 8;
};

/**
 * Check if two passwords match
 * @param {string} password - First password
 * @param {string} confirmPassword - Second password to compare
 * @returns {boolean} Whether passwords match
 */
export const passwordsMatch = (password, confirmPassword) => {
  return password === confirmPassword && password.length > 0;
};

/**
 * Get password strength label for display
 * @param {string} password - Password to evaluate
 * @returns {string} Strength label ('Weak', 'Fair', 'Good', 'Strong')
 */
export const getPasswordStrengthLabel = (password) => {
  const { strength } = calculatePasswordStrength(password);
  return strength.charAt(0).toUpperCase() + strength.slice(1);
};
