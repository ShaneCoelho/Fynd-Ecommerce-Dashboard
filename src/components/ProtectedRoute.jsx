import { Navigate } from 'react-router-dom';
import { cookieService } from '../services/cookies';

export default function ProtectedRoute({ children }) {
  // Check authentication at render time, not at route definition time
  if (!cookieService.isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

