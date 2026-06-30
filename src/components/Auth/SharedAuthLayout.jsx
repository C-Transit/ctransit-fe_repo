import { FaWifi } from 'react-icons/fa';
import styles from './SharedAuthLayout.module.css';

/**
 * SharedAuthLayout - Common wrapper for all auth screens
 * Provides: logo header, title/subtitle, form card, footer link
 */
export default function SharedAuthLayout({
  title,
  subtitle,
  children,
  footerText,
  footerLinkText,
  onFooterLinkClick,
}) {
  return (
    <div className={styles.authPage}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.logoBox}>
          <FaWifi className={styles.logoIcon} />
          <span className={styles.logoText}>C-Transit</span>
        </div>
        <h2 className={styles.title}>{title}</h2>
        <p className={styles.subtitle}>{subtitle}</p>
      </div>

      {/* Form Card */}
      <div className={styles.formCard}>
        {children}
      </div>

      {/* Footer Link */}
      {footerText && (
        <div className={styles.footer}>
          <span>{footerText}</span>
          {footerLinkText && (
            <button
              type="button"
              onClick={onFooterLinkClick}
              className={styles.footerLink}
              aria-label={footerLinkText}
            >
              {footerLinkText}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
