import { motion } from 'framer-motion';

import styles from './StatCard.module.css';

export default function StatCard({ title, value, trend, icon: Icon, loading = false }) {
  return (
    <motion.article
      className={styles.card}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
    >
      {loading ? (
        <div className={styles.skeletonWrap}>
          <span className={styles.skeletonLine} />
          <span className={styles.skeletonValue} />
          <span className={styles.skeletonLineSmall} />
        </div>
      ) : (
        <>
          <div className={styles.head}>
            <p>{title}</p>
            <span className={styles.iconWrap}>
              <Icon />
            </span>
          </div>
          <h3>{value}</h3>
          <small>{trend}</small>
        </>
      )}
    </motion.article>
  );
}
