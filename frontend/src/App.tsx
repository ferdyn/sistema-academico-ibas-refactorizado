import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { ThemeProvider } from 'next-themes';
import { Toaster } from 'sonner';
import { AuthProvider } from '@/context/AuthContext';
import { AppRoutes } from '@/components/routing/AppRoutes';
import { ErrorBoundary } from '@/components/ErrorBoundary';

// Configuración del Toaster
const toasterConfig = {
  position: 'top-right' as const,
  toastOptions: {
    duration: 4000,
    style: {
      background: 'hsl(var(--background))',
      color: 'hsl(var(--foreground))',
      border: '1px solid hsl(var(--border))',
    },
  },
};

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
        <AuthProvider>
          <Router>
            <AppRoutes />
            <Toaster {...toasterConfig} />
          </Router>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
