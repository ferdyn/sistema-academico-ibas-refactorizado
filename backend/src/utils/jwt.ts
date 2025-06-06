import jwt from 'jsonwebtoken';
import { Types } from 'mongoose';
import config from '@/config';
import { IUser } from '@/types';

export interface TokenPayload {
  userId: string;
  email: string;
  rol: string;
  iat?: number;
  exp?: number;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

/**
 * Genera un token de acceso JWT
 */
export const generateAccessToken = (user: IUser): string => {
  const payload: TokenPayload = {
    userId: user._id.toString(),
    email: user.email,
    rol: user.rol
  };

  return jwt.sign(payload, config.JWT_SECRET, {
    expiresIn: config.JWT_EXPIRES_IN,
    issuer: 'ibas-api',
    audience: 'ibas-frontend'
  });
};

/**
 * Genera un token de refresh JWT
 */
export const generateRefreshToken = (user: IUser): string => {
  const payload = {
    userId: user._id.toString(),
    tokenType: 'refresh'
  };

  return jwt.sign(payload, config.JWT_REFRESH_SECRET, {
    expiresIn: config.JWT_REFRESH_EXPIRES_IN,
    issuer: 'ibas-api',
    audience: 'ibas-frontend'
  });
};

/**
 * Genera un par de tokens (acceso y refresh)
 */
export const generateTokenPair = (user: IUser): TokenPair => {
  return {
    accessToken: generateAccessToken(user),
    refreshToken: generateRefreshToken(user)
  };
};

/**
 * Verifica un token de acceso
 */
export const verifyAccessToken = (token: string): TokenPayload => {
  try {
    const decoded = jwt.verify(token, config.JWT_SECRET, {
      issuer: 'ibas-api',
      audience: 'ibas-frontend'
    }) as TokenPayload;

    return decoded;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error('Token expirado');
    } else if (error instanceof jwt.JsonWebTokenError) {
      throw new Error('Token inválido');
    } else {
      throw new Error('Error al verificar token');
    }
  }
};

/**
 * Verifica un token de refresh
 */
export const verifyRefreshToken = (token: string): { userId: string; tokenType: string } => {
  try {
    const decoded = jwt.verify(token, config.JWT_REFRESH_SECRET, {
      issuer: 'ibas-api',
      audience: 'ibas-frontend'
    }) as any;

    if (decoded.tokenType !== 'refresh') {
      throw new Error('Tipo de token inválido');
    }

    return decoded;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error('Token de refresh expirado');
    } else if (error instanceof jwt.JsonWebTokenError) {
      throw new Error('Token de refresh inválido');
    } else {
      throw new Error('Error al verificar token de refresh');
    }
  }
};

/**
 * Extrae el token del header Authorization
 */
export const extractTokenFromHeader = (authHeader?: string): string | null => {
  if (!authHeader) return null;
  
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') return null;
  
  return parts[1];
};

/**
 * Genera un token temporal para operaciones específicas (reset password, verificación email, etc.)
 */
export const generateTemporaryToken = (
  payload: Record<string, any>, 
  expiresIn: string = '1h'
): string => {
  return jwt.sign(
    { ...payload, tokenType: 'temporary' },
    config.JWT_SECRET,
    { expiresIn }
  );
};

/**
 * Verifica un token temporal
 */
export const verifyTemporaryToken = (token: string): any => {
  try {
    const decoded = jwt.verify(token, config.JWT_SECRET) as any;
    
    if (decoded.tokenType !== 'temporary') {
      throw new Error('Tipo de token inválido');
    }
    
    return decoded;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error('Token temporal expirado');
    } else if (error instanceof jwt.JsonWebTokenError) {
      throw new Error('Token temporal inválido');
    } else {
      throw new Error('Error al verificar token temporal');
    }
  }
};

/**
 * Genera un código de verificación numérico
 */
export const generateVerificationCode = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Decodifica un token sin verificar (útil para obtener información del payload de tokens expirados)
 */
export const decodeTokenWithoutVerification = (token: string): TokenPayload | null => {
  try {
    return jwt.decode(token) as TokenPayload;
  } catch (error) {
    return null;
  }
};

/**
 * Verifica si un token está próximo a expirar
 */
export const isTokenNearExpiry = (token: string, minutesThreshold: number = 10): boolean => {
  try {
    const decoded = jwt.decode(token) as any;
    if (!decoded || !decoded.exp) return false;
    
    const expirationTime = decoded.exp * 1000; // Convertir a milliseconds
    const now = Date.now();
    const thresholdTime = minutesThreshold * 60 * 1000; // Convertir minutos a milliseconds
    
    return (expirationTime - now) <= thresholdTime;
  } catch (error) {
    return false;
  }
};

/**
 * Obtiene el tiempo restante de un token en segundos
 */
export const getTokenRemainingTime = (token: string): number => {
  try {
    const decoded = jwt.decode(token) as any;
    if (!decoded || !decoded.exp) return 0;
    
    const expirationTime = decoded.exp * 1000;
    const now = Date.now();
    
    return Math.max(0, Math.floor((expirationTime - now) / 1000));
  } catch (error) {
    return 0;
  }
};

/**
 * Valida el formato de un token JWT sin verificar la firma
 */
export const isValidJWTFormat = (token: string): boolean => {
  const parts = token.split('.');
  return parts.length === 3 && parts.every(part => part.length > 0);
};

/**
 * Helper para crear payload de usuario para tokens
 */
export const createUserPayload = (user: IUser): TokenPayload => {
  return {
    userId: user._id.toString(),
    email: user.email,
    rol: user.rol
  };
};

/**
 * Constantes útiles para tokens
 */
export const TOKEN_CONSTANTS = {
  BEARER_PREFIX: 'Bearer ',
  HEADER_NAME: 'Authorization',
  REFRESH_HEADER_NAME: 'X-Refresh-Token',
  NEAR_EXPIRY_THRESHOLD_MINUTES: 10,
  
  // Tipos de token personalizados
  TOKEN_TYPES: {
    ACCESS: 'access',
    REFRESH: 'refresh',
    TEMPORARY: 'temporary',
    VERIFICATION: 'verification',
    RESET_PASSWORD: 'reset_password'
  }
} as const;
