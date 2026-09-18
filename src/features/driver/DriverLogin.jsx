import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Bus, Lock, Mail, Eye, EyeOff, AlertCircle, ArrowRight, Loader2 } from "lucide-react";
import useDriverAuth from "../../hooks/useDriverAuth";
import styles from "./DriverLogin.module.css";

export default function DriverLogin() {
  const { login, isLoading } = useDriverAuth();

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!identifier.trim() || !password) {
      setError("Please enter your Driver ID/Email and Password.");
      return;
    }

    const result = await login(identifier.trim(), password);
    if (!result.success) {
      setError(result.error || "Driver authentication failed. Please try again.");
    }
  };

  const handleFillDevCredentials = () => {
    const devDriverId = import.meta.env.VITE_DEV_DRIVER_ID || "driver@ctransit.ng";
    const devPass = import.meta.env.VITE_DEV_DRIVER_PASSWORD || "Driver@12345";
    setIdentifier(devDriverId);
    setPassword(devPass);
    setError("");
  };

  return (
    <div className={styles.wrapper}>
      <motion.div
        className={styles.container}
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className={styles.header}>
          <span className={styles.badge}>
            <Bus size={14} /> C-Transit Shuttle
          </span>
          <h1 className={styles.title}>Driver Portal</h1>
          <p className={styles.subtitle}>
            Sign in to access your shift earnings, passenger verification & settlement logs
          </p>
        </div>

        {error && (
          <div className={styles.errorBanner}>
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label htmlFor="identifier" className={styles.label}>
              <Mail size={14} /> Driver Email or Matric ID
            </label>
            <div className={styles.inputWrapper}>
              <input
                id="identifier"
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="e.g. driver@ctransit.ng or MAT-DRV-01"
                className={styles.input}
                required
                autoFocus
              />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="password" className={styles.label}>
              <Lock size={14} /> Driver Password
            </label>
            <div className={styles.inputWrapper}>
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className={styles.input}
                required
              />
              <button
                type="button"
                className={styles.togglePasswordBtn}
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className={styles.submitBtn}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                <span>Verifying credentials...</span>
              </>
            ) : (
              <>
                <span>Access Driver Shift</span>
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        <div className={styles.devHelperSection}>
          <button
            type="button"
            className={styles.devBtn}
            onClick={handleFillDevCredentials}
          >
            ⚡ Autofill Driver Demo Credentials
          </button>
          <Link to="/" className={styles.backLink}>
            ← Back to C-Transit Home
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
