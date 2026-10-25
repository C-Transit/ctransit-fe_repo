import { useMemo, useRef, useState, useEffect } from "react";
import { Search, CheckCircle2, Building2, ChevronDown } from "lucide-react";
import styles from "./BankPicker.module.css";

// Pinned first so the most common Nigerian banks are reachable without typing.
const POPULAR_CODES = [
  "058", // GTBank
  "044", // Access Bank
  "011", // First Bank
  "033", // UBA
  "057", // Zenith
  "100033", // PalmPay
  "50211", // Kuda
  "070", // Fidelity
  "032", // Union Bank
  "035", // Wema
  "221", // Stanbic IBTC
  "232", // Sterling
  "214", // FCMB
  "076", // Polaris
  "215", // Unity
  "082", // Keystone
  "101", // Providus
  "301", // Jaiz
  "305", // PayCom (OPay)
];

export default function BankPicker({ banks, value, onChange, loading, error }) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const wrapRef = useRef(null);

  const selectedBank = useMemo(
    () => (banks || []).find((b) => b.code === value) || null,
    [banks, value]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = q
      ? (banks || []).filter((bank) => bank.name.toLowerCase().includes(q))
      : banks || [];

    return [...list].sort((a, b) => {
      const ai = POPULAR_CODES.indexOf(a.code);
      const bi = POPULAR_CODES.indexOf(b.code);
      if (ai !== -1 || bi !== -1) {
        if (ai === -1) return 1;
        if (bi === -1) return -1;
        return ai - bi;
      }
      return a.name.localeCompare(b.name);
    });
  }, [banks, query]);

  const shown = filtered.slice(0, 80);

  // Close the dropdown when clicking outside.
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [isOpen]);

  const handleToggle = () => {
    if (loading || error) return;
    setIsOpen((prev) => !prev);
    if (!isOpen) setQuery("");
  };

  const handleSelect = (bank) => {
    onChange(bank);
    setIsOpen(false);
    setQuery("");
  };

  return (
    <div className={styles.wrap} ref={wrapRef}>
      <button
        type="button"
        className={styles.toggle}
        onClick={handleToggle}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        disabled={loading || !!error}
      >
        <Building2 size={18} className={styles.bankIcon} />
        <span className={styles.toggleLabel}>
          {loading
            ? "Loading banks..."
            : error
            ? "Could not load banks"
            : selectedBank
            ? selectedBank.name
            : "Choose your bank"}
        </span>
        <ChevronDown
          size={18}
          className={`${styles.chevron} ${isOpen ? styles.chevronOpen : ""}`}
        />
      </button>

      {isOpen && !loading && !error && (
        <div className={styles.panel}>
          <div className={styles.searchRow}>
            <Search size={18} className={styles.searchIcon} />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search your bank (GTBank, Access, Opay...)"
              className={styles.search}
              aria-label="Search banks"
              autoFocus
            />
          </div>

          <div className={styles.list} role="listbox" aria-label="Select your bank">
            {shown.map((bank) => {
              const selected = value === bank.code;
              return (
                <button
                  key={`${bank.code}-${bank.name}`}
                  type="button"
                  role="option"
                  aria-selected={selected}
                  className={selected ? styles.optionSelected : styles.option}
                  onClick={() => handleSelect(bank)}
                >
                  <Building2 size={18} className={styles.bankIcon} />
                  <span className={styles.bankName}>{bank.name}</span>
                  {selected && <CheckCircle2 size={18} className={styles.check} />}
                </button>
              );
            })}
            {shown.length === 0 && (
              <p className={styles.hint}>
                No bank matches &ldquo;{query}&rdquo;. Try a shorter name.
              </p>
            )}
          </div>
          {filtered.length > shown.length && (
            <p className={styles.hint}>
              Showing {shown.length} of {filtered.length}. Type more to narrow it
              down.
            </p>
          )}
        </div>
      )}

      {error && <p className={styles.error}>{error}</p>}
    </div>
  );
}
