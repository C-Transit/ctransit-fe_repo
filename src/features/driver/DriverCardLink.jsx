import { useState } from "react";
import { Link } from "react-router-dom";
import {
<<<<<<< HEAD
=======
  CreditCard,
>>>>>>> 72cdc132266f78ca8234e380e965306a1cda93a1
  Radio,
  KeyRound,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
<<<<<<< HEAD
  Loader2,
} from "lucide-react";
import useDriverAuth from "../../hooks/useDriverAuth";
import { linkDriverCard, getDriverCardLinkErrorMessage, fetchDriverProfile } from "../../api/driverApi";
=======
} from "lucide-react";
import useDriverAuth from "../../hooks/useDriverAuth";
import { linkDriverCard } from "../../api/driverApi";
>>>>>>> 72cdc132266f78ca8234e380e965306a1cda93a1
import {
  generateDriverDisplayId,
  generateTerminalDisplayId,
} from "../../utils/identifierUtils";
import DriverLayout from "./components/DriverLayout";
import styles from "./DriverCardLink.module.css";

export default function DriverCardLink() {
  const { driver } = useDriverAuth();

  const [currentStep, setCurrentStep] = useState(1);
<<<<<<< HEAD
  const [otp, setOtp] = useState("");
  const [pin, setPin] = useState("");
=======
  const [cardUid, setCardUid] = useState("");
  const [otp, setOtp] = useState("");
>>>>>>> 72cdc132266f78ca8234e380e965306a1cda93a1
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const steps = [
<<<<<<< HEAD
    { num: 1, label: "Terminal Tap" },
    { num: 2, label: "OTP & Confirm PIN" },
    { num: 3, label: "Card Linked" },
=======
    { num: 1, label: "Prepare" },
    { num: 2, label: "Terminal Tap" },
    { num: 3, label: "Security OTP" },
    { num: 4, label: "Confirm" },
    { num: 5, label: "Linked" },
>>>>>>> 72cdc132266f78ca8234e380e965306a1cda93a1
  ];

  const driverDisplayId = generateDriverDisplayId(driver?.id || driver?.matricNumber || "CURRENT");
  const terminalDisplayId = generateTerminalDisplayId(driver?.terminalId || "TRM-01");

<<<<<<< HEAD
  const handleStep1Next = () => {
=======
  const handleStep1Next = (e) => {
    e.preventDefault();
    if (!cardUid.trim()) {
      setError("Please enter the physical card number or NFC UID.");
      return;
    }
>>>>>>> 72cdc132266f78ca8234e380e965306a1cda93a1
    setError(null);
    setCurrentStep(2);
  };

<<<<<<< HEAD
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
=======
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
>>>>>>> 72cdc132266f78ca8234e380e965306a1cda93a1
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
<<<<<<< HEAD
            Link an authorized physical driver card to terminal {terminalDisplayId}
          </p>
        </div>

        {/* 3-Step Progress Bar */}
=======
            Link an authorized physical driver card or RFID token to your vehicle terminal
          </p>
        </div>

        {/* 5-Step Progress Bar */}
>>>>>>> 72cdc132266f78ca8234e380e965306a1cda93a1
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
<<<<<<< HEAD
          {/* STEP 1: Terminal Tap */}
          {currentStep === 1 && (
=======
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
>>>>>>> 72cdc132266f78ca8234e380e965306a1cda93a1
            <div className={styles.stepContent}>
              <div className={styles.iconGraphic} style={{ background: "#fef3c7", color: "#d97706" }}>
                <Radio size={32} />
              </div>
<<<<<<< HEAD
              <h2 className={styles.stepTitle}>Step 1: Tap Card on Terminal</h2>
              <p className={styles.stepDesc}>
                Hold the driver's card against terminal <strong>{terminalDisplayId}</strong> for 2 seconds. The terminal will emit a chime and display a 6-digit verification OTP.
=======
              <h2 className={styles.stepTitle}>Step 2: Tap on POS Terminal</h2>
              <p className={styles.stepDesc}>
                Hold your card against the reader on terminal <strong>{terminalDisplayId}</strong> for 2 seconds until you hear a chime.
>>>>>>> 72cdc132266f78ca8234e380e965306a1cda93a1
              </p>

              <div className={styles.receiptBox}>
                <div className={styles.receiptRow}>
                  <span className={styles.receiptLabel}>Assigned Terminal:</span>
                  <span className={styles.receiptVal}>{terminalDisplayId}</span>
                </div>
                <div className={styles.receiptRow}>
<<<<<<< HEAD
                  <span className={styles.receiptLabel}>Driver Identity:</span>
                  <span className={styles.receiptVal}>{driver?.firstname} {driver?.lastname} ({driverDisplayId})</span>
=======
                  <span className={styles.receiptLabel}>Vehicle:</span>
                  <span className={styles.receiptVal}>{driver?.vehiclePlate || "Pending Assignment"}</span>
>>>>>>> 72cdc132266f78ca8234e380e965306a1cda93a1
                </div>
              </div>

              <div className={styles.actionButtons}>
<<<<<<< HEAD
                <div />
                <button
                  type="button"
                  className={styles.btnPrimary}
                  onClick={handleStep1Next}
                >
                  <span>Card Tapped (I Have the 6-Digit OTP)</span>
=======
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
>>>>>>> 72cdc132266f78ca8234e380e965306a1cda93a1
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}

<<<<<<< HEAD
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
=======
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
>>>>>>> 72cdc132266f78ca8234e380e965306a1cda93a1
                <input
                  type="text"
                  maxLength={6}
                  placeholder="e.g. 123456"
<<<<<<< HEAD
                  inputMode="numeric"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
=======
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
>>>>>>> 72cdc132266f78ca8234e380e965306a1cda93a1
                  className={styles.input}
                  style={{ textAlign: "center", letterSpacing: "0.25em", fontSize: "1.2rem", fontWeight: "700" }}
                  required
                  autoFocus
                />
<<<<<<< HEAD
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
=======
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
>>>>>>> 72cdc132266f78ca8234e380e965306a1cda93a1
                  disabled={loading}
                >
                  <ArrowLeft size={16} />
                  <span>Back</span>
                </button>
                <button
<<<<<<< HEAD
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
=======
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
>>>>>>> 72cdc132266f78ca8234e380e965306a1cda93a1
            <div className={styles.stepContent}>
              <div className={styles.iconGraphic} style={{ background: "#dcfce7", color: "#16a34a" }}>
                <CheckCircle2 size={36} />
              </div>
              <h2 className={styles.stepTitle}>Card Successfully Bound!</h2>
              <p className={styles.stepDesc}>
<<<<<<< HEAD
                Your physical driver card has been verified and bound to terminal {terminalDisplayId}. You are ready for shifts and fare collections.
=======
                Your NFC driver card is now linked and active for your vehicle shift on terminal {terminalDisplayId}.
>>>>>>> 72cdc132266f78ca8234e380e965306a1cda93a1
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
