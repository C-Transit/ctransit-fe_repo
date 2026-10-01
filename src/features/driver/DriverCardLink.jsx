import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Radio,
  KeyRound,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Loader2,
} from "lucide-react";
import useDriverAuth from "../../hooks/useDriverAuth";
import { linkDriverCard, getDriverCardLinkErrorMessage, fetchDriverProfile } from "../../api/driverApi";
import {
  generateDriverDisplayId,
  generateTerminalDisplayId,
} from "../../utils/identifierUtils";
import DriverLayout from "./components/DriverLayout";
import styles from "./DriverCardLink.module.css";

export default function DriverCardLink() {
  const { driver } = useDriverAuth();

  const [currentStep, setCurrentStep] = useState(1);
  const [otp, setOtp] = useState("");
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const steps = [
    { num: 1, label: "Terminal Tap" },
    { num: 2, label: "OTP & Confirm PIN" },
    { num: 3, label: "Card Linked" },
  ];

  const driverDisplayId = generateDriverDisplayId(driver?.id || driver?.matricNumber || "CURRENT");
  const terminalDisplayId = generateTerminalDisplayId(driver?.terminalId || "TRM-01");

  const handleStep1Next = () => {
    setError(null);
    setCurrentStep(2);
  };

  const handleLinkSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const cleanOtp = otp.trim().replace(/\D/g, "");
    const cleanPin = pin.trim().replace(/\D/g, "");

    if (cleanOtp.length !== 6) {
      setError("OTP must be exactly 6 digits.");
      return;
    }

    if (cleanPin.length !== 4) {
      setError("PIN must be exactly 4 digits.");
      return;
    }

    setLoading(true);

    try {
      await linkDriverCard({
        otp: cleanOtp,
        pin: cleanPin,
      });

      // Refresh profile to reflect linked card
      try {
        await fetchDriverProfile();
      } catch {
        // Non-blocking sync
      }

      setCurrentStep(3);
    } catch (err) {
      setError(getDriverCardLinkErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <DriverLayout>
      <div className={styles.pageContainer}>
        {/* Header */}
        <div className={styles.pageHeader}>
          <h1 className={styles.title}>NFC Card Binding</h1>
          <p className={styles.subtitle}>
            Link an authorized physical driver card to terminal {terminalDisplayId}
          </p>
        </div>

        {/* 3-Step Progress Bar */}
        <div className={styles.stepsProgressBar}>
          {steps.map((s) => (
            <div key={s.num} className={styles.stepNode}>
              <div
                className={`${styles.stepCircle} ${
                  currentStep === s.num
                    ? styles.active
                    : currentStep > s.num
                    ? styles.completed
                    : ""
                }`}
              >
                {currentStep > s.num ? <CheckCircle2 size={16} /> : s.num}
              </div>
              <span
                className={`${styles.stepLabel} ${
                  currentStep === s.num ? styles.active : ""
                }`}
              >
                {s.label}
              </span>
            </div>
          ))}
        </div>

        {error && (
          <div style={{ padding: "0.85rem 1.25rem", background: "#fee2e2", border: "1px solid #fca5a5", borderRadius: "10px", color: "#b91c1c", display: "flex", alignItems: "center", gap: "8px" }}>
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <div className={styles.card}>
          {/* STEP 1: Terminal Tap */}
          {currentStep === 1 && (
            <div className={styles.stepContent}>
              <div className={styles.iconGraphic} style={{ background: "#fef3c7", color: "#d97706" }}>
                <Radio size={32} />
              </div>
              <h2 className={styles.stepTitle}>Step 1: Tap Card on Terminal</h2>
              <p className={styles.stepDesc}>
                Hold the driver's card against terminal <strong>{terminalDisplayId}</strong> for 2 seconds. The terminal will emit a chime and display a 6-digit verification OTP.
              </p>

              <div className={styles.receiptBox}>
                <div className={styles.receiptRow}>
                  <span className={styles.receiptLabel}>Assigned Terminal:</span>
                  <span className={styles.receiptVal}>{terminalDisplayId}</span>
                </div>
                <div className={styles.receiptRow}>
                  <span className={styles.receiptLabel}>Driver Identity:</span>
                  <span className={styles.receiptVal}>{driver?.firstname} {driver?.lastname} ({driverDisplayId})</span>
                </div>
              </div>

              <div className={styles.actionButtons}>
                <div />
                <button
                  type="button"
                  className={styles.btnPrimary}
                  onClick={handleStep1Next}
                >
                  <span>Card Tapped (I Have the 6-Digit OTP)</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Enter OTP & Confirm Driver's PIN */}
          {currentStep === 2 && (
            <form onSubmit={handleLinkSubmit} className={styles.stepContent}>
              <div className={styles.iconGraphic} style={{ background: "#f3e8ff", color: "#7e22ce" }}>
                <KeyRound size={32} />
              </div>
              <h2 className={styles.stepTitle}>Step 2: Enter OTP & Confirm PIN</h2>
              <p className={styles.stepDesc}>
                Input the 6-digit OTP displayed on terminal <strong>{terminalDisplayId}</strong>, then confirm the driver's 4-digit PIN.
              </p>

              <div className={styles.formGroup} style={{ width: "100%", maxWidth: "360px" }}>
                <label className={styles.label}>6-Digit Terminal OTP</label>
                <input
                  type="text"
                  maxLength={6}
                  placeholder="e.g. 123456"
                  inputMode="numeric"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  className={styles.input}
                  style={{ textAlign: "center", letterSpacing: "0.25em", fontSize: "1.2rem", fontWeight: "700" }}
                  required
                  autoFocus
                />
                <span style={{ fontSize: "11px", color: "#64748b", marginTop: "4px" }}>
                  Generated on the POS terminal screen upon card tap
                </span>
              </div>

              <div className={styles.formGroup} style={{ width: "100%", maxWidth: "360px" }}>
                <label className={styles.label}>Confirm Driver's PIN</label>
                <input
                  type="password"
                  maxLength={4}
                  placeholder="••••"
                  inputMode="numeric"
                  value={pin}
                  onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
                  className={styles.input}
                  style={{ textAlign: "center", letterSpacing: "0.25em", fontSize: "1.2rem", fontWeight: "700" }}
                  required
                />
                <span style={{ fontSize: "11px", color: "#64748b", marginTop: "4px" }}>
                  Re-confirmation: enter the SAME 4-digit PIN set during account creation to verify and push to terminal
                </span>
              </div>

              <div className={styles.actionButtons} style={{ width: "100%" }}>
                <button
                  type="button"
                  className={styles.btnSecondary}
                  onClick={() => setCurrentStep(1)}
                  disabled={loading}
                >
                  <ArrowLeft size={16} />
                  <span>Back</span>
                </button>
                <button
                  type="submit"
                  className={styles.btnPrimary}
                  disabled={loading || otp.length !== 6 || pin.length !== 4}
                >
                  {loading ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>Linking Card...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck size={16} />
                      <span>Link Card</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* STEP 3: Linked Success */}
          {currentStep === 3 && (
            <div className={styles.stepContent}>
              <div className={styles.iconGraphic} style={{ background: "#dcfce7", color: "#16a34a" }}>
                <CheckCircle2 size={36} />
              </div>
              <h2 className={styles.stepTitle}>Card Successfully Bound!</h2>
              <p className={styles.stepDesc}>
                Your physical driver card has been verified and bound to terminal {terminalDisplayId}. You are ready for shifts and fare collections.
              </p>

              <Link to="/driver" className={styles.btnPrimary} style={{ width: "100%", textDecoration: "none" }}>
                <span>Return to Driver Dashboard</span>
                <ArrowRight size={16} />
              </Link>
            </div>
          )}
        </div>
      </div>
    </DriverLayout>
  );
}
