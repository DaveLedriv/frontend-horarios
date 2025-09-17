import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';

interface PrivateRouteProps {
  requiredRoles?: string[];
  redirectPath?: string;
}

export default function PrivateRoute({
  requiredRoles,
  redirectPath = '/',
}: PrivateRouteProps) {
  const { isAuthenticated, expires_at, roles } = useAuthStore((state) => ({
    isAuthenticated: state.isAuthenticated,
    expires_at: state.expires_at,
    roles: state.roles,
  }));

  const isValid = isAuthenticated && !!expires_at && expires_at > Date.now();
  if (!isValid) {
    return <Navigate to="/" replace />;
  }

  if (requiredRoles && requiredRoles.length > 0 && roles.length > 0) {
    const normalizedRoles = roles.map((role) => role.toLowerCase());
    const hasRole = requiredRoles.some((role) =>
      normalizedRoles.includes(role.toLowerCase()),
    );

    if (!hasRole) {
      return <Navigate to={redirectPath} replace />;
    }
  }

  return <Outlet />;
}
