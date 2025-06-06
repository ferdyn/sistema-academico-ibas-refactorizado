import { Router } from 'express';
import authController from '@/controllers/authController';
import { authenticate } from '@/middleware/auth';
import { userValidations } from '@/utils/validation';

const router = Router();

/**
 * @route   POST /api/v1/auth/register
 * @desc    Registrar nuevo usuario
 * @access  Public
 */
router.post('/register', userValidations.register, authController.register);

/**
 * @route   POST /api/v1/auth/login
 * @desc    Iniciar sesión
 * @access  Public
 */
router.post('/login', userValidations.login, authController.login);

/**
 * @route   POST /api/v1/auth/refresh
 * @desc    Refrescar token de acceso
 * @access  Public
 */
router.post('/refresh', authController.refreshToken);

/**
 * @route   POST /api/v1/auth/logout
 * @desc    Cerrar sesión
 * @access  Private
 */
router.post('/logout', authenticate, authController.logout);

/**
 * @route   POST /api/v1/auth/logout-all
 * @desc    Cerrar todas las sesiones
 * @access  Private
 */
router.post('/logout-all', authenticate, authController.logoutAll);

/**
 * @route   GET /api/v1/auth/me
 * @desc    Obtener información del usuario actual
 * @access  Private
 */
router.get('/me', authenticate, authController.getCurrentUser);

/**
 * @route   POST /api/v1/auth/forgot-password
 * @desc    Solicitar restablecimiento de contraseña
 * @access  Public
 */
router.post('/forgot-password', userValidations.resetPassword, authController.requestPasswordReset);

/**
 * @route   POST /api/v1/auth/reset-password
 * @desc    Confirmar restablecimiento de contraseña
 * @access  Public
 */
router.post('/reset-password', userValidations.confirmResetPassword, authController.confirmPasswordReset);

/**
 * @route   POST /api/v1/auth/change-password
 * @desc    Cambiar contraseña (usuario autenticado)
 * @access  Private
 */
router.post('/change-password', authenticate, userValidations.changePassword, authController.changePassword);

/**
 * @route   POST /api/v1/auth/verify-email
 * @desc    Verificar email con código
 * @access  Private
 */
router.post('/verify-email', authenticate, authController.verifyEmail);

/**
 * @route   POST /api/v1/auth/resend-verification
 * @desc    Reenviar código de verificación
 * @access  Private
 */
router.post('/resend-verification', authenticate, authController.resendVerificationCode);

export default router;
