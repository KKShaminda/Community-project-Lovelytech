import { Navigate, useLocation } from 'react-router-dom';
import { getCurrentUser, isAuthenticated } from '../../services/authServices';

/**
 * Route guard for role-based and authentication-required routes.
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children
 * @param {string[]} [props.allowedRoles] - Optional list of allowed roles (e.g. ['admin', 'Receptionist'])
 */
export function ProtectedRoute({ children, allowedRoles }) {
  const location = useLocation();
  const authenticated = isAuthenticated();
  const user = getCurrentUser();

  if (!authenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && allowedRoles.length > 0) {
    const userRole = (user.role || '').toLowerCase();
    const isAllowed = allowedRoles.some(
      (role) => role.toLowerCase() === userRole
    );

    if (!isAllowed) {
      // Redirect to their respective authorized dashboard
      if (userRole === 'admin') {
        return <Navigate to="/admin/dashboard" replace />;
      }
      if (userRole === 'receptionist') {
        return <Navigate to="/receptionist/dashboard" replace />;
      }
      return <Navigate to="/user/dashboard" replace />;
    }
  }

  return children;
}

export default ProtectedRoute;
