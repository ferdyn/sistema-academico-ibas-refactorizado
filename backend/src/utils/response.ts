import { Response } from 'express';
import { ApiResponse, PaginatedResponse } from '@/types';

/**
 * Clase para manejar respuestas estandarizadas de la API
 */
class ApiResponseHandler {
  /**
   * Respuesta exitosa genérica
   */
  static success<T = any>(
    res: Response,
    data?: T,
    message: string = 'Operación exitosa',
    statusCode: number = 200
  ): Response {
    const response: ApiResponse<T> = {
      success: true,
      data,
      message,
      meta: {
        timestamp: new Date(),
        requestId: res.locals.requestId,
        version: '1.0'
      }
    };

    return res.status(statusCode).json(response);
  }

  /**
   * Respuesta de error genérica
   */
  static error(
    res: Response,
    message: string = 'Error interno del servidor',
    statusCode: number = 500,
    errors?: Record<string, string>
  ): Response {
    const response: ApiResponse = {
      success: false,
      message,
      errors,
      meta: {
        timestamp: new Date(),
        requestId: res.locals.requestId,
        version: '1.0'
      }
    };

    return res.status(statusCode).json(response);
  }

  /**
   * Respuesta paginada
   */
  static paginated<T = any>(
    res: Response,
    data: T[],
    page: number,
    pageSize: number,
    total: number,
    message: string = 'Datos obtenidos exitosamente'
  ): Response {
    const totalPages = Math.ceil(total / pageSize);
    
    const paginatedResponse: PaginatedResponse<T> = {
      data,
      pagination: {
        page,
        pageSize,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    };

    const response: ApiResponse<PaginatedResponse<T>> = {
      success: true,
      data: paginatedResponse,
      message,
      meta: {
        timestamp: new Date(),
        requestId: res.locals.requestId,
        version: '1.0'
      }
    };

    return res.status(200).json(response);
  }

  /**
   * Respuesta de recurso creado
   */
  static created<T = any>(
    res: Response,
    data: T,
    message: string = 'Recurso creado exitosamente'
  ): Response {
    return this.success(res, data, message, 201);
  }

  /**
   * Respuesta de recurso actualizado
   */
  static updated<T = any>(
    res: Response,
    data: T,
    message: string = 'Recurso actualizado exitosamente'
  ): Response {
    return this.success(res, data, message, 200);
  }

  /**
   * Respuesta de recurso eliminado
   */
  static deleted(
    res: Response,
    message: string = 'Recurso eliminado exitosamente'
  ): Response {
    return this.success(res, undefined, message, 200);
  }

  /**
   * Respuesta de no contenido
   */
  static noContent(res: Response): Response {
    return res.status(204).send();
  }

  /**
   * Respuesta de recurso no encontrado
   */
  static notFound(
    res: Response,
    message: string = 'Recurso no encontrado'
  ): Response {
    return this.error(res, message, 404);
  }

  /**
   * Respuesta de solicitud incorrecta
   */
  static badRequest(
    res: Response,
    message: string = 'Solicitud incorrecta',
    errors?: Record<string, string>
  ): Response {
    return this.error(res, message, 400, errors);
  }

  /**
   * Respuesta de no autorizado
   */
  static unauthorized(
    res: Response,
    message: string = 'No autorizado'
  ): Response {
    return this.error(res, message, 401);
  }

  /**
   * Respuesta de prohibido
   */
  static forbidden(
    res: Response,
    message: string = 'Acceso prohibido'
  ): Response {
    return this.error(res, message, 403);
  }

  /**
   * Respuesta de conflicto
   */
  static conflict(
    res: Response,
    message: string = 'Conflicto en la solicitud'
  ): Response {
    return this.error(res, message, 409);
  }

  /**
   * Respuesta de validación fallida
   */
  static validationError(
    res: Response,
    errors: Record<string, string>,
    message: string = 'Errores de validación'
  ): Response {
    return this.error(res, message, 422, errors);
  }

  /**
   * Respuesta de límite de velocidad excedido
   */
  static rateLimitExceeded(
    res: Response,
    message: string = 'Límite de solicitudes excedido'
  ): Response {
    return this.error(res, message, 429);
  }

  /**
   * Respuesta de error interno del servidor
   */
  static internalServerError(
    res: Response,
    message: string = 'Error interno del servidor'
  ): Response {
    return this.error(res, message, 500);
  }

  /**
   * Respuesta de servicio no disponible
   */
  static serviceUnavailable(
    res: Response,
    message: string = 'Servicio no disponible'
  ): Response {
    return this.error(res, message, 503);
  }
}

/**
 * Funciones helper para respuestas comunes
 */

// Respuestas de éxito
export const sendSuccess = ApiResponseHandler.success.bind(ApiResponseHandler);
export const sendCreated = ApiResponseHandler.created.bind(ApiResponseHandler);
export const sendUpdated = ApiResponseHandler.updated.bind(ApiResponseHandler);
export const sendDeleted = ApiResponseHandler.deleted.bind(ApiResponseHandler);
export const sendPaginated = ApiResponseHandler.paginated.bind(ApiResponseHandler);
export const sendNoContent = ApiResponseHandler.noContent.bind(ApiResponseHandler);

// Respuestas de error
export const sendError = ApiResponseHandler.error.bind(ApiResponseHandler);
export const sendNotFound = ApiResponseHandler.notFound.bind(ApiResponseHandler);
export const sendBadRequest = ApiResponseHandler.badRequest.bind(ApiResponseHandler);
export const sendUnauthorized = ApiResponseHandler.unauthorized.bind(ApiResponseHandler);
export const sendForbidden = ApiResponseHandler.forbidden.bind(ApiResponseHandler);
export const sendConflict = ApiResponseHandler.conflict.bind(ApiResponseHandler);
export const sendValidationError = ApiResponseHandler.validationError.bind(ApiResponseHandler);
export const sendRateLimitExceeded = ApiResponseHandler.rateLimitExceeded.bind(ApiResponseHandler);
export const sendInternalServerError = ApiResponseHandler.internalServerError.bind(ApiResponseHandler);
export const sendServiceUnavailable = ApiResponseHandler.serviceUnavailable.bind(ApiResponseHandler);

/**
 * Middleware para agregar helpers de respuesta al objeto response
 */
export const responseMiddleware = (req: any, res: Response, next: any) => {
  // Agregar helpers directamente al objeto response
  res.sendSuccess = (data?: any, message?: string, statusCode?: number) => 
    sendSuccess(res, data, message, statusCode);
  
  res.sendCreated = (data: any, message?: string) => 
    sendCreated(res, data, message);
  
  res.sendUpdated = (data: any, message?: string) => 
    sendUpdated(res, data, message);
  
  res.sendDeleted = (message?: string) => 
    sendDeleted(res, message);
  
  res.sendPaginated = (data: any[], page: number, pageSize: number, total: number, message?: string) => 
    sendPaginated(res, data, page, pageSize, total, message);
  
  res.sendError = (message?: string, statusCode?: number, errors?: Record<string, string>) => 
    sendError(res, message, statusCode, errors);
  
  res.sendNotFound = (message?: string) => 
    sendNotFound(res, message);
  
  res.sendBadRequest = (message?: string, errors?: Record<string, string>) => 
    sendBadRequest(res, message, errors);
  
  res.sendUnauthorized = (message?: string) => 
    sendUnauthorized(res, message);
  
  res.sendForbidden = (message?: string) => 
    sendForbidden(res, message);
  
  res.sendValidationError = (errors: Record<string, string>, message?: string) => 
    sendValidationError(res, errors, message);

  next();
};

/**
 * Tipos para TypeScript - Extiende el objeto Response
 */
declare global {
  namespace Express {
    interface Response {
      sendSuccess: (data?: any, message?: string, statusCode?: number) => Response;
      sendCreated: (data: any, message?: string) => Response;
      sendUpdated: (data: any, message?: string) => Response;
      sendDeleted: (message?: string) => Response;
      sendPaginated: (data: any[], page: number, pageSize: number, total: number, message?: string) => Response;
      sendError: (message?: string, statusCode?: number, errors?: Record<string, string>) => Response;
      sendNotFound: (message?: string) => Response;
      sendBadRequest: (message?: string, errors?: Record<string, string>) => Response;
      sendUnauthorized: (message?: string) => Response;
      sendForbidden: (message?: string) => Response;
      sendValidationError: (errors: Record<string, string>, message?: string) => Response;
    }
  }
}

export default ApiResponseHandler;
