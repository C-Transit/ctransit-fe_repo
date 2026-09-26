// src/components/PaymentStatusToast.jsx

/**
 * PaymentStatusToast
 *
 * Inline status panel for the Kora Checkout return flow.
 * aria-live="polite" so screen readers announce status changes.
 *
 * Props (all from usePaymentReturn):
 *   status      — current status string
 *   amount      — NGN amount paid (number | null)
 *   newBalance  — updated wallet balance (number | null)
 *   message     — human-readable status message
 *   checkAgain  — fn() — re-poll (shown on TIMEOUT)
 *   dismiss     — fn() — clear the panel
 *   onTryAgain  — fn() — open the top-up form (shown on failure statuses)
 */
export default function PaymentStatusToast({
  status,
  amount,
  newBalance,
  message,
  checkAgain,
  dismiss,
  onTryAgain,
}) {
  if (status === "IDLE") return null;

  // ─── Colour tokens per status ─────────────────────────────────────────────
  const config = {
    PENDING: {
      bg: "#EFF6FF",
      border: "#BFDBFE",
      color: "#1E40AF",
      icon: "⏳",
      title: "Checking payment…",
    },
    PROCESSING: {
      bg: "#EFF6FF",
      border: "#BFDBFE",
      color: "#1E40AF",
      icon: "🔄",
      title: "Payment processing…",
    },
    SUCCESS: {
      bg: "#F0FDF4",
      border: "#BBF7D0",
      color: "#166534",
      icon: "✅",
      title: "Payment successful!",
    },
    FAILED: {
      bg: "#FEF2F2",
      border: "#FECACA",
      color: "#991B1B",
      icon: "❌",
      title: "Payment failed",
    },
    CANCELLED: {
      bg: "#FEF2F2",
      border: "#FECACA",
      color: "#991B1B",
      icon: "🚫",
      title: "Payment cancelled",
    },
    EXPIRED: {
      bg: "#FEF3C7",
      border: "#FDE68A",
      color: "#92400E",
      icon: "⌛",
      title: "Payment expired",
    },
    TIMEOUT: {
      bg: "#FEF3C7",
      border: "#FDE68A",
      color: "#92400E",
      icon: "⏱️",
      title: "Still checking…",
    },
    ERROR: {
      bg: "#FEF2F2",
      border: "#FECACA",
      color: "#991B1B",
      icon: "⚠️",
      title: "Something went wrong",
    },
  };

  const c = config[status] || config.ERROR;

  const panelStyle = {
    position: "relative",
    margin: "0 0 16px",
    padding: "14px 16px",
    borderRadius: "10px",
    border: `1px solid ${c.border}`,
    background: c.bg,
    color: c.color,
  };

  const headerStyle = {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontWeight: 700,
    fontSize: "15px",
    marginBottom: message ? "6px" : 0,
  };

  const msgStyle = {
    fontSize: "13px",
    marginBottom: "10px",
    lineHeight: 1.5,
  };

  const dismissBtnStyle = {
    position: "absolute",
    top: "10px",
    right: "12px",
    background: "transparent",
    border: "none",
    fontSize: "16px",
    cursor: "pointer",
    color: c.color,
    lineHeight: 1,
  };

  const actionBtnStyle = {
    display: "inline-block",
    marginRight: "8px",
    marginTop: "4px",
    padding: "7px 14px",
    fontSize: "13px",
    fontWeight: 600,
    borderRadius: "6px",
    border: `1px solid ${c.color}`,
    background: "transparent",
    color: c.color,
    cursor: "pointer",
  };

  const isFailure = ["FAILED", "CANCELLED", "EXPIRED", "ERROR"].includes(
    status
  );
  const isSpinning = status === "PENDING" || status === "PROCESSING";

  return (
    <div style={panelStyle} aria-live="polite" aria-atomic="true" role="status">
      {/* Dismiss button (always available) */}
      <button
        style={dismissBtnStyle}
        onClick={dismiss}
        aria-label="Dismiss payment status"
        title="Dismiss"
      >
        ×
      </button>

      {/* Header */}
      <div style={headerStyle}>
        <span aria-hidden="true">{c.icon}</span>
        <span>{c.title}</span>
        {isSpinning && (
          <span
            aria-hidden="true"
            style={{
              marginLeft: "2px",
              display: "inline-block",
              animation: "spin 1s linear infinite",
            }}
          ></span>
        )}
      </div>

      {/* Message */}
      {message && <p style={msgStyle}>{message}</p>}

      {/* SUCCESS — show amounts */}
      {status === "SUCCESS" && (
        <div style={{ fontSize: "13px", marginBottom: "6px" }}>
          {amount != null && (
            <p style={{ margin: "2px 0" }}>
              Amount paid:{" "}
              <strong>
                ₦
                {Number(amount).toLocaleString("en-NG", {
                  minimumFractionDigits: 2,
                })}
              </strong>
            </p>
          )}
          {newBalance != null && (
            <p style={{ margin: "2px 0" }}>
              New balance:{" "}
              <strong>
                ₦
                {Number(newBalance).toLocaleString("en-NG", {
                  minimumFractionDigits: 2,
                })}
              </strong>
            </p>
          )}
        </div>
      )}

      {/* TIMEOUT — "Check again" */}
      {status === "TIMEOUT" && checkAgain && (
        <button style={actionBtnStyle} onClick={checkAgain}>
          Check again
        </button>
      )}

      {/* Failure statuses — "Try again" */}
      {isFailure && onTryAgain && (
        <button style={actionBtnStyle} onClick={onTryAgain}>
          Try again
        </button>
      )}
    </div>
  );
}
