// Base URL reads from the Vite env variable VITE_API_URL.
// Set this in Vercel → Project → Settings → Environment Variables.
// Fallback keeps the deployed API working during transition.
export const baseApiUrl =
  import.meta.env.VITE_API_URL || "https://c-transit-pink.vercel.app";

export const ROOT_API_URL = baseApiUrl;
export const AUTH_API_URL = `${baseApiUrl}/api/auth`;
export const USER_API_URL = `${baseApiUrl}/api`;
export const USERS_API_URL = `${baseApiUrl}/api/users`;
export const KYC_API_URL = `${baseApiUrl}/api/kyc`;
export const WALLETS_API_URL = `${baseApiUrl}/api/wallets`;
export const PAYMENTS_API_URL = `${baseApiUrl}/api/payments`;
export const TRANSACTIONS_API_URL = `${baseApiUrl}/api/transactions`;
export const DISPUTES_API_URL = `${baseApiUrl}/api/disputes`;
export const DISPUTE_API_URL = `${baseApiUrl}/api/disputes`;
export const NOT_API_URL = `${baseApiUrl}/api/notifications`;
export const NOTIFICATIONS_API_URL = `${baseApiUrl}/api/notifications`;
export const ADMIN_API_URL = `${baseApiUrl}/admin`;
export const API_ADMIN_URL = `${baseApiUrl}/api/admin`;
export const AGENTS_API_URL = `${baseApiUrl}/api/agents`;
export const AUTH_AGENT_API_URL = `${baseApiUrl}/api/auth/agent`;

export default {
  baseApiUrl,
  ROOT_API_URL,
  AUTH_API_URL,
  USER_API_URL,
  USERS_API_URL,
  KYC_API_URL,
  WALLETS_API_URL,
  PAYMENTS_API_URL,
  TRANSACTIONS_API_URL,
  DISPUTES_API_URL,
  DISPUTE_API_URL,
  NOT_API_URL,
  NOTIFICATIONS_API_URL,
  ADMIN_API_URL,
  API_ADMIN_URL,
  AGENTS_API_URL,
  AUTH_AGENT_API_URL,
};
