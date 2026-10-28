import axios from "axios";
import { baseApiUrl, NOTIFICATIONS_API_URL } from "./api";
import {
  getDriverToken,
  setDriverSession,
  clearDriverSession,
  getDriverProfile,
} from "./driverAuth";

const driverApi = axios.create({
  baseURL: `${baseApiUrl}/api`,
  headers: {
    "Content-Type": "application/json",
  },
});

const MAX_RATE_LIMIT_RETRIES = 1;
const MAX_RATE_LIMIT_RETRY_DELAY_MS = 5000;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const parseRetryAfterMs = (retryAfter) => {
  if (!retryAfter) return null;

  const seconds = Number(retryAfter);
  if (Number.isFinite(seconds)) return Math.max(0, seconds * 1000);

  const retryDate = Date.parse(retryAfter);
  if (!Number.isNaN(retryDate)) return Math.max(0, retryDate - Date.now());

  return null;
};

const getRateLimitMessage = (retryAfterMs) => {
  if (!retryAfterMs) {
    return "Too many requests. Please wait a moment and try again.";
  }

  const seconds = Math.ceil(retryAfterMs / 1000);
  if (seconds < 60) {
    return `Too many requests. Please wait ${seconds} seconds and try again.`;
  }

  const minutes = Math.ceil(seconds / 60);
  return `Too many requests. Please wait ${minutes} minute${
    minutes === 1 ? "" : "s"
  } and try again.`;
};

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Request Interceptor: Attach Driver Bearer token
driverApi.interceptors.request.use(
  (config) => {
    const token = getDriverToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Auto refresh token on 401/403 once
driverApi.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (
      (error.response?.status === 401 || error.response?.status === 403) &&
      !originalRequest._retry &&
      !originalRequest.url?.includes("/login") &&
      !originalRequest.url?.includes("/auth/refresh")
    ) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return driverApi(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem("driver_refresh_token");
      if (!refreshToken) {
        clearDriverSession();
        isRefreshing = false;
        return Promise.reject(error);
      }

      try {
        const refreshResponse = await axios.post(
          `${baseApiUrl}/api/auth/refresh`,
          {
            refreshToken,
          }
        );

        const newAccessToken =
          refreshResponse.data?.accessToken || refreshResponse.data?.token;

        if (!newAccessToken) {
          throw new Error("No access token returned from refresh");
        }

        const existingProfile = getDriverProfile() || {};
        setDriverSession(newAccessToken, refreshToken, existingProfile);

        processQueue(null, newAccessToken);
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return driverApi(originalRequest);
      } catch (refreshErr) {
        processQueue(refreshErr, null);
        clearDriverSession();
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }

    if (error.response?.status === 429) {
      const retryAfterHeader =
        error.response.headers?.["retry-after"] ??
        error.response.headers?.get?.("retry-after");
      const retryAfterMs = parseRetryAfterMs(retryAfterHeader);

      error.isRateLimited = true;
      error.retryAfterMs = retryAfterMs;
      error.userMessage = getRateLimitMessage(retryAfterMs);

      const request = error.config;
      const isGet = request?.method?.toLowerCase() === "get";
      const retryCount = request?._rateLimitRetryCount || 0;
      const canRetry =
        isGet &&
        retryCount < MAX_RATE_LIMIT_RETRIES &&
        (retryAfterMs === null ||
          retryAfterMs <= MAX_RATE_LIMIT_RETRY_DELAY_MS);

      if (canRetry) {
        request._rateLimitRetryCount = retryCount + 1;
        await sleep(retryAfterMs ?? 1000 * 2 ** retryCount);
        return driverApi(request);
      }
    }

    return Promise.reject(error);
  }
);

// Helper for fallback request across candidate endpoints
const requestDriverWithFallback = async (
  primaryMethod,
  primaryPath,
  fallbackPaths = [],
  dataOrParams = null,
  isPostOrPatch = false
) => {
  const allPaths = [
    primaryPath,
    ...(Array.isArray(fallbackPaths) ? fallbackPaths : [fallbackPaths]),
  ];
  let lastErr = null;

  for (const p of allPaths) {
    try {
      if (isPostOrPatch) {
        const res = await driverApi[primaryMethod](p, dataOrParams || {});
        return res.data;
      }
      const res = await driverApi[primaryMethod](p, { params: dataOrParams });
      return res.data;
    } catch (err) {
      lastErr = err;
      // If 404 or 405 (endpoint doesn't exist on this path), try next path
      if (err.response?.status === 404 || err.response?.status === 405) {
        continue;
      }
      throw err;
    }
  }

  throw lastErr;
};

// ─── DRIVER API ENDPOINTS ───────────────────────────────────────────────────

/**
 * 1. Fetch Driver Profile
 * GET /api/drivers/me or /api/drivers/profile or /api/users/myprofile
 */
export const fetchDriverProfile = async () => {
  return requestDriverWithFallback("get", "/drivers/me", [
    "/drivers/profile",
    "/users/myprofile",
    "/auth/driver/me",
  ]);
};

/**
 * 2. Fetch Driver Dashboard Overview & Today's Earnings
 * GET /api/drivers/dashboard or /api/drivers/overview or /api/drivers/earnings
 */
export const fetchDriverDashboard = async () => {
  return requestDriverWithFallback("get", "/drivers/dashboard", [
    "/drivers/overview",
    "/drivers/earnings",
    "/transactions/history",
  ]);
};

/**
 * 3. Fetch Driver Rides / Trips History (with pagination, date, status filters)
 * GET /api/drivers/rides or /api/drivers/trips or /api/transactions/history
 */
export const fetchDriverRides = async ({
  page = 1,
  limit = 20,
  date,
  status,
  search,
} = {}) => {
  const params = { page, limit };
  if (date) params.date = date;
  if (status && status !== "ALL") params.status = status.toUpperCase();
  if (search) params.search = search.trim();

  return requestDriverWithFallback(
    "get",
    "/drivers/rides",
    ["/drivers/trips", "/transactions/history", "/transactions"],
    params
  );
};

/**
 * 4. Verify Payment for a Ride or Student
 * GET /api/drivers/verify-payment or /api/transactions/verify/:id
 */
export const verifyDriverPayment = async (referenceOrId) => {
  const cleanRef = String(referenceOrId || "").trim();
  return requestDriverWithFallback(
    "get",
    `/drivers/verify-payment/${encodeURIComponent(cleanRef)}`,
    [
      `/transactions/${encodeURIComponent(cleanRef)}`,
      `/payments/verify/${encodeURIComponent(cleanRef)}`,
    ]
  );
};

/**
 * 5. Fetch Driver Withdrawals & Settlement Status
 * GET /api/drivers/withdrawals or /api/wallets/withdrawals
 */
export const fetchDriverWithdrawals = async ({ page = 1, limit = 20 } = {}) => {
  return requestDriverWithFallback(
    "get",
    "/drivers/withdrawals",
    ["/wallets/withdrawals", "/drivers/settlements"],
    { page, limit }
  );
};

/**
 * 6. Request Driver Withdrawal
 * POST /api/drivers/withdraw
 */
export const requestDriverWithdrawal = async ({ amount, pin, remarks, idempotencyKey }) => {
  const payload = {
    amount: Number(amount),
    pin: String(pin || "").trim(),
    ...(remarks ? { remarks: remarks.trim() } : {}),
    ...(idempotencyKey ? { idempotencyKey } : {}),
  };

  return requestDriverWithFallback("post", "/drivers/withdraw", [], payload, true);
};

/**
 * 7. Fetch Driver Notifications
 * GET /api/drivers/notifications (fallback /api/notifications)
 */
export const fetchDriverNotifications = async ({
  page = 1,
  limit = 30,
} = {}) => {
  return requestDriverWithFallback(
    "get",
    "/drivers/notifications",
    ["/notifications", `${NOTIFICATIONS_API_URL}`],
    { page, limit }
  );
};

/**
 * 8. Mark Driver Notification As Read
 * PATCH /api/drivers/notifications/:id/read (fallback /api/notifications/:id/read)
 */
export const markDriverNotificationAsRead = async (id) => {
  return requestDriverWithFallback(
    "patch",
    `/drivers/notifications/${encodeURIComponent(id)}/read`,
    [
      `/notifications/${encodeURIComponent(id)}/read`,
      `/notifications/${encodeURIComponent(id)}/mark-read`,
    ],
    {},
    true
  );
};

/**
 * 9. Mark All Driver Notifications As Read
 * PATCH /api/drivers/notifications/mark-all-read (fallback /api/notifications/mark-all-read)
 */
export const markAllDriverNotificationsAsRead = async () => {
  return requestDriverWithFallback(
    "patch",
    "/drivers/notifications/mark-all-read",
    ["/notifications/mark-all-read", "/notifications/read-all"],
    {},
    true
  );
};

/**
 * Error message parser for driver card linking
 */
export const getDriverCardLinkErrorMessage = (err) => {
  const status = err?.response?.status;
  const data = err?.response?.data;
  const code = data?.code || data?.error || data?.message;
  const str = typeof code === "string" ? code.trim() : "";

  if (
    str === "CARD_ALREADY_LINKED" ||
    (status === 409 && str.includes("CARD"))
  ) {
    return "This physical card belongs to someone else.";
  }
  if (str === "DRIVER_ALREADY_HAS_CARD") {
    return "This driver already has a different card linked — must unlink first.";
  }
  if (str === "MISSING_TERMINAL_CONTEXT") {
    return "OTP has no terminal data — ask driver to tap again.";
  }
  if (str === "UNAUTHORIZED_DRIVER_ID" || status === 403) {
    return "Unauthorized driver account.";
  }
  if (str === "INVALID_OTP_FORMAT") {
    return "OTP isn't 6 digits.";
  }
  if (str === "INVALID_OTP") {
    return "OTP not recognized — ask driver to tap again.";
  }
  if (str === "CARD_MISMATCH") {
    return "Card mismatch — please tap the card again.";
  }
  if (str === "OTP_ALREADY_USED") {
    return "This OTP has already been used — ask driver to tap again for a fresh OTP.";
  }
  if (str === "OTP_EXPIRED") {
    return "This OTP has expired — ask driver to tap again.";
  }
  if (str === "DRIVER_NOT_FOUND" || status === 404) {
    return "Driver not found.";
  }
  if (str === "INVALID_PIN_FORMAT") {
    return "PIN isn't exactly 4 digits.";
  }
  if (str === "INVALID_PIN" || status === 401) {
    return "PIN doesn't match what was set at creation.";
  }
  return (
    data?.error ||
    data?.message ||
    "Failed to link card. Please verify and try again."
  );
};

/**
 * 11. Initiate Driver Card Linking (Card -> Driver binding)
 * POST /api/drivers/card/link
 * req.body: { otp, pin } (pin is re-confirmation of driver creation PIN)
 */
export const linkDriverCard = async ({ otp, pin }) => {
  const payload = {
    otp: String(otp || "").trim(),
    pin: String(pin || "").trim(),
  };

  return requestDriverWithFallback(
    "post",
    "/drivers/card/link",
    [],
    payload,
    true
  );
};

/**
 * 12. Fetch supported banks for the payout dropdown
 * GET /api/drivers/banks
 */
export const fetchDriverBanks = async () => {
  return requestDriverWithFallback("get", "/drivers/banks", [], {});
};

/**
 * 13. Resolve an account name (read-only, nothing is saved)
 * POST /api/drivers/bank/resolve
 * req.body: { bankCode, accountNumber }
 */
export const resolveDriverBank = async ({ bankCode, accountNumber }) => {
  const payload = {
    bankCode: String(bankCode || "").trim(),
    accountNumber: String(accountNumber || "").trim(),
  };

  return requestDriverWithFallback(
    "post",
    "/drivers/bank/resolve",
    [],
    payload,
    true
  );
};

/**
 * 14. Driver adds / verifies bank account (PIN required, saves the destination)
 * POST /api/drivers/bank/verify
 * req.body: { bankCode, accountNumber, pin }
 */
export const verifyDriverBank = async ({ bankCode, accountNumber, pin }) => {
  const payload = {
    bankCode: String(bankCode || "").trim(),
    accountNumber: String(accountNumber || "").trim(),
    pin: String(pin || "").trim(),
  };

  return requestDriverWithFallback(
    "post",
    "/drivers/bank/verify",
    [],
    payload,
    true
  );
};

export default driverApi;
