import { motion } from 'framer-motion';
import styles from './LoadingState.module.css';

/**
 * LoadingState Component
 * 
 * Displays skeleton loaders for content that's being loaded.
 * Supports multiple variants: card, list, profile, table
 */
export default function LoadingState({ variant = 'card', count = 1 }) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  };

  // Card skeleton loader
  const renderCardSkeleton = () => (
    <motion.div
      className={styles.card}
      variants={itemVariants}
    >
      <div className={styles.skeletonHead} />
      <div className={styles.skeletonLine} />
      <div className={styles.skeletonLine} style={{ width: '85%' }} />
      <div className={styles.skeletonButton} />
    </motion.div>
  );

  // Profile skeleton loader
  const renderProfileSkeleton = () => (
    <motion.div
      className={styles.profile}
      variants={itemVariants}
    >
      <div className={styles.avatar} />
      <div className={styles.skeletonHead} style={{ width: '60%', margin: '1rem auto' }} />
      <div className={styles.profileGrid}>
        {[1, 2, 3].map((i) => (
          <div key={i}>
            <div className={styles.skeletonLabel} />
            <div className={styles.skeletonLine} />
          </div>
        ))}
      </div>
    </motion.div>
  );

  // Table skeleton loader
  const renderTableSkeleton = () => (
    <motion.div
      className={styles.table}
      variants={itemVariants}
    >
      <div className={styles.tableHeader}>
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className={styles.skeletonLine} style={{ width: '80%' }} />
        ))}
      </div>
      {[1, 2, 3].map((row) => (
        <div key={row} className={styles.tableRow}>
          {[1, 2, 3, 4].map((col) => (
            <div key={col} className={styles.skeletonLine} />
          ))}
        </div>
      ))}
    </motion.div>
  );

  // List skeleton loader
  const renderListSkeleton = () => (
    <motion.div
      className={styles.list}
      variants={itemVariants}
    >
      {[1, 2, 3].map((i) => (
        <div key={i} className={styles.listItem}>
          <div className={styles.skeletonCircle} />
          <div className={styles.listContent}>
            <div className={styles.skeletonLine} />
            <div className={styles.skeletonLine} style={{ width: '70%' }} />
          </div>
        </div>
      ))}
    </motion.div>
  );

  const renderSkeleton = () => {
    switch (variant) {
      case 'profile':
        return renderProfileSkeleton();
      case 'table':
        return renderTableSkeleton();
      case 'list':
        return renderListSkeleton();
      case 'card':
      default:
        return renderCardSkeleton();
    }
  };

  return (
    <motion.div
      className={styles.container}
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {Array.from({ length: count }).map((_, i) => (
        <div key={i}>{renderSkeleton()}</div>
      ))}
    </motion.div>
  );
}
