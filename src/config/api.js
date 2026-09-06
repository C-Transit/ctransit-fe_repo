// Base URL reads from the Vite env variable VITE_API_URL.
// Set this in Vercel → Project → Settings → Environment Variables.
// Fallback keeps the old URL working during transition.
const baseApiUrl =
  import.meta.env.VITE_API_URL || "https://c-transit-pink.vercel.app";

export const AUTH_API_URL = `${baseApiUrl}/api/auth`;
export const USER_API_URL = `${baseApiUrl}/api`;
export const KYC_API_URL = `${baseApiUrl}/api/kyc`;
export const NOT_API_URL = `${baseApiUrl}/api/notifications`;
export const ADMIN_API_URL = `${baseApiUrl}/admin`;
