import { FaGoogle, FaApple, FaFacebook } from 'react-icons/fa';
import styles from './SocialAuthButtons.module.css';

/**
 * SocialAuthButtons - Social auth divider + buttons (Google, Apple, Facebook)
 */
export default function SocialAuthButtons({
  onGoogleClick,
  onAppleClick,
  onFacebookClick,
  disabled = false,
  showDivider = true,
}) {
  const handleClick = (provider) => {
    if (provider === 'google' && onGoogleClick) onGoogleClick();
    if (provider === 'apple' && onAppleClick) onAppleClick();
    if (provider === 'facebook' && onFacebookClick) onFacebookClick();
  };

  return (
    <>
      {showDivider && (
        <div className={styles.divider}>
          <span className={styles.dividerText}>or continue with</span>
        </div>
      )}

      <div className={styles.socialButtonsRow}>
        <button
          type="button"
          onClick={() => handleClick('google')}
          disabled={disabled}
          className={styles.socialButton}
          aria-label="Continue with Google"
          title="Google Login (Coming Soon)"
        >
          <FaGoogle className={styles.icon} />
        </button>

        <button
          type="button"
          onClick={() => handleClick('apple')}
          disabled={disabled}
          className={styles.socialButton}
          aria-label="Continue with Apple"
          title="Apple Login (Coming Soon)"
        >
          <FaApple className={styles.icon} />
        </button>

        <button
          type="button"
          onClick={() => handleClick('facebook')}
          disabled={disabled}
          className={styles.socialButton}
          aria-label="Continue with Facebook"
          title="Facebook Login (Coming Soon)"
        >
          <FaFacebook className={styles.icon} />
        </button>
      </div>
    </>
  );
}
