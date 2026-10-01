import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { EmailIcon, LockIcon, EyeIcon, EyeOffIcon, LoadingSpinner } from '../AnimatedIcons';
import { validateEmail } from '../../utils/validation';
import { AUTH_API_URL } from '../../config/api';
import styles from './LoginForm.module.css';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
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

export default function LoginForm() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState({ title: '', message: '' });
  const [noticeMessage, setNoticeMessage] = useState('');

  useEffect(() => {
    const storedMessage = sessionStorage.getItem('authSuccessMessage');

    if (!storedMessage) {
      return;
    }

    setNoticeMessage(storedMessage);
    sessionStorage.removeItem('authSuccessMessage');

    const timer = setTimeout(() => setNoticeMessage(''), 4000);

    return () => clearTimeout(timer);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    if (!formData.password) {
      newErrors.password = 'Password is required';
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
      const response = await axios.post(`${AUTH_API_URL}/login`, {
        email: formData.email.trim(),
        password: formData.password,
      });

      localStorage.setItem('token', response.data.token);
      sessionStorage.setItem('authSuccessMessage', 'Login successful. Welcome back.');
      sessionStorage.setItem('kycReminderMessage', 'Complete your KYC to unlock card linking, reports, and wallet features.');

      setTimeout(() => {
        navigate('/dashboard', { replace: true });
      }, 700);
    } catch (error) {
      if (error.response?.data?.message) {
        setErrors({ form: error.response.data.message });
      } else {
        setErrors({ form: 'Login failed. Please try again.' });
      }
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = (e) => {
    e.preventDefault();
    navigate('/forgot-password');
  };

  const handleGoogleLogin = () => {
    setModalContent({
      title: 'Google Login',
      message: 'Google OAuth integration is coming soon! Stay tuned for this convenient login option.',
    });
    setShowModal(true);
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
        {noticeMessage && (
          <motion.div
            className={styles.successNotice}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {noticeMessage}
          </motion.div>
        )}

        <motion.div className={styles.formGroup} variants={itemVariants}>
          <label htmlFor="email" className={styles.label}>
            Email Address
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
              whileFocus={{
                boxShadow: '0 0 0 3px rgba(37, 99, 235, 0.1)',
              }}
            />
          </div>
          {errors.email && (
            <motion.span
              className={styles.errorText}
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {errors.email}
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
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              className={`${styles.input} ${errors.password ? styles.invalid : ''}`}
              disabled={loading}
              whileFocus={{
                boxShadow: '0 0 0 3px rgba(37, 99, 235, 0.1)',
              }}
            />
            <motion.button
              type="button"
              className={styles.togglePassword}
              onClick={() => setShowPassword(!showPassword)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              {showPassword ? <EyeIcon /> : <EyeOffIcon />}
            </motion.button>
          </div>
          {errors.password && (
            <motion.span
              className={styles.errorText}
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {errors.password}
            </motion.span>
          )}
        </motion.div>

        {errors.form && (
          <motion.div
            className={styles.formError}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ type: 'spring', stiffness: 200 }}
          >
            {errors.form}
          </motion.div>
        )}

        <motion.div className={styles.row} variants={itemVariants}>
          <motion.a
            href="#"
            onClick={handleForgotPassword}
            className={styles.link}
            whileHover={{ x: 3 }}
          >
            Forgot password?
          </motion.a>
        </motion.div>

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
              Signing in...
            </>
          ) : (
            'Sign In'
          )}
        </motion.button>

        <motion.button
          className={styles.googleBtn}
          type="button"
          onClick={handleGoogleLogin}
          disabled={loading}
          variants={itemVariants}
          whileHover={!loading ? { scale: 1.02 } : {}}
          whileTap={!loading ? { scale: 0.98 } : {}}
        >
          🔗 Continue with Google
        </motion.button>
      </motion.form>

      {showModal && (
        <motion.div
          className={styles.modalOverlay}
          onClick={() => setShowModal(false)}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className={styles.modalContent}
            onClick={(e) => e.stopPropagation()}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            <motion.button
              className={styles.modalClose}
              onClick={() => setShowModal(false)}
              whileHover={{ scale: 1.2, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
            >
              ×
            </motion.button>
            <div className={styles.modalIcon}>
              {modalContent.title.includes('Password') ? '🔐' : '🚀'}
            </div>
            <h2 className={styles.modalTitle}>{modalContent.title}</h2>
            <p className={styles.modalMessage}>{modalContent.message}</p>
            <motion.button
              className={styles.modalBtn}
              onClick={() => setShowModal(false)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Got it
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </>
  );
}
