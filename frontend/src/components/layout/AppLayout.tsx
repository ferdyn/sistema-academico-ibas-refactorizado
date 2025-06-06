import React from 'react';
import { Navigation } from './Navigation';

interface AppLayoutProps {
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  return (
    <Navigation>
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </Navigation>
  );
};
