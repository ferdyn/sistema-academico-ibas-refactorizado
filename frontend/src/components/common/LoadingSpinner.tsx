import React from 'react';
import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  text = 'Cargando...',
  className
}) => {
  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-12 w-12',
    lg: 'h-16 w-16'
  };

  return (
    <div className={cn(
      "flex items-center justify-center h-screen",
      className
    )}>
      <div className="text-center">
        <div 
          className={cn(
            "animate-spin rounded-full border-b-2 border-primary mx-auto mb-4",
            sizeClasses[size]
          )}
        />
        {text && <p className="text-muted-foreground">{text}</p>}
      </div>
    </div>
  );
};

// Componente inline más pequeño para casos específicos
export const InlineSpinner: React.FC<{ size?: 'sm' | 'md' }> = ({ size = 'sm' }) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6'
  };

  return (
    <div 
      className={cn(
        "animate-spin rounded-full border-b-2 border-current",
        sizeClasses[size]
      )}
    />
  );
};
