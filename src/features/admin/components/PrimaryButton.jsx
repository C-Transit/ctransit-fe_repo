import styles from './PrimaryButton.module.css';

export default function PrimaryButton({
  children,
  type = 'button',
  variant = 'solid',
  onClick,
  disabled = false,
  className = '',
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${styles.button} ${styles[variant]} ${className}`.trim()}
    >
      {children}
    </button>
  );
}
