import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { LoadingSpinner } from './LoadingSpinner';

interface RouteGuardProps {
  children: React.ReactNode;
  allowedRoles?: ('alumno' | 'maestro' | 'administrador')[];
  requireAuth?: boolean;
  redirectTo?: string;
}

export const RouteGuard: React.FC<RouteGuardProps> = ({
  children,
  allowedRoles,
  requireAuth = true,
  redirectTo = '/login'
}) => {
  const { isAuthenticated, isLoading, user } = useAuth();

  // Mostrar loading mientras se verifica la autenticación
  if (isLoading) {
    return <LoadingSpinner />;
  }

  // Si requiere autenticación pero no está autenticado
  if (requireAuth && !isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  // Si está autenticado pero no debería (ej: página de login)
  if (!requireAuth && isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  // Verificar roles si se especifican
  if (allowedRoles && user && !allowedRoles.includes(user.rol)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};
