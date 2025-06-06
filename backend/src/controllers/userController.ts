import { Request, Response } from 'express';
import { User } from '@/models';
import { 
  sendSuccess, 
  sendNotFound, 
  sendBadRequest,
  sendConflict,
  sendInternalServerError,
  sendPaginated 
} from '@/utils/response';
import { UpdateUserDTO, QueryOptions, UserRole } from '@/types';

/**
 * Obtener todos los usuarios con paginación y filtros
 */
export const getUsers = async (req: Request, res: Response) => {
  try {
    const {
      page = 1,
      pageSize = 10,
      search,
      rol,
      activo,
      sort = '-createdAt'
    } = req.query;

    // Construir filtros
    const filters: any = {};
    
    if (search) {
      filters.$or = [
        { nombre: { $regex: search, $options: 'i' } },
        { apellido: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    if (rol) {
      filters.rol = rol;
    }

    if (activo !== undefined) {
      filters.activo = activo === 'true';
    }

    // Paginación
    const pageNum = parseInt(page as string);
    const pageSizeNum = parseInt(pageSize as string);
    const skip = (pageNum - 1) * pageSizeNum;

    // Ejecutar consulta
    const [users, total] = await Promise.all([
      User.find(filters)
        .sort(sort as string)
        .skip(skip)
        .limit(pageSizeNum)
        .select('-password -refreshTokens'),
      User.countDocuments(filters)
    ]);

    return sendPaginated(res, users, pageNum, pageSizeNum, total);

  } catch (error) {
    console.error('Error obteniendo usuarios:', error);
    return sendInternalServerError(res, 'Error interno del servidor');
  }
};

/**
 * Obtener un usuario por ID
 */
export const getUserById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id).select('-password -refreshTokens');
    
    if (!user) {
      return sendNotFound(res, 'Usuario no encontrado');
    }

    return sendSuccess(res, user, 'Usuario obtenido exitosamente');

  } catch (error) {
    console.error('Error obteniendo usuario:', error);
    return sendInternalServerError(res, 'Error interno del servidor');
  }
};

/**
 * Crear nuevo usuario (solo administradores)
 */
export const createUser = async (req: Request, res: Response) => {
  try {
    const userData = req.body;

    // Verificar si el email ya existe
    const existingUser = await User.findByEmail(userData.email);
    if (existingUser) {
      return sendConflict(res, 'El email ya está registrado');
    }

    // Crear usuario
    const user = new User(userData);
    await user.save();

    // Respuesta sin datos sensibles
    const userResponse = user.toJSON();
    delete userResponse.password;
    delete userResponse.refreshTokens;

    return sendSuccess(res, userResponse, 'Usuario creado exitosamente', 201);

  } catch (error: any) {
    console.error('Error creando usuario:', error);
    
    if (error.name === 'ValidationError') {
      const errors: Record<string, string> = {};
      Object.keys(error.errors).forEach(key => {
        errors[key] = error.errors[key].message;
      });
      return sendBadRequest(res, 'Errores de validación', errors);
    }

    return sendInternalServerError(res, 'Error interno del servidor');
  }
};

/**
 * Actualizar usuario
 */
export const updateUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData: UpdateUserDTO = req.body;

    // No permitir actualizar campos sensibles
    delete (updateData as any).password;
    delete (updateData as any).email;
    delete (updateData as any).rol;
    delete (updateData as any).activo;

    const user = await User.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password -refreshTokens');

    if (!user) {
      return sendNotFound(res, 'Usuario no encontrado');
    }

    return sendSuccess(res, user, 'Usuario actualizado exitosamente');

  } catch (error: any) {
    console.error('Error actualizando usuario:', error);
    
    if (error.name === 'ValidationError') {
      const errors: Record<string, string> = {};
      Object.keys(error.errors).forEach(key => {
        errors[key] = error.errors[key].message;
      });
      return sendBadRequest(res, 'Errores de validación', errors);
    }

    return sendInternalServerError(res, 'Error interno del servidor');
  }
};

/**
 * Eliminar usuario (desactivar)
 */
export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // No eliminar físicamente, solo desactivar
    const user = await User.findByIdAndUpdate(
      id,
      { activo: false },
      { new: true }
    ).select('-password -refreshTokens');

    if (!user) {
      return sendNotFound(res, 'Usuario no encontrado');
    }

    return sendSuccess(res, user, 'Usuario desactivado exitosamente');

  } catch (error) {
    console.error('Error eliminando usuario:', error);
    return sendInternalServerError(res, 'Error interno del servidor');
  }
};

/**
 * Reactivar usuario
 */
export const reactivateUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const user = await User.findByIdAndUpdate(
      id,
      { activo: true },
      { new: true }
    ).select('-password -refreshTokens');

    if (!user) {
      return sendNotFound(res, 'Usuario no encontrado');
    }

    return sendSuccess(res, user, 'Usuario reactivado exitosamente');

  } catch (error) {
    console.error('Error reactivando usuario:', error);
    return sendInternalServerError(res, 'Error interno del servidor');
  }
};

/**
 * Cambiar rol de usuario (solo administradores)
 */
export const changeUserRole = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { rol }: { rol: UserRole } = req.body;

    const user = await User.findByIdAndUpdate(
      id,
      { rol },
      { new: true, runValidators: true }
    ).select('-password -refreshTokens');

    if (!user) {
      return sendNotFound(res, 'Usuario no encontrado');
    }

    return sendSuccess(res, user, 'Rol de usuario actualizado exitosamente');

  } catch (error) {
    console.error('Error cambiando rol de usuario:', error);
    return sendInternalServerError(res, 'Error interno del servidor');
  }
};

/**
 * Obtener estadísticas de usuarios
 */
export const getUserStats = async (req: Request, res: Response) => {
  try {
    const stats = await User.getUsersStats();
    
    // Estadísticas adicionales
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ activo: true });
    const recentUsers = await User.countDocuments({
      createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } // Últimos 30 días
    });

    const response = {
      total: totalUsers,
      active: activeUsers,
      recent: recentUsers,
      inactive: totalUsers - activeUsers,
      byRole: stats
    };

    return sendSuccess(res, response, 'Estadísticas obtenidas exitosamente');

  } catch (error) {
    console.error('Error obteniendo estadísticas:', error);
    return sendInternalServerError(res, 'Error interno del servidor');
  }
};

/**
 * Buscar usuarios
 */
export const searchUsers = async (req: Request, res: Response) => {
  try {
    const { q: query, rol, limit = 10 } = req.query;

    if (!query) {
      return sendBadRequest(res, 'Parámetro de búsqueda requerido');
    }

    const searchOptions: any = {};
    if (rol) {
      searchOptions.rol = rol;
    }

    const users = await User.searchUsers(
      query as string, 
      searchOptions
    )
      .limit(parseInt(limit as string))
      .select('nombre apellido email rol activo foto');

    return sendSuccess(res, users, 'Búsqueda completada exitosamente');

  } catch (error) {
    console.error('Error en búsqueda de usuarios:', error);
    return sendInternalServerError(res, 'Error interno del servidor');
  }
};

/**
 * Obtener usuarios por rol
 */
export const getUsersByRole = async (req: Request, res: Response) => {
  try {
    const { rol } = req.params;
    const { activo = 'true' } = req.query;

    if (!['alumno', 'maestro', 'administrador'].includes(rol)) {
      return sendBadRequest(res, 'Rol inválido');
    }

    const filters: any = { rol };
    if (activo !== 'all') {
      filters.activo = activo === 'true';
    }

    const users = await User.find(filters)
      .select('nombre apellido email telefono activo foto createdAt')
      .sort({ nombre: 1, apellido: 1 });

    return sendSuccess(res, users, `Usuarios con rol ${rol} obtenidos exitosamente`);

  } catch (error) {
    console.error('Error obteniendo usuarios por rol:', error);
    return sendInternalServerError(res, 'Error interno del servidor');
  }
};

/**
 * Actualizar foto de perfil
 */
export const updateProfilePicture = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { foto } = req.body;

    if (!foto) {
      return sendBadRequest(res, 'URL de foto requerida');
    }

    const user = await User.findByIdAndUpdate(
      id,
      { foto },
      { new: true }
    ).select('-password -refreshTokens');

    if (!user) {
      return sendNotFound(res, 'Usuario no encontrado');
    }

    return sendSuccess(res, user, 'Foto de perfil actualizada exitosamente');

  } catch (error) {
    console.error('Error actualizando foto de perfil:', error);
    return sendInternalServerError(res, 'Error interno del servidor');
  }
};

/**
 * Obtener perfil del usuario actual
 */
export const getMyProfile = async (req: Request, res: Response) => {
  try {
    const user = req.user;

    if (!user) {
      return sendNotFound(res, 'Usuario no encontrado');
    }

    const userProfile = {
      id: user._id,
      email: user.email,
      nombre: user.nombre,
      apellido: user.apellido,
      telefono: user.telefono,
      direccion: user.direccion,
      fechaNacimiento: user.fechaNacimiento,
      foto: user.foto,
      rol: user.rol,
      activo: user.activo,
      emailVerificado: user.emailVerificado,
      ultimoAcceso: user.ultimoAcceso,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };

    return sendSuccess(res, userProfile, 'Perfil obtenido exitosamente');

  } catch (error) {
    console.error('Error obteniendo perfil:', error);
    return sendInternalServerError(res, 'Error interno del servidor');
  }
};

/**
 * Actualizar perfil del usuario actual
 */
export const updateMyProfile = async (req: Request, res: Response) => {
  try {
    const userId = req.user?._id;
    const updateData: UpdateUserDTO = req.body;

    // No permitir actualizar campos sensibles
    delete (updateData as any).password;
    delete (updateData as any).email;
    delete (updateData as any).rol;
    delete (updateData as any).activo;

    const user = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true }
    ).select('-password -refreshTokens');

    if (!user) {
      return sendNotFound(res, 'Usuario no encontrado');
    }

    return sendSuccess(res, user, 'Perfil actualizado exitosamente');

  } catch (error: any) {
    console.error('Error actualizando perfil:', error);
    
    if (error.name === 'ValidationError') {
      const errors: Record<string, string> = {};
      Object.keys(error.errors).forEach(key => {
        errors[key] = error.errors[key].message;
      });
      return sendBadRequest(res, 'Errores de validación', errors);
    }

    return sendInternalServerError(res, 'Error interno del servidor');
  }
};

export default {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  reactivateUser,
  changeUserRole,
  getUserStats,
  searchUsers,
  getUsersByRole,
  updateProfilePicture,
  getMyProfile,
  updateMyProfile
};
