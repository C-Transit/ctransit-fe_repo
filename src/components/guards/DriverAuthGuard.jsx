import { Navigate, useLocation } from "react-router-dom";
import { isDriverAuthenticated } from "../../api/driverAuth";

/**
 * DriverAuthGuard
 * Protects driver-only routes.
 * Redirects unauthenticated users or users with invalid sessions to /driver/login.
 * Strictly prevents cross-portal contamination from student, agent, or admin sessions.
 */
export default function DriverAuthGuard({ children }) {
  const location = useLocation();
  const authenticated = isDriverAuthenticated();

  if (!authenticated) {
    return <Navigate to="/driver/login" state={{ from: location }} replace />;
  }

  return children;
}

/**
 * PublicDriverRoute
 * Redirects authenticated drivers straight into the Driver Dashboard (/driver).
 */
export function PublicDriverRoute({ children }) {
  const authenticated = isDriverAuthenticated();

  if (authenticated) {
    return <Navigate to="/driver" replace />;
  }

  return children;
}
