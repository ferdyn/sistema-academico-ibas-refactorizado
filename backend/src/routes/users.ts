import { Router } from 'express';
import userController from '@/controllers/userController';
import { 
  authenticate, 
  requireAdmin, 
  authorizeOwnerOrAdmin,
  getUserIdFromParams 
} from '@/middleware/auth';
import { 
  userValidations, 
  paramValidations, 
  queryValidations,
  commonValidations,
  handleValidationErrors 
} from '@/utils/validation';

const router = Router();

// Todas las rutas requieren autenticación
router.use(authenticate);

/**
 * @route   GET /api/v1/users
 * @desc    Obtener todos los usuarios con paginación y filtros
 * @access  Private (Solo administradores)
 */
router.get('/', 
  requireAdmin, 
  queryValidations.pagination, 
  userController.getUsers
);

/**
 * @route   GET /api/v1/users/stats
 * @desc    Obtener estadísticas de usuarios
 * @access  Private (Solo administradores)
 */
router.get('/stats', 
  requireAdmin, 
  userController.getUserStats
);

/**
 * @route   GET /api/v1/users/search
 * @desc    Buscar usuarios
 * @access  Private (Solo administradores)
 */
router.get('/search', 
  requireAdmin, 
  queryValidations.search,
  userController.searchUsers
);

/**
 * @route   GET /api/v1/users/role/:rol
 * @desc    Obtener usuarios por rol
 * @access  Private (Solo administradores)
 */
router.get('/role/:rol', 
  requireAdmin,
  [
    commonValidations.enum('rol', ['alumno', 'maestro', 'administrador']).custom((value, { req }) => {
      req.params.rol = value;
      return true;
    }),
    handleValidationErrors
  ],
  userController.getUsersByRole
);

/**
 * @route   GET /api/v1/users/profile
 * @desc    Obtener perfil del usuario actual
 * @access  Private
 */
router.get('/profile', userController.getMyProfile);

/**
 * @route   PUT /api/v1/users/profile
 * @desc    Actualizar perfil del usuario actual
 * @access  Private
 */
router.put('/profile', 
  userValidations.update, 
  userController.updateMyProfile
);

/**
 * @route   POST /api/v1/users
 * @desc    Crear nuevo usuario
 * @access  Private (Solo administradores)
 */
router.post('/', 
  requireAdmin, 
  userValidations.register, 
  userController.createUser
);

/**
 * @route   GET /api/v1/users/:id
 * @desc    Obtener usuario por ID
 * @access  Private (Solo el usuario o administradores)
 */
router.get('/:id', 
  paramValidations.id,
  authorizeOwnerOrAdmin(getUserIdFromParams),
  userController.getUserById
);

/**
 * @route   PUT /api/v1/users/:id
 * @desc    Actualizar usuario
 * @access  Private (Solo el usuario o administradores)
 */
router.put('/:id', 
  paramValidations.id,
  authorizeOwnerOrAdmin(getUserIdFromParams),
  userValidations.update,
  userController.updateUser
);

/**
 * @route   DELETE /api/v1/users/:id
 * @desc    Eliminar usuario (desactivar)
 * @access  Private (Solo administradores)
 */
router.delete('/:id', 
  requireAdmin,
  paramValidations.id,
  userController.deleteUser
);

/**
 * @route   POST /api/v1/users/:id/reactivate
 * @desc    Reactivar usuario
 * @access  Private (Solo administradores)
 */
router.post('/:id/reactivate', 
  requireAdmin,
  paramValidations.id,
  userController.reactivateUser
);

/**
 * @route   PATCH /api/v1/users/:id/role
 * @desc    Cambiar rol de usuario
 * @access  Private (Solo administradores)
 */
router.patch('/:id/role', 
  requireAdmin,
  paramValidations.id,
  [
    commonValidations.enum('rol', ['alumno', 'maestro', 'administrador']),
    handleValidationErrors
  ],
  userController.changeUserRole
);

/**
 * @route   PATCH /api/v1/users/:id/picture
 * @desc    Actualizar foto de perfil
 * @access  Private (Solo el usuario o administradores)
 */
router.patch('/:id/picture', 
  paramValidations.id,
  authorizeOwnerOrAdmin(getUserIdFromParams),
  [
    commonValidations.url('foto'),
    handleValidationErrors
  ],
  userController.updateProfilePicture
);

export default router;
