import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import styles from './LeftPanel.module.css';

export default function LeftPanel() {
  const panelRef = useRef(null);
  const contentRef = useRef(null);

  useEffect(() => {
    // Animation on mount
    gsap.fromTo(
      panelRef.current,
      { opacity: 0, scale: 0.95 },
      {
        opacity: 1,
        scale: 1,
        duration: 0.8,
        ease: 'power3.out',
      }
    );

    gsap.fromTo(
      contentRef.current,
      { y: 30, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.8,
        delay: 0.2,
        ease: 'power3.out',
      }
    );
  }, []);

  return (
    <div ref={panelRef} className={styles.leftPanel}>
      <div className={styles.backgroundImage} />
      <div className={styles.overlay} />
      <div ref={contentRef} className={styles.content}>
        <div className={styles.badge}>🚌 C-Transit</div>
        <h1 className={styles.title}>Campus Made Easy</h1>
        <p className={styles.subtitle}>
          Connect with campus mobility, manage your wallet, and ride with confidence.
        </p>
        <div className={styles.features}>
          <div className={styles.feature}>
            <span className={styles.icon}>✓</span>
            <span>Quick & Secure Payments</span>
          </div>
          <div className={styles.feature}>
            <span className={styles.icon}>✓</span>
            <span>Real-time Ride Tracking</span>
          </div>
          <div className={styles.feature}>
            <span className={styles.icon}>✓</span>
            <span>Campus-wide Coverage</span>
          </div>
        </div>
      </div>
      <div className={styles.floatingElements}>
        <div className={styles.circle1} />
        <div className={styles.circle2} />
        <div className={styles.circle3} />
      </div>
    </div>
  );
}
