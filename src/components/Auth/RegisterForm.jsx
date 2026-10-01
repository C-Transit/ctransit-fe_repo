import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { EmailIcon, LockIcon, EyeIcon, EyeOffIcon, LoadingSpinner } from '../AnimatedIcons';
import OTPVerification from './OTPVerification';
import {
  validateEmail,
  validatePassword,
  validateFullName,
  passwordsMatch,
  getPasswordStrength,
} from '../../utils/validation';
import { AUTH_API_URL } from '../../config/api';
import styles from './RegisterForm.module.css';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: 'easeOut' },
  },
};

export default function RegisterForm() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstname: '',
    lastname: '',
    email: '',
    matricNumber: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showOTPModal, setShowOTPModal] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [passwordStrength, setPasswordStrength] = useState('weak');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (name === 'password') {
      const strength = getPasswordStrength(value);
      setPasswordStrength(strength);
    }

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.firstname.trim()) {
      newErrors.firstname = 'First name is required';
    } else if (!validateFullName(formData.firstname)) {
      newErrors.firstname = 'Invalid first name';
    }

    if (!formData.lastname.trim()) {
      newErrors.lastname = 'Last name is required';
    } else if (!validateFullName(formData.lastname)) {
      newErrors.lastname = 'Invalid last name';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Invalid email';
    }

    if (!formData.matricNumber.trim()) {
      newErrors.matricNumber = 'Matric number is required';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (!validatePassword(formData.password)) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Confirm password';
    } else if (!passwordsMatch(formData.password, formData.confirmPassword)) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // BACKEND: POST /api/auth/register
      // Expected response: { success: true, message: "OTP sent to your email" }
      // Backend should send OTP to user's email
      const response = await axios.post(`${AUTH_API_URL}/register`, {
        firstname: formData.firstname.trim(),
        lastname: formData.lastname.trim(),
        email: formData.email.trim(),
        matricNumber: formData.matricNumber.trim(),
        password: formData.password,
      });

      // Store email and show OTP modal
      setUserEmail(formData.email.trim());
      setShowOTPModal(true);
    } catch (error) {
      if (error.response?.data?.message) {
        setErrors({ form: error.response.data.message });
      } else {
        setErrors({ form: 'Registration failed. Please try again.' });
      }
      console.error('Registration error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStrengthColor = () => {
    switch (passwordStrength) {
      case 'strong':
        return '#22c55e';
      case 'medium':
        return '#f59e0b';
      default:
        return '#ef4444';
    }
  };

  // Handle successful OTP verification
  const handleOTPSuccess = (data) => {
    // BACKEND RESPONSE from verify-otp:
    // { token: "jwt_token", user: { firstname, lastname, email, matricNumber } }

    // After email verification, route the user back to login so they can sign in normally.
    sessionStorage.setItem('authSuccessMessage', 'Email verified successfully. Please sign in to continue.');
    setShowOTPModal(false);
    
    // Clear form
    setFormData({
      firstname: '',
      lastname: '',
      email: '',
      matricNumber: '',
      password: '',
      confirmPassword: '',
    });

    // Redirect to login page after verification success.
    setTimeout(() => {
      navigate('/login', { replace: true });
    }, 500);
  };

  return (
    <>
      <motion.form
        className={styles.form}
        onSubmit={handleSubmit}
        noValidate
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className={styles.nameRow}>
          <motion.div className={styles.formGroup} variants={itemVariants}>
            <label htmlFor="firstname" className={styles.label}>
              First Name
            </label>
            <motion.input
              id="firstname"
              type="text"
              name="firstname"
              placeholder="First name"
              value={formData.firstname}
              onChange={handleChange}
              className={`${styles.input} ${errors.firstname ? styles.invalid : ''}`}
              disabled={loading}
            />
            {errors.firstname && (
              <motion.span className={styles.errorText} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                {errors.firstname}
              </motion.span>
            )}
          </motion.div>

          <motion.div className={styles.formGroup} variants={itemVariants}>
            <label htmlFor="lastname" className={styles.label}>
              Last Name
            </label>
            <motion.input
              id="lastname"
              type="text"
              name="lastname"
              placeholder="Last name"
              value={formData.lastname}
              onChange={handleChange}
              className={`${styles.input} ${errors.lastname ? styles.invalid : ''}`}
              disabled={loading}
            />
            {errors.lastname && (
              <motion.span className={styles.errorText} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                {errors.lastname}
              </motion.span>
            )}
          </motion.div>
        </div>

        <motion.div className={styles.formGroup} variants={itemVariants}>
          <label htmlFor="email" className={styles.label}>
            Campus Email
          </label>
          <div className={styles.inputWrapper}>
            <EmailIcon />
            <motion.input
              id="email"
              type="email"
              name="email"
              placeholder="your.email@campus.edu"
              value={formData.email}
              onChange={handleChange}
              className={`${styles.input} ${errors.email ? styles.invalid : ''}`}
              disabled={loading}
            />
          </div>
          {errors.email && (
            <motion.span className={styles.errorText} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              {errors.email}
            </motion.span>
          )}
        </motion.div>

        <motion.div className={styles.formGroup} variants={itemVariants}>
          <label htmlFor="matricNumber" className={styles.label}>
            Matric Number
          </label>
          <motion.input
            id="matricNumber"
            type="text"
            name="matricNumber"
            placeholder="e.g., PHY/2026/154"
            value={formData.matricNumber}
            onChange={handleChange}
            className={`${styles.input} ${errors.matricNumber ? styles.invalid : ''}`}
            disabled={loading}
          />
          {errors.matricNumber && (
            <motion.span className={styles.errorText} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              {errors.matricNumber}
            </motion.span>
          )}
        </motion.div>

        <motion.div className={styles.formGroup} variants={itemVariants}>
          <label htmlFor="password" className={styles.label}>
            Password
          </label>
          <div className={styles.passwordWrapper}>
            <LockIcon />
            <motion.input
              id="password"
              type={showPassword ? 'text' : 'password'}
              name="password"
              placeholder="Min. 8 characters"
              value={formData.password}
              onChange={handleChange}
              className={`${styles.input} ${errors.password ? styles.invalid : ''}`}
              disabled={loading}
            />
            <motion.button
              type="button"
              className={styles.togglePassword}
              onClick={() => setShowPassword(!showPassword)}
              whileHover={{ scale: 1.1 }}
            >
              {showPassword ? <EyeIcon /> : <EyeOffIcon />}
            </motion.button>
          </div>
          {formData.password && (
            <div className={styles.strengthBar}>
              <div
                className={styles.strength}
                style={{ width: passwordStrength === 'weak' ? '33%' : passwordStrength === 'medium' ? '66%' : '100%', backgroundColor: getStrengthColor() }}
              />
            </div>
          )}
          {errors.password && (
            <motion.span className={styles.errorText} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              {errors.password}
            </motion.span>
          )}
        </motion.div>

        <motion.div className={styles.formGroup} variants={itemVariants}>
          <label htmlFor="confirmPassword" className={styles.label}>
            Confirm Password
          </label>
          <div className={styles.passwordWrapper}>
            <LockIcon />
            <motion.input
              id="confirmPassword"
              type={showConfirm ? 'text' : 'password'}
              name="confirmPassword"
              placeholder="Re-enter password"
              value={formData.confirmPassword}
              onChange={handleChange}
              className={`${styles.input} ${errors.confirmPassword ? styles.invalid : ''}`}
              disabled={loading}
            />
            <motion.button
              type="button"
              className={styles.togglePassword}
              onClick={() => setShowConfirm(!showConfirm)}
              whileHover={{ scale: 1.1 }}
            >
              {showConfirm ? <EyeIcon /> : <EyeOffIcon />}
            </motion.button>
          </div>
          {errors.confirmPassword && (
            <motion.span className={styles.errorText} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              {errors.confirmPassword}
            </motion.span>
          )}
        </motion.div>

        {errors.form && (
          <motion.div className={styles.formError} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
            {errors.form}
          </motion.div>
        )}

        <motion.button
          className={styles.submitBtn}
          type="submit"
          disabled={loading}
          variants={itemVariants}
          whileHover={!loading ? { scale: 1.02, y: -2 } : {}}
          whileTap={!loading ? { scale: 0.98 } : {}}
        >
          {loading ? (
            <>
              <LoadingSpinner />
              Creating account...
            </>
          ) : (
            'Create Account'
          )}
        </motion.button>
      </motion.form>

      {/* OTP Verification Modal */}
      <OTPVerification
        isOpen={showOTPModal}
        email={userEmail}
        onClose={() => setShowOTPModal(false)}
        onSuccess={handleOTPSuccess}
      />
    </>
  );
}
