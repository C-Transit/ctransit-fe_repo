import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import SharedAuthLayout from '../components/Auth/SharedAuthLayout';
import InputField from '../components/Auth/InputField';
import PasswordInput from '../components/Auth/PasswordInput';
import AuthButton from '../components/Auth/AuthButton';
import SocialAuthButtons from '../components/Auth/SocialAuthButtons';
import Toast from '../components/Toast';
import { validateEmail } from '../utils/validation';
import styles from './Login.page.module.css';

/**
 * Login Screen
 * Route: /auth/login
 */
export default function LoginPage() {
  const navigate = useNavigate();
  const { login, isLoading, error, setError } = useContext(AuthContext);


const [formData, setFormData] = useState({
  emailOrPhone: '',
  password: '',
});

  const [errors, setErrors] = useState({});
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = 'error') => {
    const id = Math.random();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3500);
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.emailOrPhone.trim()) {
      newErrors.emailOrPhone = 'Email or phone is required';
    } else if (formData.emailOrPhone.includes('@') && !validateEmail(formData.emailOrPhone)) {
      newErrors.emailOrPhone = 'Please enter a valid email';
    } else if (!formData.emailOrPhone.includes('@') && formData.emailOrPhone.replace(/\D/g, '').length < 10) {
      newErrors.emailOrPhone = 'Please enter a valid phone number';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!validateForm()) return;

    const result = await login(formData.emailOrPhone, formData.password);

    if (result.success) {
      addToast('Login successful. Welcome back!', 'success');
      setTimeout(() => {
        // Navigate to dashboard or role selection
        navigate('/dashboard');
      }, 1500);
    } else {
      addToast(result.error || 'Login failed. Please try again.', 'error');
    }
  };

  const handleForgotPassword = () => {
    navigate('/auth/forgot-password');
  };

  const handleSocialLogin = (provider) => {
    addToast(`${provider.charAt(0).toUpperCase() + provider.slice(1)} login coming soon!`, 'info');
  };

  const handleFooterLink = () => {
    navigate('/auth/register');
  };

  return (
    <SharedAuthLayout
      title="Welcome Back"
      subtitle="Login to continue"
      footerText="Don't have an account?"
      footerLinkText="Register"
      onFooterLinkClick={handleFooterLink}
    >
      <form onSubmit={handleSubmit} className={styles.form}>
        {error && (
          <div className={styles.errorBanner} role="alert">
            {error}
          </div>
        )}

        <InputField
          label="Email or Phone"
          placeholder="Enter your email"
          name="emailOrPhone"
          type="text"
          value={formData.emailOrPhone}
          onChange={handleChange}
          error={errors.emailOrPhone}
          required
          inputMode="email"
          autoComplete="email"
        />

        <div className={styles.passwordFieldContainer}>
          <PasswordInput
            label="Password"
            placeholder="Enter your password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            error={errors.password}
            required
            autoComplete="current-password"
          />
          <button
            type="button"
            onClick={handleForgotPassword}
            className={styles.forgotPasswordLink}
          >
            Forgot Password?
          </button>
        </div>

        <AuthButton
          type="submit"
          isLoading={isLoading}
          disabled={isLoading}
        >
          Login
        </AuthButton>

        <SocialAuthButtons
          onGoogleClick={() => handleSocialLogin('google')}
          onAppleClick={() => handleSocialLogin('apple')}
          onFacebookClick={() => handleSocialLogin('facebook')}
          disabled={isLoading}
        />
      </form>

      {toasts.length > 0 && (
        <div className={styles.toastContainer}>
          {toasts.map(toast => (
            <div key={toast.id} className={`${styles.toast} ${styles[toast.type]}`}>
              {toast.message}
            </div>
          ))}
        </div>
      )}
    </SharedAuthLayout>
  );
}
