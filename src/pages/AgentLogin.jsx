import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaLock, FaChartLine, FaHandshake, FaArrowRight } from 'react-icons/fa';

import PrimaryButton from '../components/Admin/PrimaryButton';

import styles from './AgentLogin.module.css';

const AGENT_PLACEHOLDER_CREDENTIALS = {
  email: 'agent@ctransit.ng',
  password: 'agent_password',
};

export default function AgentLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const helperText = useMemo(
    () => `Demo: ${AGENT_PLACEHOLDER_CREDENTIALS.email} / ${AGENT_PLACEHOLDER_CREDENTIALS.password}`,
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
        email.toLowerCase() !== AGENT_PLACEHOLDER_CREDENTIALS.email
        || password !== AGENT_PLACEHOLDER_CREDENTIALS.password
      ) {
        setError('Invalid credentials. Use demo credentials below.');
        setLoading(false);
        return;
      }

      // BACKEND INTEGRATION: POST /api/agent/login
      // Send: { email: "agent@ctransit.ng", password: "agent_password" }
      // Response: { success: true, token: "jwt_token", user: { name, email, agentId } }
      // TODO: Replace with actual API endpoint when backend is ready
      
      const agentSession = {
        name: 'Adekunle Johnson',
        email: AGENT_PLACEHOLDER_CREDENTIALS.email,
        agentId: 'AGT-001',
        role: 'Field Agent',
      };
      
      localStorage.setItem('agentSession', JSON.stringify(agentSession));
      navigate('/agent/dashboard', { replace: true });
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
              <span className={styles.badge}>C-Transit Agent</span>
            </div>
            <h1 className={styles.title}>Agent Portal</h1>
            <p className={styles.subtitle}>Manage transactions and commissions</p>
          </div>

          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.formGroup}>
              <label htmlFor="agentEmail" className={styles.label}>Agent Email</label>
              <input
                id="agentEmail"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="agent@ctransit.ng"
                className={styles.input}
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="agentPassword" className={styles.label}>Password</label>
              <input
                id="agentPassword"
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

          <div className={styles.demoBox}>
            <div className={styles.demoLabel}>📝 Demo Credentials</div>
            <code className={styles.demoCode}>{helperText}</code>
          </div>
        </motion.section>

        {/* Right Column: Features */}
        <motion.aside
          className={styles.infoSection}
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <div className={styles.infoHeader}>
            <h2 className={styles.infoTitle}>Agent Dashboard</h2>
            <p className={styles.infoSubtitle}>Powerful tools for field success</p>
          </div>

          <ul className={styles.featureList}>
            <li className={styles.featureItem}>
              <div className={styles.featureIcon}>
                <FaChartLine />
              </div>
              <div className={styles.featureContent}>
                <h3>Track Earnings</h3>
                <p>Real-time commission and performance metrics</p>
              </div>
            </li>
            <li className={styles.featureItem}>
              <div className={styles.featureIcon}>
                <FaHandshake />
              </div>
              <div className={styles.featureContent}>
                <h3>User Management</h3>
                <p>Register and link cards for your customers</p>
              </div>
            </li>
            <li className={styles.featureItem}>
              <div className={styles.featureIcon}>
                <FaLock />
              </div>
              <div className={styles.featureContent}>
                <h3>Secure Access</h3>
                <p>Protected terminals and encrypted transactions</p>
              </div>
            </li>
          </ul>
        </motion.aside>
      </div>
    </div>
  );
}
