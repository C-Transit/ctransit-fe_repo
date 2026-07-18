import styles from './ComingSoon.module.css';

export default function ComingSoon({ title, description, progress = 40 }) {
  return (
    <div className={styles.comingSoon}>
      <div className={styles.content}>
        <span className={styles.icon}>🚧</span>
        <h2 className={styles.title}>{title}</h2>
        <p className={styles.description}>{description}</p>
        <div className={styles.progressSection}>
          <div className={styles.progressBar}>
            <div className={styles.progressFill} style={{ width: `${progress}%` }} />
          </div>
          <span className={styles.progressLabel}>{progress}% complete</span>
        </div>
        <p className={styles.note}>We're working hard to bring this feature to you soon.</p>
      </div>
    </div>
  );
}