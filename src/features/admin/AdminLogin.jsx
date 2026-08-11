import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FaLock, FaShieldAlt, FaUserTie, FaArrowRight } from "react-icons/fa";

import PrimaryButton from "./components/PrimaryButton";
import { loginAdmin } from "../../api/adminAuth";

import styles from "./AdminLogin.module.css";

export default function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }

    setLoading(true);

    try {
      await loginAdmin(email, password);
      navigate("/admin/dashboard", { replace: true });
    } catch (err) {
      // Keep error message vague — never confirm which field was wrong
      const serverMsg = err.response?.data?.message;
      setError(serverMsg || "Invalid credentials. Please try again.");
    } finally {
      setLoading(false);
    }
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
            <p className={styles.subtitle}>
              Secure portal for operations teams
            </p>
          </div>

          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.formGroup}>
              <label htmlFor="adminEmail" className={styles.label}>
                Admin Email
              </label>
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
              <label htmlFor="adminPassword" className={styles.label}>
                Password
              </label>
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

            <PrimaryButton
              type="submit"
              disabled={loading}
              className={styles.submitBtn}
            >
              {loading ? (
                <>
                  <span>Verifying...</span>
                </>
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
