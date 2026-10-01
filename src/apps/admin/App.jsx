import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import '../../App.css';
import '../../styles/designSystem.css';
import ToastProvider from '../../context/ToastProvider';
import AdminLogin from '../../features/admin/AdminLogin';
import AdminDashboard from '../../features/admin/AdminDashboard';
import { isAdminAuthenticated } from '../../api/adminAuth';

function ProtectedAdminRoute({ children }) {
  return isAdminAuthenticated() ? children : <Navigate to="/login" replace />;
}

function PublicAdminRoute({ children }) {
  return isAdminAuthenticated() ? <Navigate to="/dashboard" replace /> : children;
}

export default function AdminApp() {
  return (
    <ToastProvider>
      <Router>
        <Routes>
          {/* Admin Authentication */}
          <Route
            path="/login"
            element={
              <PublicAdminRoute>
                <AdminLogin />
              </PublicAdminRoute>
            }
          />
          <Route
            path="/admin/login"
            element={
              <PublicAdminRoute>
                <AdminLogin />
              </PublicAdminRoute>
            }
          />

          {/* Admin Dashboard */}
          <Route
            path="/"
            element={
              <ProtectedAdminRoute>
                <AdminDashboard />
              </ProtectedAdminRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedAdminRoute>
                <AdminDashboard />
              </ProtectedAdminRoute>
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
            element={<Navigate to="/dashboard" replace />}
          />

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
    </ToastProvider>
  );
}
