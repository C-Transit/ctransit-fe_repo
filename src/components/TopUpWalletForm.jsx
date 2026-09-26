// src/components/TopUpWalletForm.jsx
import { useState } from "react";
import { useTopUpWallet } from "../hooks/useTopUpWallet";

const QUICK_AMOUNTS = [150, 500, 1000, 2000];

/**
 * TopUpWalletForm
 *
 * Presentational form component for the Kora Checkout top-up flow.
 * Calls useTopUpWallet internally.
 *
 * Props:
 *   onCancel — called when the user closes the form without submitting.
 */
export default function TopUpWalletForm({ onCancel }) {
  const [rawAmount, setRawAmount] = useState("");
  const { submit, isLoading, error, isKycRequired, reset } = useTopUpWallet();

  const handleQuickSelect = (val) => {
    setRawAmount(String(val));
    reset();
  };

  const handleChange = (e) => {
    // Strip anything that's not a digit
    const digitsOnly = e.target.value.replace(/\D/g, "");
    setRawAmount(digitsOnly);
    if (error) reset();
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = (e.clipboardData || window.clipboardData).getData("text");
    const digitsOnly = pasted.replace(/\D/g, "");
    setRawAmount(digitsOnly);
    if (error) reset();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    submit(rawAmount);
  };

  const containerStyle = {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  };

  const labelStyle = {
    display: "block",
    fontSize: "14px",
    fontWeight: 600,
    color: "#374151",
    marginBottom: "6px",
  };

  const inputStyle = {
    width: "100%",
    padding: "12px 14px",
    fontSize: "16px",
    border: "1px solid #D1D5DB",
    borderRadius: "8px",
    outline: "none",
    boxSizing: "border-box",
  };

  const quickRowStyle = {
    display: "flex",
    gap: "8px",
    flexWrap: "wrap",
  };

  const quickBtnStyle = (selected) => ({
    flex: "1 1 auto",
    padding: "8px 4px",
    fontSize: "13px",
    fontWeight: 500,
    border: `1px solid ${selected ? "#1A56DB" : "#D1D5DB"}`,
    borderRadius: "6px",
    background: selected ? "#EFF6FF" : "#FFFFFF",
    color: selected ? "#1A56DB" : "#374151",
    cursor: "pointer",
  });

  const submitBtnStyle = {
    width: "100%",
    padding: "13px",
    fontSize: "15px",
    fontWeight: 600,
    background: isLoading ? "#93C5FD" : "#1A56DB",
    color: "#FFFFFF",
    border: "none",
    borderRadius: "8px",
    cursor: isLoading ? "not-allowed" : "pointer",
  };

  const cancelBtnStyle = {
    width: "100%",
    padding: "11px",
    fontSize: "14px",
    background: "transparent",
    color: "#6B7280",
    border: "1px solid #D1D5DB",
    borderRadius: "8px",
    cursor: "pointer",
  };

  const errorBoxStyle = {
    padding: "10px 12px",
    borderRadius: "6px",
    fontSize: "13px",
    background: "#FEF2F2",
    border: "1px solid #FECACA",
    color: "#B91C1C",
  };

  const kycBannerStyle = {
    padding: "10px 12px",
    borderRadius: "6px",
    fontSize: "13px",
    background: "#FFFBEB",
    border: "1px solid #FDE68A",
    color: "#92400E",
  };

  const numericAmount = Number(rawAmount);

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div style={containerStyle}>
        <div>
          <label htmlFor="topup-amount" style={labelStyle}>
            Enter amount (₦)
          </label>
          <input
            id="topup-amount"
            type="number"
            inputMode="numeric"
            step="1"
            min="150"
            max="10000"
            value={rawAmount}
            onChange={handleChange}
            onPaste={handlePaste}
            placeholder="e.g. 500"
            disabled={isLoading}
            aria-describedby={error ? "topup-error" : undefined}
            style={inputStyle}
            autoFocus
          />
        </div>

        {/* Quick-select buttons */}
        <div
          style={quickRowStyle}
          role="group"
          aria-label="Quick amount select"
        >
          {QUICK_AMOUNTS.map((val) => (
            <button
              key={val}
              type="button"
              onClick={() => handleQuickSelect(val)}
              disabled={isLoading}
              style={quickBtnStyle(numericAmount === val)}
              aria-pressed={numericAmount === val}
            >
              ₦{val.toLocaleString("en-NG")}
            </button>
          ))}
        </div>

        {/* KYC banner (takes priority over generic error) */}
        {isKycRequired && (
          <div style={kycBannerStyle} role="alert">
            ⚠️ <strong>Verification required.</strong> Please complete your KYC
            to activate your wallet before topping up.
          </div>
        )}

        {/* Generic inline error */}
        {error && !isKycRequired && (
          <div id="topup-error" style={errorBoxStyle} role="alert">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading || !rawAmount}
          style={submitBtnStyle}
        >
          {isLoading ? "Redirecting to payment…" : "Continue to payment"}
        </button>

        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            style={cancelBtnStyle}
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
