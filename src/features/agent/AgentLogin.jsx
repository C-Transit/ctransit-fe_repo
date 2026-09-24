import { useState } from "react";
import { motion } from "framer-motion";
import { FaArrowRight, FaEye, FaEyeSlash, FaLock } from "react-icons/fa";
import { agentLogin } from "../../api/agentApi";
import useAgentAuth from "../../hooks/useAgentAuth";
import styles from "./AgentLogin.module.css";

export default function AgentLogin() {
  const { login } = useAgentAuth();
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
              <span className={styles.badge}>C-Transit</span>
            </div>
            <h1 className={styles.title}>Agent and Driver Portal</h1>
            <p className={styles.subtitle}>
              Secure access for authorized agents
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
              <div className={styles.passwordInputWrapper}>
                <input
                  id="agentPassword"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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

      </div>
    </div>
  );
}
