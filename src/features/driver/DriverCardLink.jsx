import { useState } from "react";
import { Link } from "react-router-dom";
import {
  CreditCard,
  Radio,
  KeyRound,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
} from "lucide-react";
import useDriverAuth from "../../hooks/useDriverAuth";
import { linkDriverCard } from "../../api/driverApi";
import {
  generateDriverDisplayId,
  generateTerminalDisplayId,
} from "../../utils/identifierUtils";
import DriverLayout from "./components/DriverLayout";
import styles from "./DriverCardLink.module.css";

export default function DriverCardLink() {
  const { driver } = useDriverAuth();

  const [currentStep, setCurrentStep] = useState(1);
  const [cardUid, setCardUid] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const steps = [
    { num: 1, label: "Prepare" },
    { num: 2, label: "Terminal Tap" },
    { num: 3, label: "Security OTP" },
    { num: 4, label: "Confirm" },
    { num: 5, label: "Linked" },
  ];

  const driverDisplayId = generateDriverDisplayId(driver?.id || driver?.matricNumber || "CURRENT");
  const terminalDisplayId = generateTerminalDisplayId(driver?.terminalId || "TRM-01");

  const handleStep1Next = (e) => {
    e.preventDefault();
    if (!cardUid.trim()) {
      setError("Please enter the physical card number or NFC UID.");
      return;
    }
    setError(null);
    setCurrentStep(2);
  };

  const handleStep2Next = () => {
    setError(null);
    setCurrentStep(3);
  };

  const handleStep3Next = (e) => {
    e.preventDefault();
    if (!otp.trim()) {
      setError("Please enter the 6-digit driver security code.");
      return;
    }
    setError(null);
    setCurrentStep(4);
  };

  const handleConfirmLink = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await linkDriverCard({
        otp: otp.trim(),
        cardUid: cardUid.trim(),
        driverId: driver?.id,
      });

      if (res?.success || res?.status === "success" || res?.data) {
        setCurrentStep(5);
      } else {
        throw new Error(res?.message || "Card linking rejected by server.");
      }
    } catch (err) {
      if (err.response?.status === 404 || err.response?.status === 501) {
        // Explicit Backend Dependency Boundary
        setError(
          "Driver NFC card binding service is currently pending contract deployment on the backend server. Please contact C-Transit Operations."
        );
      } else {
        setError(
          err.response?.data?.message ||
          err.message ||
          "Unable to link NFC transit card. Please verify credentials."
        );
      }
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
            Link an authorized physical driver card or RFID token to your vehicle terminal
          </p>
        </div>

        {/* 5-Step Progress Bar */}
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
          {/* STEP 1: Prepare */}
          {currentStep === 1 && (
            <form onSubmit={handleStep1Next} className={styles.stepContent}>
              <div className={styles.iconGraphic}>
                <CreditCard size={32} />
              </div>
              <h2 className={styles.stepTitle}>Step 1: Enter Card UID</h2>
              <p className={styles.stepDesc}>
                Enter the physical 8-digit or 16-digit card UID printed on your driver card or tag.
              </p>

              <div className={styles.formGroup}>
                <label className={styles.label}>NFC Card Serial / UID</label>
                <input
                  type="text"
                  placeholder="e.g. 04:A2:3B:5C:8D or CT-DRV-9021"
                  value={cardUid}
                  onChange={(e) => setCardUid(e.target.value)}
                  className={styles.input}
                  required
                  autoFocus
                />
              </div>

              <div className={styles.actionButtons}>
                <div />
                <button type="submit" className={styles.btnPrimary}>
                  <span>Continue</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            </form>
          )}

          {/* STEP 2: Terminal Tap */}
          {currentStep === 2 && (
            <div className={styles.stepContent}>
              <div className={styles.iconGraphic} style={{ background: "#fef3c7", color: "#d97706" }}>
                <Radio size={32} />
              </div>
              <h2 className={styles.stepTitle}>Step 2: Tap on POS Terminal</h2>
              <p className={styles.stepDesc}>
                Hold your card against the reader on terminal <strong>{terminalDisplayId}</strong> for 2 seconds until you hear a chime.
              </p>

              <div className={styles.receiptBox}>
                <div className={styles.receiptRow}>
                  <span className={styles.receiptLabel}>Assigned Terminal:</span>
                  <span className={styles.receiptVal}>{terminalDisplayId}</span>
                </div>
                <div className={styles.receiptRow}>
                  <span className={styles.receiptLabel}>Vehicle:</span>
                  <span className={styles.receiptVal}>{driver?.vehiclePlate || "Pending Assignment"}</span>
                </div>
              </div>

              <div className={styles.actionButtons}>
                <button
                  type="button"
                  className={styles.btnSecondary}
                  onClick={() => setCurrentStep(1)}
                >
                  <ArrowLeft size={16} />
                  <span>Back</span>
                </button>
                <button
                  type="button"
                  className={styles.btnPrimary}
                  onClick={handleStep2Next}
                >
                  <span>Terminal Chime Confirmed</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: OTP Verification */}
          {currentStep === 3 && (
            <form onSubmit={handleStep3Next} className={styles.stepContent}>
              <div className={styles.iconGraphic} style={{ background: "#f3e8ff", color: "#7e22ce" }}>
                <KeyRound size={32} />
              </div>
              <h2 className={styles.stepTitle}>Step 3: Security Code (OTP)</h2>
              <p className={styles.stepDesc}>
                Enter the verification code sent to your registered driver contact number {driver?.phone ? `(${driver.phone})` : ""}.
              </p>

              <div className={styles.formGroup}>
                <label className={styles.label}>6-Digit Security OTP</label>
                <input
                  type="text"
                  maxLength={6}
                  placeholder="e.g. 123456"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className={styles.input}
                  style={{ textAlign: "center", letterSpacing: "0.25em", fontSize: "1.2rem", fontWeight: "700" }}
                  required
                  autoFocus
                />
              </div>

              <div className={styles.actionButtons}>
                <button
                  type="button"
                  className={styles.btnSecondary}
                  onClick={() => setCurrentStep(2)}
                >
                  <ArrowLeft size={16} />
                  <span>Back</span>
                </button>
                <button type="submit" className={styles.btnPrimary}>
                  <span>Verify OTP</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            </form>
          )}

          {/* STEP 4: Confirmation */}
          {currentStep === 4 && (
            <div className={styles.stepContent}>
              <div className={styles.iconGraphic}>
                <ShieldCheck size={32} />
              </div>
              <h2 className={styles.stepTitle}>Step 4: Confirm Binding</h2>
              <p className={styles.stepDesc}>
                Verify the linking parameters before permanently associating this card with your driver shift.
              </p>

              <div className={styles.receiptBox}>
                <div className={styles.receiptRow}>
                  <span className={styles.receiptLabel}>Driver Name:</span>
                  <span className={styles.receiptVal}>{driver?.firstname} {driver?.lastname}</span>
                </div>
                <div className={styles.receiptRow}>
                  <span className={styles.receiptLabel}>Driver ID:</span>
                  <span className={styles.receiptVal}>{driverDisplayId}</span>
                </div>
                <div className={styles.receiptRow}>
                  <span className={styles.receiptLabel}>Card UID:</span>
                  <span className={styles.receiptVal}>{cardUid}</span>
                </div>
                <div className={styles.receiptRow}>
                  <span className={styles.receiptLabel}>Target POS:</span>
                  <span className={styles.receiptVal}>{terminalDisplayId}</span>
                </div>
              </div>

              <div className={styles.actionButtons}>
                <button
                  type="button"
                  className={styles.btnSecondary}
                  onClick={() => setCurrentStep(3)}
                  disabled={loading}
                >
                  <ArrowLeft size={16} />
                  <span>Back</span>
                </button>
                <button
                  type="button"
                  className={styles.btnPrimary}
                  onClick={handleConfirmLink}
                  disabled={loading}
                >
                  <ShieldCheck size={16} />
                  <span>{loading ? "Authorizing on Server..." : "Confirm & Link Card"}</span>
                </button>
              </div>
            </div>
          )}

          {/* STEP 5: Success Receipt */}
          {currentStep === 5 && (
            <div className={styles.stepContent}>
              <div className={styles.iconGraphic} style={{ background: "#dcfce7", color: "#16a34a" }}>
                <CheckCircle2 size={36} />
              </div>
              <h2 className={styles.stepTitle}>Card Successfully Bound!</h2>
              <p className={styles.stepDesc}>
                Your NFC driver card is now linked and active for your vehicle shift on terminal {terminalDisplayId}.
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
