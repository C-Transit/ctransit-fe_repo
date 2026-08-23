import { useState } from "react";
import { motion } from "framer-motion";
import { FaLock, FaChartLine, FaHandshake, FaArrowRight } from "react-icons/fa";
import { agentLogin } from "../../api/agentApi";
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
      const data = await agentLogin(email, password);
      const token = data.accessToken || data.token;
      const agent = data.agent || data.user || data.data?.agent || data.data;
      const refreshToken = data.refreshToken;

      if (!token) {
        throw new Error("Invalid response from server");
      }

      if (refreshToken) {
        localStorage.setItem("agentRefreshToken", refreshToken);
      }

      login(token, agent || { email, firstname: "Field", lastname: "Agent" });
    } catch (err) {
      if (err.response?.status === 401) {
        setError("Invalid email or password");
      } else if (err.response?.status === 404) {
        setError("Agent account not found");
      } else {
        setError(
          err.response?.data?.message || err.response?.data?.error || "Login failed. Please try again."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleFillDevCredentials = () => {
    const devEmail = import.meta.env.VITE_DEV_AGENT_EMAIL || "agent@ctransit.ng";
    const devPass = import.meta.env.VITE_DEV_AGENT_PASSWORD || "Agent@12345";
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

            {import.meta.env.DEV && (
              <div style={{ marginTop: "12px", textAlign: "center" }}>
                <button
                  type="button"
                  onClick={handleFillDevCredentials}
                  style={{
                    background: "none",
                    border: "1px dashed #cbd5e1",
                    borderRadius: "6px",
                    padding: "6px 12px",
                    fontSize: "12px",
                    color: "#64748b",
                    cursor: "pointer",
                  }}
                >
                  ⚡ Auto-fill Test Agent Credentials
                </button>
              </div>
            )}
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
