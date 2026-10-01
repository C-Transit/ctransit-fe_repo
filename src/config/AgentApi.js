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
    const token = localStorage.getItem('agentToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default agentApi;