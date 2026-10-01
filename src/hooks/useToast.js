import { useState, useCallback, useRef, useEffect } from "react";

/**
 * Custom hook for managing toast notifications
 *
 * Usage:
 * const { toasts, addToast, removeToast } = useToast();
 *
 * addToast({
 *   message: 'Error message',
 *   type: 'error', // 'success' | 'error' | 'warning' | 'info'
 *   title: 'Optional title',
 *   duration: 4000, // milliseconds
 * });
 */
export const useToast = () => {
  const [toasts, setToasts] = useState([]);
  const toastIdRef = useRef(0);
  const timeoutRef = useRef(new Map());

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));

    // Clear timeout if still pending
    if (timeoutRef.current.has(id)) {
      clearTimeout(timeoutRef.current.get(id));
      timeoutRef.current.delete(id);
    }
  }, []);

  const addToast = useCallback(
    (config) => {
      const {
        message,
        type = "info",
        title,
        duration = 4000,
      } = typeof config === "string" ? { message: config } : config;

      const id = toastIdRef.current++;
      const newToast = { id, message, type, title };

      setToasts((prev) => [...prev, newToast]);

      // Auto-dismiss after duration
      if (duration > 0) {
        const timeoutId = setTimeout(() => {
          removeToast(id);
        }, duration);

        timeoutRef.current.set(id, timeoutId);
      }

      return id;
    },
    [removeToast],
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      timeoutRef.current.forEach((timeoutId) => clearTimeout(timeoutId));
      timeoutRef.current.clear();
    };
  }, []);

  return { toasts, addToast, removeToast };
};

export default useToast;
