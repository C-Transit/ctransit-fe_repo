import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaLock, FaShieldAlt, FaUserTie, FaArrowRight } from 'react-icons/fa';

import PrimaryButton from '../components/Admin/PrimaryButton';
import { ADMIN_PLACEHOLDER_CREDENTIALS, setAdminSession } from '../config/adminAuth';

import styles from './AdminLogin.module.css';

export default function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const helperText = useMemo(
    () => `Demo: ${ADMIN_PLACEHOLDER_CREDENTIALS.email} / ${ADMIN_PLACEHOLDER_CREDENTIALS.password}`,
    [],
  );

  const handleSubmit = (event) => {
    event.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }

    setLoading(true);

    setTimeout(() => {
      if (
        email.toLowerCase() !== ADMIN_PLACEHOLDER_CREDENTIALS.email
        || password !== ADMIN_PLACEHOLDER_CREDENTIALS.password
      ) {
        setError('Invalid credentials. Use demo credentials below.');
        setLoading(false);
        return;
      }

      // BACKEND INTEGRATION: POST /api/admin/login
      // Send: { email: "admin@ctransit.ng", password: "admin_password" }
      // Response: { success: true, token: "jwt_token", user: { name, email, role } }
      // TODO: Replace with actual API endpoint when backend is ready
      setAdminSession({
        name: 'Operations Admin',
        email: ADMIN_PLACEHOLDER_CREDENTIALS.email,
        role: 'Super Admin',
      });

      navigate('/admin/dashboard', { replace: true });
    }, 800);
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.container}>
        {/* Left Column: Form */}
        <motion.section
          className={styles.formSection}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className={styles.formHeader}>
            <div className={styles.badgeWrapper}>
              <span className={styles.badge}>C-Transit Control</span>
            </div>
            <h1 className={styles.title}>Admin Access</h1>
            <p className={styles.subtitle}>Secure portal for operations teams</p>
          </div>

          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.formGroup}>
              <label htmlFor="adminEmail" className={styles.label}>Admin Email</label>
              <input
                id="adminEmail"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="admin@ctransit.ng"
                className={styles.input}
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="adminPassword" className={styles.label}>Password</label>
              <input
                id="adminPassword"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="••••••••"
                className={styles.input}
                required
              />
            </div>

            {error && (
              <motion.div
                className={styles.errorBox}
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {error}
              </motion.div>
            )}

            <PrimaryButton type="submit" disabled={loading} className={styles.submitBtn}>
              {loading ? (
                <><span>Verifying...</span></>
              ) : (
                <>
                  <span>Sign In</span>
                  <FaArrowRight />
                </>
              )}
            </PrimaryButton>
          </form>
        </motion.section>

        {/* Right Column: Security Info */}
        <motion.aside
          className={styles.infoSection}
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <div className={styles.infoHeader}>
            <h2 className={styles.infoTitle}>Security Features</h2>
            <p className={styles.infoSubtitle}>Enterprise-grade protection</p>
          </div>

          <ul className={styles.featureList}>
            <li className={styles.featureItem}>
              <div className={styles.featureIcon}>
                <FaShieldAlt />
              </div>
              <div className={styles.featureContent}>
                <h3>Role-Based Access</h3>
                <p>Multi-level privilege boundaries</p>
              </div>
            </li>
            <li className={styles.featureItem}>
              <div className={styles.featureIcon}>
                <FaLock />
              </div>
              <div className={styles.featureContent}>
                <h3>Encrypted Sessions</h3>
                <p>Secure token management</p>
              </div>
            </li>
            <li className={styles.featureItem}>
              <div className={styles.featureIcon}>
                <FaUserTie />
              </div>
              <div className={styles.featureContent}>
                <h3>Audit Logging</h3>
                <p>Complete action tracking</p>
              </div>
            </li>
          </ul>
        </motion.aside>
      </div>
    </div>
  );
}
