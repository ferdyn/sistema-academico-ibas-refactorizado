import { Document, Types } from 'mongoose';

// Tipos base
export type ObjectId = Types.ObjectId;
export type UserRole = 'alumno' | 'maestro' | 'administrador';

// Interfaces base para documentos de MongoDB
export interface BaseDocument extends Document {
  _id: ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

// Usuario
export interface IUser extends BaseDocument {
  email: string;
  password: string;
  nombre: string;
  apellido: string;
  telefono?: string;
  direccion?: string;
  fechaNacimiento?: Date;
  foto?: string;
  rol: UserRole;
  activo: boolean;
  ultimoAcceso?: Date;
  refreshTokens: string[];
  emailVerificado: boolean;
  codigoVerificacion?: string;
  codigoVerificacionExpira?: Date;
  resetPasswordToken?: string;
  resetPasswordExpira?: Date;
}

// Nivel académico
export interface INivel extends BaseDocument {
  nombre: string;
  descripcion: string;
  orden: number;
  activo: boolean;
}

// Materia
export interface IMateria extends BaseDocument {
  codigo: string;
  nombre: string;
  descripcion: string;
  creditos: number;
  nivelId: ObjectId;
  prerequisitos: ObjectId[];
  activa: boolean;
}

// Curso
export interface ICurso extends BaseDocument {
  materiaId: ObjectId;
  maestroId: ObjectId;
  nombre: string;
  descripcion?: string;
  fechaInicio: Date;
  fechaFin: Date;
  modalidad: 'presencial' | 'virtual' | 'hibrida';
  aula?: string;
  horario: string;
  cupoMaximo: number;
  activo: boolean;
  estudiantesInscritos: number;
}

// Inscripción
export interface IInscripcion extends BaseDocument {
  cursoId: ObjectId;
  alumnoId: ObjectId;
  fechaInscripcion: Date;
  calificacionFinal?: number;
  estado: 'inscrito' | 'cursando' | 'aprobado' | 'reprobado' | 'retirado';
  notas: {
    parcial1?: number;
    parcial2?: number;
    final?: number;
    trabajos?: number;
    participacion?: number;
  };
}

// Calificación
export interface ICalificacion extends BaseDocument {
  inscripcionId: ObjectId;
  tipo: 'tarea' | 'examen' | 'proyecto' | 'participacion';
  descripcion: string;
  nota: number;
  notaMaxima: number;
  peso: number; // Porcentaje del total
  fecha: Date;
  comentarios?: string;
}

// Tarea
export interface ITarea extends BaseDocument {
  cursoId: ObjectId;
  titulo: string;
  descripcion: string;
  fechaCreacion: Date;
  fechaVencimiento: Date;
  puntaje: number;
  activa: boolean;
  archivos: string[];
  instrucciones?: string;
  criteriosEvaluacion?: string;
}

// Entrega de tarea
export interface IEntregaTarea extends BaseDocument {
  tareaId: ObjectId;
  alumnoId: ObjectId;
  fechaEntrega: Date;
  archivos: string[];
  comentarios?: string;
  calificacion?: number;
  feedback?: string;
  estado: 'entregada' | 'calificada' | 'tarde';
  fechaCalificacion?: Date;
}

// Examen
export interface IExamen extends BaseDocument {
  cursoId: ObjectId;
  titulo: string;
  descripcion: string;
  fechaExamen: Date;
  duracion: number; // en minutos
  puntaje: number;
  tipo: 'parcial' | 'final' | 'quiz';
  activo: boolean;
  instrucciones?: string;
  preguntas?: {
    pregunta: string;
    tipo: 'multiple' | 'abierta' | 'verdadero_falso';
    opciones?: string[];
    respuestaCorrecta?: string | number;
    puntos: number;
  }[];
}

// Resultado de examen
export interface IResultadoExamen extends BaseDocument {
  examenId: ObjectId;
  alumnoId: ObjectId;
  fechaRealizado: Date;
  calificacion: number;
  duracionRealizada: number;
  comentarios?: string;
  respuestas?: {
    pregunta: number;
    respuesta: string | number;
    esCorrecta: boolean;
    puntos: number;
  }[];
}

// Pago
export interface IPago extends BaseDocument {
  alumnoId: ObjectId;
  concepto: string;
  monto: number;
  fechaVencimiento: Date;
  fechaPago?: Date;
  metodoPago?: 'efectivo' | 'transferencia' | 'deposito' | 'tarjeta';
  referencia?: string;
  comprobante?: string;
  estado: 'pendiente' | 'pagado' | 'vencido' | 'cancelado';
  procesadoPor?: ObjectId;
  notas?: string;
}

// Nómina
export interface INomina extends BaseDocument {
  maestroId: ObjectId;
  periodo: string; // "2024-01", "2024-02", etc.
  salarioBase: number;
  bonificaciones: number;
  deducciones: number;
  salarioNeto: number;
  fechaPago?: Date;
  estado: 'pendiente' | 'pagado';
  detalles?: {
    horasClase: number;
    tarifaHora: number;
    bonoAsistencia?: number;
    descuentoImpuestos?: number;
    otros?: number;
  };
}

// Evento
export interface IEvento extends BaseDocument {
  titulo: string;
  descripcion?: string;
  fechaInicio: Date;
  fechaFin?: Date;
  tipo: 'academico' | 'administrativo' | 'social' | 'feriado';
  audiencia: 'todos' | 'alumnos' | 'maestros' | 'administradores';
  creadorId: ObjectId;
  cursoId?: ObjectId; // Si es específico de un curso
  activo: boolean;
  ubicacion?: string;
  recordatorios?: Date[];
}

// Notificación
export interface INotificacion extends BaseDocument {
  usuarioId: ObjectId;
  titulo: string;
  mensaje: string;
  tipo: 'info' | 'warning' | 'error' | 'success';
  leida: boolean;
  fechaCreacion: Date;
  enlace?: string; // URL para navegar al hacer clic
  datos?: any; // Datos adicionales para la notificación
}

// Configuración de usuario
export interface IConfiguracionUsuario extends BaseDocument {
  userId: ObjectId;
  tema: 'claro' | 'oscuro';
  idioma: string;
  notificacionesEmail: boolean;
  notificacionesPush: boolean;
  configuracionPrivacidad: {
    perfilPublico: boolean;
    mostrarEmail: boolean;
    mostrarTelefono: boolean;
  };
}

// Log de auditoría
export interface IAuditLog extends BaseDocument {
  usuarioId?: ObjectId;
  accion: string;
  entidad: string;
  entidadId?: ObjectId;
  detalles?: any;
  ip?: string;
  userAgent?: string;
  fecha: Date;
}

// Sesión
export interface ISesion extends BaseDocument {
  usuarioId: ObjectId;
  token: string;
  refreshToken: string;
  ip: string;
  userAgent: string;
  ultimaActividad: Date;
  expiraEn: Date;
  activa: boolean;
}

// Tipos para respuestas de API
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: Record<string, string>;
  meta?: {
    timestamp: Date;
    requestId?: string;
    version?: string;
  };
}

export interface PaginatedResponse<T = any> {
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Tipos para consultas
export interface QueryOptions {
  page?: number;
  pageSize?: number;
  sort?: string;
  select?: string;
  populate?: string | string[];
}

export interface FilterOptions {
  search?: string;
  dateFrom?: Date;
  dateTo?: Date;
  status?: string;
  activo?: boolean;
}

// Tipos para DTOs (Data Transfer Objects)
export interface CreateUserDTO {
  email: string;
  password: string;
  nombre: string;
  apellido: string;
  telefono?: string;
  direccion?: string;
  fechaNacimiento?: Date;
  rol: UserRole;
}

export interface UpdateUserDTO {
  nombre?: string;
  apellido?: string;
  telefono?: string;
  direccion?: string;
  fechaNacimiento?: Date;
  foto?: string;
}

export interface LoginDTO {
  email: string;
  password: string;
}

export interface CreateCursoDTO {
  materiaId: string;
  maestroId: string;
  nombre: string;
  descripcion?: string;
  fechaInicio: Date;
  fechaFin: Date;
  modalidad: 'presencial' | 'virtual' | 'hibrida';
  aula?: string;
  horario: string;
  cupoMaximo: number;
}

export interface CreateTareaDTO {
  cursoId: string;
  titulo: string;
  descripcion: string;
  fechaVencimiento: Date;
  puntaje: number;
  instrucciones?: string;
  criteriosEvaluacion?: string;
}

export interface CreatePagoDTO {
  alumnoId: string;
  concepto: string;
  monto: number;
  fechaVencimiento: Date;
}

// Tipos para middleware
export interface AuthenticatedRequest extends Request {
  user?: IUser;
  token?: string;
}

// Tipos para validación
export interface ValidationError {
  field: string;
  message: string;
  value?: any;
}

// Tipos para archivos
export interface FileUpload {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  destination: string;
  filename: string;
  path: string;
  buffer?: Buffer;
  url?: string; // URL en Cloudinary
}

// Tipos para estadísticas del dashboard
export interface DashboardStats {
  totalUsuarios?: number;
  totalAlumnos?: number;
  totalMaestros?: number;
  totalCursos?: number;
  cursosActivos?: number;
  totalInscripciones?: number;
  tareasCreadas?: number;
  tareasEntregadas?: number;
  examenesRealizados?: number;
  pagosVencidos?: number;
  ingresosMes?: number;
  proximosEventos?: number;
  calificacionPromedio?: number;
}

export interface UserStats {
  materiasInscritas?: number;
  tareasPendientes?: number;
  tareasEntregadas?: number;
  promedioGeneral?: number;
  proximosExamenes?: number;
  pagosVencidos?: number;
  eventosProximos?: number;
}
