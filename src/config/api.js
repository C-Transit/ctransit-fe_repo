// Base API URL: Uses the environment variable VITE_API_URL if available, otherwise defaults to the production URL.
const baseApiUrl = "https://c-transit-pink.vercel.app";

// Authentication API endpoint: Used for all authentication-related requests.
export const AUTH_API_URL = `${baseApiUrl}/api/auth`;
export const USER_API_URL = `${baseApiUrl}/api`;
export const KYC_API_URL = `${baseApiUrl}/api/kyc`;
export const NOT_API_URL = `${baseApiUrl}/api/notification`;