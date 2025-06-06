import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import Database from '@/config/database';
import config from '@/config';
import routes from '@/routes';
import { responseMiddleware } from '@/utils/response';

// Crear aplicación Express
const app = express();

/**
 * Configurar middlewares de seguridad
 */

// Helmet para headers de seguridad
app.use(helmet({
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// CORS - Configuración mejorada para desarrollo
app.use(cors({
  origin: function (origin, callback) {
    // En desarrollo, permitir requests sin origin (como Postman/tests)
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
      config.CORS_ORIGIN || '*'
    ].filter(Boolean);

    if (origin && allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else if (config.NODE_ENV === 'development') {
      // En desarrollo, ser más permisivo
      callback(null, true);
    } else {
      callback(new Error('No permitido por CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Origin',
    'X-Requested-With', 
    'Content-Type',
    'Accept',
    'Authorization',
    'Cache-Control',
    'X-Access-Token'
  ],
  exposedHeaders: ['X-Total-Count', 'X-Page-Count'],
  maxAge: 3600,
  optionsSuccessStatus: 204
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: config.RATE_LIMIT_WINDOW_MS,
  max: config.RATE_LIMIT_MAX_REQUESTS,
  message: {
    success: false,
    message: 'Demasiadas solicitudes desde esta IP, inténtalo de nuevo más tarde.',
    errors: {
      rateLimit: 'Límite de solicitudes excedido'
    }
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(limiter);

/**
 * Configurar middlewares de parsing y logging
 */

// Compression
app.use(compression());

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging
if (config.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

/**
 * Middlewares personalizados
 */

// Middleware para agregar ID único a cada request
app.use((req, res, next) => {
  res.locals.requestId = Math.random().toString(36).substring(2, 15);
  next();
});

// Middleware de respuesta estandarizada
app.use(responseMiddleware);

/**
 * Endpoint de health check para tests de integración
 */
app.get(`${config.API_PREFIX}/health`, async (req, res) => {
  try {
    // Verificar conexión a base de datos
    const db = Database.getInstance();
    const isConnected = db.getConnectionState();
    
    res.json({
      success: true,
      message: 'Sistema IBAS funcionando correctamente',
      data: {
        status: 'healthy',
        version: '1.0.0',
        environment: config.NODE_ENV,
        database: isConnected ? 'connected' : 'disconnected',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        memory: {
          used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + ' MB',
          total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + ' MB'
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error en health check',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
});

/**
 * Rutas principales
 */
app.use(config.API_PREFIX, routes);

// Ruta raíz
app.get('/', (req, res) => {
  res.json({
    message: 'API del Sistema Académico IBAS',
    version: '1.0.0',
    environment: config.NODE_ENV,
    documentation: config.ENABLE_DOCS ? `${req.protocol}://${req.get('host')}${config.API_PREFIX}/docs` : undefined
  });
});

/**
 * Manejo de errores 404
 */
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Ruta no encontrada',
    errors: {
      path: `La ruta ${req.originalUrl} no existe`
    },
    meta: {
      timestamp: new Date(),
      requestId: res.locals.requestId,
      version: '1.0.0'
    }
  });
});

/**
 * Manejo global de errores
 */
app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error no manejado:', error);

  // Error de validación de MongoDB
  if (error.name === 'ValidationError') {
    const errors: Record<string, string> = {};
    Object.keys(error.errors).forEach(key => {
      errors[key] = error.errors[key].message;
    });
    
    return res.status(400).json({
      success: false,
      message: 'Errores de validación',
      errors,
      meta: {
        timestamp: new Date(),
        requestId: res.locals.requestId,
        version: '1.0.0'
      }
    });
  }

  // Error de cast (ID inválido)
  if (error.name === 'CastError') {
    return res.status(400).json({
      success: false,
      message: 'ID inválido',
      errors: {
        id: 'El ID proporcionado no es válido'
      },
      meta: {
        timestamp: new Date(),
        requestId: res.locals.requestId,
        version: '1.0.0'
      }
    });
  }

  // Error de duplicado (MongoDB)
  if (error.code === 11000) {
    const field = Object.keys(error.keyValue)[0];
    return res.status(409).json({
      success: false,
      message: 'Recurso duplicado',
      errors: {
        [field]: `El ${field} ya existe`
      },
      meta: {
        timestamp: new Date(),
        requestId: res.locals.requestId,
        version: '1.0.0'
      }
    });
  }

  // Error de JWT
  if (error.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Token inválido',
      errors: {
        token: 'El token de autenticación es inválido'
      },
      meta: {
        timestamp: new Date(),
        requestId: res.locals.requestId,
        version: '1.0.0'
      }
    });
  }

  // Error de JWT expirado
  if (error.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Token expirado',
      errors: {
        token: 'El token de autenticación ha expirado'
      },
      meta: {
        timestamp: new Date(),
        requestId: res.locals.requestId,
        version: '1.0.0'
      }
    });
  }

  // Error genérico
  res.status(error.status || 500).json({
    success: false,
    message: config.NODE_ENV === 'production' 
      ? 'Error interno del servidor' 
      : error.message,
    errors: config.NODE_ENV === 'development' ? { stack: error.stack } : undefined,
    meta: {
      timestamp: new Date(),
      requestId: res.locals.requestId,
      version: '1.0.0'
    }
  });
});

/**
 * Función para iniciar el servidor
 */
const startServer = async () => {
  try {
    // Conectar a la base de datos
    await Database.connect();

    // Iniciar servidor
    const server = app.listen(config.PORT, () => {
      console.log(`
🚀 Servidor iniciado exitosamente
🌍 Entorno: ${config.NODE_ENV}
📍 Puerto: ${config.PORT}
🔗 URL: http://localhost:${config.PORT}
📋 API: http://localhost:${config.PORT}${config.API_PREFIX}
${config.ENABLE_DOCS ? `📚 Docs: http://localhost:${config.PORT}${config.API_PREFIX}/docs` : ''}
      `);
    });

    // Manejo de cierre graceful
    const gracefulShutdown = async (signal: string) => {
      console.log(`\n📪 Recibida señal ${signal}, cerrando servidor...`);
      
      server.close(async () => {
        console.log('🔒 Servidor HTTP cerrado');
        
        try {
          await Database.disconnect();
          console.log('💾 Base de datos desconectada');
          process.exit(0);
        } catch (error) {
          console.error('❌ Error cerrando base de datos:', error);
          process.exit(1);
        }
      });

      // Forzar cierre después de 10 segundos
      setTimeout(() => {
        console.error('❌ Forzando cierre del proceso...');
        process.exit(1);
      }, 10000);
    };

    // Escuchar señales de cierre
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    // Manejar errores no capturados
    process.on('unhandledRejection', (reason, promise) => {
      console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
      // No cerrar el proceso en desarrollo
      if (config.NODE_ENV === 'production') {
        process.exit(1);
      }
    });

    process.on('uncaughtException', (error) => {
      console.error('❌ Uncaught Exception:', error);
      process.exit(1);
    });

    return server;

  } catch (error) {
    console.error('❌ Error iniciando servidor:', error);
    process.exit(1);
  }
};

// Iniciar servidor si este archivo es ejecutado directamente
if (require.main === module) {
  startServer();
}

export { app, startServer };
export default app;
