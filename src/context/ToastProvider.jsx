import React, { createContext, useContext } from 'react';
import Toast from '../components/Toast';
import { useToast } from '../hooks/useToast';

/**
 * ToastContext for providing toast notifications globally
 */
const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const { toasts, addToast, removeToast } = useToast();

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <Toast toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  );
};

/**
 * Hook to use toast notifications anywhere in the app
 * 
 * Usage:
 * const { addToast } = useToastContext();
 * addToast({ message: 'Success!', type: 'success' });
 */
export const useToastContext = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToastContext must be used within a ToastProvider');
  }
  return context;
};

export default ToastProvider;
