import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LucideIcon, Plus, Search, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
    variant?: 'default' | 'outline' | 'secondary';
  };
  variant?: 'card' | 'page';
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon = FileText,
  title,
  description,
  action,
  variant = 'card',
  className
}) => {
  const content = (
    <>
      <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-6">
        <Icon className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
        {description}
      </p>
      {action && (
        <Button 
          onClick={action.onClick}
          variant={action.variant || 'default'}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          {action.label}
        </Button>
      )}
    </>
  );

  if (variant === 'card') {
    return (
      <Card className={cn('w-full', className)}>
        <CardContent className="text-center pt-6">
          {content}
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
      <div className="text-center">
        {content}
      </div>
    </div>
  );
};

// Estados vacíos específicos para diferentes secciones
export const NoMateriasFounded: React.FC<{ onCreateNew?: () => void }> = ({ onCreateNew }) => (
  <EmptyState
    icon={Search}
    title="No hay materias disponibles"
    description="No se encontraron materias que coincidan con los criterios de búsqueda."
    action={onCreateNew ? {
      label: 'Crear nueva materia',
      onClick: onCreateNew
    } : undefined}
  />
);

export const NoTasksFound: React.FC<{ onCreateNew?: () => void }> = ({ onCreateNew }) => (
  <EmptyState
    icon={FileText}
    title="No hay tareas pendientes"
    description="¡Excelente! No tienes tareas pendientes por el momento."
    action={onCreateNew ? {
      label: 'Crear nueva tarea',
      onClick: onCreateNew
    } : undefined}
  />
);

export const NoStudentsFound: React.FC<{ onInviteNew?: () => void }> = ({ onInviteNew }) => (
  <EmptyState
    icon={Search}
    title="No hay estudiantes registrados"
    description="Aún no hay estudiantes inscritos en esta materia."
    action={onInviteNew ? {
      label: 'Invitar estudiantes',
      onClick: onInviteNew
    } : undefined}
  />
);

export const NoNotificationsFound: React.FC = () => (
  <EmptyState
    icon={Search}
    title="No tienes notificaciones"
    description="Todas las notificaciones están al día. Te notificaremos cuando haya algo nuevo."
    variant="card"
  />
);

export const NoEventsFound: React.FC<{ onCreateNew?: () => void }> = ({ onCreateNew }) => (
  <EmptyState
    icon={Search}
    title="No hay eventos programados"
    description="No tienes eventos próximos en tu calendario."
    action={onCreateNew ? {
      label: 'Crear evento',
      onClick: onCreateNew
    } : undefined}
  />
);
