import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@hooks/useAuth';
import { useAppDispatch } from '@hooks/useRedux';
import { fetchProfile } from '@store/slices/authSlice';
import { UserRole } from '../types/auth.types';

interface RoleBasedRouteProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
}

const RoleBasedRoute: React.FC<RoleBasedRouteProps> = ({ children, allowedRoles }) => {
  const dispatch = useAppDispatch();
  const { isAuthenticated, user, loading } = useAuth();
  const [isHydrating, setIsHydrating] = React.useState(false);

  React.useEffect(() => {
    if (isAuthenticated && !user && !loading && !isHydrating) {
      console.log('RoleBasedRoute: Token exists but user missing. Fetching profile...');
      setIsHydrating(true);
      dispatch(fetchProfile())
        .unwrap()
        .catch((err) => {
           console.error('RoleBasedRoute: Profile fetch failed', err);
        })
        .finally(() => {
           setIsHydrating(false);
        });
    }
  }, [isAuthenticated, user, loading, dispatch, isHydrating]);

  if (loading || (isAuthenticated && !user)) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!user || !allowedRoles.includes(user.role)) {
    console.log('RoleBasedRoute redirecting to dashboard:', { user, role: user?.role, allowedRoles });
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

export default RoleBasedRoute;
