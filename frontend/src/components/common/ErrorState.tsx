import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  showHomeButton?: boolean;
  variant?: 'inline' | 'card' | 'page';
  className?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Ha ocurrido un error',
  message = 'No se pudieron cargar los datos. Por favor, inténtalo de nuevo.',
  onRetry,
  showHomeButton = false,
  variant = 'inline',
  className
}) => {
  const actions = (
    <div className="flex flex-col sm:flex-row gap-2 mt-4">
      {onRetry && (
        <Button 
          onClick={onRetry}
          variant="outline"
          className="flex items-center gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Reintentar
        </Button>
      )}
      {showHomeButton && (
        <Button asChild variant="default">
          <Link to="/dashboard" className="flex items-center gap-2">
            <Home className="h-4 w-4" />
            Ir al inicio
          </Link>
        </Button>
      )}
    </div>
  );

  if (variant === 'inline') {
    return (
      <Alert variant="destructive" className={className}>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription className="flex flex-col">
          <span className="font-medium">{title}</span>
          <span className="text-sm mt-1">{message}</span>
          {(onRetry || showHomeButton) && actions}
        </AlertDescription>
      </Alert>
    );
  }

  if (variant === 'card') {
    return (
      <Card className={cn('w-full', className)}>
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mb-4">
            <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
          </div>
          <CardTitle className="text-red-600 dark:text-red-400">{title}</CardTitle>
          <CardDescription>{message}</CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          {actions}
        </CardContent>
      </Card>
    );
  }

  // variant === 'page'
  return (
    <div className={cn(
      'min-h-[400px] flex items-center justify-center p-4',
      className
    )}>
      <div className="text-center max-w-md">
        <div className="mx-auto w-16 h-16 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mb-6">
          <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
        </div>
        <h2 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-2">
          {title}
        </h2>
        <p className="text-muted-foreground mb-6">
          {message}
        </p>
        {actions}
      </div>
    </div>
  );
};

// Componente específico para errores de carga de datos
interface DataErrorProps {
  onRetry?: () => void;
  className?: string;
}

export const DataError: React.FC<DataErrorProps> = ({ onRetry, className }) => {
  return (
    <ErrorState
      title="Error al cargar datos"
      message="Hubo un problema al obtener la información. Verifica tu conexión e inténtalo nuevamente."
      onRetry={onRetry}
      variant="card"
      className={className}
    />
  );
};

// Componente para estado de "no encontrado"
interface NotFoundStateProps {
  title?: string;
  message?: string;
  showHomeButton?: boolean;
  className?: string;
}

export const NotFoundState: React.FC<NotFoundStateProps> = ({
  title = 'No encontrado',
  message = 'El contenido que buscas no existe o ha sido movido.',
  showHomeButton = true,
  className
}) => {
  return (
    <ErrorState
      title={title}
      message={message}
      showHomeButton={showHomeButton}
      variant="page"
      className={className}
    />
  );
};
