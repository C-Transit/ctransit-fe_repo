import axios from "axios";
import { AUTH_API_URL } from "./api";

export const ADMIN_TOKEN_KEY = "admin_token";
export const ADMIN_PROFILE_KEY = "admin_profile";

export function isAdminAuthenticated() {
  const token = localStorage.getItem(ADMIN_TOKEN_KEY);
  if (!token) return false;

  // Check JWT expiry without a library — same pattern as AuthContext
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    if (payload.exp * 1000 < Date.now()) {
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
  const payload = JSON.parse(atob(accessToken.split(".")[1]));

  const profile = {
    userId: payload.userId,
    email: payload.email,
    role: payload.role,
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
