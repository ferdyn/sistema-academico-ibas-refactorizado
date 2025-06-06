import { Request, Response } from 'express';
import { User } from '@/models';
import { 
  generateTokenPair, 
  verifyRefreshToken, 
  generateTemporaryToken,
  generateVerificationCode 
} from '@/utils/jwt';
import { 
  sendSuccess, 
  sendBadRequest, 
  sendUnauthorized, 
  sendNotFound,
  sendConflict,
  sendInternalServerError 
} from '@/utils/response';
import { CreateUserDTO, LoginDTO } from '@/types';

/**
 * Registrar nuevo usuario
 */
export const register = async (req: Request, res: Response) => {
  try {
    const userData: CreateUserDTO = req.body;

    // Verificar si el email ya existe
    const existingUser = await User.findByEmail(userData.email);
    if (existingUser) {
      return sendConflict(res, 'El email ya está registrado');
    }

    // Crear nuevo usuario
    const user = new User(userData);
    
    // Generar código de verificación
    const verificationCode = generateVerificationCode();
    const verificationExpiry = new Date();
    verificationExpiry.setHours(verificationExpiry.getHours() + 24); // 24 horas

    user.codigoVerificacion = verificationCode;
    user.codigoVerificacionExpira = verificationExpiry;

    await user.save();

    // Generar tokens
    const tokens = generateTokenPair(user);
    
    // Agregar refresh token al usuario
    user.addRefreshToken(tokens.refreshToken);
    await user.save();

    // TODO: Enviar email de verificación
    // await emailService.sendVerificationEmail(user.email, verificationCode);

    // Respuesta sin datos sensibles
    const userData_response = {
      id: user._id,
      email: user.email,
      nombre: user.nombre,
      apellido: user.apellido,
      rol: user.rol,
      activo: user.activo,
      emailVerificado: user.emailVerificado
    };

    return sendSuccess(res, {
      user: userData_response,
      tokens
    }, 'Usuario registrado exitosamente. Revisa tu email para verificar tu cuenta.', 201);

  } catch (error: any) {
    console.error('Error en registro:', error);
    
    // Manejar errores de validación de Mongoose
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
 * Iniciar sesión
 */
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password }: LoginDTO = req.body;

    // Buscar usuario con contraseña incluida
    const user = await User.findOne({ email }).select('+password +refreshTokens');
    
    if (!user) {
      return sendUnauthorized(res, 'Credenciales inválidas');
    }

    // Verificar contraseña
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return sendUnauthorized(res, 'Credenciales inválidas');
    }

    // Verificar que el usuario esté activo
    if (!user.activo) {
      return sendUnauthorized(res, 'Cuenta desactivada. Contacta al administrador.');
    }

    // Generar tokens
    const tokens = generateTokenPair(user);
    
    // Agregar refresh token al usuario
    user.addRefreshToken(tokens.refreshToken);
    user.updateLastAccess();
    await user.save();

    // Respuesta sin datos sensibles
    const userData = {
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
      ultimoAcceso: user.ultimoAcceso
    };

    return sendSuccess(res, {
      user: userData,
      tokens
    }, 'Inicio de sesión exitoso');

  } catch (error) {
    console.error('Error en login:', error);
    return sendInternalServerError(res, 'Error interno del servidor');
  }
};

/**
 * Refrescar token de acceso
 */
export const refreshToken = async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return sendBadRequest(res, 'Token de refresh requerido');
    }

    // Verificar token de refresh
    let decoded;
    try {
      decoded = verifyRefreshToken(refreshToken);
    } catch (error: any) {
      return sendUnauthorized(res, error.message);
    }

    // Buscar usuario
    const user = await User.findById(decoded.userId).select('+refreshTokens');
    if (!user) {
      return sendUnauthorized(res, 'Usuario no encontrado');
    }

    // Verificar que el token esté en la lista del usuario
    if (!user.refreshTokens.includes(refreshToken)) {
      return sendUnauthorized(res, 'Token de refresh inválido');
    }

    // Verificar que el usuario esté activo
    if (!user.activo) {
      return sendUnauthorized(res, 'Usuario inactivo');
    }

    // Generar nuevos tokens
    const tokens = generateTokenPair(user);
    
    // Reemplazar el refresh token antiguo con el nuevo
    user.removeRefreshToken(refreshToken);
    user.addRefreshToken(tokens.refreshToken);
    user.updateLastAccess();
    await user.save();

    return sendSuccess(res, { tokens }, 'Token renovado exitosamente');

  } catch (error) {
    console.error('Error en refresh token:', error);
    return sendInternalServerError(res, 'Error interno del servidor');
  }
};

/**
 * Cerrar sesión
 */
export const logout = async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;
    const user = req.user;

    if (!user) {
      return sendUnauthorized(res, 'Usuario no autenticado');
    }

    // Remover token específico si se proporciona
    if (refreshToken) {
      user.removeRefreshToken(refreshToken);
    } else {
      // Si no se proporciona, limpiar todos los tokens
      user.clearRefreshTokens();
    }

    await user.save();

    return sendSuccess(res, null, 'Sesión cerrada exitosamente');

  } catch (error) {
    console.error('Error en logout:', error);
    return sendInternalServerError(res, 'Error interno del servidor');
  }
};

/**
 * Cerrar todas las sesiones
 */
export const logoutAll = async (req: Request, res: Response) => {
  try {
    const user = req.user;

    if (!user) {
      return sendUnauthorized(res, 'Usuario no autenticado');
    }

    // Limpiar todos los refresh tokens
    user.clearRefreshTokens();
    await user.save();

    return sendSuccess(res, null, 'Todas las sesiones cerradas exitosamente');

  } catch (error) {
    console.error('Error en logout all:', error);
    return sendInternalServerError(res, 'Error interno del servidor');
  }
};

/**
 * Obtener información del usuario actual
 */
export const getCurrentUser = async (req: Request, res: Response) => {
  try {
    const user = req.user;

    if (!user) {
      return sendUnauthorized(res, 'Usuario no autenticado');
    }

    const userData = {
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

    return sendSuccess(res, userData, 'Información del usuario obtenida exitosamente');

  } catch (error) {
    console.error('Error obteniendo usuario actual:', error);
    return sendInternalServerError(res, 'Error interno del servidor');
  }
};

/**
 * Solicitar restablecimiento de contraseña
 */
export const requestPasswordReset = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    const user = await User.findByEmail(email);
    if (!user) {
      // Por seguridad, siempre responder exitosamente aunque el email no exista
      return sendSuccess(res, null, 'Si el email existe, se enviaron las instrucciones de restablecimiento');
    }

    // Generar token temporal para reset
    const resetToken = generateTemporaryToken(
      { userId: user._id.toString(), action: 'password_reset' },
      '1h'
    );

    // Guardar token en la base de datos
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpira = new Date(Date.now() + 60 * 60 * 1000); // 1 hora
    await user.save();

    // TODO: Enviar email con el link de reset
    // await emailService.sendPasswordResetEmail(user.email, resetToken);

    return sendSuccess(res, null, 'Si el email existe, se enviaron las instrucciones de restablecimiento');

  } catch (error) {
    console.error('Error en solicitud de reset de contraseña:', error);
    return sendInternalServerError(res, 'Error interno del servidor');
  }
};

/**
 * Confirmar restablecimiento de contraseña
 */
export const confirmPasswordReset = async (req: Request, res: Response) => {
  try {
    const { token, newPassword } = req.body;

    // Verificar token temporal
    let decoded;
    try {
      decoded = verifyRefreshToken(token);
    } catch (error: any) {
      return sendBadRequest(res, 'Token inválido o expirado');
    }

    // Buscar usuario con el token
    const user = await User.findOne({
      _id: decoded.userId,
      resetPasswordToken: token,
      resetPasswordExpira: { $gt: new Date() }
    }).select('+resetPasswordToken +resetPasswordExpira');

    if (!user) {
      return sendBadRequest(res, 'Token inválido o expirado');
    }

    // Actualizar contraseña
    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpira = undefined;
    
    // Limpiar todos los refresh tokens por seguridad
    user.clearRefreshTokens();
    
    await user.save();

    return sendSuccess(res, null, 'Contraseña restablecida exitosamente');

  } catch (error) {
    console.error('Error confirmando reset de contraseña:', error);
    return sendInternalServerError(res, 'Error interno del servidor');
  }
};

/**
 * Cambiar contraseña (usuario autenticado)
 */
export const changePassword = async (req: Request, res: Response) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = req.user;

    if (!user) {
      return sendUnauthorized(res, 'Usuario no autenticado');
    }

    // Obtener usuario con contraseña
    const userWithPassword = await User.findById(user._id).select('+password +refreshTokens');
    if (!userWithPassword) {
      return sendNotFound(res, 'Usuario no encontrado');
    }

    // Verificar contraseña actual
    const isCurrentPasswordValid = await userWithPassword.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      return sendBadRequest(res, 'Contraseña actual incorrecta');
    }

    // Actualizar contraseña
    userWithPassword.password = newPassword;
    
    // Limpiar todos los refresh tokens por seguridad (opcional)
    userWithPassword.clearRefreshTokens();
    
    await userWithPassword.save();

    return sendSuccess(res, null, 'Contraseña cambiada exitosamente');

  } catch (error) {
    console.error('Error cambiando contraseña:', error);
    return sendInternalServerError(res, 'Error interno del servidor');
  }
};

/**
 * Verificar email con código
 */
export const verifyEmail = async (req: Request, res: Response) => {
  try {
    const { codigo } = req.body;
    const user = req.user;

    if (!user) {
      return sendUnauthorized(res, 'Usuario no autenticado');
    }

    // Obtener usuario con código de verificación
    const userWithCode = await User.findById(user._id)
      .select('+codigoVerificacion +codigoVerificacionExpira');

    if (!userWithCode) {
      return sendNotFound(res, 'Usuario no encontrado');
    }

    // Verificar que el código coincida y no haya expirado
    if (
      !userWithCode.codigoVerificacion ||
      userWithCode.codigoVerificacion !== codigo ||
      !userWithCode.codigoVerificacionExpira ||
      userWithCode.codigoVerificacionExpira < new Date()
    ) {
      return sendBadRequest(res, 'Código de verificación inválido o expirado');
    }

    // Marcar email como verificado
    userWithCode.emailVerificado = true;
    userWithCode.codigoVerificacion = undefined;
    userWithCode.codigoVerificacionExpira = undefined;
    
    await userWithCode.save();

    return sendSuccess(res, null, 'Email verificado exitosamente');

  } catch (error) {
    console.error('Error verificando email:', error);
    return sendInternalServerError(res, 'Error interno del servidor');
  }
};

/**
 * Reenviar código de verificación
 */
export const resendVerificationCode = async (req: Request, res: Response) => {
  try {
    const user = req.user;

    if (!user) {
      return sendUnauthorized(res, 'Usuario no autenticado');
    }

    if (user.emailVerificado) {
      return sendBadRequest(res, 'El email ya está verificado');
    }

    // Generar nuevo código
    const verificationCode = generateVerificationCode();
    const verificationExpiry = new Date();
    verificationExpiry.setHours(verificationExpiry.getHours() + 24);

    user.codigoVerificacion = verificationCode;
    user.codigoVerificacionExpira = verificationExpiry;
    
    await user.save();

    // TODO: Enviar email de verificación
    // await emailService.sendVerificationEmail(user.email, verificationCode);

    return sendSuccess(res, null, 'Código de verificación enviado exitosamente');

  } catch (error) {
    console.error('Error reenviando código de verificación:', error);
    return sendInternalServerError(res, 'Error interno del servidor');
  }
};

export default {
  register,
  login,
  refreshToken,
  logout,
  logoutAll,
  getCurrentUser,
  requestPasswordReset,
  confirmPasswordReset,
  changePassword,
  verifyEmail,
  resendVerificationCode
};
