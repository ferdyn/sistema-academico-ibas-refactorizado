// Tipos para el Sistema Académico IBAS

export type UserRole = 'alumno' | 'maestro' | 'administrador';

export interface User {
  id: string;
  email: string;
  password: string;
  nombre: string;
  apellido: string;
  telefono?: string;
  direccion?: string;
  fechaNacimiento?: string;
  foto?: string;
  rol: UserRole;
  activo: boolean;
  fechaCreacion: string;
  ultimoAcceso?: string;
}

export interface Nivel {
  id: string;
  nombre: string;
  descripcion: string;
  orden: number;
  activo: boolean;
}

export interface Materia {
  id: string;
  codigo: string;
  nombre: string;
  descripcion: string;
  creditos: number;
  nivelId: string;
  prerequisitos?: string[];
  activa: boolean;
}

export interface Curso {
  id: string;
  materiaId: string;
  maestroId: string;
  nombre: string;
  descripcion?: string;
  fechaInicio: string;
  fechaFin: string;
  modalidad: 'presencial' | 'virtual' | 'hibrida';
  aula?: string;
  horario: string;
  cupoMaximo: number;
  activo: boolean;
}

export interface Inscripcion {
  id: string;
  cursoId: string;
  alumnoId: string;
  fechaInscripcion: string;
  calificacionFinal?: number;
  estado: 'inscrito' | 'cursando' | 'aprobado' | 'reprobado' | 'retirado';
}

export interface Calificacion {
  id: string;
  inscripcionId: string;
  tipo: 'tarea' | 'examen' | 'proyecto' | 'participacion';
  descripcion: string;
  nota: number;
  notaMaxima: number;
  peso: number; // Porcentaje del total
  fecha: string;
  comentarios?: string;
}

export interface Tarea {
  id: string;
  cursoId: string;
  titulo: string;
  descripcion: string;
  fechaCreacion: string;
  fechaVencimiento: string;
  puntaje: number;
  activa: boolean;
  archivos?: string[];
}

export interface EntregaTarea {
  id: string;
  tareaId: string;
  alumnoId: string;
  fechaEntrega: string;
  archivos: string[];
  comentarios?: string;
  calificacion?: number;
  feedback?: string;
  estado: 'entregada' | 'calificada' | 'tarde';
}

export interface Examen {
  id: string;
  cursoId: string;
  titulo: string;
  descripcion: string;
  fechaExamen: string;
  duracion: number; // en minutos
  puntaje: number;
  tipo: 'parcial' | 'final' | 'quiz';
  activo: boolean;
}

export interface ResultadoExamen {
  id: string;
  examenId: string;
  alumnoId: string;
  fechaRealizado: string;
  calificacion: number;
  duracionRealizada: number;
  comentarios?: string;
}

export interface Pago {
  id: string;
  alumnoId: string;
  concepto: string;
  monto: number;
  fechaVencimiento: string;
  fechaPago?: string;
  metodoPago?: 'efectivo' | 'transferencia' | 'deposito' | 'tarjeta';
  referencia?: string;
  comprobante?: string;
  estado: 'pendiente' | 'pagado' | 'vencido' | 'cancelado';
}

export interface Nomina {
  id: string;
  maestroId: string;
  periodo: string; // "2024-01", "2024-02", etc.
  salarioBase: number;
  bonificaciones?: number;
  deducciones?: number;
  salarioNeto: number;
  fechaPago?: string;
  estado: 'pendiente' | 'pagado';
}

export interface Evento {
  id: string;
  titulo: string;
  descripcion?: string;
  fechaInicio: string;
  fechaFin?: string;
  tipo: 'academico' | 'administrativo' | 'social' | 'feriado';
  audiencia: 'todos' | 'alumnos' | 'maestros' | 'administradores';
  creadorId: string;
  cursoId?: string; // Si es específico de un curso
  activo: boolean;
}

export interface Notificacion {
  id: string;
  usuarioId: string;
  titulo: string;
  mensaje: string;
  tipo: 'info' | 'warning' | 'error' | 'success';
  leida: boolean;
  fechaCreacion: string;
  enlace?: string; // URL para navegar al hacer clic
}

export interface ConfiguracionUsuario {
  userId: string;
  tema: 'claro' | 'oscuro';
  idioma: string;
  notificacionesEmail: boolean;
  notificacionesPush: boolean;
}

// Tipos para formularios
export interface LoginForm {
  email: string;
  password: string;
}

export interface RegistroUsuarioForm {
  email: string;
  password: string;
  confirmarPassword: string;
  nombre: string;
  apellido: string;
  telefono?: string;
  direccion?: string;
  fechaNacimiento?: string;
  rol: UserRole;
}

export interface CrearCursoForm {
  materiaId: string;
  maestroId: string;
  nombre: string;
  descripcion?: string;
  fechaInicio: string;
  fechaFin: string;
  modalidad: 'presencial' | 'virtual' | 'hibrida';
  aula?: string;
  horario: string;
  cupoMaximo: number;
}

export interface CrearTareaForm {
  titulo: string;
  descripcion: string;
  fechaVencimiento: string;
  puntaje: number;
}

export interface EntregarTareaForm {
  comentarios?: string;
  archivos: File[];
}

export interface CrearExamenForm {
  titulo: string;
  descripcion: string;
  fechaExamen: string;
  duracion: number;
  puntaje: number;
  tipo: 'parcial' | 'final' | 'quiz';
}

export interface RegistrarPagoForm {
  concepto: string;
  monto: number;
  fechaVencimiento: string;
  alumnoId?: string; // Para admin que registra pago
}

export interface ProcesarPagoForm {
  metodoPago: 'efectivo' | 'transferencia' | 'deposito' | 'tarjeta';
  referencia?: string;
  comprobante?: File;
}

export interface CrearEventoForm {
  titulo: string;
  descripcion?: string;
  fechaInicio: string;
  fechaFin?: string;
  tipo: 'academico' | 'administrativo' | 'social' | 'feriado';
  audiencia: 'todos' | 'alumnos' | 'maestros' | 'administradores';
  cursoId?: string;
}

// Tipos para respuestas de API (preparación para backend futuro)
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: Record<string, string>;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// Tipos para el Dashboard
export interface DashboardStats {
  totalAlumnos?: number;
  totalMaestros?: number;
  totalCursos?: number;
  totalIngresos?: number;
  cursosActivos?: number;
  tareasEntregadas?: number;
  calificacionPromedio?: number;
  pagosVencidos?: number;
  proximosEventos?: number;
}

// Tipos para filtros y búsquedas
export interface FiltroUsuarios {
  rol?: UserRole;
  activo?: boolean;
  busqueda?: string;
}

export interface FiltroCursos {
  maestroId?: string;
  materiaId?: string;
  modalidad?: string;
  activo?: boolean;
  busqueda?: string;
}

export interface FiltroPagos {
  alumnoId?: string;
  estado?: string;
  fechaDesde?: string;
  fechaHasta?: string;
}

export interface FiltroEventos {
  tipo?: string;
  audiencia?: string;
  fechaDesde?: string;
  fechaHasta?: string;
}
