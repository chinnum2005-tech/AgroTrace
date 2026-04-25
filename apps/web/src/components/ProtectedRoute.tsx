import { Navigate } from 'react-router-dom';
import { toast } from './Toast';

export type UserRole = 'ADMIN' | 'FARMER' | 'DISTRIBUTOR' | 'CONSUMER';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
  fallbackPath?: string;
}

export default function ProtectedRoute({ 
  children, 
  allowedRoles,
  fallbackPath = '/dashboard'
}: ProtectedRouteProps) {
  
  // Read auth state from the global app state (localStorage)
  const userData = localStorage.getItem('user');
  const user = userData ? JSON.parse(userData) : null;

  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Redirect to fallback path if role not allowed
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    toast.error('You do not have permission to access this page');
    return <Navigate to={fallbackPath} replace />;
  }

  // Render protected content
  return <>{children}</>;
}

