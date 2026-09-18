import { useState, useEffect } from "react";
import {
  User,
  Bus,
  Building2,
  ShieldCheck,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import useDriverAuth from "../../hooks/useDriverAuth";
import { fetchDriverProfile } from "../../api/driverApi";
import {
  generateDriverDisplayId,
  generateTerminalDisplayId,
} from "../../utils/identifierUtils";
import DriverLayout from "./components/DriverLayout";
import styles from "./DriverProfile.module.css";

export default function DriverProfile() {
  const { driver } = useDriverAuth();
  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState(driver || null);
  const [error, setError] = useState(null);

  useEffect(() => {
    setProfileData(driver);
  }, [driver]);

  const loadProfile = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchDriverProfile();
      const p =
        res?.data?.profile ||
        res?.data?.driver ||
        res?.data?.user ||
        res?.profile ||
        res?.driver ||
        res?.data ||
        res;

      if (p && typeof p === "object") {
        setProfileData((prev) => ({
          ...prev,
          ...p,
        }));
      }
    } catch (err) {
      setError("Unable to sync latest profile records from backend server.");
    } finally {
      setLoading(false);
    }
  };

  const currentDriver = profileData || driver;

  const driverDisplayId = generateDriverDisplayId(
    currentDriver?.id || currentDriver?.matricNumber || currentDriver?.email || "CURRENT"
  );
  const terminalDisplayId = generateTerminalDisplayId(currentDriver?.terminalId || "TRM-01");

  return (
    <DriverLayout>
      <div className={styles.pageContainer}>
        {/* Header */}
        <div className={styles.pageHeader}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", width: "100%" }}>
            <div>
              <h1 className={styles.title}>Driver Account & Vehicle Profile</h1>
              <p className={styles.subtitle}>
                Verified driver identity, vehicle details, terminal assignment & settlement records
              </p>
            </div>
            <button
              type="button"
              onClick={loadProfile}
              disabled={loading}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.4rem",
                padding: "0.5rem 0.9rem",
                borderRadius: "8px",
                border: "1px solid #cbd5e1",
                background: "#ffffff",
                color: "#0284c7",
                fontSize: "0.85rem",
                fontWeight: "600",
                cursor: "pointer",
              }}
            >
              <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
              <span>{loading ? "Refreshing..." : "Sync Profile"}</span>
            </button>
          </div>
        </div>

        {error && (
          <div style={{ padding: "0.85rem 1rem", background: "#fee2e2", border: "1px solid #fca5a5", borderRadius: "8px", color: "#b91c1c", fontSize: "0.85rem", display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem" }}>
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {/* Profile Hero */}
        <div className={styles.profileHero}>
          <div className={styles.avatarLarge}>
            {(currentDriver?.firstname?.[0] || "D").toUpperCase()}
          </div>
          <div className={styles.heroMeta}>
            <h2 className={styles.driverFullName}>
              {currentDriver?.firstname || "Driver"} {currentDriver?.lastname || ""}
            </h2>
            <div className={styles.driverBadgeRow}>
              <span className={styles.publicIdBadge}>
                {driverDisplayId}
              </span>
              <span className={styles.roleBadge}>
                Authorized Driver
              </span>
              <span style={{ fontSize: "0.82rem", color: "#16a34a", fontWeight: "700" }}>
                ● Active Shift
              </span>
            </div>
          </div>
        </div>

        {/* 3-Column Info Grid */}
        <div className={styles.sectionsGrid}>
          {/* Card 1: Contact & Personal Info */}
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <User size={18} color="#0284c7" />
              <span>Personal Information</span>
            </div>

            <div className={styles.fieldList}>
              <div className={styles.fieldItem}>
                <span className={styles.fieldLabel}>Full Name</span>
                <span className={styles.fieldValue}>
                  {currentDriver?.firstname || "Driver"} {currentDriver?.lastname || ""}
                </span>
              </div>
              <div className={styles.fieldItem}>
                <span className={styles.fieldLabel}>Display Identifier</span>
                <span className={styles.fieldValue} style={{ fontFamily: "monospace", color: "#0284c7" }}>
                  {driverDisplayId}
                </span>
              </div>
              <div className={styles.fieldItem}>
                <span className={styles.fieldLabel}>Registered Email</span>
                <span className={styles.fieldValue}>
                  {currentDriver?.email || "Not Provided"}
                </span>
              </div>
              <div className={styles.fieldItem}>
                <span className={styles.fieldLabel}>Phone Number</span>
                <span className={styles.fieldValue}>
                  {currentDriver?.phone || currentDriver?.phoneNumber || "Not Provided"}
                </span>
              </div>
              <div className={styles.fieldItem}>
                <span className={styles.fieldLabel}>Driver Matric / License</span>
                <span className={styles.fieldValue}>
                  {currentDriver?.matricNumber || currentDriver?.matric_number || "Not Assigned"}
                </span>
              </div>
            </div>
          </div>

          {/* Card 2: Assigned Vehicle & Terminal */}
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <Bus size={18} color="#0284c7" />
              <span>Assigned Vehicle & POS</span>
            </div>

            <div className={styles.fieldList}>
              <div className={styles.fieldItem}>
                <span className={styles.fieldLabel}>Vehicle Type</span>
                <span className={styles.fieldValue}>
                  {currentDriver?.vehicleType || currentDriver?.vehicle_type || "Campus Transit Shuttle"}
                </span>
              </div>
              <div className={styles.fieldItem}>
                <span className={styles.fieldLabel}>License Plate Number</span>
                <span className={styles.fieldValue} style={{ letterSpacing: "0.05em" }}>
                  {currentDriver?.vehiclePlate || currentDriver?.vehicle_plate || "Pending Assignment"}
                </span>
              </div>
              <div className={styles.fieldItem}>
                <span className={styles.fieldLabel}>Assigned POS Terminal</span>
                <span className={styles.fieldValue} style={{ color: "#0284c7" }}>
                  {terminalDisplayId}
                </span>
              </div>
              <div className={styles.fieldItem}>
                <span className={styles.fieldLabel}>Terminal Status</span>
                <span className={styles.fieldValue} style={{ color: "#16a34a" }}>
                  ● {currentDriver?.terminalStatus || "ONLINE"}
                </span>
              </div>
              <div className={styles.fieldItem}>
                <span className={styles.fieldLabel}>Operating Route</span>
                <span className={styles.fieldValue}>
                  {currentDriver?.operatingRoute || currentDriver?.route || "Campus Assigned Route"}
                </span>
              </div>
            </div>
          </div>

          {/* Card 3: Bank Settlement Account */}
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <Building2 size={18} color="#0284c7" />
              <span>Settlement Account</span>
            </div>

            <div className={styles.fieldList}>
              <div className={styles.fieldItem}>
                <span className={styles.fieldLabel}>Settlement Bank</span>
                <span className={styles.fieldValue}>
                  {currentDriver?.bankName || currentDriver?.bank_name || "Not Configured"}
                </span>
              </div>
              <div className={styles.fieldItem}>
                <span className={styles.fieldLabel}>Account Number</span>
                <span className={styles.fieldValue}>
                  {currentDriver?.accountNumber
                    ? `••••${currentDriver.accountNumber.slice(-4)}`
                    : currentDriver?.account_number
                    ? `••••${currentDriver.account_number.slice(-4)}`
                    : "Not Configured"}
                </span>
              </div>
              <div className={styles.fieldItem}>
                <span className={styles.fieldLabel}>Account Name</span>
                <span className={styles.fieldValue}>
                  {`${currentDriver?.firstname || "Driver"} ${currentDriver?.lastname || ""}`.trim().toUpperCase()}
                </span>
              </div>
              <div className={styles.fieldItem}>
                <span className={styles.fieldLabel}>Payout Method</span>
                <span className={styles.fieldValue}>
                  Direct NIBSS Instant Settlement
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Security & Privacy Compliance Note */}
        <div className={styles.securityNoteBox}>
          <ShieldCheck size={24} color="#16a34a" style={{ flexShrink: 0 }} />
          <div>
            <strong>Identity & Data Protection Standard</strong>
            <p style={{ marginTop: "0.25rem", lineHeight: "1.4" }}>
              In compliance with C-Transit security guidelines, internal database keys, raw credentials, and cryptographic terminal signing secrets are strictly safeguarded and never exposed to the client interface.
            </p>
          </div>
        </div>
      </div>
    </DriverLayout>
  );
}
