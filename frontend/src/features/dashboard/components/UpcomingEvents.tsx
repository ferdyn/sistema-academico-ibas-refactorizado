import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { InlineSpinner } from '@/components/common/LoadingSpinner';
import { ErrorState } from '@/components/common/ErrorState';
import { NoEventsFound } from '@/components/common/EmptyState';
import { Calendar, Clock, MapPin, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Evento } from '@/types';

interface UpcomingEventsProps {
  events: Evento[];
  loading: boolean;
  error: string | null;
  maxItems?: number;
}

export const UpcomingEvents: React.FC<UpcomingEventsProps> = ({
  events,
  loading,
  error,
  maxItems = 5
}) => {
  const getEventTypeColor = (tipo: string) => {
    switch (tipo) {
      case 'examen':
        return 'bg-red-500';
      case 'tarea':
        return 'bg-yellow-500';
      case 'clase':
        return 'bg-blue-500';
      case 'evento':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getEventBadgeVariant = (tipo: string) => {
    switch (tipo) {
      case 'examen':
        return 'destructive';
      case 'tarea':
        return 'secondary';
      case 'clase':
        return 'default';
      case 'evento':
        return 'outline';
      default:
        return 'outline';
    }
  };

  const formatEventDate = (fecha: string) => {
    try {
      return format(new Date(fecha), "dd MMM 'a las' HH:mm", { locale: es });
    } catch {
      return 'Fecha inválida';
    }
  };

  const isToday = (fecha: string) => {
    const today = new Date();
    const eventDate = new Date(fecha);
    return today.toDateString() === eventDate.toDateString();
  };

  const isTomorrow = (fecha: string) => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const eventDate = new Date(fecha);
    return tomorrow.toDateString() === eventDate.toDateString();
  };

  const getDateLabel = (fecha: string) => {
    if (isToday(fecha)) return 'Hoy';
    if (isTomorrow(fecha)) return 'Mañana';
    return formatEventDate(fecha);
  };

  // Filtrar y ordenar eventos próximos
  const upcomingEvents = events
    .filter(event => new Date(event.fechaInicio) > new Date())
    .sort((a, b) => new Date(a.fechaInicio).getTime() - new Date(b.fechaInicio).getTime())
    .slice(0, maxItems);

  return (
    <Card className="h-fit">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-semibold flex items-center">
          <Calendar className="h-5 w-5 mr-2" />
          Eventos Próximos
        </CardTitle>
        {upcomingEvents.length > 0 && (
          <Badge variant="secondary">
            {upcomingEvents.length}
          </Badge>
        )}
      </CardHeader>
      
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <InlineSpinner size="md" />
            <span className="ml-2 text-sm text-muted-foreground">
              Cargando eventos...
            </span>
          </div>
        ) : error ? (
          <ErrorState
            title="Error al cargar eventos"
            message={error}
            variant="inline"
            onRetry={() => window.location.reload()}
          />
        ) : upcomingEvents.length === 0 ? (
          <NoEventsFound />
        ) : (
          <>
            <ScrollArea className="h-[300px]">
              <div className="space-y-4">
                {upcomingEvents.map((event) => (
                  <div
                    key={event.id}
                    className="flex items-start space-x-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                  >
                    {/* Indicador de color por tipo */}
                    <div className={`w-1 h-16 rounded-full ${getEventTypeColor(event.tipo)}`} />
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <h4 className="text-sm font-medium text-foreground line-clamp-1">
                          {event.titulo}
                        </h4>
                        <Badge 
                          variant={getEventBadgeVariant(event.tipo)}
                          className="ml-2 text-xs"
                        >
                          {event.tipo}
                        </Badge>
                      </div>
                      
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                        {event.descripcion}
                      </p>
                      
                      <div className="flex items-center space-x-4 mt-2 text-xs text-muted-foreground">
                        <div className="flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          {getDateLabel(event.fechaInicio)}
                        </div>
                        
                        {event.ubicacion && (
                          <div className="flex items-center">
                            <MapPin className="h-3 w-3 mr-1" />
                            <span className="truncate max-w-[100px]">
                              {event.ubicacion}
                            </span>
                          </div>
                        )}
                      </div>
                      
                      {(isToday(event.fechaInicio) || isTomorrow(event.fechaInicio)) && (
                        <div className="mt-2">
                          <Badge 
                            variant={isToday(event.fechaInicio) ? "default" : "secondary"}
                            className="text-xs"
                          >
                            {isToday(event.fechaInicio) ? "¡Hoy!" : "Mañana"}
                          </Badge>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
            
            <div className="mt-4 pt-4 border-t">
              <Button variant="outline" size="sm" className="w-full" asChild>
                <Link to="/calendario">
                  Ver calendario completo
                  <ExternalLink className="h-4 w-4 ml-2" />
                </Link>
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};
