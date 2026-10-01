import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Bus, Lock, Phone, Eye, EyeOff, AlertCircle, ArrowRight, Loader2 } from "lucide-react";
import useDriverAuth from "../../hooks/useDriverAuth";
import styles from "./DriverLogin.module.css";

export default function DriverLogin() {
  const { login, isLoading } = useDriverAuth();

  const [phone, setPhone] = useState("");
  const [pin, setPin] = useState("");
  const [showPin, setShowPin] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!phone.trim() || !pin.trim()) {
      setError("Please provide phone and pin");
      return;
    }

    if (pin.length !== 4) {
      setError("PIN must be exactly 4 digits.");
      return;
    }

    const result = await login(phone.trim(), pin.trim());
    if (!result.success) {
      setError(result.error || "Driver authentication failed. Please try again.");
    }
  };

  const handleFillDevCredentials = () => {
    const devDriverPhone = import.meta.env.VITE_DEV_DRIVER_PHONE || "08012345678";
    const devPin = import.meta.env.VITE_DEV_DRIVER_PIN || "1234";
    setPhone(devDriverPhone);
    setPin(devPin);
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
            Sign in with your registered phone number and 4-digit security PIN
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
            <label htmlFor="phone" className={styles.label}>
              <Phone size={14} /> Registered Phone Number
            </label>
            <div className={styles.inputWrapper}>
              <input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. 08012345678 or +2348012345678"
                className={styles.input}
                required
                autoFocus
              />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="pin" className={styles.label}>
              <Lock size={14} /> 4-Digit Security PIN
            </label>
            <div className={styles.inputWrapper}>
              <input
                id="pin"
                type={showPin ? "text" : "password"}
                maxLength={4}
                inputMode="numeric"
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
                placeholder="••••"
                className={styles.input}
                required
              />
              <button
                type="button"
                className={styles.togglePasswordBtn}
                onClick={() => setShowPin(!showPin)}
                tabIndex={-1}
                aria-label={showPin ? "Hide PIN" : "Show PIN"}
              >
                {showPin ? <EyeOff size={16} /> : <Eye size={16} />}
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
