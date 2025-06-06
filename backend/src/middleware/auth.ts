import { Request, Response, NextFunction } from 'express';
import { User } from '@/models';
import { 
  verifyAccessToken, 
  extractTokenFromHeader, 
  TokenPayload 
} from '@/utils/jwt';
import { sendUnauthorized, sendForbidden } from '@/utils/response';
import { UserRole, IUser } from '@/types';

// Extender el tipo Request para incluir el usuario autenticado
declare global {
  namespace Express {
    interface Request {
      user?: IUser;
      token?: string;
    }
  }
}

/**
 * Middleware para verificar la autenticación JWT
 */
export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Extraer token del header Authorization
    const token = extractTokenFromHeader(req.headers.authorization);
    
    if (!token) {
      return sendUnauthorized(res, 'Token de acceso requerido');
    }

    // Verificar y decodificar el token
    let decoded: TokenPayload;
    try {
      decoded = verifyAccessToken(token);
    } catch (error: any) {
      return sendUnauthorized(res, error.message);
    }

    // Buscar el usuario en la base de datos
    const user = await User.findById(decoded.userId).select('+refreshTokens');
    
    if (!user) {
      return sendUnauthorized(res, 'Usuario no encontrado');
    }

    // Verificar que el usuario esté activo
    if (!user.activo) {
      return sendUnauthorized(res, 'Usuario inactivo');
    }

    // Actualizar última actividad
    user.updateLastAccess();
    await user.save();

    // Agregar usuario y token al request
    req.user = user;
    req.token = token;

    next();
  } catch (error) {
    console.error('Error en middleware de autenticación:', error);
    return sendUnauthorized(res, 'Error de autenticación');
  }
};

/**
 * Middleware para verificar roles específicos
 */
export const authorize = (...allowedRoles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // Verificar que el usuario esté autenticado
    if (!req.user) {
      return sendUnauthorized(res, 'Usuario no autenticado');
    }

    // Verificar que el usuario tenga uno de los roles permitidos
    if (!allowedRoles.includes(req.user.rol)) {
      return sendForbidden(res, 'No tienes permisos para realizar esta acción');
    }

    next();
  };
};

/**
 * Middleware para permitir solo al dueño del recurso o administradores
 */
export const authorizeOwnerOrAdmin = (
  getUserIdFromParams: (req: Request) => string
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return sendUnauthorized(res, 'Usuario no autenticado');
    }

    const resourceUserId = getUserIdFromParams(req);
    const currentUserId = req.user._id.toString();
    const isAdmin = req.user.rol === 'administrador';

    // Permitir si es el dueño del recurso o es administrador
    if (currentUserId === resourceUserId || isAdmin) {
      return next();
    }

    return sendForbidden(res, 'Solo puedes acceder a tus propios recursos');
  };
};

/**
 * Middleware para verificar que el usuario es el dueño del recurso
 */
export const authorizeOwner = (
  getUserIdFromParams: (req: Request) => string
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return sendUnauthorized(res, 'Usuario no autenticado');
    }

    const resourceUserId = getUserIdFromParams(req);
    const currentUserId = req.user._id.toString();

    if (currentUserId !== resourceUserId) {
      return sendForbidden(res, 'Solo puedes acceder a tus propios recursos');
    }

    next();
  };
};

/**
 * Middleware para verificar que el usuario es administrador
 */
export const requireAdmin = authorize('administrador');

/**
 * Middleware para verificar que el usuario es maestro o administrador
 */
export const requireMaestroOrAdmin = authorize('maestro', 'administrador');

/**
 * Middleware para verificar que el usuario es alumno
 */
export const requireAlumno = authorize('alumno');

/**
 * Middleware opcional de autenticación (no falla si no hay token)
 */
export const optionalAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = extractTokenFromHeader(req.headers.authorization);
    
    if (!token) {
      return next(); // Continuar sin usuario
    }

    // Intentar verificar el token
    try {
      const decoded = verifyAccessToken(token);
      const user = await User.findById(decoded.userId);
      
      if (user && user.activo) {
        req.user = user;
        req.token = token;
        
        // Actualizar última actividad
        user.updateLastAccess();
        await user.save();
      }
    } catch (error) {
      // Token inválido, pero continuar sin usuario
      console.warn('Token inválido en autenticación opcional:', error);
    }

    next();
  } catch (error) {
    console.error('Error en middleware de autenticación opcional:', error);
    next(); // Continuar sin usuario en caso de error
  }
};

/**
 * Middleware para verificar permisos específicos en cursos
 */
export const authorizeCursoAccess = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return sendUnauthorized(res, 'Usuario no autenticado');
    }

    const cursoId = req.params.cursoId || req.body.cursoId;
    const userId = req.user._id.toString();
    const userRole = req.user.rol;

    // Administradores tienen acceso completo
    if (userRole === 'administrador') {
      return next();
    }

    // Importar modelos necesarios
    const { Curso, Inscripcion } = await import('@/models');

    // Verificar que el curso existe
    const curso = await Curso.findById(cursoId);
    if (!curso) {
      return sendForbidden(res, 'Curso no encontrado');
    }

    // Maestros solo pueden acceder a sus propios cursos
    if (userRole === 'maestro') {
      if (curso.maestroId.toString() !== userId) {
        return sendForbidden(res, 'Solo puedes acceder a tus propios cursos');
      }
      return next();
    }

    // Alumnos solo pueden acceder a cursos en los que están inscritos
    if (userRole === 'alumno') {
      const inscripcion = await Inscripcion.findOne({
        cursoId,
        alumnoId: userId,
        estado: { $in: ['inscrito', 'cursando', 'aprobado'] }
      });

      if (!inscripcion) {
        return sendForbidden(res, 'No tienes acceso a este curso');
      }
      return next();
    }

    return sendForbidden(res, 'Rol no autorizado');
  } catch (error) {
    console.error('Error en autorización de curso:', error);
    return sendForbidden(res, 'Error al verificar permisos del curso');
  }
};

/**
 * Middleware para verificar acceso a tareas
 */
export const authorizeTareaAccess = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return sendUnauthorized(res, 'Usuario no autenticado');
    }

    const tareaId = req.params.tareaId || req.params.id;
    const userId = req.user._id.toString();
    const userRole = req.user.rol;

    // Administradores tienen acceso completo
    if (userRole === 'administrador') {
      return next();
    }

    // Importar modelos necesarios
    const { Tarea, Curso, Inscripcion } = await import('@/models');

    // Verificar que la tarea existe y obtener el curso
    const tarea = await Tarea.findById(tareaId).populate('cursoId');
    if (!tarea) {
      return sendForbidden(res, 'Tarea no encontrada');
    }

    // Maestros pueden acceder a tareas de sus cursos
    if (userRole === 'maestro') {
      const curso = tarea.cursoId as any;
      if (curso.maestroId.toString() !== userId) {
        return sendForbidden(res, 'Solo puedes acceder a tareas de tus cursos');
      }
      return next();
    }

    // Alumnos pueden acceder a tareas de cursos en los que están inscritos
    if (userRole === 'alumno') {
      const inscripcion = await Inscripcion.findOne({
        cursoId: tarea.cursoId,
        alumnoId: userId,
        estado: { $in: ['inscrito', 'cursando', 'aprobado'] }
      });

      if (!inscripcion) {
        return sendForbidden(res, 'No tienes acceso a esta tarea');
      }
      return next();
    }

    return sendForbidden(res, 'Rol no autorizado');
  } catch (error) {
    console.error('Error en autorización de tarea:', error);
    return sendForbidden(res, 'Error al verificar permisos de la tarea');
  }
};

/**
 * Helper functions para usar en authorizeOwnerOrAdmin
 */
export const getUserIdFromParams = (req: Request): string => {
  return req.params.userId || req.params.id || '';
};

export const getUserIdFromBody = (req: Request): string => {
  return req.body.userId || req.body.alumnoId || '';
};

/**
 * Middleware para verificar que un usuario es alumno para operaciones específicas
 */
export const ensureAlumno = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const userId = req.params.userId || req.body.alumnoId;
  
  if (!userId) {
    return sendForbidden(res, 'ID de usuario requerido');
  }

  try {
    const user = await User.findById(userId);
    
    if (!user) {
      return sendForbidden(res, 'Usuario no encontrado');
    }

    if (user.rol !== 'alumno') {
      return sendForbidden(res, 'El usuario debe ser un alumno');
    }

    next();
  } catch (error) {
    console.error('Error verificando rol de alumno:', error);
    return sendForbidden(res, 'Error al verificar usuario');
  }
};

/**
 * Middleware para verificar que un usuario es maestro para operaciones específicas
 */
export const ensureMaestro = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const userId = req.params.userId || req.body.maestroId;
  
  if (!userId) {
    return sendForbidden(res, 'ID de maestro requerido');
  }

  try {
    const user = await User.findById(userId);
    
    if (!user) {
      return sendForbidden(res, 'Maestro no encontrado');
    }

    if (user.rol !== 'maestro') {
      return sendForbidden(res, 'El usuario debe ser un maestro');
    }

    next();
  } catch (error) {
    console.error('Error verificando rol de maestro:', error);
    return sendForbidden(res, 'Error al verificar maestro');
  }
};

export default {
  authenticate,
  authorize,
  authorizeOwnerOrAdmin,
  authorizeOwner,
  requireAdmin,
  requireMaestroOrAdmin,
  requireAlumno,
  optionalAuth,
  authorizeCursoAccess,
  authorizeTareaAccess,
  getUserIdFromParams,
  getUserIdFromBody,
  ensureAlumno,
  ensureMaestro
};
