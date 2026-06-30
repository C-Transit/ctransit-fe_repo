export const ADMIN_PLACEHOLDER_CREDENTIALS = {
  email: 'admin@ctransit.futminna.edu',
  password: 'Admin@12345',
};

export const ADMIN_TOKEN_KEY = 'admin_token';
export const ADMIN_PROFILE_KEY = 'admin_profile';

export function isAdminAuthenticated() {
  return Boolean(localStorage.getItem(ADMIN_TOKEN_KEY));
}

export function setAdminSession(profile) {
  localStorage.setItem(ADMIN_TOKEN_KEY, 'admin-demo-token');
  localStorage.setItem(ADMIN_PROFILE_KEY, JSON.stringify(profile));
}

export function clearAdminSession() {
  localStorage.removeItem(ADMIN_TOKEN_KEY);
  localStorage.removeItem(ADMIN_PROFILE_KEY);
}

export function getAdminProfile() {
  const rawProfile = localStorage.getItem(ADMIN_PROFILE_KEY);

  if (!rawProfile) {
    return null;
  }

  try {
    return JSON.parse(rawProfile);
  } catch (error) {
    return null;
  }
}
