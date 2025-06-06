// Exportar todos los modelos desde un punto central
export { default as User } from './User';
export { default as Nivel } from './Nivel';
export { default as Materia } from './Materia';
export { default as Curso } from './Curso';
export { default as Inscripcion } from './Inscripcion';
export { default as Tarea } from './Tarea';
export { default as Pago } from './Pago';

// Importar y exportar modelos adicionales cuando se creen
// export { default as EntregaTarea } from './EntregaTarea';
// export { default as Examen } from './Examen';
// export { default as ResultadoExamen } from './ResultadoExamen';
// export { default as Nomina } from './Nomina';
// export { default as Evento } from './Evento';
// export { default as Notificacion } from './Notificacion';
// export { default as ConfiguracionUsuario } from './ConfiguracionUsuario';
// export { default as AuditLog } from './AuditLog';
// export { default as Sesion } from './Sesion';

// Tipos de los modelos
export type { UserDocument, UserModel } from './User';
// Agregar más tipos según se necesiten
