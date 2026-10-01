// Email validation
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Password validation - requires min 8 chars, 1 uppercase, 1 lowercase, 1 number
export const validatePassword = (password) => {
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)\S{8,}$/;
  return passwordRegex.test(password);
};

// Password strength calculation
export const getPasswordStrength = (password) => {
  if (!password) return 0;

  let strength = 0;

  // Length check
  if (password.length >= 8) strength += 1;
  if (password.length >= 12) strength += 1;

  // Character variety
  if (/[a-z]/.test(password)) strength += 1;
  if (/[A-Z]/.test(password)) strength += 1;
  if (/\d/.test(password)) strength += 1;
  if (/[@$!%*?&]/.test(password)) strength += 1;

  return Math.min(strength, 5); // Return 0-5
};

// Get strength label
export const getStrengthLabel = (strength) => {
  if (strength <= 1) return "Weak";
  if (strength <= 2) return "Fair";
  if (strength <= 3) return "Good";
  if (strength <= 4) return "Strong";
  return "Very Strong";
};

// Full name validation
export const validateFullName = (name) => {
  return name.trim().length >= 2;
};

// Password match check
export const passwordsMatch = (password, confirmPassword) => {
  return password === confirmPassword && password.length > 0;
};

// Sanitize input to prevent XSS
export const sanitizeInput = (input) => {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
};
