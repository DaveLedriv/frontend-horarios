import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';

export default function PrivateRoute() {
  const { isAuthenticated, expires_at } = useAuthStore((state) => ({
    isAuthenticated: state.isAuthenticated,
    expires_at: state.expires_at,
  }));

  const isValid = isAuthenticated && !!expires_at && expires_at > Date.now();

  return isValid ? <Outlet /> : <Navigate to="/" />;
}
