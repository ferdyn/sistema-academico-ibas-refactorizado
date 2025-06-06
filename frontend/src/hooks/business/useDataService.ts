import { useMemo } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useMockData, useFilteredData } from '@/hooks/common/useApi';
import { 
  User, Nivel, Materia, Curso, Inscripcion, Calificacion, 
  Tarea, EntregaTarea, Examen, ResultadoExamen, Pago, 
  Nomina, Evento, Notificacion, ConfiguracionUsuario 
} from '@/types';

interface MockData {
  users: User[];
  niveles: Nivel[];
  materias: Materia[];
  cursos: Curso[];
  inscripciones: Inscripcion[];
  calificaciones: Calificacion[];
  tareas: Tarea[];
  entregas: EntregaTarea[];
  examenes: Examen[];
  resultados: ResultadoExamen[];
  pagos: Pago[];
  nominas: Nomina[];
  eventos: Evento[];
  notificaciones: Notificacion[];
  configuraciones: ConfiguracionUsuario[];
}

// Hook principal para datos mock
export const useData = () => {
  return useMockData<MockData>();
};

// Hooks específicos más simples
export const useMaterias = () => {
  const { data, loading, error } = useData();
  
  return {
    materias: data?.materias || [],
    loading,
    error
  };
};

export const useCursos = () => {
  const { data, loading, error } = useData();
  
  return {
    cursos: data?.cursos || [],
    loading,
    error
  };
};

export const useUsers = () => {
  const { data, loading, error } = useData();
  
  return {
    users: data?.users || [],
    loading,
    error
  };
};

// Hook para materias del usuario actual
export const useUserMaterias = () => {
  const { user } = useAuth();
  const { data, loading, error } = useData();
  
  const userMaterias = useFilteredData(
    data,
    (mockData: MockData) => {
      if (!user) return [];
      
      const inscripciones = mockData.inscripciones.filter(
        inscripcion => inscripcion.userId === user.id
      );
      
      return mockData.materias.filter(materia =>
        inscripciones.some(inscripcion => inscripcion.materiaId === materia.id)
      );
    },
    [user?.id]
  );
  
  return {
    materias: userMaterias || [],
    loading,
    error
  };
};

// Hook para estadísticas del dashboard
export const useDashboardStats = () => {
  const { user } = useAuth();
  const { data, loading, error } = useData();
  
  const stats = useFilteredData(
    data,
    (mockData: MockData) => {
      if (!user) return null;
      
      const userRole = user.rol;
      
      switch (userRole) {
        case 'alumno':
          return {
            materiasInscritas: mockData.inscripciones.filter(i => i.userId === user.id).length,
            tareasPendientes: mockData.tareas.filter(t => {
              const entrega = mockData.entregas.find(e => e.tareaId === t.id && e.userId === user.id);
              return !entrega && new Date(t.fechaEntrega) > new Date();
            }).length,
            promedioGeneral: calculateUserAverage(mockData, user.id),
            eventosProximos: mockData.eventos.filter(e => 
              new Date(e.fechaInicio) > new Date() && 
              new Date(e.fechaInicio) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
            ).length
          };
          
        case 'maestro':
          const materiasMaestro = mockData.materias.filter(m => m.maestroId === user.id);
          return {
            materiasImpartidas: materiasMaestro.length,
            estudiantesTotal: mockData.inscripciones.filter(i => 
              materiasMaestro.some(m => m.id === i.materiaId)
            ).length,
            tareasCreadas: mockData.tareas.filter(t => 
              materiasMaestro.some(m => m.id === t.materiaId)
            ).length,
            examenesRecientes: mockData.examenes.filter(e => 
              materiasMaestro.some(m => m.id === e.materiaId) &&
              new Date(e.fecha) >= new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
            ).length
          };
          
        case 'administrador':
          return {
            usuariosTotal: mockData.users.length,
            materiasTotal: mockData.materias.length,
            cursosActivos: mockData.cursos.filter(c => c.activo).length,
            ingresosMes: mockData.pagos
              .filter(p => new Date(p.fechaPago).getMonth() === new Date().getMonth())
              .reduce((sum, p) => sum + p.monto, 0)
          };
          
        default:
          return null;
      }
    },
    [user?.id, user?.rol]
  );
  
  return {
    stats,
    loading,
    error
  };
};

// Hook para notificaciones del usuario
export const useUserNotifications = () => {
  const { user } = useAuth();
  const { data, loading, error } = useData();
  
  const notifications = useFilteredData(
    data,
    (mockData: MockData) => 
      mockData.notificaciones
        .filter(notif => notif.userId === user?.id)
        .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime()),
    [user?.id]
  );
  
  return {
    notifications: notifications || [],
    loading,
    error
  };
};

// Hook para eventos del usuario
export const useUserEvents = () => {
  const { user } = useAuth();
  const { data, loading, error } = useData();
  
  const events = useFilteredData(
    data,
    (mockData: MockData) => {
      if (!user) return [];
      
      // Obtener eventos relevantes según el rol
      if (user.rol === 'alumno') {
        const userMaterias = mockData.inscripciones
          .filter(i => i.userId === user.id)
          .map(i => i.materiaId);
        
        return mockData.eventos.filter(evento =>
          userMaterias.includes(evento.materiaId) || evento.tipo === 'general'
        );
      }
      
      if (user.rol === 'maestro') {
        const materiasMaestro = mockData.materias
          .filter(m => m.maestroId === user.id)
          .map(m => m.id);
        
        return mockData.eventos.filter(evento =>
          materiasMaestro.includes(evento.materiaId) || evento.tipo === 'general'
        );
      }
      
      // Administrador ve todos los eventos
      return mockData.eventos;
    },
    [user?.id, user?.rol]
  );
  
  return {
    events: events || [],
    loading,
    error
  };
};

// Función auxiliar para calcular promedio
function calculateUserAverage(mockData: MockData, userId: string): number {
  const userCalificaciones = mockData.calificaciones.filter(c => c.userId === userId);
  
  if (userCalificaciones.length === 0) return 0;
  
  const suma = userCalificaciones.reduce((acc, cal) => acc + cal.calificacion, 0);
  return Math.round((suma / userCalificaciones.length) * 100) / 100;
}
