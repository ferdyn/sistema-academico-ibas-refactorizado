import React, { useState } from 'react';
import { useAuth, useUserRole } from '@/context/AuthContext';
import { useUserEvents, useData } from '@/hooks/useData';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar as CalendarIcon, Plus, Clock, MapPin, Users, Filter } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const eventoSchema = z.object({
  titulo: z.string().min(1, 'El título es requerido'),
  descripcion: z.string().optional(),
  fechaInicio: z.string().min(1, 'La fecha de inicio es requerida'),
  fechaFin: z.string().optional(),
  tipo: z.enum(['academico', 'administrativo', 'social', 'feriado']),
  audiencia: z.enum(['todos', 'alumnos', 'maestros', 'administradores']),
  cursoId: z.string().optional()
});

type EventoForm = z.infer<typeof eventoSchema>;

const Calendario: React.FC = () => {
  const { user } = useAuth();
  const { isAdmin, isMaestro } = useUserRole();
  const { events, loading } = useUserEvents();
  const { data } = useData();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [isCreateEventOpen, setIsCreateEventOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>('month');

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue
  } = useForm<EventoForm>({
    resolver: zodResolver(eventoSchema)
  });

  const onSubmitEvent = async (formData: EventoForm) => {
    console.log('Nuevo evento:', formData);
    reset();
    setIsCreateEventOpen(false);
  };

  // Filtrar eventos
  const filteredEvents = events.filter(event => {
    if (selectedFilter === 'all') return true;
    return event.tipo === selectedFilter;
  });

  // Obtener eventos del día seleccionado
  const eventsForSelectedDate = filteredEvents.filter(event => {
    const eventDate = new Date(event.fechaInicio);
    return eventDate.toDateString() === selectedDate.toDateString();
  });

  // Obtener eventos próximos (próximos 7 días)
  const upcomingEvents = filteredEvents.filter(event => {
    const eventDate = new Date(event.fechaInicio);
    const today = new Date();
    const weekFromNow = new Date();
    weekFromNow.setDate(today.getDate() + 7);
    return eventDate >= today && eventDate <= weekFromNow;
  }).sort((a, b) => new Date(a.fechaInicio).getTime() - new Date(b.fechaInicio).getTime());

  // Generar días del mes para el calendario
  const generateCalendarDays = () => {
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days = [];
    for (let i = 0; i < 42; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      
      const dayEvents = filteredEvents.filter(event => {
        const eventDate = new Date(event.fechaInicio);
        return eventDate.toDateString() === date.toDateString();
      });

      days.push({
        date,
        isCurrentMonth: date.getMonth() === month,
        isToday: date.toDateString() === new Date().toDateString(),
        isSelected: date.toDateString() === selectedDate.toDateString(),
        events: dayEvents
      });
    }
    return days;
  };

  const calendarDays = generateCalendarDays();

  const getEventTypeColor = (tipo: string) => {
    switch (tipo) {
      case 'academico': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'administrativo': return 'bg-green-100 text-green-800 border-green-200';
      case 'social': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'feriado': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Cargando calendario...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <div>
          <h1 className="text-3xl font-bold">Calendario</h1>
          <p className="text-muted-foreground">
            Eventos académicos y administrativos del instituto
          </p>
        </div>

        <div className="flex space-x-2">
          {(isAdmin || isMaestro) && (
            <Dialog open={isCreateEventOpen} onOpenChange={setIsCreateEventOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Nuevo Evento
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Crear Nuevo Evento</DialogTitle>
                  <DialogDescription>
                    Programa un nuevo evento en el calendario
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmitEvent)} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="titulo">Título</Label>
                    <Input
                      id="titulo"
                      placeholder="Título del evento"
                      {...register('titulo')}
                    />
                    {errors.titulo && (
                      <p className="text-sm text-destructive">{errors.titulo.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="descripcion">Descripción</Label>
                    <Textarea
                      id="descripcion"
                      placeholder="Descripción del evento..."
                      {...register('descripcion')}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="fechaInicio">Fecha Inicio</Label>
                      <Input
                        id="fechaInicio"
                        type="datetime-local"
                        {...register('fechaInicio')}
                      />
                      {errors.fechaInicio && (
                        <p className="text-sm text-destructive">{errors.fechaInicio.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="fechaFin">Fecha Fin (opcional)</Label>
                      <Input
                        id="fechaFin"
                        type="datetime-local"
                        {...register('fechaFin')}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="tipo">Tipo</Label>
                      <Select onValueChange={(value) => setValue('tipo', value as any)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar tipo" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="academico">Académico</SelectItem>
                          <SelectItem value="administrativo">Administrativo</SelectItem>
                          <SelectItem value="social">Social</SelectItem>
                          <SelectItem value="feriado">Feriado</SelectItem>
                        </SelectContent>
                      </Select>
                      {errors.tipo && (
                        <p className="text-sm text-destructive">{errors.tipo.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="audiencia">Audiencia</Label>
                      <Select onValueChange={(value) => setValue('audiencia', value as any)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar audiencia" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="todos">Todos</SelectItem>
                          <SelectItem value="alumnos">Estudiantes</SelectItem>
                          <SelectItem value="maestros">Maestros</SelectItem>
                          <SelectItem value="administradores">Administradores</SelectItem>
                        </SelectContent>
                      </Select>
                      {errors.audiencia && (
                        <p className="text-sm text-destructive">{errors.audiencia.message}</p>
                      )}
                    </div>
                  </div>

                  {isMaestro && (
                    <div className="space-y-2">
                      <Label htmlFor="cursoId">Curso (opcional)</Label>
                      <Select onValueChange={(value) => setValue('cursoId', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar curso" />
                        </SelectTrigger>
                        <SelectContent>
                          {data?.cursos.filter(c => c.maestroId === user?.id && c.activo).map(curso => (
                            <SelectItem key={curso.id} value={curso.id}>
                              {curso.nombre}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <div className="flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={() => setIsCreateEventOpen(false)}>
                      Cancelar
                    </Button>
                    <Button type="submit">Crear Evento</Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          )}

          <Select value={selectedFilter} onValueChange={setSelectedFilter}>
            <SelectTrigger className="w-40">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="academico">Académico</SelectItem>
              <SelectItem value="administrativo">Administrativo</SelectItem>
              <SelectItem value="social">Social</SelectItem>
              <SelectItem value="feriado">Feriado</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Calendar */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>
                  {selectedDate.toLocaleDateString('es-ES', { 
                    month: 'long', 
                    year: 'numeric' 
                  })}
                </CardTitle>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const prevMonth = new Date(selectedDate);
                      prevMonth.setMonth(prevMonth.getMonth() - 1);
                      setSelectedDate(prevMonth);
                    }}
                  >
                    ←
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedDate(new Date())}
                  >
                    Hoy
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const nextMonth = new Date(selectedDate);
                      nextMonth.setMonth(nextMonth.getMonth() + 1);
                      setSelectedDate(nextMonth);
                    }}
                  >
                    →
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-1 mb-4">
                {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map(day => (
                  <div key={day} className="p-2 text-center text-sm font-medium text-muted-foreground">
                    {day}
                  </div>
                ))}
              </div>
              
              <div className="grid grid-cols-7 gap-1">
                {calendarDays.map((day, index) => (
                  <div
                    key={index}
                    className={`p-2 min-h-[80px] border rounded cursor-pointer transition-colors ${
                      day.isCurrentMonth ? 'bg-background' : 'bg-muted/50'
                    } ${day.isToday ? 'bg-primary/10 border-primary' : ''} ${
                      day.isSelected ? 'bg-primary/20' : ''
                    } hover:bg-muted`}
                    onClick={() => setSelectedDate(day.date)}
                  >
                    <div className={`text-sm font-medium ${
                      day.isCurrentMonth ? '' : 'text-muted-foreground'
                    } ${day.isToday ? 'text-primary' : ''}`}>
                      {day.date.getDate()}
                    </div>
                    <div className="space-y-1 mt-1">
                      {day.events.slice(0, 2).map((event, eventIndex) => (
                        <div
                          key={eventIndex}
                          className={`text-xs p-1 rounded truncate ${getEventTypeColor(event.tipo)}`}
                        >
                          {event.titulo}
                        </div>
                      ))}
                      {day.events.length > 2 && (
                        <div className="text-xs text-muted-foreground">
                          +{day.events.length - 2} más
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Eventos del día seleccionado */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                {selectedDate.toLocaleDateString('es-ES', { 
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long'
                })}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {eventsForSelectedDate.length === 0 ? (
                <p className="text-muted-foreground text-sm">No hay eventos programados</p>
              ) : (
                <div className="space-y-3">
                  {eventsForSelectedDate.map((event) => (
                    <div key={event.id} className={`p-3 rounded-lg border ${getEventTypeColor(event.tipo)}`}>
                      <h4 className="font-medium text-sm">{event.titulo}</h4>
                      {event.descripcion && (
                        <p className="text-xs mt-1 opacity-90">{event.descripcion}</p>
                      )}
                      <div className="flex items-center mt-2 text-xs opacity-75">
                        <Clock className="h-3 w-3 mr-1" />
                        {new Date(event.fechaInicio).toLocaleTimeString([], { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                        {event.fechaFin && (
                          <span>
                            {' - '}
                            {new Date(event.fechaFin).toLocaleTimeString([], { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <Badge variant="outline" className="text-xs">
                          {event.audiencia}
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          {event.tipo}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Próximos eventos */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Próximos Eventos</CardTitle>
              <CardDescription>Eventos de los próximos 7 días</CardDescription>
            </CardHeader>
            <CardContent>
              {upcomingEvents.length === 0 ? (
                <p className="text-muted-foreground text-sm">No hay eventos próximos</p>
              ) : (
                <div className="space-y-3">
                  {upcomingEvents.slice(0, 5).map((event) => (
                    <div key={event.id} className="p-3 border rounded-lg">
                      <h4 className="font-medium text-sm">{event.titulo}</h4>
                      <div className="flex items-center mt-1 text-xs text-muted-foreground">
                        <CalendarIcon className="h-3 w-3 mr-1" />
                        {new Date(event.fechaInicio).toLocaleDateString()}
                      </div>
                      <div className="flex items-center mt-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3 mr-1" />
                        {new Date(event.fechaInicio).toLocaleTimeString([], { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <Badge variant="outline" className="text-xs">
                          {event.audiencia}
                        </Badge>
                        <Badge 
                          variant="secondary" 
                          className={`text-xs ${getEventTypeColor(event.tipo)}`}
                        >
                          {event.tipo}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Leyenda */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Leyenda</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded bg-blue-500"></div>
                  <span className="text-sm">Académico</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded bg-green-500"></div>
                  <span className="text-sm">Administrativo</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded bg-purple-500"></div>
                  <span className="text-sm">Social</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded bg-red-500"></div>
                  <span className="text-sm">Feriado</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Calendario;
