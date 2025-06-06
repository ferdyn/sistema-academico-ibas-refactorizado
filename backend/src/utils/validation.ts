import { body, param, query, ValidationChain, validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';
import { sendValidationError } from './response';
import mongoose from 'mongoose';

/**
 * Middleware para manejar errores de validación
 */
export const handleValidationErrors = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().reduce((acc, error) => {
      acc[error.param] = error.msg;
      return acc;
    }, {} as Record<string, string>);
    
    return sendValidationError(res, errorMessages);
  }
  
  next();
};

/**
 * Validaciones comunes para reutilizar
 */
export const commonValidations = {
  // Email
  email: (field: string = 'email') => 
    body(field)
      .isEmail()
      .withMessage('Debe ser un email válido')
      .normalizeEmail(),

  // Password
  password: (field: string = 'password', minLength: number = 6) =>
    body(field)
      .isLength({ min: minLength })
      .withMessage(`La contraseña debe tener al menos ${minLength} caracteres`)
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .withMessage('La contraseña debe contener al menos una letra minúscula, una mayúscula y un número'),

  // Password simple (sin reglas complejas)
  simplePassword: (field: string = 'password', minLength: number = 6) =>
    body(field)
      .isLength({ min: minLength })
      .withMessage(`La contraseña debe tener al menos ${minLength} caracteres`),

  // Confirmación de contraseña
  confirmPassword: (passwordField: string = 'password', confirmField: string = 'confirmarPassword') =>
    body(confirmField)
      .custom((value, { req }) => {
        if (value !== req.body[passwordField]) {
          throw new Error('Las contraseñas no coinciden');
        }
        return true;
      }),

  // ObjectId de MongoDB
  objectId: (field: string) =>
    param(field)
      .custom((value) => {
        if (!mongoose.Types.ObjectId.isValid(value)) {
          throw new Error('ID inválido');
        }
        return true;
      }),

  // ObjectId en body
  objectIdBody: (field: string) =>
    body(field)
      .custom((value) => {
        if (!mongoose.Types.ObjectId.isValid(value)) {
          throw new Error('ID inválido');
        }
        return true;
      }),

  // Nombre
  name: (field: string) =>
    body(field)
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage('El nombre debe tener entre 2 y 50 caracteres')
      .matches(/^[a-zA-ZÀ-ÿ\s]+$/)
      .withMessage('El nombre solo puede contener letras y espacios'),

  // Teléfono
  phone: (field: string = 'telefono', required: boolean = false) => {
    const validation = body(field)
      .optional({ nullable: true, checkFalsy: !required })
      .isMobilePhone('any')
      .withMessage('Número de teléfono inválido');
    
    return required ? validation.notEmpty().withMessage('El teléfono es requerido') : validation;
  },

  // Fecha
  date: (field: string) =>
    body(field)
      .isISO8601()
      .withMessage('Fecha inválida')
      .toDate(),

  // Fecha opcional
  optionalDate: (field: string) =>
    body(field)
      .optional()
      .isISO8601()
      .withMessage('Fecha inválida')
      .toDate(),

  // Número entero
  integer: (field: string, min?: number, max?: number) => {
    let validation = body(field).isInt();
    
    if (min !== undefined) {
      validation = validation.isInt({ min }).withMessage(`Debe ser mayor o igual a ${min}`);
    }
    
    if (max !== undefined) {
      validation = validation.isInt({ max }).withMessage(`Debe ser menor o igual a ${max}`);
    }
    
    return validation.toInt();
  },

  // Número decimal
  decimal: (field: string, min?: number, max?: number) => {
    let validation = body(field).isFloat();
    
    if (min !== undefined) {
      validation = validation.isFloat({ min }).withMessage(`Debe ser mayor o igual a ${min}`);
    }
    
    if (max !== undefined) {
      validation = validation.isFloat({ max }).withMessage(`Debe ser menor o igual a ${max}`);
    }
    
    return validation.toFloat();
  },

  // Enum
  enum: (field: string, values: string[], message?: string) =>
    body(field)
      .isIn(values)
      .withMessage(message || `Debe ser uno de: ${values.join(', ')}`),

  // Array de ObjectIds
  objectIdArray: (field: string) =>
    body(field)
      .isArray()
      .withMessage('Debe ser un array')
      .custom((value) => {
        if (!Array.isArray(value)) return false;
        return value.every(id => mongoose.Types.ObjectId.isValid(id));
      })
      .withMessage('Todos los elementos deben ser IDs válidos'),

  // URL
  url: (field: string) =>
    body(field)
      .optional()
      .isURL()
      .withMessage('Debe ser una URL válida'),

  // Texto con longitud
  text: (field: string, min: number = 1, max: number = 1000) =>
    body(field)
      .trim()
      .isLength({ min, max })
      .withMessage(`Debe tener entre ${min} y ${max} caracteres`),

  // Texto opcional
  optionalText: (field: string, max: number = 1000) =>
    body(field)
      .optional()
      .trim()
      .isLength({ max })
      .withMessage(`No puede exceder ${max} caracteres`),

  // Código (letras y números)
  code: (field: string, length?: number) => {
    let validation = body(field)
      .trim()
      .matches(/^[A-Z0-9]+$/)
      .withMessage('Solo puede contener letras mayúsculas y números');
    
    if (length) {
      validation = validation.isLength({ min: length, max: length })
        .withMessage(`Debe tener exactamente ${length} caracteres`);
    }
    
    return validation;
  },

  // Paginación
  pagination: () => [
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('La página debe ser un número mayor a 0')
      .toInt(),
    
    query('pageSize')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('El tamaño de página debe estar entre 1 y 100')
      .toInt(),
    
    query('sort')
      .optional()
      .isString()
      .withMessage('El campo de ordenamiento debe ser texto'),
    
    query('search')
      .optional()
      .trim()
      .isLength({ max: 100 })
      .withMessage('La búsqueda no puede exceder 100 caracteres')
  ]
};

/**
 * Validaciones específicas para el dominio
 */
export const userValidations = {
  register: [
    commonValidations.email(),
    commonValidations.simplePassword(),
    commonValidations.confirmPassword(),
    commonValidations.name('nombre'),
    commonValidations.name('apellido'),
    commonValidations.phone('telefono', false),
    commonValidations.optionalText('direccion', 200),
    commonValidations.optionalDate('fechaNacimiento'),
    commonValidations.enum('rol', ['alumno', 'maestro', 'administrador']),
    handleValidationErrors
  ],

  update: [
    commonValidations.name('nombre'),
    commonValidations.name('apellido'),
    commonValidations.phone('telefono', false),
    commonValidations.optionalText('direccion', 200),
    commonValidations.optionalDate('fechaNacimiento'),
    handleValidationErrors
  ],

  login: [
    commonValidations.email(),
    body('password').notEmpty().withMessage('La contraseña es requerida'),
    handleValidationErrors
  ],

  changePassword: [
    body('currentPassword').notEmpty().withMessage('La contraseña actual es requerida'),
    commonValidations.simplePassword('newPassword'),
    commonValidations.confirmPassword('newPassword', 'confirmNewPassword'),
    handleValidationErrors
  ],

  resetPassword: [
    commonValidations.email(),
    handleValidationErrors
  ],

  confirmResetPassword: [
    body('token').notEmpty().withMessage('El token es requerido'),
    commonValidations.simplePassword('newPassword'),
    commonValidations.confirmPassword('newPassword', 'confirmNewPassword'),
    handleValidationErrors
  ]
};

export const cursoValidations = {
  create: [
    commonValidations.objectIdBody('materiaId'),
    commonValidations.objectIdBody('maestroId'),
    commonValidations.text('nombre', 3, 200),
    commonValidations.optionalText('descripcion', 1000),
    commonValidations.date('fechaInicio'),
    commonValidations.date('fechaFin'),
    commonValidations.enum('modalidad', ['presencial', 'virtual', 'hibrida']),
    commonValidations.optionalText('aula', 50),
    commonValidations.text('horario', 5, 200),
    commonValidations.integer('cupoMaximo', 1, 100),
    handleValidationErrors
  ],

  update: [
    commonValidations.text('nombre', 3, 200),
    commonValidations.optionalText('descripcion', 1000),
    commonValidations.date('fechaInicio'),
    commonValidations.date('fechaFin'),
    commonValidations.enum('modalidad', ['presencial', 'virtual', 'hibrida']),
    commonValidations.optionalText('aula', 50),
    commonValidations.text('horario', 5, 200),
    commonValidations.integer('cupoMaximo', 1, 100),
    handleValidationErrors
  ]
};

export const tareaValidations = {
  create: [
    commonValidations.objectIdBody('cursoId'),
    commonValidations.text('titulo', 3, 200),
    commonValidations.text('descripcion', 10, 2000),
    commonValidations.date('fechaVencimiento'),
    commonValidations.integer('puntaje', 1, 100),
    commonValidations.optionalText('instrucciones', 3000),
    commonValidations.optionalText('criteriosEvaluacion', 2000),
    handleValidationErrors
  ],

  update: [
    commonValidations.text('titulo', 3, 200),
    commonValidations.text('descripcion', 10, 2000),
    commonValidations.date('fechaVencimiento'),
    commonValidations.integer('puntaje', 1, 100),
    commonValidations.optionalText('instrucciones', 3000),
    commonValidations.optionalText('criteriosEvaluacion', 2000),
    handleValidationErrors
  ]
};

export const pagoValidations = {
  create: [
    commonValidations.objectIdBody('alumnoId'),
    commonValidations.text('concepto', 3, 200),
    commonValidations.decimal('monto', 0.01),
    commonValidations.date('fechaVencimiento'),
    handleValidationErrors
  ],

  processPayment: [
    commonValidations.enum('metodoPago', ['efectivo', 'transferencia', 'deposito', 'tarjeta']),
    commonValidations.optionalText('referencia', 100),
    commonValidations.optionalText('notas', 500),
    handleValidationErrors
  ]
};

export const materiaValidations = {
  create: [
    commonValidations.code('codigo', 6),
    commonValidations.text('nombre', 3, 150),
    commonValidations.text('descripcion', 10, 1000),
    commonValidations.integer('creditos', 1, 10),
    commonValidations.objectIdBody('nivelId'),
    commonValidations.objectIdArray('prerequisitos').optional(),
    handleValidationErrors
  ],

  update: [
    commonValidations.code('codigo', 6),
    commonValidations.text('nombre', 3, 150),
    commonValidations.text('descripcion', 10, 1000),
    commonValidations.integer('creditos', 1, 10),
    commonValidations.objectIdBody('nivelId'),
    commonValidations.objectIdArray('prerequisitos').optional(),
    handleValidationErrors
  ]
};

/**
 * Validación de parámetros de ruta
 */
export const paramValidations = {
  id: [
    commonValidations.objectId('id'),
    handleValidationErrors
  ],

  userId: [
    commonValidations.objectId('userId'),
    handleValidationErrors
  ],

  cursoId: [
    commonValidations.objectId('cursoId'),
    handleValidationErrors
  ]
};

/**
 * Validaciones de query parameters
 */
export const queryValidations = {
  pagination: [
    ...commonValidations.pagination(),
    handleValidationErrors
  ],

  search: [
    query('search')
      .optional()
      .trim()
      .isLength({ min: 1, max: 100 })
      .withMessage('La búsqueda debe tener entre 1 y 100 caracteres'),
    handleValidationErrors
  ]
};

export default {
  commonValidations,
  userValidations,
  cursoValidations,
  tareaValidations,
  pagoValidations,
  materiaValidations,
  paramValidations,
  queryValidations,
  handleValidationErrors
};
