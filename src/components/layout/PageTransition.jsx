import { motion } from 'framer-motion';

/**
 * PageTransition Component
 * 
 * Wraps pages with consistent entrance/exit animations
 * Provides smooth transitions between routes
 */
export default function PageTransition({ children, direction = 'up' }) {
  const getDirectionVariants = () => {
    switch (direction) {
      case 'down':
        return {
          hidden: { opacity: 0, y: -20 },
          visible: { opacity: 1, y: 0 },
          exit: { opacity: 0, y: 20 },
        };
      case 'left':
        return {
          hidden: { opacity: 0, x: -20 },
          visible: { opacity: 1, x: 0 },
          exit: { opacity: 0, x: 20 },
        };
      case 'right':
        return {
          hidden: { opacity: 0, x: 20 },
          visible: { opacity: 1, x: 0 },
          exit: { opacity: 0, x: -20 },
        };
      case 'up':
      default:
        return {
          hidden: { opacity: 0, y: 20 },
          visible: { opacity: 1, y: 0 },
          exit: { opacity: 0, y: -20 },
        };
    }
  };

  const variants = getDirectionVariants();

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      exit="exit"
      variants={variants}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
    >
      {children}
    </motion.div>
  );
}
