import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import "../../App.css";
import "../../styles/designSystem.css";
import ToastProvider from "../../context/ToastProvider";
import DriverAuthGuard, { PublicDriverRoute } from "../../components/guards/DriverAuthGuard";
import {
  DriverLogin,
  DriverDashboard,
  DriverRideLog,
  DriverWithdrawals,
  DriverProfile,
  DriverNotifications,
  DriverCardLink,
} from "../../features/driver";

export default function DriverApp() {
  return (
    <ToastProvider>
      <Router>
        <Routes>
          {/* Public Driver Auth */}
          <Route
            path="/driver/login"
            element={
              <PublicDriverRoute>
                <DriverLogin />
              </PublicDriverRoute>
            }
          />
          <Route
            path="/login"
            element={<Navigate to="/driver/login" replace />}
          />

          {/* Protected Driver Routes */}
          <Route
            path="/driver"
            element={
              <DriverAuthGuard>
                <DriverDashboard />
              </DriverAuthGuard>
            }
          />
          <Route
            path="/driver/dashboard"
            element={<Navigate to="/driver" replace />}
          />
          <Route
            path="/driver/history"
            element={
              <DriverAuthGuard>
                <DriverRideLog />
              </DriverAuthGuard>
            }
          />
          <Route
            path="/driver/withdrawals"
            element={
              <DriverAuthGuard>
                <DriverWithdrawals />
              </DriverAuthGuard>
            }
          />
          <Route
            path="/driver/profile"
            element={
              <DriverAuthGuard>
                <DriverProfile />
              </DriverAuthGuard>
            }
          />
          <Route
            path="/driver/notifications"
            element={
              <DriverAuthGuard>
                <DriverNotifications />
              </DriverAuthGuard>
            }
          />
          <Route
            path="/driver/link-card"
            element={
              <DriverAuthGuard>
                <DriverCardLink />
              </DriverAuthGuard>
            }
          />

          {/* Root redirect for Driver portal */}
          <Route path="/" element={<Navigate to="/driver" replace />} />
          <Route path="*" element={<Navigate to="/driver" replace />} />
        </Routes>
      </Router>
    </ToastProvider>
  );
}
