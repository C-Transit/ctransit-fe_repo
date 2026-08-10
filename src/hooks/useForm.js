import { useState, useCallback } from "react";
import {
  validateEmail,
  validatePassword,
  validateFullName,
  passwordsMatch,
} from "../utils/validation";

/**
 * Custom hook for form validation and state management
 *
 * Features:
 * - Field-level validation
 * - Real-time error clearing
 * - Validation rules customization
 * - Form submission prevention on errors
 *
 * Usage:
 * const { values, errors, touched, handleChange, handleBlur, setValues, clearErrors } = useForm({
 *   initialValues: { email: '', password: '' },
 *   validationRules: {
 *     email: (value) => validateEmail(value) ? null : 'Invalid email',
 *     password: (value) => validatePassword(value) ? null : 'Password must be 8+ chars with uppercase, lowercase, and number',
 *   },
 * });
 */
export const useForm = ({ initialValues = {}, validationRules = {} } = {}) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const validateField = useCallback(
    (name, value) => {
      if (!validationRules[name]) {
        return null;
      }

      const rule = validationRules[name];
      if (typeof rule === "function") {
        return rule(value);
      }

      return null;
    },
    [validationRules],
  );

  const handleChange = useCallback(
    (e) => {
      const { name, value, type, checked } = e.target;
      const newValue = type === "checkbox" ? checked : value;

      setValues((prev) => ({
        ...prev,
        [name]: newValue,
      }));

      // Clear error when user starts typing
      if (errors[name]) {
        setErrors((prev) => ({
          ...prev,
          [name]: null,
        }));
      }
    },
    [errors],
  );

  const handleBlur = useCallback(
    (e) => {
      const { name } = e.target;
      const value = values[name];

      setTouched((prev) => ({
        ...prev,
        [name]: true,
      }));

      // Validate on blur
      const error = validateField(name, value);
      if (error) {
        setErrors((prev) => ({
          ...prev,
          [name]: error,
        }));
      }
    },
    [values, validateField],
  );

  const validateForm = useCallback(() => {
    const newErrors = {};

    Object.keys(validationRules).forEach((fieldName) => {
      const error = validateField(fieldName, values[fieldName]);
      if (error) {
        newErrors[fieldName] = error;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [validationRules, values, validateField]);

  const clearErrors = useCallback(() => {
    setErrors({});
  }, []);

  const resetForm = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
  }, [initialValues]);

  return {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    setValues,
    clearErrors,
    validateForm,
    resetForm,
  };
};

export default useForm;
