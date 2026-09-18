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
        const refreshResponse = await axios.post(`${baseApiUrl}/api/auth/refresh`, {
          refreshToken,
        });

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
  const allPaths = [primaryPath, ...(Array.isArray(fallbackPaths) ? fallbackPaths : [fallbackPaths])];
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
export const fetchDriverRides = async ({ page = 1, limit = 20, date, status, search } = {}) => {
  const params = { page, limit };
  if (date) params.date = date;
  if (status && status !== "ALL") params.status = status.toUpperCase();
  if (search) params.search = search.trim();

  return requestDriverWithFallback(
    "get",
    "/drivers/rides",
    [
      "/drivers/trips",
      "/transactions/history",
      "/transactions",
    ],
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
    [
      "/wallets/withdrawals",
      "/drivers/settlements",
    ],
    { page, limit }
  );
};

/**
 * 6. Request Driver Withdrawal
 * POST /api/drivers/withdraw (fallback /api/drivers/withdrawals, /api/wallets/withdraw)
 */
export const requestDriverWithdrawal = async ({
  amount,
  bankName,
  accountNumber,
  accountName,
  bankCode,
  remarks,
}) => {
  const payload = {
    amount: Number(amount),
    ...(bankName ? { bankName: bankName.trim() } : {}),
    ...(accountNumber ? { accountNumber: accountNumber.trim() } : {}),
    ...(accountName ? { accountName: accountName.trim() } : {}),
    ...(bankCode ? { bankCode: bankCode.trim() } : {}),
    ...(remarks ? { remarks: remarks.trim() } : {}),
  };

  return requestDriverWithFallback(
    "post",
    "/drivers/withdraw",
    [
      "/drivers/withdrawals",
      "/wallets/withdraw",
      "/drivers/settlements/request",
    ],
    payload,
    true
  );
};

/**
 * 7. Fetch Driver Notifications
 * GET /api/drivers/notifications (fallback /api/notifications)
 */
export const fetchDriverNotifications = async ({ page = 1, limit = 30 } = {}) => {
  return requestDriverWithFallback(
    "get",
    "/drivers/notifications",
    [
      "/notifications",
      `${NOTIFICATIONS_API_URL}`,
    ],
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
    [
      "/notifications/mark-all-read",
      "/notifications/read-all",
    ],
    {},
    true
  );
};

/**
 * 10. Fetch Driver Assigned Terminal Status
 * GET /api/terminals/:terminalId or /api/drivers/terminal
 */
export const fetchDriverTerminalStatus = async (terminalId) => {
  const path = terminalId ? `/terminals/${encodeURIComponent(terminalId)}` : "/terminals/my-terminal";
  return requestDriverWithFallback(
    "get",
    path,
    [
      terminalId ? `/terminals/${encodeURIComponent(terminalId)}/status` : null,
      terminalId ? `/drivers/terminal/${encodeURIComponent(terminalId)}` : "/drivers/terminal",
      "/terminals/status",
      "/admin/terminals",
    ].filter(Boolean)
  );
};

/**
 * 11. Initiate Driver Card Linking (Card -> Driver binding)
 * POST /api/drivers/card/link (Explicit Backend Dependency)
 */
export const linkDriverCard = async ({ otp, cardUid, driverId }) => {
  const payload = {
    otp: String(otp || "").trim(),
    cardUid: String(cardUid || "").trim(),
    driverId: String(driverId || "").trim(),
  };

  return requestDriverWithFallback(
    "post",
    "/drivers/card/link",
    [
      "/agents/card/link",
      "/cards/link",
    ],
    payload,
    true
  );
};

export default driverApi;
