import logo from '../../../assets/images/c-transit-icon.svg';
import backdrop from '../../../assets/images/c-transit-icon.svg'; // your new image
import styles from './SharedAuthLayout.module.css';

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
      <img src={backdrop} alt="" className={styles.backdropImage} aria-hidden="true" />

      <div className={styles.content}>
        <div className={styles.header}>
          <div className={styles.logoBox}>
            <img src={logo} alt="C-Transit" className={styles.logoImg} />
          </div>
          <h2 className={styles.title}>{title}</h2>
          <p className={styles.subtitle}>{subtitle}</p>
        </div>

        <div className={styles.formCard}>
          {children}
        </div>

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
    </div>
  );
}