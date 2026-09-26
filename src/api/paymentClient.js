// src/api/paymentClient.js
import axios from "axios";
import { PAYMENTS_API_URL, WALLETS_API_URL, AUTH_API_URL } from "./api";

// ─── Token helpers (same source as the rest of the app) ───────────────────────
const getAccessToken = () =>
  localStorage.getItem("authToken") || localStorage.getItem("token");

const setAccessToken = (token) => {
  localStorage.setItem("authToken", token);
  localStorage.setItem("token", token);
  axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
};

const getRefreshToken = () => localStorage.getItem("refreshToken");

// ─── Auth headers ─────────────────────────────────────────────────────────────
const authHeaders = () => {
  const token = getAccessToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// ─── 401 → refresh-once → retry → redirect ────────────────────────────────────
let isRefreshing = false;
let pendingQueue = [];

function resolveQueue(newToken) {
  pendingQueue.forEach((cb) => cb(newToken));
  pendingQueue = [];
}

async function withAuth(requestFn, signal) {
  try {
    return await requestFn(getAccessToken(), signal);
  } catch (err) {
    if (err.response?.status !== 401) throw err;

    // Already tried refreshing — give up
    if (isRefreshing) {
      return new Promise((_, reject) => {
        pendingQueue.push(() => reject(err));
      });
    }

    isRefreshing = true;
    const refreshToken = getRefreshToken();

    if (!refreshToken) {
      isRefreshing = false;
      redirectToLogin();
      throw err;
    }

    try {
      const refreshRes = await axios.post(`${AUTH_API_URL}/refresh`, {
        refreshToken,
      });
      const newToken = refreshRes.data?.accessToken || refreshRes.data?.token;

      if (!newToken) throw new Error("No token in refresh response");

      setAccessToken(newToken);
      resolveQueue(newToken);
      isRefreshing = false;

      // Retry the original request once with the new token
      return await requestFn(newToken, signal);
    } catch {
      isRefreshing = false;
      pendingQueue = [];
      redirectToLogin();
      throw err;
    }
  }
}

function redirectToLogin() {
  // Clear passenger session — match what DashboardWrapper does on logout
  localStorage.removeItem("authToken");
  localStorage.removeItem("token");
  localStorage.removeItem("authUser");
  localStorage.removeItem("refreshToken");
  delete axios.defaults.headers.common["Authorization"];
  window.location.href = "/auth/login";
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * POST /api/payments/initialize
 * @param {{ amount: number }} params  — amount in whole NGN, 150–10000
 * @param {AbortSignal} [signal]
 */
export async function initializeCheckout({ amount }, signal) {
  return withAuth(async (token, sig) => {
    const res = await axios.post(
      `${PAYMENTS_API_URL}/initialize`,
      { amount },
      {
        headers: { Authorization: `Bearer ${token}` },
        signal: sig,
      }
    );
    return res.data;
  }, signal);
}

/**
 * GET /api/payments/status/:reference
 * @param {string} reference
 * @param {AbortSignal} [signal]
 */
export async function getPaymentStatus(reference, signal) {
  return withAuth(async (token, sig) => {
    const res = await axios.get(
      `${PAYMENTS_API_URL}/status/${encodeURIComponent(reference)}`,
      {
        headers: { Authorization: `Bearer ${token}` },
        signal: sig,
      }
    );
    return res.data;
  }, signal);
}

/**
 * GET /api/wallets/details
 * @param {AbortSignal} [signal]
 */
export async function getWalletDetails(signal) {
  return withAuth(async (token, sig) => {
    const res = await axios.get(`${WALLETS_API_URL}/details`, {
      headers: { Authorization: `Bearer ${token}` },
      signal: sig,
    });
    return res.data;
  }, signal);
}
