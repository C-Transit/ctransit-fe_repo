import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import SharedAuthLayout from '../components/Auth/SharedAuthLayout';
import InputField from '../components/Auth/InputField';
import PasswordInput from '../components/Auth/PasswordInput';
import AuthButton from '../components/Auth/AuthButton';
import SocialAuthButtons from '../components/Auth/SocialAuthButtons';
import TermsCheckbox from '../components/Auth/TermsCheckbox';
import { validateEmail } from '../utils/validation';
import { calculatePasswordStrength, getPasswordStrengthLabel } from '../utils/passwordUtils';
import styles from './Register.page.module.css';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register, isLoading, error, setError } = useContext(AuthContext);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    matricNumber: '',
    password: '',
    confirmPassword: '',          
    termsAccepted: false,
  });

  const [errors, setErrors] = useState({});
  const [toasts, setToasts] = useState([]);
  const [passwordStrength, setPasswordStrength] = useState({ strength: 'weak', level: 0 });

  const addToast = (message, type = 'error') => {
    const id = Math.random();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3500);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (name === 'password') {
      setPasswordStrength(calculatePasswordStrength(value));
    }

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleTermsChange = (checked) => {
    setFormData(prev => ({ ...prev, termsAccepted: checked }));
    if (errors.termsAccepted) {
      setErrors(prev => ({ ...prev, termsAccepted: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    } else if (formData.firstName.trim().length < 2) {
      newErrors.firstName = 'First name must be at least 2 characters';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    } else if (formData.lastName.trim().length < 2) {
      newErrors.lastName = 'Last name must be at least 2 characters';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'School email is required';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid school email';
    }

    if (!formData.matricNumber.trim()) {
      newErrors.matricNumber = 'Matric number is required';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!formData.termsAccepted) {
      newErrors.termsAccepted = 'You must accept the terms and conditions';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!validateForm()) return;

    const result = await register({
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      matricNumber: formData.matricNumber,
      password: formData.password,
    });

    if (result.success) {
      addToast('Account created successfully!', 'success');
      setTimeout(() => {
        navigate('/auth/verify-phone', {
          state: { email: formData.email },
        });
      }, 1500);
    } else {
      addToast(result.error || 'Registration failed. Please try again.', 'error');
    }
  };

  const handleSocialRegister = (provider) => {
    addToast(`${provider.charAt(0).toUpperCase() + provider.slice(1)} signup coming soon!`, 'info');
  };

  const handleFooterLink = () => navigate('/auth/login');
  const handleTermsClick = () => navigate('/terms');
  const handlePrivacyClick = () => navigate('/privacy');

  return (
    <SharedAuthLayout
      title="Create Account"
      subtitle="Join C-Transit today"
      footerText="Already have an account?"
      footerLinkText="Login"
      onFooterLinkClick={handleFooterLink}
    >
      <form onSubmit={handleSubmit} className={styles.form}>
        {error && (
          <div className={styles.errorBanner} role="alert">
            {error}
          </div>
        )}

        {/* First Name and Last Name side by side */}
        <div className={styles.nameRow}>
          <InputField
            label="First Name"
            placeholder="John"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            error={errors.firstName}
            required
            autoComplete="given-name"
          />
          <InputField
            label="Last Name"
            placeholder="Doe"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            error={errors.lastName}
            required
            autoComplete="family-name"
          />
        </div>

        <InputField
          label="School Email"
          placeholder="e.g. joe.m12345@st.futminna.edu.ng"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          error={errors.email}
          required
          inputMode="email"
          autoComplete="email"
        />

        <InputField
          label="Matric Number"
          placeholder="e.g. 2021/1/12345EE"
          name="matricNumber"
          value={formData.matricNumber}
          onChange={handleChange}
          error={errors.matricNumber}
          required
          autoComplete="off"
        />

        <PasswordInput
          label="Password"
          placeholder="Create a strong password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          error={errors.password}
          required
          showStrengthMeter
          strengthLevel={passwordStrength.level}
          strengthLabel={getPasswordStrengthLabel(formData.password)}
          autoComplete="new-password"
        />

        <PasswordInput
          label="Confirm Password"
          placeholder="Re-enter your password"
          name="confirmPassword"
          value={formData.confirmPassword}
          onChange={handleChange}
          error={errors.confirmPassword}
          required
          autoComplete="new-password"
        />

        {/* Role is hidden — always student by default */}
        <input type="hidden" name="role" value={formData.role} />

        <TermsCheckbox
          checked={formData.termsAccepted}
          onChange={handleTermsChange}
          onTermsClick={handleTermsClick}
          onPrivacyClick={handlePrivacyClick}
          error={errors.termsAccepted}
        />

        <AuthButton
          type="submit"
          isLoading={isLoading}
          disabled={isLoading}
        >
          Create Account
        </AuthButton>

        <SocialAuthButtons
          onGoogleClick={() => handleSocialRegister('google')}
          onAppleClick={() => handleSocialRegister('apple')}
          onFacebookClick={() => handleSocialRegister('facebook')}
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