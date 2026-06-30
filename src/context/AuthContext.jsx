import React, { createContext, useState, useCallback, useEffect, useContext } from 'react';
import axios from 'axios';
import { AUTH_API_URL, USER_API_URL } from '../config/api';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Helper function to centralize session initialization/saving
  const setSession = useCallback((token, userData) => {
    localStorage.setItem('authToken', token);
    localStorage.setItem('authUser', JSON.stringify(userData));
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    setUser(userData);
    setIsAuthenticated(true);
  }, []);

  // Helper function to completely wipe session data safely
  const clearSession = useCallback(() => {
    setUser(null);
    setIsAuthenticated(false);
    setError(null);
    localStorage.removeItem('authToken');
    localStorage.removeItem('authUser');
    delete axios.defaults.headers.common['Authorization'];
  }, []);

  useEffect(() => {
    const initializeAuth = () => {
      try {
        const storedToken = localStorage.getItem('authToken');
        const storedUser = localStorage.getItem('authUser');

        if (storedToken && storedUser) {
          try {
            // Check JWT expiration safely
            const payload = JSON.parse(atob(storedToken.split('.')[1]));
            const isExpired = payload.exp * 1000 < Date.now();
            
            if (isExpired) {
              clearSession();
              return;
            }
            
            const userData = JSON.parse(storedUser);
            setSession(storedToken, userData);
          } catch {
            clearSession();
          }
        }
      } catch (err) {
        clearSession();
      }
    };

    initializeAuth();
  }, [setSession, clearSession]);

  const login = useCallback(async (email, password) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await axios.post(`${AUTH_API_URL}/login`, {
        email: email.trim().toLowerCase(),
        password,
      });

      const { token, user: userData } = response.data;
      setSession(token, userData);

      return { success: true, user: userData };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Login failed. Please try again.';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, [setSession]);

  const register = useCallback(async (data) => {
    setIsLoading(true);
    setError(null);

    try {
      const payload = {
        firstname: data.firstName,
        lastname: data.lastName,
        email: data.email.trim().toLowerCase(),
        matricNumber: data.matricNumber,
        password: data.password,
      };

      const response = await axios.post(`${AUTH_API_URL}/register`, payload);
      return { success: true, data: response.data };
    } catch (err) {
      const errorMessage = err.response?.data?.message 
        || err.response?.data?.error
        || err.response?.data?.msg
        || 'Registration failed. Please try again.';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, []);

// OTP verification and related functions
  const verifyOTP = useCallback(async (email, otp) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await axios.post(`${AUTH_API_URL}/verify-otp`, {
        email: email.trim().toLowerCase(),
        otp: otp.trim(),
      });

    
      return { success: true, data: response.data };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'OTP verification failed. Please try again.';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const resendOTP = useCallback(async (email) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await axios.post(`${AUTH_API_URL}/resend-otp`, { 
        email: email.trim().toLowerCase() 
      });
      return { success: true, data: response.data };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to resend OTP. Please try again.';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, []);

// Forgot password and reset password functions
  const forgotPassword = useCallback(async (email) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await axios.post(`${USER_API_URL}/users/forgot-password`, { 
        email: email.trim().toLowerCase() 
      });
      return { success: true, data: response.data };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to process request. Please try again.';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const resetPassword = useCallback(async (email, otp, newPassword) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await axios.post(`${USER_API_URL}/users/reset-password`, {
        email: email.trim().toLowerCase(),
        otp: otp.trim(),
        newPassword,
      });

      return { success: true, data: response.data };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Password reset failed. Please try again.';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, []);

  
  const logout = useCallback(() => {
    clearSession();
  }, [clearSession]);

  const value = {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    register,
    verifyOTP,
    resendOTP,
    forgotPassword,
    resetPassword,
    logout,
    setError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}