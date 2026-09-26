// src/hooks/useTopUpWallet.js
import { useState, useCallback } from "react";
import { initializeCheckout } from "../api/paymentClient";

const MIN_AMOUNT = 150;
const MAX_AMOUNT = 10000;

function validateAmount(raw) {
  const n = Math.floor(Number(raw));
  if (!Number.isFinite(n) || n !== Number(raw)) {
    return "Amount must be a whole number.";
  }
  if (n < MIN_AMOUNT) return `Minimum top-up is ₦${MIN_AMOUNT}.`;
  if (n > MAX_AMOUNT)
    return `Maximum top-up is ₦${MAX_AMOUNT.toLocaleString("en-NG")}.`;
  return null;
}

/**
 * Hook for the Kora Checkout top-up flow.
 *
 * Returns: { submit, isLoading, error, isKycRequired, reset }
 *
 * On success: saves reference to sessionStorage and navigates to Kora.
 * On failure: sets error / isKycRequired.
 */
export function useTopUpWallet() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isKycRequired, setIsKycRequired] = useState(false);

  const reset = useCallback(() => {
    setError(null);
    setIsKycRequired(false);
    setIsLoading(false);
  }, []);

  const submit = useCallback(async (rawAmount) => {
    setError(null);
    setIsKycRequired(false);

    const validationError = validateAmount(rawAmount);
    if (validationError) {
      setError(validationError);
      return;
    }

    const amount = Math.floor(Number(rawAmount));
    setIsLoading(true);

    try {
      const responseData = await initializeCheckout({ amount });
      const { reference, checkoutUrl } = responseData?.data || {};

      if (!reference || !checkoutUrl) {
        throw new Error("Invalid response from payment server.");
      }

      sessionStorage.setItem("pendingPaymentReference", reference);
      // Navigate away — no state update needed after this point
      window.location.href = checkoutUrl;
    } catch (err) {
      const status = err.response?.status;
      const message = err.response?.data?.message || "";

      if (
        status === 400 &&
        (message.toLowerCase().includes("kyc") ||
          message.toLowerCase().includes("wallet not activated") ||
          message.toLowerCase().includes("verification"))
      ) {
        setIsKycRequired(true);
        setError("Your wallet needs to be verified before you can top up.");
      } else if (status === 403) {
        setError("You are not authorised to perform this action.");
      } else if (!err.response) {
        setError(
          "Could not reach the server. Check your connection and try again."
        );
      } else {
        setError(message || "Top-up failed. Please try again.");
      }

      setIsLoading(false);
    }
    // Do NOT set isLoading false on success — the page is navigating away.
  }, []);

  return { submit, isLoading, error, isKycRequired, reset };
}

export default useTopUpWallet;
