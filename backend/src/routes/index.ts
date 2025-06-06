import { Router } from 'express';
import authRoutes from './auth';
import userRoutes from './users';
// Importar más rutas según se vayan creando
// import cursoRoutes from './cursos';
// import materiaRoutes from './materias';
// import tareaRoutes from './tareas';
// import pagoRoutes from './pagos';

const router = Router();

// Rutas de autenticación
router.use('/auth', authRoutes);

// Rutas de usuarios
router.use('/users', userRoutes);

// Rutas adicionales (descomentar según se implementen)
// router.use('/cursos', cursoRoutes);
// router.use('/materias', materiaRoutes);
// router.use('/tareas', tareaRoutes);
// router.use('/pagos', pagoRoutes);

// Ruta de health check
router.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
    version: '1.0.0'
  });
});

export default router;
