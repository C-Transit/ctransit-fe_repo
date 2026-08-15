import axios from 'axios';
import { USER_API_URL } from './api';

const agentApi = axios.create({
  baseURL: USER_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

agentApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('agentToken') || localStorage.getItem('agent_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Unified Agent API methods supporting both /auth/agent and /agents path structures
export const agentLogin = async (email, password) => {
  try {
    return await agentApi.post('/auth/agent/login', {
      email: email.trim().toLowerCase(),
      password,
    });
  } catch (err) {
    if (err.response?.status === 404) {
      return await agentApi.post('/agents/login', {
        email: email.trim().toLowerCase(),
        password,
      });
    }
    throw err;
  }
};

export const fetchPendingKYC = async () => {
  try {
    const res = await agentApi.get('/auth/agent/kyc/pending');
    return res.data;
  } catch (err) {
    const fallbackRes = await agentApi.get('/agents/kyc/pending');
    return fallbackRes.data;
  }
};

export const approveAgentKYC = async (userId) => {
  try {
    const res = await agentApi.post(`/auth/agent/kyc/${userId}/approve`);
    return res.data;
  } catch (err) {
    const fallbackRes = await agentApi.post(`/agents/kyc/${userId}/approve`);
    return fallbackRes.data;
  }
};

export const rejectAgentKYC = async (userId, reason) => {
  try {
    const res = await agentApi.post(`/auth/agent/kyc/${userId}/reject`, { reason });
    return res.data;
  } catch (err) {
    const fallbackRes = await agentApi.post(`/agents/kyc/${userId}/reject`, { reason });
    return fallbackRes.data;
  }
};

export const fetchDrivers = async () => {
  try {
    const res = await agentApi.get('/auth/agent/drivers');
    return res.data;
  } catch (err) {
    const fallbackRes = await agentApi.get('/agents/drivers');
    return fallbackRes.data;
  }
};

export const registerDriver = async ({ firstname, lastname, matricNumber, phone, vehicleType, vehiclePlate }) => {
  const payload = {
    firstname: firstname?.trim(),
    lastname: lastname?.trim(),
    matricNumber: matricNumber?.trim(),
    ...(phone ? { phone: phone.trim() } : {}),
    ...(vehicleType ? { vehicleType } : {}),
    ...(vehiclePlate ? { vehiclePlate: vehiclePlate.trim() } : {}),
  };
  try {
    const res = await agentApi.post('/auth/agent/drivers/register', payload);
    return res.data;
  } catch (err) {
    const fallbackRes = await agentApi.post('/agents/drivers/register', payload);
    return fallbackRes.data;
  }
};

export const fetchTerminals = async () => {
  try {
    const res = await agentApi.get('/auth/agent/terminals');
    return res.data;
  } catch (err) {
    const fallbackRes = await agentApi.get('/agents/terminals');
    return fallbackRes.data;
  }
};

export const linkAgentCard = async ({ otp, studentId }) => {
  const payload = { otp: String(otp).trim(), studentId: String(studentId).trim() };
  try {
    const res = await agentApi.post('/auth/agent/card/link', payload);
    return res.data;
  } catch (err) {
    const fallbackRes = await agentApi.post('/agents/card/link', payload);
    return fallbackRes.data;
  }
};

export const fetchAgentUsers = async ({ isVerified, page = 1, limit = 20 } = {}) => {
  const params = new URLSearchParams();
  if (isVerified !== undefined && isVerified !== '') params.append('isVerified', isVerified);
  if (page) params.append('page', page);
  if (limit) params.append('limit', limit);

  const query = params.toString() ? `?${params.toString()}` : '';
  try {
    const res = await agentApi.get(`/auth/agent/users${query}`);
    return res.data;
  } catch (err) {
    const fallbackRes = await agentApi.get(`/agents/users${query}`);
    return fallbackRes.data;
  }
};

export const fetchAgentUserTransactions = async (matricNumber, { page = 1, limit = 20 } = {}) => {
  const params = new URLSearchParams();
  if (page) params.append('page', page);
  if (limit) params.append('limit', limit);

  const query = params.toString() ? `?${params.toString()}` : '';
  try {
    const res = await agentApi.get(`/auth/agent/users/${encodeURIComponent(matricNumber)}/transactions${query}`);
    return res.data;
  } catch (err) {
    const fallbackRes = await agentApi.get(`/agents/users/${encodeURIComponent(matricNumber)}/transactions${query}`);
    return fallbackRes.data;
  }
};

export default agentApi;
