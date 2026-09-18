import { Navigate, useLocation } from "react-router-dom";
import { isDriverAuthenticated } from "../../api/driverAuth";

export default function DriverAuthGuard({ children }) {
  const location = useLocation();
  const authenticated = isDriverAuthenticated();

  if (!authenticated) {
    return <Navigate to="/driver/login" state={{ from: location }} replace />;
  }

  return children;
}

export function PublicDriverRoute({ children }) {
  const authenticated = isDriverAuthenticated();

  if (authenticated) {
    return <Navigate to="/driver" replace />;
  }

  return children;
}
