import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from './AuthContext/authContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
  requireReseller?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requireAdmin = false,
  requireReseller = false,
}) => {
  const {
    isAuthenticated,
    userInfo,
    checkAuth,
  } = useContext(AuthContext);

  const hasToken = checkAuth();

  if (!isAuthenticated || !hasToken) {
    return <Navigate to="/login" replace />;
  }

  if (requireAdmin && userInfo?.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  if (requireReseller && userInfo?.role !== 'reseller') {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};