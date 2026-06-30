import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import './App.css';
import './styles/designSystem.css';
import ToastProvider from './context/ToastProvider';
import { AuthProvider } from './context/AuthContext';
import Home from './pages/Home';
import DashboardWrapper from './pages/DashboardWrapper';
import UserProfile from './pages/UserProfile';
import Settings from './pages/dashboard/SettingsPage';
import TransferHistory from './pages/TransferHistory';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import AgentLogin from './pages/AgentLogin';
import AgentDashboard from './pages/AgentDashboard';
import TermsPage from './pages/Terms.page';
import PrivacyPage from './pages/Privacy.page';
import AboutPage from './pages/About';
import ContactSupport from './pages/Contact';
import HelpCenter from './pages/HelpPage';

// New Auth Screens
import LoginPage from './pages/Login.page';
import RegisterPage from './pages/Register.page';
import VerifyPhonePage from './pages/VerifyPhone.page'; // Your OTP page
import ForgotPasswordPage from './pages/ForgotPassword.page';
import ResetPasswordPage from './pages/ResetPassword.page';
import AuthGuard from './components/Auth/AuthGuard';

import { isAdminAuthenticated } from './config/adminAuth';

const isAgentAuthenticated = () => Boolean(localStorage.getItem('agentSession'));

function PublicAuthRoute({ children }) {
  const isAuthenticated = Boolean(localStorage.getItem('authToken'));
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : children;
}

function ProtectedAdminRoute({ children }) {
  return isAdminAuthenticated() ? children : <Navigate to="/admin/login" replace />;
}

function PublicAdminRoute({ children }) {
  return isAdminAuthenticated() ? <Navigate to="/admin/dashboard" replace /> : children;
}

function ProtectedAgentRoute({ children }) {
  return isAgentAuthenticated() ? children : <Navigate to="/agent/login" replace />;
}

function PublicAgentRoute({ children }) {
  return isAgentAuthenticated() ? <Navigate to="/agent/dashboard" replace /> : children;
}

function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/terms" element={<TermsPage />} />
            <Route path="/privacy" element={<PrivacyPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<ContactSupport />} />
            <Route path="/help" element={<HelpCenter />} />

            {/* New Auth Routes */}
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

            {/* Legacy routes for backward compatibility */}
            <Route path="/login" element={<Navigate to="/auth/login" replace />} />
            <Route path="/register" element={<Navigate to="/auth/register" replace />} />
            <Route path="/forgot-password" element={<Navigate to="/auth/forgot-password" replace />} />
            <Route path="/password-reset-otp" element={<Navigate to="/auth/reset-password" replace />} />

            {/* Protected Routes — using AuthGuard */}
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

            {/* Admin Routes */}
            <Route
              path="/admin/login"
              element={
                <PublicAdminRoute>
                  <AdminLogin />
                </PublicAdminRoute>
              }
            />
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedAdminRoute>
                  <AdminDashboard />
                </ProtectedAdminRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <PublicAdminRoute>
                  <Navigate to="/admin/dashboard" replace />
                </PublicAdminRoute>
              }
            />

            {/* Agent Routes */}
            <Route
              path="/agent/login"
              element={
                <PublicAgentRoute>
                  <AgentLogin />
                </PublicAgentRoute>
              }
            />
            <Route
              path="/agent/dashboard"
              element={
                <ProtectedAgentRoute>
                  <AgentDashboard />
                </ProtectedAgentRoute>
              }
            />
            <Route
              path="/agent"
              element={
                <PublicAgentRoute>
                  <Navigate to="/agent/dashboard" replace />
                </PublicAgentRoute>
              }
            />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ToastProvider>
  );
}

export default App;