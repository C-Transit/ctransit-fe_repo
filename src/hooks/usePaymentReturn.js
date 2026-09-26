// src/hooks/usePaymentReturn.js
import { useState, useEffect, useRef, useCallback } from "react";
import { getPaymentStatus, getWalletDetails } from "../api/paymentClient";

const BACKOFF_MS = [1500, 2000, 3000, 5000, 8000, 13000];

const TERMINAL_STATUSES = new Set([
  "SUCCESS",
  "FAILED",
  "CANCELLED",
  "EXPIRED",
]);

/**
 * Hook that handles the Kora Checkout return flow.
 *
 * On mount:
 *  - Reads ?reference= from the URL (or falls back to sessionStorage).
 *  - If found: cleans the URL immediately, then polls the status endpoint.
 *  - If not found: stays IDLE.
 *
 * Returns: { status, amount, newBalance, message, checkAgain, dismiss }
 *
 * status is one of:
 *   "IDLE" | "PENDING" | "PROCESSING" | "SUCCESS"
 *   | "FAILED" | "CANCELLED" | "EXPIRED" | "TIMEOUT" | "ERROR"
 */
export function usePaymentReturn() {
  const [status, setStatus] = useState("IDLE");
  const [amount, setAmount] = useState(null);
  const [newBalance, setNewBalance] = useState(null);
  const [message, setMessage] = useState("");

  const abortRef = useRef(null);
  const hasRun = useRef(false);
  const timeoutRef = useRef(null);

  // Stable helper — clear the pending reference and cancel timers
  const cleanup = useCallback((nextStatus, nextMessage) => {
    sessionStorage.removeItem("pendingPaymentReference");
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (abortRef.current) abortRef.current.abort();
    setStatus(nextStatus);
    setMessage(nextMessage || "");
  }, []);

  // ─── Polling logic ────────────────────────────────────────────────────────
  const runPolling = useCallback(
    async (reference) => {
      setStatus("PENDING");

      for (let i = 0; i < BACKOFF_MS.length; i++) {
        // Wait before polling (first attempt waits 1.5s — gives webhook time)
        await new Promise((resolve) => {
          timeoutRef.current = setTimeout(resolve, BACKOFF_MS[i]);
        });

        // Create a fresh AbortController for this request
        const controller = new AbortController();
        abortRef.current = controller;

        let data;
        try {
          const res = await getPaymentStatus(reference, controller.signal);
          data = res?.data;
        } catch (err) {
          if (err.name === "CanceledError" || err.name === "AbortError") return;

          const httpStatus = err.response?.status;
          if (httpStatus === 401 || httpStatus === 404) {
            cleanup(
              "ERROR",
              httpStatus === 401
                ? "Session expired. Please log in again."
                : "Payment reference not found."
            );
            return;
          }

          // Network error — show user-facing message then stop
          if (!err.response) {
            cleanup(
              "ERROR",
              "Could not reach the server. Check your connection."
            );
            return;
          }

          // Other HTTP error — surface and stop
          cleanup(
            "ERROR",
            err.response?.data?.message || "Something went wrong."
          );
          return;
        }

        const payStatus = data?.status;

        if (payStatus === "PROCESSING") {
          setStatus("PROCESSING");
        }

        if (TERMINAL_STATUSES.has(payStatus)) {
          if (payStatus === "SUCCESS") {
            const paid = data?.amount ?? null;
            setAmount(paid);

            // Fetch fresh balance
            try {
              const walletController = new AbortController();
              abortRef.current = walletController;
              const walletRes = await getWalletDetails(walletController.signal);
              const fresh = walletRes?.data?.balance ?? null;
              setNewBalance(fresh);
            } catch {
              // Non-fatal — balance just won't show
            }

            cleanup("SUCCESS", "Your wallet has been topped up successfully!");
          } else {
            const statusMessages = {
              FAILED: "Your payment failed. Please try again.",
              CANCELLED: "Payment was cancelled.",
              EXPIRED: "The payment session expired.",
            };
            cleanup(
              payStatus,
              statusMessages[payStatus] || "Payment was not completed."
            );
          }
          return; // stop polling
        }
      }

      // Exhausted all attempts
      cleanup(
        "TIMEOUT",
        "Payment is taking longer than expected. Check back soon."
      );
    },
    [cleanup]
  );

  // ─── Mount effect ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    // Extract reference from URL query string
    const searchParams = new URLSearchParams(window.location.search);
    const urlReference = searchParams.get("reference");
    const storedReference = sessionStorage.getItem("pendingPaymentReference");

    const reference = urlReference || storedReference;
    if (!reference) return; // Normal dashboard visit — stay IDLE

    // Immediately clean the URL before any async work
    window.history.replaceState({}, document.title, "/dashboard");

    runPolling(reference);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (abortRef.current) abortRef.current.abort();
    };
  }, [runPolling]);

  // ─── checkAgain — let user manually re-poll on TIMEOUT ───────────────────
  const checkAgain = useCallback(() => {
    const reference = sessionStorage.getItem("pendingPaymentReference");
    if (!reference) {
      setStatus("ERROR");
      setMessage("No payment reference found.");
      return;
    }
    hasRun.current = false; // allow re-run
    setStatus("PENDING");
    setMessage("");
    runPolling(reference);
  }, [runPolling]);

  // ─── dismiss ─────────────────────────────────────────────────────────────
  const dismiss = useCallback(() => {
    sessionStorage.removeItem("pendingPaymentReference");
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (abortRef.current) abortRef.current.abort();
    setStatus("IDLE");
    setAmount(null);
    setNewBalance(null);
    setMessage("");
  }, []);

  return { status, amount, newBalance, message, checkAgain, dismiss };
}

export default usePaymentReturn;
