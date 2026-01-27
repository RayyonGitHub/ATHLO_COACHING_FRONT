import { Navigate } from 'react-router-dom';
import { authService } from '../services/authService';

const ProtectedRoute = ({ children }) => {
  const isAuthenticated = authService.isAuthenticated();

  if (!isAuthenticated) {
    // Rediriger vers login si non connecté
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;