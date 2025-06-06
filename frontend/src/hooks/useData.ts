import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
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

// Hook principal para obtener datos mock
export const useData = () => {
  const [data, setData] = useState<MockData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/data/mock-data.json');
        if (!response.ok) {
          throw new Error('Failed to fetch data');
        }
        const jsonData = await response.json();
        setData(jsonData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return { data, loading, error };
};

// Hook para obtener cursos del usuario actual
export const useUserCourses = () => {
  const { user } = useAuth();
  const { data, loading, error } = useData();

  const courses = data ? (() => {
    if (!user) return [];

    if (user.rol === 'alumno') {
      // Obtener cursos donde está inscrito el alumno
      const userInscriptions = data.inscripciones.filter(i => i.alumnoId === user.id);
      return data.cursos.filter(c => 
        userInscriptions.some(i => i.cursoId === c.id) && c.activo
      );
    } else if (user.rol === 'maestro') {
      // Obtener cursos que imparte el maestro
      return data.cursos.filter(c => c.maestroId === user.id && c.activo);
    } else if (user.rol === 'administrador') {
      // Obtener todos los cursos activos
      return data.cursos.filter(c => c.activo);
    }

    return [];
  })() : [];

  return { courses, loading, error };
};

// Hook para obtener materias con información adicional
export const useMaterias = () => {
  const { data, loading, error } = useData();

  const materias = data ? data.materias.map(materia => {
    const nivel = data.niveles.find(n => n.id === materia.nivelId);
    const cursosActivos = data.cursos.filter(c => c.materiaId === materia.id && c.activo);
    
    return {
      ...materia,
      nivel,
      cursosActivos: cursosActivos.length,
      totalEstudiantes: cursosActivos.reduce((total, curso) => {
        const inscripciones = data.inscripciones.filter(i => i.cursoId === curso.id);
        return total + inscripciones.length;
      }, 0)
    };
  }) : [];

  return { materias, loading, error };
};

// Hook para obtener calificaciones de un estudiante
export const useStudentGrades = (studentId?: string) => {
  const { user } = useAuth();
  const { data, loading, error } = useData();
  
  const targetStudentId = studentId || user?.id;

  const grades = data && targetStudentId ? (() => {
    const userInscriptions = data.inscripciones.filter(i => i.alumnoId === targetStudentId);
    const userGrades = data.calificaciones.filter(c => 
      userInscriptions.some(i => i.id === c.inscripcionId)
    );

    return userGrades.map(grade => {
      const inscription = userInscriptions.find(i => i.id === grade.inscripcionId);
      const course = inscription ? data.cursos.find(c => c.id === inscription.cursoId) : null;
      const materia = course ? data.materias.find(m => m.id === course.materiaId) : null;
      
      return {
        ...grade,
        inscription,
        course,
        materia
      };
    });
  })() : [];

  return { grades, loading, error };
};

// Hook para obtener pagos de un estudiante
export const useStudentPayments = (studentId?: string) => {
  const { user } = useAuth();
  const { data, loading, error } = useData();
  
  const targetStudentId = studentId || user?.id;

  const payments = data && targetStudentId ? 
    data.pagos.filter(p => p.alumnoId === targetStudentId) : [];

  const summary = payments.length > 0 ? {
    total: payments.reduce((sum, p) => sum + p.monto, 0),
    pagados: payments.filter(p => p.estado === 'pagado').reduce((sum, p) => sum + p.monto, 0),
    pendientes: payments.filter(p => p.estado === 'pendiente').reduce((sum, p) => sum + p.monto, 0),
    vencidos: payments.filter(p => p.estado === 'vencido').reduce((sum, p) => sum + p.monto, 0),
  } : {
    total: 0,
    pagados: 0,
    pendientes: 0,
    vencidos: 0
  };

  return { payments, summary, loading, error };
};

// Hook para obtener nóminas de un maestro
export const useTeacherPayroll = (teacherId?: string) => {
  const { user } = useAuth();
  const { data, loading, error } = useData();
  
  const targetTeacherId = teacherId || user?.id;

  const payroll = data && targetTeacherId ? 
    data.nominas.filter(n => n.maestroId === targetTeacherId) : [];

  return { payroll, loading, error };
};

// Hook para obtener eventos relevantes para el usuario
export const useUserEvents = () => {
  const { user } = useAuth();
  const { data, loading, error } = useData();

  const events = data && user ? data.eventos.filter(evento => {
    if (!evento.activo) return false;
    
    // Filtrar por audiencia
    if (evento.audiencia === 'todos') return true;
    if (evento.audiencia === 'alumnos' && user.rol === 'alumno') return true;
    if (evento.audiencia === 'maestros' && user.rol === 'maestro') return true;
    if (evento.audiencia === 'administradores' && user.rol === 'administrador') return true;
    
    return false;
  }) : [];

  return { events, loading, error };
};

// Hook para obtener notificaciones del usuario
export const useUserNotifications = () => {
  const { user } = useAuth();
  const { data, loading, error } = useData();

  const notifications = data && user ? 
    data.notificaciones.filter(n => n.usuarioId === user.id) : [];

  const unreadCount = notifications.filter(n => !n.leida).length;

  return { notifications, unreadCount, loading, error };
};

// Hook para obtener tareas de un curso
export const useCourseTasks = (courseId: string) => {
  const { data, loading, error } = useData();

  const tasks = data ? data.tareas.filter(t => t.cursoId === courseId && t.activa) : [];

  return { tasks, loading, error };
};

// Hook para obtener exámenes de un curso
export const useCourseExams = (courseId: string) => {
  const { data, loading, error } = useData();

  const exams = data ? data.examenes.filter(e => e.cursoId === courseId && e.activo) : [];

  return { exams, loading, error };
};

// Hook para obtener estadísticas del dashboard
export const useDashboardStats = () => {
  const { user } = useAuth();
  const { data, loading, error } = useData();

  const stats = data && user ? (() => {
    if (user.rol === 'administrador') {
      const totalAlumnos = data.users.filter(u => u.rol === 'alumno' && u.activo).length;
      const totalMaestros = data.users.filter(u => u.rol === 'maestro' && u.activo).length;
      const totalCursos = data.cursos.filter(c => c.activo).length;
      const totalIngresos = data.pagos.filter(p => p.estado === 'pagado').reduce((sum, p) => sum + p.monto, 0);
      const pagosVencidos = data.pagos.filter(p => p.estado === 'vencido').length;
      
      return {
        totalAlumnos,
        totalMaestros,
        totalCursos,
        totalIngresos,
        pagosVencidos,
        proximosEventos: data.eventos.filter(e => e.activo && new Date(e.fechaInicio) > new Date()).length
      };
    } else if (user.rol === 'maestro') {
      const cursosMaestro = data.cursos.filter(c => c.maestroId === user.id && c.activo);
      const totalEstudiantes = cursosMaestro.reduce((total, curso) => {
        return total + data.inscripciones.filter(i => i.cursoId === curso.id).length;
      }, 0);
      
      return {
        cursosActivos: cursosMaestro.length,
        totalEstudiantes,
        tareasCreadas: data.tareas.filter(t => 
          cursosMaestro.some(c => c.id === t.cursoId) && t.activa
        ).length
      };
    } else if (user.rol === 'alumno') {
      const inscripciones = data.inscripciones.filter(i => i.alumnoId === user.id);
      const calificaciones = data.calificaciones.filter(c =>
        inscripciones.some(i => i.id === c.inscripcionId)
      );
      const calificacionPromedio = calificaciones.length > 0 ?
        calificaciones.reduce((sum, c) => sum + (c.nota / c.notaMaxima * 20), 0) / calificaciones.length : 0;
      
      const pagosPendientes = data.pagos.filter(p => 
        p.alumnoId === user.id && (p.estado === 'pendiente' || p.estado === 'vencido')
      ).length;
      
      return {
        cursosInscritos: inscripciones.length,
        calificacionPromedio: Math.round(calificacionPromedio * 100) / 100,
        pagosPendientes,
        tareasEntregadas: data.entregas.filter(e => e.alumnoId === user.id).length
      };
    }
    
    return {};
  })() : {};

  return { stats, loading, error };
};

// Hook para búsquedas y filtros
export const useSearch = <T>(items: T[], searchFields: (keyof T)[]) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredItems, setFilteredItems] = useState<T[]>(items);

  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredItems(items);
      return;
    }

    const filtered = items.filter(item =>
      searchFields.some(field => {
        const value = item[field];
        if (typeof value === 'string') {
          return value.toLowerCase().includes(searchTerm.toLowerCase());
        }
        return false;
      })
    );

    setFilteredItems(filtered);
  }, [items, searchTerm, searchFields]);

  return {
    searchTerm,
    setSearchTerm,
    filteredItems
  };
};
