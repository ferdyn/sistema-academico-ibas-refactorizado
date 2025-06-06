import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { LoadingSpinner, InlineSpinner } from '@/components/common/LoadingSpinner';
import { ErrorState } from '@/components/common/ErrorState';
import { NoNotificationsFound } from '@/components/common/EmptyState';
import { Bell, CheckCircle, AlertCircle, Info, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { Notificacion } from '@/types';

interface NotificationsListProps {
  notifications: Notificacion[];
  loading: boolean;
  error: string | null;
  maxItems?: number;
}

export const NotificationsList: React.FC<NotificationsListProps> = ({
  notifications,
  loading,
  error,
  maxItems = 5
}) => {
  const getNotificationIcon = (tipo: string) => {
    switch (tipo) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Info className="h-4 w-4 text-blue-500" />;
    }
  };

  const getNotificationBadgeVariant = (tipo: string) => {
    switch (tipo) {
      case 'success':
        return 'default';
      case 'warning':
        return 'secondary';
      case 'error':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const formatNotificationDate = (fecha: string) => {
    try {
      return formatDistanceToNow(new Date(fecha), {
        addSuffix: true,
        locale: es
      });
    } catch {
      return 'Fecha inválida';
    }
  };

  const recentNotifications = notifications.slice(0, maxItems);

  return (
    <Card className="h-fit">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-semibold flex items-center">
          <Bell className="h-5 w-5 mr-2" />
          Notificaciones
        </CardTitle>
        {notifications.length > 0 && (
          <Badge variant="secondary">
            {notifications.length}
          </Badge>
        )}
      </CardHeader>
      
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <InlineSpinner size="md" />
            <span className="ml-2 text-sm text-muted-foreground">
              Cargando notificaciones...
            </span>
          </div>
        ) : error ? (
          <ErrorState
            title="Error al cargar notificaciones"
            message={error}
            variant="inline"
            onRetry={() => window.location.reload()}
          />
        ) : notifications.length === 0 ? (
          <NoNotificationsFound />
        ) : (
          <>
            <ScrollArea className="h-[300px]">
              <div className="space-y-4">
                {recentNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    className="flex items-start space-x-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex-shrink-0 mt-1">
                      {getNotificationIcon(notification.tipo)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <p className="text-sm font-medium text-foreground">
                          {notification.titulo}
                        </p>
                        <Badge 
                          variant={getNotificationBadgeVariant(notification.tipo)}
                          className="ml-2 text-xs"
                        >
                          {notification.tipo}
                        </Badge>
                      </div>
                      
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                        {notification.mensaje}
                      </p>
                      
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-muted-foreground">
                          {formatNotificationDate(notification.fecha)}
                        </span>
                        
                        {!notification.leida && (
                          <div className="h-2 w-2 bg-blue-500 rounded-full" />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
            
            {notifications.length > maxItems && (
              <div className="mt-4 pt-4 border-t">
                <Button variant="outline" size="sm" className="w-full" asChild>
                  <Link to="/notificaciones">
                    Ver todas las notificaciones
                    <ExternalLink className="h-4 w-4 ml-2" />
                  </Link>
                </Button>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};
