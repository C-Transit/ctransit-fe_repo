import axios from "axios";
import { baseApiUrl } from "./api";

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

  // Extract driver profile
  const driverProfile =
    responseData?.driver ||
    responseData?.user ||
    responseData?.profile ||
    responseData?.data?.driver ||
    responseData?.data?.user ||
    responseData?.data?.profile ||
    responseData?.data ||
    {};

  const normalizedProfile = {
    id: driverProfile.id || driverProfile._id || driverProfile.driverId || driverProfile.userId || `DRV-${cleanPhone}`,
    firstname: driverProfile.firstname || driverProfile.firstName || "Driver",
    lastname: driverProfile.lastname || driverProfile.lastName || "",
    phone: driverProfile.phone || driverProfile.phoneNumber || cleanPhone,
    matricNumber: driverProfile.matricNumber || driverProfile.matric_number || "",
    role: "DRIVER",
    vehicleType: driverProfile.vehicleType || driverProfile.vehicle_type || "",
    vehiclePlate: driverProfile.vehiclePlate || driverProfile.vehicle_plate || "",
    terminalId: driverProfile.terminalId || driverProfile.terminal_id || "TRM-01",
    terminalStatus: (driverProfile.terminalStatus || "ONLINE").toUpperCase(),
    bankName: driverProfile.bankName || driverProfile.bank_name || "",
    accountNumber: driverProfile.accountNumber || driverProfile.account_number || "",
    driverWallet: driverProfile.driverWallet || { balance: 0, total_earnings: 0 },
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
