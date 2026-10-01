import axios from "axios";
import { baseApiUrl } from "./api";
import {
  getAdminToken,
  setAdminSession,
  clearAdminSession,
} from "./adminAuth";

const adminApi = axios.create({
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

// Request Interceptor: Attach Admin Bearer token
adminApi.interceptors.request.use(
  (config) => {
    const token = getAdminToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Auto refresh token on 401/403 once
adminApi.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (
      (error.response?.status === 401 || error.response?.status === 403) &&
      !originalRequest._retry &&
      !originalRequest.url?.includes("/auth/admin/login") &&
      !originalRequest.url?.includes("/auth/refresh")
    ) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return adminApi(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem("admin_refresh_token");
      if (!refreshToken) {
        clearAdminSession();
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

        const existingProfile = localStorage.getItem("admin_profile");
        const parsedProfile = existingProfile ? JSON.parse(existingProfile) : {};
        setAdminSession(newAccessToken, refreshToken, parsedProfile);

        processQueue(null, newAccessToken);
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return adminApi(originalRequest);
      } catch (refreshErr) {
        processQueue(refreshErr, null);
        clearAdminSession();
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

// Helper for fallback request (e.g. /api/admin vs /admin)
const requestWithFallback = async (primaryMethod, primaryPath, fallbackPath, dataOrParams = null, isPostOrPatch = false) => {
  try {
    if (isPostOrPatch) {
      const res = await adminApi[primaryMethod](primaryPath, dataOrParams || {});
      return res.data;
    }
    const res = await adminApi[primaryMethod](primaryPath, { params: dataOrParams });
    return res.data;
  } catch (err) {
    if (err.response?.status === 404 && fallbackPath) {
      const fallbackUrl = `${baseApiUrl}${fallbackPath}`;
      const token = getAdminToken();
      const headers = {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      };

      if (isPostOrPatch) {
        const fallbackRes = await axios[primaryMethod](fallbackUrl, dataOrParams || {}, { headers });
        return fallbackRes.data;
      }
      const fallbackRes = await axios[primaryMethod](fallbackUrl, {
        params: dataOrParams,
        headers,
      });
      return fallbackRes.data;
    }
    throw err;
  }
};

// ─── ADMIN ENDPOINTS ──────────────────────────────────────────────────────────

/**
 * 1. Overview
 * GET /api/admin/overview (fallback /admin/overview)
 */
export const fetchAdminOverview = async () => {
  return requestWithFallback("get", "/admin/overview", "/admin/overview");
};

/**
 * 2. Income Report
 * GET /api/admin/income (fallback /admin/income)
 */
export const fetchAdminIncome = async ({ from, to, terminalId, driverUid } = {}) => {
  const params = {};
  if (from) params.from = from;
  if (to) params.to = to;
  if (terminalId) params.terminalId = terminalId;
  if (driverUid) params.driverUid = driverUid;

  return requestWithFallback("get", "/admin/income", "/admin/income", params);
};

/**
 * 3. List Terminals
 * GET /api/admin/terminals (fallback /admin/terminals)
 */
export const fetchAdminTerminals = async () => {
  return requestWithFallback("get", "/admin/terminals", "/admin/terminals");
};

/**
 * 4. List Agents
 * GET /api/admin/agents?page=1&limit=20&status=ACTIVE
 */
export const fetchAdminAgents = async ({ page = 1, limit = 20, status = "ACTIVE" } = {}) => {
  const params = {};
  if (page) params.page = page;
  if (limit) params.limit = limit;
  if (status && status !== "ALL") params.status = status.toUpperCase();

  return requestWithFallback("get", "/admin/agents", "/admin/agents", params);
};

/**
 * 5. Get One Agent
 * GET /api/admin/agents/:id
 */
export const fetchAdminAgentById = async (agentId) => {
  return requestWithFallback("get", `/admin/agents/${encodeURIComponent(agentId)}`, `/admin/agents/${encodeURIComponent(agentId)}`);
};

/**
 * 6. Create Agent
 * POST /api/admin/agents
 */
export const createAdminAgent = async ({ firstname, lastname, firstName, lastName, email, phone, password }) => {
  const fName = (firstname || firstName || '').trim();
  const lName = (lastname || lastName || '').trim();
  const payload = {
    firstname: fName,
    lastname: lName,
    firstName: fName,
    lastName: lName,
    email: email?.trim()?.toLowerCase(),
    phone: phone?.trim(),
    password,
  };
  return requestWithFallback("post", "/admin/agents", "/admin/agents", payload, true);
};

/**
 * 7. Change Agent Status
 * PATCH /api/admin/agents/:id/status
 */
export const updateAdminAgentStatus = async (agentId, status) => {
  const payload = { status: status.toUpperCase() };
  return requestWithFallback(
    "patch",
    `/admin/agents/${encodeURIComponent(agentId)}/status`,
    `/admin/agents/${encodeURIComponent(agentId)}/status`,
    payload,
    true
  );
};

/**
 * 8. List Disputes
 * GET /api/admin/disputes?page=1&limit=20&status=OPEN
 */
export const fetchAdminDisputes = async ({ page = 1, limit = 20, status = "OPEN" } = {}) => {
  const params = {};
  if (page) params.page = page;
  if (limit) params.limit = limit;
  if (status && status !== "ALL") params.status = status.toUpperCase();

  return requestWithFallback("get", "/admin/disputes", "/admin/disputes", params);
};

/**
 * 9. Get One Dispute
 * GET /api/admin/disputes/:id
 */
export const fetchAdminDisputeById = async (disputeId) => {
  return requestWithFallback("get", `/admin/disputes/${encodeURIComponent(disputeId)}`, `/admin/disputes/${encodeURIComponent(disputeId)}`);
};

/**
 * 10. Update Dispute Status
 * PATCH /api/admin/disputes/:id/status
 */
export const updateAdminDisputeStatus = async (disputeId, { status, resolution }) => {
  const payload = {
    status: status.toUpperCase(),
    ...(resolution ? { resolution: resolution.trim() } : {}),
  };
  return requestWithFallback(
    "patch",
    `/admin/disputes/${encodeURIComponent(disputeId)}/status`,
    `/admin/disputes/${encodeURIComponent(disputeId)}/status`,
    payload,
    true
  );
};

/**
 * 11. Send Student Notification
 * POST /api/admin/notifications
 */
export const sendAdminStudentNotification = async ({ studentMatric, title, body }) => {
  const payload = {
    studentMatric: studentMatric?.trim(),
    title: title?.trim(),
    body: body?.trim(),
  };
  return requestWithFallback("post", "/admin/notifications", "/admin/notifications", payload, true);
};

/**
 * 12. Sync Card Whitelist
 * POST /api/admin/sync/whitelist
 */
export const syncAdminCardWhitelist = async () => {
  return requestWithFallback("post", "/admin/sync/whitelist", "/admin/sync/whitelist", {}, true);
};

/**
 * Error parser for Admin Card Linking
 */
export const getAdminCardLinkErrorMessage = (err) => {
  const status = err?.response?.status;
  const data = err?.response?.data;
  const code = data?.code || data?.error || data?.message;
  const str = typeof code === "string" ? code.trim() : "";

  if (str === "ADMIN_NOT_FOUND" || status === 404) {
    return "Admin profile not found.";
  }
  if (str === "INVALID_OTP_FORMAT") {
    return "OTP must be exactly 6 digits.";
  }
  if (str === "INVALID_PIN_FORMAT") {
    return "PIN must be exactly 4 digits.";
  }
  if (str === "INVALID_OTP") {
    return "Invalid OTP. Please tap the card again.";
  }
  if (str === "OTP_ALREADY_USED" || (status === 409 && str.includes("USED"))) {
    return "This OTP has already been used. Please tap again for a fresh OTP.";
  }
  if (str === "OTP_EXPIRED" || status === 410) {
    return "This OTP has expired. Please tap again.";
  }
  if (str === "MISSING_TERMINAL_CONTEXT") {
    return "Missing terminal context. Please tap again.";
  }
  if (str === "CARD_ALREADY_LINKED" || (status === 409 && str.includes("CARD_ALREADY"))) {
    return "This card belongs to someone else.";
  }
  if (str === "ADMIN_ALREADY_HAS_CARD" || (status === 409 && str.includes("ADMIN_ALREADY"))) {
    return "This admin already has a different card linked.";
  }
  return data?.error || data?.message || "Failed to link admin card. Please try again.";
};

/**
 * 14. Admin links their own card
 * POST /api/admin/card/link
 * req.body: { otp, pin }
 */
export const linkAdminCard = async ({ otp, pin }) => {
  const payload = {
    otp: String(otp || "").trim(),
    pin: String(pin || "").trim(),
  };
  return requestWithFallback("post", "/admin/card/link", "/admin/card/link", payload, true);
};

/**
 * Error parser for Admin/Agent Card Unlinking
 */
export const getAdminUnlinkCardErrorMessage = (err) => {
  const status = err?.response?.status;
  const data = err?.response?.data;
  const code = data?.code || data?.error || data?.message;
  const str = typeof code === "string" ? code.trim() : "";

  if (str === "UNAUTHORIZED_CALLER" || status === 403) {
    return "Unauthorized caller";
  }
  if (str === "MISSING_IDENTIFIER") {
    return "Identifier is missing";
  }
  if (status === 400 && (!code || str.includes("Either") || str.includes("required"))) {
    return "Either cardUid or userIdentifier must be provided";
  }
  return data?.error || data?.message || "Failed to unlink card. Please try again.";
};

/**
 * 15. Unlink a card (Admin)
 * POST /api/admin/card/unlink
 * req.body: provide exactly one of { cardUid } or { userIdentifier }
 */
export const unlinkAdminCard = async ({ cardUid, userIdentifier } = {}) => {
  const payload = {};
  if (cardUid && String(cardUid).trim()) {
    payload.cardUid = String(cardUid).trim();
  } else if (userIdentifier && String(userIdentifier).trim()) {
    payload.userIdentifier = String(userIdentifier).trim();
  }

  return requestWithFallback("post", "/admin/card/unlink", "/admin/card/unlink", payload, true);
};

/**
 * 13. Admin Logout
 * POST /api/auth/logout
 */
export const logoutAdmin = async () => {
  const refreshToken = localStorage.getItem("admin_refresh_token");
  try {
    if (refreshToken) {
      await axios.post(`${baseApiUrl}/api/auth/logout`, { refreshToken });
    }
  } catch {
    // Ignore network failure on logout
  } finally {
    clearAdminSession();
  }
};

export default adminApi;
