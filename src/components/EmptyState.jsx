import { motion } from 'framer-motion';
import { FaFolderOpen, FaInbox, FaClipboard, FaList } from 'react-icons/fa';
import styles from './EmptyState.module.css';

/**
 * EmptyState Component
 * 
 * Displays friendly message when no data is available.
 * Supports multiple variants: default, list, table, history
 */
export default function EmptyState({ 
  variant = 'default', 
  title = 'No Data', 
  description = 'There\'s nothing here yet.',
  action = null,
  icon = null
}) {
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, ease: 'easeOut' },
    },
  };

  const getIcon = () => {
    if (icon) return icon;
    
    switch (variant) {
      case 'list':
        return <FaList />;
      case 'table':
        return <FaClipboard />;
      case 'history':
        return <FaInbox />;
      default:
        return <FaFolderOpen />;
    }
  };

  const getTitle = () => {
    if (title !== 'No Data') return title;
    
    switch (variant) {
      case 'list':
        return 'No Items Found';
      case 'table':
        return 'No Records Available';
      case 'history':
        return 'No History Yet';
      default:
        return 'Nothing Here';
    }
  };

  const getDescription = () => {
    if (description !== 'There\'s nothing here yet.') return description;
    
    switch (variant) {
      case 'list':
        return 'Get started by adding your first item.';
      case 'table':
        return 'Once data is available, it will appear here.';
      case 'history':
        return 'Your activity history will be displayed here.';
      default:
        return 'Come back later or create something new.';
    }
  };

  return (
    <motion.div
      className={styles.container}
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <div className={styles.icon}>
        {getIcon()}
      </div>
      
      <h3 className={styles.title}>
        {getTitle()}
      </h3>
      
      <p className={styles.description}>
        {getDescription()}
      </p>

      {action && (
        <motion.button
          className={styles.actionBtn}
          onClick={action.onClick}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {action.label}
        </motion.button>
      )}
    </motion.div>
  );
}
