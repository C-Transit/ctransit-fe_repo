import { motion, AnimatePresence } from 'framer-motion';
import { FaCheckCircle, FaExclamationCircle, FaInfoCircle, FaTimes } from 'react-icons/fa';
import styles from './Toast.module.css';

/**
 * Toast Notification Component
 * 
 * Displays temporary notifications at the top-right of the screen
 * Types: success, error, info, warning
 * Auto-dismisses after duration (default 4s)
 * 
 * Usage:
 * const { addToast } = useToast();
 * addToast('Success message', 'success');
 */
export default function Toast({ toasts, removeToast }) {
  const getIcon = (type) => {
    switch (type) {
      case 'success':
        return <FaCheckCircle />;
      case 'error':
        return <FaExclamationCircle />;
      case 'warning':
        return <FaExclamationCircle />;
      case 'info':
      default:
        return <FaInfoCircle />;
    }
  };

  return (
    <div className={styles.toastContainer}>
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            className={`${styles.toast} ${styles[toast.type]}`}
            initial={{ opacity: 0, x: 400, y: -20 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            exit={{ opacity: 0, x: 400 }}
            transition={{ duration: 0.3 }}
          >
            <div className={styles.toastIcon}>
              {getIcon(toast.type)}
            </div>
            <div className={styles.toastContent}>
              {toast.title && <div className={styles.toastTitle}>{toast.title}</div>}
              <div className={styles.toastMessage}>{toast.message}</div>
            </div>
            <button
              className={styles.closeBtn}
              onClick={() => removeToast(toast.id)}
              aria-label="Close notification"
            >
              <FaTimes />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
