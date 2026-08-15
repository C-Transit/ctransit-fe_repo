import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import '../../App.css';
import '../../styles/designSystem.css';
import ToastProvider from '../../context/ToastProvider';
import { AuthProvider } from '../../context/AuthContext';
import Home from '../../features/public/Home';
import DashboardWrapper from '../../features/dashboard/DashboardWrapper';
import UserProfile from '../../features/dashboard/UserProfile';
import Settings from '../../features/dashboard/pages/SettingsPage';
import TransferHistory from '../../features/dashboard/TransferHistory';
import TermsPage from '../../features/public/TermsPage';
import PrivacyPage from '../../features/public/PrivacyPage';
import AboutPage from '../../features/public/About';
import ContactSupport from '../../features/public/Contact';
import HelpCenter from '../../features/public/HelpPage';
import ReportDispute from '../../features/public/ReportDispute';

// Auth Screens
import LoginPage from '../../features/auth/LoginPage';
import RegisterPage from '../../features/auth/RegisterPage';
import VerifyPhonePage from '../../features/auth/VerifyPhonePage';
import ForgotPasswordPage from '../../features/auth/ForgotPasswordPage';
import ResetPasswordPage from '../../features/auth/ResetPasswordPage';
import AuthGuard from '../../components/guards/AuthGuard';

const safeGetItem = (key) => {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
};

function PublicAuthRoute({ children }) {
  const isAuthenticated = Boolean(safeGetItem('authToken'));
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : children;
}

export default function WebApp() {
  return (
    <ToastProvider>
      <AuthProvider>
        <Router>
          <Routes>
            {/* Public Marketing & Information Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/terms" element={<TermsPage />} />
            <Route path="/privacy" element={<PrivacyPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<ContactSupport />} />
            <Route path="/help" element={<HelpCenter />} />
            <Route path="/dispute" element={<ReportDispute />} />
            <Route path="/report-dispute" element={<ReportDispute />} />

            {/* Passenger Auth Routes */}
            <Route
              path="/auth/login"
              element={
                <PublicAuthRoute>
                  <LoginPage />
                </PublicAuthRoute>
              }
            />
            <Route
              path="/auth/register"
              element={
                <PublicAuthRoute>
                  <RegisterPage />
                </PublicAuthRoute>
              }
            />
            <Route
              path="/auth/verify-phone"
              element={<VerifyPhonePage />}
            />
            <Route
              path="/auth/forgot-password"
              element={
                <PublicAuthRoute>
                  <ForgotPasswordPage />
                </PublicAuthRoute>
              }
            />
            <Route
              path="/auth/reset-password"
              element={
                <PublicAuthRoute>
                  <ResetPasswordPage />
                </PublicAuthRoute>
              }
            />

            {/* Legacy shortcuts */}
            <Route path="/login" element={<Navigate to="/auth/login" replace />} />
            <Route path="/register" element={<Navigate to="/auth/register" replace />} />
            <Route path="/forgot-password" element={<Navigate to="/auth/forgot-password" replace />} />
            <Route path="/password-reset-otp" element={<Navigate to="/auth/reset-password" replace />} />

            {/* Protected Passenger Dashboard Routes */}
            <Route
              path="/dashboard"
              element={
                <AuthGuard>
                  <DashboardWrapper />
                </AuthGuard>
              }
            />
            <Route
              path="/card-linking"
              element={<Navigate to="/dashboard" replace />}
            />
            <Route
              path="/history"
              element={
                <AuthGuard>
                  <TransferHistory />
                </AuthGuard>
              }
            />
            <Route
              path="/profile"
              element={
                <AuthGuard>
                  <UserProfile />
                </AuthGuard>
              }
            />
            <Route
              path="/settings"
              element={
                <AuthGuard>
                  <Settings />
                </AuthGuard>
              }
            />

            {/* Catch all */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ToastProvider>
  );
}
