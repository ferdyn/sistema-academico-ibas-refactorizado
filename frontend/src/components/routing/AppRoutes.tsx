import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { appRoutes, redirectRoutes } from '@/config/routes';
import { RouteGuard } from '@/components/common/RouteGuard';
import { AppLayout } from '@/components/layout/AppLayout';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

export const AppRoutes: React.FC = () => {
  return (
    <Suspense fallback={<LoadingSpinner text="Cargando página..." />}>
      <Routes>
        {/* Rutas dinámicas basadas en configuración */}
        {appRoutes.map((route) => {
          const { path, element: Component, requireAuth, allowedRoles } = route;
          
          return (
            <Route
              key={path}
              path={path}
              element={
                <RouteGuard
                  requireAuth={requireAuth}
                  allowedRoles={allowedRoles}
                  redirectTo={requireAuth === false ? '/dashboard' : '/login'}
                >
                  {requireAuth ? (
                    <AppLayout>
                      <Component />
                    </AppLayout>
                  ) : (
                    <Component />
                  )}
                </RouteGuard>
              }
            />
          );
        })}

        {/* Rutas de redirección */}
        {redirectRoutes.map((redirect, index) => (
          <Route
            key={`redirect-${index}`}
            path={redirect.from}
            element={<Navigate to={redirect.to} replace />}
          />
        ))}
      </Routes>
    </Suspense>
  );
};
