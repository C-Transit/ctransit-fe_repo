import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
<<<<<<< HEAD
import { Bus, Lock, Phone, Eye, EyeOff, AlertCircle, ArrowRight, Loader2 } from "lucide-react";
=======
import { Bus, Lock, Mail, Eye, EyeOff, AlertCircle, ArrowRight, Loader2 } from "lucide-react";
>>>>>>> 72cdc132266f78ca8234e380e965306a1cda93a1
import useDriverAuth from "../../hooks/useDriverAuth";
import styles from "./DriverLogin.module.css";

export default function DriverLogin() {
  const { login, isLoading } = useDriverAuth();

<<<<<<< HEAD
  const [phone, setPhone] = useState("");
  const [pin, setPin] = useState("");
  const [showPin, setShowPin] = useState(false);
=======
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
>>>>>>> 72cdc132266f78ca8234e380e965306a1cda93a1
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

<<<<<<< HEAD
    if (!phone.trim() || !pin.trim()) {
      setError("Please provide phone and pin");
      return;
    }

    if (pin.length !== 4) {
      setError("PIN must be exactly 4 digits.");
      return;
    }

    const result = await login(phone.trim(), pin.trim());
=======
    if (!identifier.trim() || !password) {
      setError("Please enter your Driver ID/Email and Password.");
      return;
    }

    const result = await login(identifier.trim(), password);
>>>>>>> 72cdc132266f78ca8234e380e965306a1cda93a1
    if (!result.success) {
      setError(result.error || "Driver authentication failed. Please try again.");
    }
  };

  const handleFillDevCredentials = () => {
<<<<<<< HEAD
    const devDriverPhone = import.meta.env.VITE_DEV_DRIVER_PHONE || "08012345678";
    const devPin = import.meta.env.VITE_DEV_DRIVER_PIN || "1234";
    setPhone(devDriverPhone);
    setPin(devPin);
=======
    const devDriverId = import.meta.env.VITE_DEV_DRIVER_ID || "driver@ctransit.ng";
    const devPass = import.meta.env.VITE_DEV_DRIVER_PASSWORD || "Driver@12345";
    setIdentifier(devDriverId);
    setPassword(devPass);
>>>>>>> 72cdc132266f78ca8234e380e965306a1cda93a1
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
<<<<<<< HEAD
            Sign in with your registered phone number and 4-digit security PIN
=======
            Sign in to access your shift earnings, passenger verification & settlement logs
>>>>>>> 72cdc132266f78ca8234e380e965306a1cda93a1
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
<<<<<<< HEAD
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
=======
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
>>>>>>> 72cdc132266f78ca8234e380e965306a1cda93a1
                className={styles.input}
                required
                autoFocus
              />
            </div>
          </div>

          <div className={styles.formGroup}>
<<<<<<< HEAD
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
=======
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
>>>>>>> 72cdc132266f78ca8234e380e965306a1cda93a1
                className={styles.input}
                required
              />
              <button
                type="button"
                className={styles.togglePasswordBtn}
<<<<<<< HEAD
                onClick={() => setShowPin(!showPin)}
                tabIndex={-1}
                aria-label={showPin ? "Hide PIN" : "Show PIN"}
              >
                {showPin ? <EyeOff size={16} /> : <Eye size={16} />}
=======
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
>>>>>>> 72cdc132266f78ca8234e380e965306a1cda93a1
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
