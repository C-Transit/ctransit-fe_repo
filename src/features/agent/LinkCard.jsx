import { useState } from "react";
import { motion } from "framer-motion";
import {
  FaSearch,
  FaUser,
  FaIdCard,
  FaKey,
  FaLink,
  FaUnlink,
  FaCheckCircle,
  FaExclamationTriangle,
} from "react-icons/fa";
import {
  linkAgentCard,
  unlinkAgentCard,
  getUnlinkCardErrorMessage,
  fetchAgentUsers,
} from "../../api/agentApi";
import styles from "./LinkCard.module.css";

export default function LinkCard() {
  const [activeMode, setActiveMode] = useState("link"); // 'link' | 'unlink'

  // Link state
  const [studentQuery, setStudentQuery] = useState("");
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [searchResults, setSearchResults] = useState([]);

  // Unlink state
  const [unlinkCardUid, setUnlinkCardUid] = useState("");
  const [unlinkUserIdentifier, setUnlinkUserIdentifier] = useState("");
  const [unlinkLoading, setUnlinkLoading] = useState(false);
  const [unlinkError, setUnlinkError] = useState(null);
  const [unlinkSuccess, setUnlinkSuccess] = useState(false);

  const handleSearchStudent = async () => {
    if (!studentQuery.trim()) return;
    setSearching(true);
    setError(null);
    setSelectedStudent(null);
    setSearchResults([]);

    try {
      const data = await fetchAgentUsers({ page: 1, limit: 10 });
      const students =
        data?.students || data?.data || (Array.isArray(data) ? data : []);
      const q = studentQuery.trim().toLowerCase();
      const matched = students.filter(
        (s) =>
          (s.email && s.email.toLowerCase().includes(q)) ||
          (s.matricNumber && s.matricNumber.toLowerCase().includes(q)) ||
          (s.firstname && s.firstname.toLowerCase().includes(q)) ||
          (s.lastname && s.lastname.toLowerCase().includes(q))
      );

      if (matched.length > 0) {
        setSearchResults(matched);
        setSelectedStudent(matched[0]);
      } else {
        // Allow direct student ID / matric linking even if not in first page of search
        setSelectedStudent({
          id: studentQuery.trim(),
          matricNumber: studentQuery.trim(),
          firstname: "Student",
          lastname: `(${studentQuery.trim()})`,
        });
      }
    } catch {
      // Fallback to manual entry
      setSelectedStudent({
        id: studentQuery.trim(),
        matricNumber: studentQuery.trim(),
        firstname: "Student",
        lastname: `(${studentQuery.trim()})`,
      });
    } finally {
      setSearching(false);
    }
  };

  const handleLinkCard = async (e) => {
    e.preventDefault();
    const targetStudentId =
      selectedStudent?.id ||
      selectedStudent?._id ||
      selectedStudent?.matricNumber ||
      studentQuery.trim();
    if (!targetStudentId || !otp.trim()) {
      setError(
        "Please provide the Student ID/Matric and the 6-digit card verification OTP."
      );
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      await linkAgentCard({
        studentId: targetStudentId,
        otp: otp.trim(),
      });

      setSuccess(true);
      setOtp("");
      setTimeout(() => setSuccess(false), 5000);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to link card. Please verify the OTP and Student ID."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleUnlinkCard = async (e) => {
    e.preventDefault();
    setUnlinkError(null);
    setUnlinkSuccess(false);

    const cUid = unlinkCardUid.trim();
    const uId = unlinkUserIdentifier.trim();

    if (!cUid && !uId) {
      setUnlinkError("Either cardUid or userIdentifier must be provided");
      return;
    }

    setUnlinkLoading(true);

    try {
      // If both available, prefer cardUid
      await unlinkAgentCard(cUid ? { cardUid: cUid } : { userIdentifier: uId });
      setUnlinkSuccess(true);
      setUnlinkCardUid("");
      setUnlinkUserIdentifier("");
      setTimeout(() => setUnlinkSuccess(false), 5000);
    } catch (err) {
      setUnlinkError(getUnlinkCardErrorMessage(err));
    } finally {
      setUnlinkLoading(false);
    }
  };

  return (
    <div className={styles.linkCard}>
      <div className={styles.header}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            width: "100%",
            flexWrap: "wrap",
            gap: "1rem",
          }}
        >
          <div>
            <h1 className={styles.pageTitle}>Transit Card Management</h1>
            <p className={styles.pageSubtitle}>
              Authorize, bind, or unlink physical RFID Transit Cards
            </p>
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
            <button
              type="button"
              onClick={() => setActiveMode("link")}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "8px 16px",
                borderRadius: "8px",
                border:
                  activeMode === "link"
                    ? "2px solid #0284c7"
                    : "1px solid #cbd5e1",
                background: activeMode === "link" ? "#0284c7" : "#ffffff",
                color: activeMode === "link" ? "#ffffff" : "#475569",
                fontWeight: 600,
                fontSize: "13px",
                cursor: "pointer",
              }}
            >
              <FaLink /> Link Card
            </button>
            <button
              type="button"
              onClick={() => setActiveMode("unlink")}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "8px 16px",
                borderRadius: "8px",
                border:
                  activeMode === "unlink"
                    ? "2px solid #dc2626"
                    : "1px solid #cbd5e1",
                background: activeMode === "unlink" ? "#dc2626" : "#ffffff",
                color: activeMode === "unlink" ? "#ffffff" : "#475569",
                fontWeight: 600,
                fontSize: "13px",
                cursor: "pointer",
              }}
            >
              <FaUnlink /> Unlink Card
            </button>
          </div>
        </div>
      </div>

      {activeMode === "unlink" ? (
        <div className={styles.container}>
          <div
            className={styles.cardSection}
            style={{
              gridColumn: "span 2",
              maxWidth: "640px",
              margin: "0 auto",
              width: "100%",
            }}
          >
            <h2 className={styles.sectionTitle}>Unlink Active Transit Card</h2>
            <p
              style={{
                fontSize: "13px",
                color: "#64748b",
                marginBottom: "1rem",
              }}
            >
              Clear card binding across system terminals. Provide either the
              physical Card UID or the user identifier (matric number, driver
              ID, or phone).
            </p>

            <form onSubmit={handleUnlinkCard} className={styles.cardForm}>
              <div className={styles.formGroup}>
                <label className={styles.label}>
                  <FaIdCard className={styles.labelIcon} /> Physical Card UID
                  (Preferred)
                </label>
                <input
                  type="text"
                  placeholder="e.g. 04A23B5C8D"
                  value={unlinkCardUid}
                  onChange={(e) => setUnlinkCardUid(e.target.value)}
                  className={styles.input}
                />
              </div>

              <div
                style={{
                  textAlign: "center",
                  color: "#94a3b8",
                  fontSize: "12px",
                  fontWeight: 600,
                }}
              >
                — OR —
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>
                  <FaUser className={styles.labelIcon} /> User Identifier
                  (Matric / Driver ID / Phone)
                </label>
                <input
                  type="text"
                  placeholder="e.g. 2021/1/12345 or 08012345678"
                  value={unlinkUserIdentifier}
                  onChange={(e) => setUnlinkUserIdentifier(e.target.value)}
                  className={styles.input}
                />
              </div>

              {unlinkError && (
                <div className={styles.errorBox}>
                  <FaExclamationTriangle style={{ marginRight: "6px" }} />{" "}
                  {unlinkError}
                </div>
              )}
              {unlinkSuccess && (
                <div className={styles.successBox}>
                  <FaCheckCircle style={{ marginRight: "6px" }} /> Card unlinked
                  successfully!
                </div>
              )}

              <button
                type="submit"
                className={styles.linkBtn}
                style={{ background: "#dc2626" }}
                disabled={
                  unlinkLoading ||
                  (!unlinkCardUid.trim() && !unlinkUserIdentifier.trim())
                }
              >
                <FaUnlink />{" "}
                {unlinkLoading ? "Unlinking..." : "Confirm & Unlink Card"}
              </button>
            </form>
          </div>
        </div>
      ) : (
        <div className={styles.container}>
          <div className={styles.searchSection}>
            <h2 className={styles.sectionTitle}>1. Locate Student Account</h2>
            <div className={styles.searchBox}>
              <div className={styles.searchInput}>
                <FaSearch className={styles.searchIcon} />
                <input
                  type="text"
                  placeholder="Enter student Matric No (e.g. 2021/1/12345) or Email"
                  value={studentQuery}
                  onChange={(e) => setStudentQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearchStudent()}
                  className={styles.input}
                />
              </div>
              <button
                className={styles.searchBtn}
                onClick={handleSearchStudent}
                disabled={searching}
              >
                <FaSearch /> {searching ? "Finding..." : "Find"}
              </button>
            </div>

            {searchResults.length > 1 && (
              <div
                style={{
                  marginTop: "12px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "6px",
                }}
              >
                <span style={{ fontSize: "12px", color: "#64748b" }}>
                  Multiple matches found:
                </span>
                {searchResults.map((s) => (
                  <button
                    key={s.id || s._id || s.matricNumber}
                    type="button"
                    onClick={() => setSelectedStudent(s)}
                    style={{
                      padding: "8px 12px",
                      textAlign: "left",
                      background:
                        selectedStudent?.id === s.id ? "#e0f2fe" : "#f8fafc",
                      border: "1px solid #cbd5e1",
                      borderRadius: "6px",
                      fontSize: "13px",
                      cursor: "pointer",
                    }}
                  >
                    <strong>
                      {s.firstname} {s.lastname}
                    </strong>{" "}
                    — {s.matricNumber || s.email}
                  </button>
                ))}
              </div>
            )}

            {selectedStudent && (
              <motion.div
                className={styles.userCard}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className={styles.userHeader}>
                  <div className={styles.userAvatar}>
                    <FaUser />
                  </div>
                  <div className={styles.userInfo}>
                    <h3>
                      {selectedStudent.firstname} {selectedStudent.lastname}
                    </h3>
                    <p>
                      Matric / ID:{" "}
                      <strong>
                        {selectedStudent.matricNumber || selectedStudent.id}
                      </strong>
                    </p>
                    {selectedStudent.email && (
                      <p className={styles.userPhone}>
                        {selectedStudent.email}
                      </p>
                    )}
                  </div>
                  <div className={styles.cardStatus}>
                    <span className={styles.cardNotLinked}>Ready to Link</span>
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          <div className={styles.cardSection}>
            <h2 className={styles.sectionTitle}>
              2. Enter Link Authorization Code
            </h2>
            <form onSubmit={handleLinkCard} className={styles.cardForm}>
              <div className={styles.formGroup}>
                <label className={styles.label}>
                  <FaIdCard className={styles.labelIcon} /> Student ID / Matric
                  Number
                </label>
                <input
                  type="text"
                  placeholder="Target Student Identifier"
                  value={
                    selectedStudent?.matricNumber ||
                    selectedStudent?.id ||
                    studentQuery
                  }
                  onChange={(e) => {
                    const val = e.target.value;
                    setSelectedStudent((prev) => ({
                      ...(prev || {}),
                      matricNumber: val,
                      id: val,
                    }));
                  }}
                  className={styles.input}
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>
                  <FaKey className={styles.labelIcon} /> Student Card OTP (6
                  Digits)
                </label>
                <input
                  type="text"
                  placeholder="e.g. 849201"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                  className={styles.input}
                  required
                />
                <span
                  style={{
                    fontSize: "12px",
                    color: "#64748b",
                    marginTop: "4px",
                  }}
                >
                  Student generates this OTP in their profile under "Settings →
                  Card Linking".
                </span>
              </div>

              {error && (
                <div className={styles.errorBox}>
                  <FaExclamationTriangle style={{ marginRight: "6px" }} />{" "}
                  {error}
                </div>
              )}
              {success && (
                <div className={styles.successBox}>
                  <FaCheckCircle style={{ marginRight: "6px" }} /> Physical
                  Transit Card linked successfully!
                </div>
              )}

              <button
                type="submit"
                className={styles.linkBtn}
                disabled={loading || !otp}
              >
                <FaLink /> {loading ? "Binding Card..." : "Confirm & Link Card"}
              </button>
            </form>
          </div>

          <div className={styles.infoBox}>
            <h3>
              <FaIdCard style={{ marginRight: "8px" }} /> Field Operations Guide
            </h3>
            <ul>
              <li>
                Ask the student to open their C-Transit app and click "Link New
                Card" in Settings.
              </li>
              <li>
                Input their student matriculation ID and the 6-digit OTP they
                generated.
              </li>
              <li>Tap the student card on the terminal to complete binding.</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
