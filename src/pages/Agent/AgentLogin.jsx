import { useState } from "react";
import { motion } from "framer-motion";
import { FaLock, FaChartLine, FaHandshake, FaArrowRight } from "react-icons/fa";
import agentApi from "../../config/agentApi";
import useAgentAuth from "../../hooks/useAgentAuth";
import styles from "./AgentLogin.module.css";

export default function AgentLogin() {
  const { login } = useAgentAuth();
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
      // ✅ Bug fix: was posting to /agents/login (wrong path).
      // Real endpoint: POST /api/auth/agent/login
      // agentApi baseURL = USER_API_URL = https://...vercel.app/api
      // So the path here must be /auth/agent/login
      const response = await agentApi.post("/auth/agent/login", {
        email: email.trim().toLowerCase(),
        password,
      });

      // ✅ Bug fix: was destructuring from response.data.data (undefined)
      // Real response shape: { success, token, refreshToken, agent: {...} }
      const { token, agent, refreshToken } = response.data;

      if (!token || !agent) {
        throw new Error("Invalid response from server");
      }

      if (refreshToken) {
        localStorage.setItem("agentRefreshToken", refreshToken);
      }

      login(token, agent);
    } catch (err) {
      if (err.response?.status === 401) {
        setError("Invalid email or password");
      } else if (err.response?.status === 404) {
        setError("Agent account not found");
      } else {
        setError(
          err.response?.data?.message || "Login failed. Please try again."
        );
      }
    } finally {
      setLoading(false);
    }
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
          <div className={styles.formHeader}>
            <div className={styles.badgeWrapper}>
              <span className={styles.badge}>C-Transit Agent</span>
            </div>
            <h1 className={styles.title}>Agent Portal</h1>
            <p className={styles.subtitle}>
              Manage KYC verifications and driver registrations
            </p>
          </div>

          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.formGroup}>
              <label htmlFor="agentEmail" className={styles.label}>
                Agent Email
              </label>
              <input
                id="agentEmail"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="agent@ctransit.ng"
                className={styles.input}
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="agentPassword" className={styles.label}>
                Password
              </label>
              <input
                id="agentPassword"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
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

            <button
              type="submit"
              disabled={loading}
              className={styles.submitBtn}
            >
              {loading ? (
                <span>Verifying...</span>
              ) : (
                <>
                  <span>Sign In</span>
                  <FaArrowRight />
                </>
              )}
            </button>
          </form>
        </motion.section>

        <motion.aside
          className={styles.infoSection}
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <div className={styles.infoHeader}>
            <h2 className={styles.infoTitle}>Agent Dashboard</h2>
            <p className={styles.infoSubtitle}>
              Powerful tools for KYC management
            </p>
          </div>

          <ul className={styles.featureList}>
            <li className={styles.featureItem}>
              <div className={styles.featureIcon}>
                <FaChartLine />
              </div>
              <div className={styles.featureContent}>
                <h3>KYC Overview</h3>
                <p>View pending, approved, and rejected verifications</p>
              </div>
            </li>
            <li className={styles.featureItem}>
              <div className={styles.featureIcon}>
                <FaHandshake />
              </div>
              <div className={styles.featureContent}>
                <h3>Driver Registration</h3>
                <p>Register new drivers and manage their profiles</p>
              </div>
            </li>
            <li className={styles.featureItem}>
              <div className={styles.featureIcon}>
                <FaLock />
              </div>
              <div className={styles.featureContent}>
                <h3>Secure Access</h3>
                <p>Protected portal for authorized agents only</p>
              </div>
            </li>
          </ul>
        </motion.aside>
      </div>
    </div>
  );
}
