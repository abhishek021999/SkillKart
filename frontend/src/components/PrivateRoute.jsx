import { useAuth } from '../contexts/AuthContext';

const PrivateRoute = ({ children, adminOnly = false }) => {
  const { user, loading } = useAuth();

  if (loading) {
    // Wait for auth to finish loading before making any redirect decisions
    return null;
  }

  if (!user) {
    window.location.href = '/login';
    return null;
  }

  if (adminOnly && user.role !== 'admin') {
    window.location.href = '/dashboard';
    return null;
  }

  return children;
};

export default PrivateRoute; 