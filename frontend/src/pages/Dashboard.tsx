import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { 
  useDashboardStats, 
  useUserNotifications, 
  useUserEvents 
} from '@/hooks/business/useDataService';
import { StatsGrid } from '@/components/common/StatsCard';
import { ErrorState, DataError } from '@/components/common/ErrorState';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { DashboardHeader } from '@/features/dashboard/components/DashboardHeader';
import { NotificationsList } from '@/features/dashboard/components/NotificationsList';
import { UpcomingEvents } from '@/features/dashboard/components/UpcomingEvents';
import { QuickActions } from '@/features/dashboard/components/QuickActions';
import { 
  Users, BookOpen, DollarSign, Calendar, 
  TrendingUp, Clock, GraduationCap 
} from 'lucide-react';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { stats, loading: statsLoading, error: statsError } = useDashboardStats();
  const { notifications, loading: notificationsLoading, error: notificationsError } = useUserNotifications();
  const { events, loading: eventsLoading, error: eventsError } = useUserEvents();

  if (!user) return null;

  // Configuración de estadísticas por rol
  const getStatsConfig = () => {
    if (!stats) return [];

    switch (user.rol) {
      case 'alumno':
        return [
          {
            title: 'Materias Inscritas',
            value: stats.materiasInscritas,
            icon: BookOpen,
            variant: 'primary' as const,
            description: 'Materias activas'
          },
          {
            title: 'Tareas Pendientes',
            value: stats.tareasPendientes,
            icon: Clock,
            variant: stats.tareasPendientes > 5 ? 'warning' as const : 'default' as const,
            description: 'Por entregar'
          },
          {
            title: 'Promedio General',
            value: `${stats.promedioGeneral}%`,
            icon: TrendingUp,
            variant: stats.promedioGeneral >= 80 ? 'success' as const : 'default' as const,
            description: 'Calificación promedio'
          },
          {
            title: 'Eventos Próximos',
            value: stats.eventosProximos,
            icon: Calendar,
            variant: 'default' as const,
            description: 'Esta semana'
          }
        ];

      case 'maestro':
        return [
          {
            title: 'Materias Impartidas',
            value: stats.materiasImpartidas,
            icon: BookOpen,
            variant: 'primary' as const,
            description: 'Materias activas'
          },
          {
            title: 'Total Estudiantes',
            value: stats.estudiantesTotal,
            icon: Users,
            variant: 'default' as const,
            description: 'En todas las materias'
          },
          {
            title: 'Tareas Creadas',
            value: stats.tareasCreadas,
            icon: Clock,
            variant: 'default' as const,
            description: 'Total de tareas'
          },
          {
            title: 'Exámenes Recientes',
            value: stats.examenesRecientes,
            icon: GraduationCap,
            variant: 'default' as const,
            description: 'Último mes'
          }
        ];

      case 'administrador':
        return [
          {
            title: 'Usuarios Totales',
            value: stats.usuariosTotal,
            icon: Users,
            variant: 'primary' as const,
            description: 'Usuarios registrados'
          },
          {
            title: 'Materias Totales',
            value: stats.materiasTotal,
            icon: BookOpen,
            variant: 'default' as const,
            description: 'Materias disponibles'
          },
          {
            title: 'Cursos Activos',
            value: stats.cursosActivos,
            icon: GraduationCap,
            variant: 'success' as const,
            description: 'Cursos en progreso'
          },
          {
            title: 'Ingresos del Mes',
            value: `$${stats.ingresosMes?.toLocaleString()}`,
            icon: DollarSign,
            variant: 'success' as const,
            description: 'Ingresos actuales'
          }
        ];

      default:
        return [];
    }
  };

  const statsConfig = getStatsConfig();

  return (
    <div className="space-y-6 p-6">
      {/* Header de bienvenida */}
      <DashboardHeader user={user} />

      {/* Estadísticas principales */}
      <section>
        {statsLoading ? (
          <LoadingSpinner size="md" text="Cargando estadísticas..." />
        ) : statsError ? (
          <DataError onRetry={() => window.location.reload()} />
        ) : (
          <StatsGrid stats={statsConfig} columns={4} />
        )}
      </section>

      {/* Grid de contenido secundario */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Notificaciones recientes */}
        <div className="lg:col-span-1">
          <NotificationsList 
            notifications={notifications}
            loading={notificationsLoading}
            error={notificationsError}
          />
        </div>

        {/* Eventos próximos */}
        <div className="lg:col-span-1">
          <UpcomingEvents 
            events={events}
            loading={eventsLoading}
            error={eventsError}
          />
        </div>

        {/* Acciones rápidas */}
        <div className="lg:col-span-1">
          <QuickActions userRole={user.rol} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
