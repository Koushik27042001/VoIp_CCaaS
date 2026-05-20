import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";

export default function ProtectedRoute({ role, roles, children }) {
  const location = useLocation();
  const { isAuthenticated, authLoading, user } = useAuthStore();
  const allowedRoles = role ? [role] : roles;

  if (authLoading) {
    return (
      <div className="auth-loading-screen">
        <p>Loading session...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles?.length && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/" replace />;
  }

  return children || <Outlet />;
}
