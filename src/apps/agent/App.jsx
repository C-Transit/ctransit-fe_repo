import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import '../../App.css';
import '../../styles/designSystem.css';
import ToastProvider from '../../context/ToastProvider';
import AgentLogin from '../../features/agent/AgentLogin';
import AgentDashboard from '../../features/agent/AgentDashboard';

const safeGetItem = (key) => {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
};

const isAgentAuthenticated = () => Boolean(safeGetItem('agentSession'));

function ProtectedAgentRoute({ children }) {
  return isAgentAuthenticated() ? children : <Navigate to="/login" replace />;
}

function PublicAgentRoute({ children }) {
  return isAgentAuthenticated() ? <Navigate to="/dashboard" replace /> : children;
}

export default function AgentApp() {
  return (
    <ToastProvider>
      <Router>
        <Routes>
          {/* Agent Authentication */}
          <Route
            path="/login"
            element={
              <PublicAgentRoute>
                <AgentLogin />
              </PublicAgentRoute>
            }
          />
          <Route
            path="/agent/login"
            element={
              <PublicAgentRoute>
                <AgentLogin />
              </PublicAgentRoute>
            }
          />

          {/* Agent & Driver Dashboard */}
          <Route
            path="/"
            element={
              <ProtectedAgentRoute>
                <AgentDashboard />
              </ProtectedAgentRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedAgentRoute>
                <AgentDashboard />
              </ProtectedAgentRoute>
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
            element={<Navigate to="/dashboard" replace />}
          />

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
    </ToastProvider>
  );
}
