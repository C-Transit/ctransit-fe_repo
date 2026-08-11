import axios from "axios";
import { AUTH_API_URL } from "./api";

export const ADMIN_TOKEN_KEY = "admin_token";
export const ADMIN_PROFILE_KEY = "admin_profile";

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

export function isAdminAuthenticated() {
  try {
    const token = localStorage.getItem(ADMIN_TOKEN_KEY);
    if (!token) return false;

    const payload = decodeJwtPayload(token);
    if (!payload || (payload.exp && payload.exp * 1000 < Date.now())) {
      clearAdminSession();
      return false;
    }
    return true;
  } catch {
    clearAdminSession();
    return false;
  }
}

// Calls POST /api/auth/admin/login
// Returns { success, token, profile } or throws with a message
export async function loginAdmin(email, password) {
  const response = await axios.post(`${AUTH_API_URL}/admin/login`, {
    email: email.trim().toLowerCase(),
    password,
  });

  const { accessToken, refreshToken } = response.data;

  if (!accessToken) {
    throw new Error("No access token returned from server");
  }

  // Decode profile from the JWT payload
  const payload = decodeJwtPayload(accessToken) || {};

  const profile = {
    userId: payload.userId || "",
    email: payload.email || email,
    role: payload.role || "admin",
  };

  setAdminSession(accessToken, refreshToken, profile);
  return profile;
}

export function setAdminSession(token, refreshToken, profile) {
  localStorage.setItem(ADMIN_TOKEN_KEY, token);
  localStorage.setItem(ADMIN_PROFILE_KEY, JSON.stringify(profile));
  if (refreshToken) {
    localStorage.setItem("admin_refresh_token", refreshToken);
  }
  // Set default auth header for axios so admin API calls are authenticated
  axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
}

export function clearAdminSession() {
  localStorage.removeItem(ADMIN_TOKEN_KEY);
  localStorage.removeItem(ADMIN_PROFILE_KEY);
  localStorage.removeItem("admin_refresh_token");
  delete axios.defaults.headers.common["Authorization"];
}

export function getAdminProfile() {
  try {
    const raw = localStorage.getItem(ADMIN_PROFILE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function getAdminToken() {
  return localStorage.getItem(ADMIN_TOKEN_KEY);
}
