import axios from "axios";
<<<<<<< HEAD
import { baseApiUrl } from "./api";
=======
import { baseApiUrl, AUTH_API_URL } from "./api";
>>>>>>> 72cdc132266f78ca8234e380e965306a1cda93a1

export const DRIVER_TOKEN_KEY = "driver_token";
export const DRIVER_PROFILE_KEY = "driver_profile";
export const DRIVER_REFRESH_TOKEN_KEY = "driver_refresh_token";

function decodeJwtPayload(token) {
  try {
    if (!token) return null;
    const parts = token.split(".");
    if (parts.length < 2) return null;
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const padding = "=".repeat((4 - (base64.length % 4)) % 4);
    return JSON.parse(atob(base64 + padding));
  } catch {
    return null;
  }
}

/**
 * Checks if a driver is currently authenticated with a non-expired token.
 */
export function isDriverAuthenticated() {
  try {
    const token = localStorage.getItem(DRIVER_TOKEN_KEY);
    if (!token) return false;

    const payload = decodeJwtPayload(token);
    if (!payload || (payload.exp && payload.exp * 1000 < Date.now())) {
      clearDriverSession();
      return false;
    }
    return true;
  } catch {
    clearDriverSession();
    return false;
  }
}

/**
<<<<<<< HEAD
 * Authenticates a driver using phone and 4-digit PIN against POST /api/drivers/login.
 * Rate-limited server-side (surfaces 429 directly).
 */
export async function loginDriver(phone, pin) {
  const cleanPhone = String(phone || "").trim();
  const cleanPin = String(pin || "").trim();

  if (!cleanPhone || !cleanPin) {
    const err = new Error("Please provide phone and pin");
    err.status = 400;
    err.code = "MISSING_FIELD";
    throw err;
  }

  const payload = {
    phone: cleanPhone,
    pin: cleanPin,
  };

  let responseData = null;

  try {
    const res = await axios.post(`${baseApiUrl}/api/drivers/login`, payload, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    responseData = res.data;
  } catch (err) {
    const status = err.response?.status;
    const data = err.response?.data;
    const code = data?.code || data?.error;

    if (status === 401 || code === "INVALID_CREDENTIALS") {
      const e = new Error("Invalid phone number or PIN.");
      e.status = 401;
      e.code = "INVALID_CREDENTIALS";
      throw e;
    }
    if (status === 429) {
      const e = new Error("Too many attempts, try again later");
      e.status = 429;
      e.code = "RATE_LIMITED";
      throw e;
    }
    if (status === 400) {
      const e = new Error(data?.error || data?.message || "Please provide phone and pin");
      e.status = 400;
      e.code = code || "BAD_REQUEST";
      throw e;
    }
    throw err;
=======
 * Authenticates a driver using credentials against backend auth endpoints.
 * Supports primary /api/auth/driver/login with fallbacks to /api/drivers/login and /api/auth/login.
 */
export async function loginDriver(identifier, password) {
  const cleanId = String(identifier || "").trim();
  const isEmail = cleanId.includes("@");
  
  const payload = {
    email: isEmail ? cleanId.toLowerCase() : undefined,
    matricNumber: !isEmail ? cleanId : undefined,
    identifier: cleanId,
    username: cleanId,
    password,
  };

  // Remove undefined fields
  Object.keys(payload).forEach((k) => payload[k] === undefined && delete payload[k]);

  let responseData = null;
  let lastError = null;

  const loginEndpoints = [
    `${baseApiUrl}/api/drivers/login`,
    `${baseApiUrl}/api/auth/driver/login`,
    `${AUTH_API_URL}/login`,
  ];

  for (const endpoint of loginEndpoints) {
    try {
      const res = await axios.post(endpoint, payload);
      if (res.data) {
        responseData = res.data;
        break;
      }
    } catch (err) {
      lastError = err;
      // If 404, continue to next candidate endpoint; otherwise if 401/400 throw
      if (err.response?.status !== 404 && err.response?.status !== 405) {
        throw err;
      }
    }
  }

  if (!responseData && lastError) {
    throw lastError;
>>>>>>> 72cdc132266f78ca8234e380e965306a1cda93a1
  }

  const accessToken =
    responseData?.accessToken ||
    responseData?.token ||
    responseData?.data?.accessToken ||
    responseData?.data?.token;

  const refreshToken =
    responseData?.refreshToken ||
    responseData?.data?.refreshToken;

  if (!accessToken) {
    throw new Error("No access token returned from server");
  }

<<<<<<< HEAD
  // Extract driver profile
  const driverProfile =
=======
  // Extract or fetch driver profile
  let driverProfile =
>>>>>>> 72cdc132266f78ca8234e380e965306a1cda93a1
    responseData?.driver ||
    responseData?.user ||
    responseData?.profile ||
    responseData?.data?.driver ||
    responseData?.data?.user ||
    responseData?.data?.profile ||
<<<<<<< HEAD
    responseData?.data ||
    {};

  const normalizedProfile = {
    id: driverProfile.id || driverProfile._id || driverProfile.driverId || driverProfile.userId || `DRV-${cleanPhone}`,
    firstname: driverProfile.firstname || driverProfile.firstName || "Driver",
    lastname: driverProfile.lastname || driverProfile.lastName || "",
    phone: driverProfile.phone || driverProfile.phoneNumber || cleanPhone,
    matricNumber: driverProfile.matricNumber || driverProfile.matric_number || "",
=======
    responseData?.data;

  // If profile is not in the login response, fetch from /api/drivers/me
  if (!driverProfile || typeof driverProfile !== "object" || !driverProfile.firstname) {
    try {
      const profRes = await axios.get(`${baseApiUrl}/api/drivers/me`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const raw =
        profRes.data?.data?.profile ||
        profRes.data?.data?.driver ||
        profRes.data?.data?.user ||
        profRes.data?.profile ||
        profRes.data?.driver ||
        profRes.data?.user ||
        profRes.data?.data ||
        profRes.data;
      if (raw && typeof raw === "object") {
        driverProfile = { ...driverProfile, ...raw };
      }
    } catch {
      // Fallback: decode basic info from JWT
      const jwtData = decodeJwtPayload(accessToken) || {};
      driverProfile = {
        id: jwtData.userId || jwtData.id || jwtData.sub || `DRV-${cleanId}`,
        firstname: jwtData.firstname || jwtData.name?.split(" ")[0] || "Driver",
        lastname: jwtData.lastname || jwtData.name?.split(" ")[1] || "",
        email: jwtData.email || (isEmail ? cleanId : ""),
        matricNumber: !isEmail ? cleanId : (jwtData.matricNumber || ""),
        role: "DRIVER",
      };
    }
  }

  const normalizedProfile = {
    id: driverProfile.id || driverProfile._id || driverProfile.driverId || driverProfile.userId || `DRV-${cleanId}`,
    firstname: driverProfile.firstname || driverProfile.firstName || "Driver",
    lastname: driverProfile.lastname || driverProfile.lastName || "",
    email: driverProfile.email || (isEmail ? cleanId : ""),
    matricNumber: driverProfile.matricNumber || driverProfile.matric_number || (!isEmail ? cleanId : ""),
    phone: driverProfile.phone || driverProfile.phoneNumber || "",
>>>>>>> 72cdc132266f78ca8234e380e965306a1cda93a1
    role: "DRIVER",
    vehicleType: driverProfile.vehicleType || driverProfile.vehicle_type || "",
    vehiclePlate: driverProfile.vehiclePlate || driverProfile.vehicle_plate || "",
    terminalId: driverProfile.terminalId || driverProfile.terminal_id || "TRM-01",
    terminalStatus: (driverProfile.terminalStatus || "ONLINE").toUpperCase(),
    bankName: driverProfile.bankName || driverProfile.bank_name || "",
    accountNumber: driverProfile.accountNumber || driverProfile.account_number || "",
<<<<<<< HEAD
    driverWallet: driverProfile.driverWallet || { balance: 0, total_earnings: 0 },
=======
>>>>>>> 72cdc132266f78ca8234e380e965306a1cda93a1
  };

  setDriverSession(accessToken, refreshToken, normalizedProfile);
  return { token: accessToken, profile: normalizedProfile };
}

export function setDriverSession(token, refreshToken, profile) {
  localStorage.setItem(DRIVER_TOKEN_KEY, token);
  localStorage.setItem(DRIVER_PROFILE_KEY, JSON.stringify(profile));
  if (refreshToken) {
    localStorage.setItem(DRIVER_REFRESH_TOKEN_KEY, refreshToken);
  }
}

export function clearDriverSession() {
  localStorage.removeItem(DRIVER_TOKEN_KEY);
  localStorage.removeItem(DRIVER_PROFILE_KEY);
  localStorage.removeItem(DRIVER_REFRESH_TOKEN_KEY);
}

export function getDriverProfile() {
  try {
    const raw = localStorage.getItem(DRIVER_PROFILE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function getDriverToken() {
  return localStorage.getItem(DRIVER_TOKEN_KEY);
}

export async function logoutDriver() {
  const refreshToken = localStorage.getItem(DRIVER_REFRESH_TOKEN_KEY);
  try {
    if (refreshToken) {
      await axios.post(`${baseApiUrl}/api/auth/logout`, { refreshToken });
    }
  } catch {
    // Ignore network error on logout
  } finally {
    clearDriverSession();
  }
}
