import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FaArrowRight, FaEye, FaEyeSlash, FaLock } from "react-icons/fa";

import PrimaryButton from "./components/PrimaryButton";
import { loginAdmin } from "../../api/adminAuth";

import styles from "./AdminLogin.module.css";

export default function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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
      
      const serverMsg = err.response?.data?.message;
      setError(serverMsg || "Invalid credentials. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Auto-fill dev credentials for testing purposes
  const handleFillDevCredentials = () => {
    const devEmail = import.meta.env.VITE_DEV_ADMIN_EMAIL || "admin@ctransit.me";
    const devPass = import.meta.env.VITE_DEV_ADMIN_PASSWORD || "Exynos@5x";
    setEmail(devEmail);
    setPassword(devPass);
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.container}>
        <motion.section
          className={styles.formSection}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <motion.div
            className={styles.brandMark}
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.15, type: "spring" }}
          >
            <FaLock />
          </motion.div>
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
              <div className={styles.passwordInputWrapper}>
                <input
                  id="adminPassword"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Enter your password"
                  className={styles.input}
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  className={styles.passwordToggle}
                  onClick={() => setShowPassword((visible) => !visible)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  title={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
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

            {import.meta.env.DEV && (
              <div style={{ marginTop: "14px", textAlign: "center" }}>
                <button
                  type="button"
                  onClick={handleFillDevCredentials}
                  style={{
                    background: "none",
                    border: "1px dashed rgba(148, 163, 184, 0.5)",
                    borderRadius: "6px",
                    padding: "6px 12px",
                    fontSize: "12px",
                    color: "#64748b",
                    cursor: "pointer",
                  }}
                >
                  ⚡ Auto-fill Test Administrator
                </button>
              </div>
            )}
          </form>
        </motion.section>

        {/* Right Column: Security Info */}
        {/* <motion.aside
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
        </motion.aside> */}
      </div>
    </div>
  );
}
