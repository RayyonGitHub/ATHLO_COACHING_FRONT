import { Navigate } from 'react-router-dom';
import { authService } from '../services/authService';

const ProtectedRoute = ({ children, roleRequired }) => {
  const isAuthenticated = authService.isAuthenticated();
  const currentUser = authService.getCurrentUser();

  if (!isAuthenticated) {
    // Rediriger vers login si non connecté
    return <Navigate to="/login" replace />;
  }

  if (roleRequired && currentUser?.role !== roleRequired) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;