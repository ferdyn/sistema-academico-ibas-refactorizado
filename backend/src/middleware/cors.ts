import cors from 'cors';
import { config } from '../config';

/**
 * Configuración de CORS para permitir comunicación frontend-backend
 */
export const corsMiddleware = cors({
  // Orígenes permitidos
  origin: function (origin, callback) {
    // En desarrollo, permitir requests sin origin (como Postman)
    if (!origin && config.NODE_ENV === 'development') {
      return callback(null, true);
    }

    // Lista de orígenes permitidos
    const allowedOrigins = [
      'http://localhost:3000',  // React dev server (CRA)
      'http://localhost:5173',  // Vite dev server
      'http://localhost:4173',  // Vite preview
      'http://127.0.0.1:3000',
      'http://127.0.0.1:5173',
      'http://127.0.0.1:4173',
      // Agregar aquí dominios de producción
      ...(config.FRONTEND_URLS ? config.FRONTEND_URLS.split(',') : [])
    ];

    // Verificar si el origin está permitido
    if (origin && allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else if (config.NODE_ENV === 'development') {
      // En desarrollo, ser más permisivo
      callback(null, true);
    } else {
      callback(new Error('No permitido por CORS'));
    }
  },

  // Métodos HTTP permitidos
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],

  // Headers permitidos
  allowedHeaders: [
    'Origin',
    'X-Requested-With',
    'Content-Type',
    'Accept',
    'Authorization',
    'Cache-Control',
    'X-Access-Token'
  ],

  // Headers expuestos al frontend
  exposedHeaders: ['X-Total-Count', 'X-Page-Count'],

  // Permitir cookies
  credentials: true,

  // Cache preflight por 1 hora
  maxAge: 3600,

  // Incluir status code 204 para OPTIONS
  optionsSuccessStatus: 204
});

/**
 * Middleware para agregar headers CORS adicionales si es necesario
 */
export const additionalCorsHeaders = (req: any, res: any, next: any) => {
  // Headers adicionales para desarrollo
  if (config.NODE_ENV === 'development') {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,PATCH,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Access-Token, X-Requested-With');
  }

  // Continuar con el siguiente middleware
  next();
};

/**
 * Función para verificar la configuración de CORS
 */
export const verifyCorsConfig = () => {
  console.log('🌐 Configuración CORS:');
  console.log(`   • Entorno: ${config.NODE_ENV}`);
  console.log(`   • Frontend URLs: ${config.FRONTEND_URLS || 'localhost:3000,localhost:5173'}`);
  console.log(`   • Credenciales: habilitadas`);
  console.log(`   • Métodos: GET, POST, PUT, DELETE, PATCH, OPTIONS`);
};
