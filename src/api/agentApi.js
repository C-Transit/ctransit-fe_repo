import axios from "axios";
import { baseApiUrl } from "./api";

const agentApi = axios.create({
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

// Request Interceptor: Attach Agent Bearer token
agentApi.interceptors.request.use(
  (config) => {
    const token =
      localStorage.getItem("agentToken") || localStorage.getItem("agent_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Auto refresh token on 401/403 once
agentApi.interceptors.response.use(
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
            return agentApi(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken =
        localStorage.getItem("agentRefreshToken") ||
        localStorage.getItem("agent_refresh_token");

      if (!refreshToken) {
        isRefreshing = false;
        return Promise.reject(error);
      }

      try {
        const refreshResponse = await axios.post(
          `${baseApiUrl}/api/auth/refresh`,
          { refreshToken }
        );

        const newAccessToken =
          refreshResponse.data?.accessToken || refreshResponse.data?.token;

        if (!newAccessToken) {
          throw new Error("No access token returned from refresh");
        }

        localStorage.setItem("agentToken", newAccessToken);
        processQueue(null, newAccessToken);
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return agentApi(originalRequest);
      } catch (refreshErr) {
        processQueue(refreshErr, null);
        localStorage.removeItem("agentToken");
        localStorage.removeItem("agentData");
        localStorage.removeItem("agentSession");
        localStorage.removeItem("agentRefreshToken");
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

// Helper for agent endpoint fallbacks (/agents/... vs /auth/agent/...)
const requestAgentWithFallback = async (
  primaryMethod,
  primaryPath,
  fallbackPath,
  dataOrParams = null,
  isPostOrPatch = false
) => {
  try {
    if (isPostOrPatch) {
      const res = await agentApi[primaryMethod](primaryPath, dataOrParams || {});
      return res.data;
    }
    const res = await agentApi[primaryMethod](primaryPath, {
      params: dataOrParams,
    });
    return res.data;
  } catch (err) {
    if (err.response?.status === 404 && fallbackPath) {
      if (isPostOrPatch) {
        const fallbackRes = await agentApi[primaryMethod](
          fallbackPath,
          dataOrParams || {}
        );
        return fallbackRes.data;
      }
      const fallbackRes = await agentApi[primaryMethod](fallbackPath, {
        params: dataOrParams,
      });
      return fallbackRes.data;
    }
    throw err;
  }
};

// ─── AGENT ENDPOINTS ──────────────────────────────────────────────────────────

/**
 * 1. Agent Login
 * POST /api/agents/login (fallback /api/auth/agent/login)
 */
export const agentLogin = async (email, password) => {
  const payload = {
    email: email.trim().toLowerCase(),
    password,
  };
  return requestAgentWithFallback(
    "post",
    "/agents/login",
    "/auth/agent/login",
    payload,
    true
  );
};

/**
 * 2. Pending KYC Queue
 * GET /api/agents/kyc/pending (fallback /api/auth/agent/kyc/pending)
 */
export const fetchPendingKYC = async () => {
  return requestAgentWithFallback(
    "get",
    "/agents/kyc/pending",
    "/auth/agent/kyc/pending"
  );
};

/**
 * 3. Approve KYC
 * POST /api/agents/kyc/:userId/approve (fallback /api/auth/agent/kyc/:userId/approve)
 */
export const approveAgentKYC = async (userId) => {
  return requestAgentWithFallback(
    "post",
    `/agents/kyc/${encodeURIComponent(userId)}/approve`,
    `/auth/agent/kyc/${encodeURIComponent(userId)}/approve`,
    {},
    true
  );
};

/**
 * 4. Reject KYC
 * POST /api/agents/kyc/:userId/reject (fallback /api/auth/agent/kyc/:userId/reject)
 */
export const rejectAgentKYC = async (userId, reason) => {
  const payload = { reason: reason?.trim() || "Incomplete or unreadable document" };
  return requestAgentWithFallback(
    "post",
    `/agents/kyc/${encodeURIComponent(userId)}/reject`,
    `/auth/agent/kyc/${encodeURIComponent(userId)}/reject`,
    payload,
    true
  );
};

/**
 * 5. List Drivers
 * GET /api/agents/drivers (fallback /api/auth/agent/drivers)
 */
export const fetchDrivers = async () => {
  return requestAgentWithFallback("get", "/agents/drivers", "/auth/agent/drivers");
};

/**
 * Error message parser for driver registration
 */
export const getDriverRegisterErrorMessage = (err) => {
  const status = err?.response?.status;
  const data = err?.response?.data;
  const code = data?.code || data?.error || data?.message;
  const str = typeof code === "string" ? code.trim() : "";

  if (str === "MISSING_NAME" || str.includes("MISSING_NAME")) {
    return "First name and last name are required.";
  }
  if (str === "INVALID_PHONE" || str.includes("INVALID_PHONE")) {
    return "Invalid phone format. Please enter a valid phone number (7–15 digits).";
  }
  if (str === "INVALID_PIN_FORMAT" || str.includes("INVALID_PIN_FORMAT")) {
    return "PIN must be exactly 4 digits.";
  }
  if (str === "PHONE_ALREADY_IN_USE" || str.includes("PHONE_ALREADY_IN_USE") || status === 409) {
    return "Another user already has this phone number.";
  }
  if (str === "DRIVER_UID_GENERATION_FAILED" || str.includes("DRIVER_UID_GENERATION_FAILED") || (status === 500 && str.toLowerCase().includes("driver"))) {
    return "Driver ID generation failed. Please retry the request.";
  }
  if (status === 400) {
    if (data?.error && typeof data.error === "string" && !data.error.includes("_")) {
      return data.error;
    }
    return "firstname, lastname, phone, and pin are all required";
  }
  return data?.error || data?.message || "Failed to register driver. Please try again.";
};

/**
 * 6. Register Driver
 * POST /api/agents/drivers/register
 * req.body: { firstname, lastname, phone, pin }
 */
export const registerDriver = async ({
  firstname,
  lastname,
  phone,
  pin,
}) => {
  const payload = {
    firstname: firstname?.trim(),
    lastname: lastname?.trim(),
    phone: phone?.trim(),
    pin: String(pin || "").trim(),
  };
  return requestAgentWithFallback(
    "post",
    "/agents/drivers/register",
    "/auth/agent/drivers/register",
    payload,
    true
  );
};

/**
 * 7. List Terminals
 * GET /api/agents/terminals (fallback /api/auth/agent/terminals)
 */
export const fetchTerminals = async () => {
  return requestAgentWithFallback(
    "get",
    "/agents/terminals",
    "/auth/agent/terminals"
  );
};

/**
 * 8. Link Card
 * POST /api/agents/card/link (fallback /api/auth/agent/card/link)
 */
export const linkAgentCard = async ({ otp, studentId }) => {
  const payload = {
    otp: String(otp).trim(),
    studentId: String(studentId).trim(),
  };
  return requestAgentWithFallback(
    "post",
    "/agents/card/link",
    "/auth/agent/card/link",
    payload,
    true
  );
};

/**
 * 8b. Unlink Card (Agent)
 * POST /api/agents/card/unlink
 * req.body: provide exactly one of { cardUid } or { userIdentifier }
 */
export const unlinkAgentCard = async ({ cardUid, userIdentifier } = {}) => {
  const payload = {};
  if (cardUid && String(cardUid).trim()) {
    payload.cardUid = String(cardUid).trim();
  } else if (userIdentifier && String(userIdentifier).trim()) {
    payload.userIdentifier = String(userIdentifier).trim();
  }

  return requestAgentWithFallback(
    "post",
    "/agents/card/unlink",
    "/auth/agent/card/unlink",
    payload,
    true
  );
};

export const getUnlinkCardErrorMessage = (err) => {
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
 * 9. List Students (User Lookup)
 * GET /api/agents/users?page=1&limit=20&isVerified=true
 */
export const fetchAgentUsers = async ({
  isVerified,
  page = 1,
  limit = 20,
} = {}) => {
  const params = {};
  if (isVerified === true || isVerified === "true") params.isVerified = "true";
  else if (isVerified === false || isVerified === "false") params.isVerified = "false";
  if (page) params.page = page;
  if (limit) params.limit = limit;

  return requestAgentWithFallback(
    "get",
    "/agents/users",
    "/auth/agent/users",
    params
  );
};

/**
 * 10. Student Transaction History
 * GET /api/agents/users/:matricNumber/transactions?page=1&limit=20
 */
export const fetchAgentUserTransactions = async (
  matricNumber,
  { page = 1, limit = 20 } = {}
) => {
  const params = {};
  if (page) params.page = page;
  if (limit) params.limit = limit;

  return requestAgentWithFallback(
    "get",
    `/agents/users/${encodeURIComponent(matricNumber)}/transactions`,
    `/auth/agent/users/${encodeURIComponent(matricNumber)}/transactions`,
    params
  );
};

/**
 * 11. Agent Logout
 * POST /api/auth/logout
 */
export const logoutAgent = async () => {
  const refreshToken =
    localStorage.getItem("agentRefreshToken") ||
    localStorage.getItem("agent_refresh_token");
  try {
    if (refreshToken) {
      await axios.post(`${baseApiUrl}/api/auth/logout`, { refreshToken });
    }
  } catch {
    // Ignore network error on logout
  } finally {
    localStorage.removeItem("agentToken");
    localStorage.removeItem("agentData");
    localStorage.removeItem("agentSession");
    localStorage.removeItem("agentRefreshToken");
  }
};

export default agentApi;
