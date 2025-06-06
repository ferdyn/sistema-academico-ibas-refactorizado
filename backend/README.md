# Backend API - Sistema Académico IBAS

API REST robusta y escalable para el Sistema de Gestión Académica del Instituto Básico de Administración y Sistemas (IBAS).

## 🚀 Características

- **Arquitectura RESTful** con Node.js, Express y TypeScript
- **Base de datos MongoDB** con Mongoose ODM
- **Autenticación JWT** con refresh tokens
- **Validación robusta** con express-validator
- **Seguridad** con Helmet, CORS y rate limiting
- **Logging** con Morgan
- **Documentación** automática de API
- **Testing** con Jest
- **Seeding** de datos de prueba

## 📋 Tecnologías

- **Runtime**: Node.js 18+
- **Lenguaje**: TypeScript
- **Framework**: Express.js
- **Base de datos**: MongoDB
- **ODM**: Mongoose
- **Autenticación**: JWT (jsonwebtoken)
- **Validación**: express-validator
- **Seguridad**: Helmet, CORS, express-rate-limit
- **Hash**: bcryptjs
- **File Upload**: Multer, Cloudinary
- **Email**: Nodemailer
- **Testing**: Jest
- **Linting**: ESLint

## 🏗️ Arquitectura

```
src/
├── config/          # Configuraciones (DB, variables de entorno)
├── controllers/     # Controladores (lógica de negocio)
├── middleware/      # Middlewares personalizados
├── models/          # Modelos de MongoDB/Mongoose
├── routes/          # Definición de rutas
├── services/        # Servicios externos (email, storage, etc.)
├── utils/           # Utilidades (JWT, validación, respuestas)
├── types/           # Tipos de TypeScript
├── scripts/         # Scripts de utilidad (seed, migrate)
└── server.ts        # Archivo principal del servidor
```

## ⚙️ Instalación

### Prerrequisitos

- Node.js 18+ y npm
- MongoDB 6.0+
- Redis (opcional, para cache)

### Configuración

1. **Clonar e instalar dependencias**:
```bash
cd backend
npm install
```

2. **Configurar variables de entorno**:
```bash
cp .env.example .env
```

Editar `.env` con tu configuración:
```env
# Base de datos
MONGODB_URI=mongodb://localhost:27017/ibas_academic

# JWT
JWT_SECRET=tu_jwt_secret_super_seguro
JWT_REFRESH_SECRET=tu_refresh_secret_super_seguro

# Email
SMTP_HOST=smtp.gmail.com
SMTP_USER=tu_email@gmail.com
SMTP_PASS=tu_app_password

# CORS
CORS_ORIGIN=http://localhost:3000
```

3. **Iniciar MongoDB**:
```bash
# En Ubuntu/Debian
sudo systemctl start mongod

# En macOS con Homebrew
brew services start mongodb-community

# Con Docker
docker run -d -p 27017:27017 --name mongodb mongo:6
```

## 🚦 Uso

### Desarrollo

```bash
# Iniciar en modo desarrollo (con nodemon)
npm run dev

# Compilar TypeScript
npm run build

# Poblar base de datos con datos de prueba
npm run seed
```

### Producción

```bash
# Compilar y ejecutar
npm run build
npm start
```

### Testing

```bash
# Ejecutar tests
npm test

# Tests en modo watch
npm run test:watch

# Linting
npm run lint
npm run lint:fix
```

## 📡 API Endpoints

### Autenticación
- `POST /api/v1/auth/register` - Registrar usuario
- `POST /api/v1/auth/login` - Iniciar sesión
- `POST /api/v1/auth/refresh` - Refrescar token
- `POST /api/v1/auth/logout` - Cerrar sesión
- `GET /api/v1/auth/me` - Usuario actual
- `POST /api/v1/auth/forgot-password` - Solicitar reset
- `POST /api/v1/auth/reset-password` - Confirmar reset

### Usuarios
- `GET /api/v1/users` - Listar usuarios (Admin)
- `POST /api/v1/users` - Crear usuario (Admin)
- `GET /api/v1/users/:id` - Obtener usuario
- `PUT /api/v1/users/:id` - Actualizar usuario
- `DELETE /api/v1/users/:id` - Eliminar usuario (Admin)
- `GET /api/v1/users/profile` - Mi perfil
- `PUT /api/v1/users/profile` - Actualizar mi perfil

### Más endpoints (por implementar)
- Cursos: `/api/v1/cursos`
- Materias: `/api/v1/materias`
- Tareas: `/api/v1/tareas`
- Pagos: `/api/v1/pagos`
- Dashboard: `/api/v1/dashboard`

## 🔐 Autenticación y Autorización

### Roles de Usuario
- **Alumno**: Acceso a sus cursos, tareas y pagos
- **Maestro**: Gestión de sus cursos y estudiantes
- **Administrador**: Acceso completo al sistema

### Sistema de Tokens
- **Access Token**: JWT de corta duración (7 días)
- **Refresh Token**: JWT de larga duración (30 días)
- **Temporary Tokens**: Para operaciones específicas (reset password)

### Middleware de Protección
```typescript
// Rutas protegidas básicas
router.use('/protected', authenticate);

// Solo administradores
router.use('/admin', requireAdmin);

// Solo maestros o administradores
router.use('/teaching', requireMaestroOrAdmin);

// Solo el dueño del recurso o administradores
router.get('/users/:id', authorizeOwnerOrAdmin(getUserIdFromParams));
```

## 📊 Modelos de Datos

### Usuario
```typescript
interface IUser {
  email: string;
  password: string;
  nombre: string;
  apellido: string;
  telefono?: string;
  direccion?: string;
  fechaNacimiento?: Date;
  foto?: string;
  rol: 'alumno' | 'maestro' | 'administrador';
  activo: boolean;
  emailVerificado: boolean;
  // ... más campos
}
```

### Curso
```typescript
interface ICurso {
  materiaId: ObjectId;
  maestroId: ObjectId;
  nombre: string;
  descripcion?: string;
  fechaInicio: Date;
  fechaFin: Date;
  modalidad: 'presencial' | 'virtual' | 'hibrida';
  aula?: string;
  horario: string;
  cupoMaximo: number;
  activo: boolean;
  estudiantesInscritos: number;
}
```

### Tarea
```typescript
interface ITarea {
  cursoId: ObjectId;
  titulo: string;
  descripcion: string;
  fechaVencimiento: Date;
  puntaje: number;
  activa: boolean;
  archivos: string[];
  instrucciones?: string;
  criteriosEvaluacion?: string;
}
```

## 🛡️ Seguridad

### Medidas Implementadas
- **Helmet**: Headers de seguridad HTTP
- **CORS**: Control de origen cruzado
- **Rate Limiting**: Límite de solicitudes por IP
- **JWT**: Tokens seguros con expiración
- **bcrypt**: Hash seguro de contraseñas
- **Validación**: Sanitización de entrada
- **MongoDB Injection**: Protección con Mongoose

### Variables de Entorno Sensibles
```env
JWT_SECRET=
JWT_REFRESH_SECRET=
MONGODB_URI=
SMTP_PASS=
CLOUDINARY_API_SECRET=
```

## 📈 Monitoreo y Logging

### Logs
- **Desarrollo**: Formato colorido con morgan 'dev'
- **Producción**: Formato 'combined' estándar
- **Errores**: Console.error para debugging

### Health Check
```
GET /api/v1/health
```

Respuesta:
```json
{
  "status": "OK",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 3600,
  "environment": "development",
  "version": "1.0.0"
}
```

## 🚀 Despliegue

### Variables de Entorno de Producción
```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/ibas_academic
CORS_ORIGIN=https://tu-frontend.com
LOG_LEVEL=warn
```

### Scripts de Despliegue
```bash
# Compilar para producción
npm run build

# Ejecutar en producción
npm start

# PM2 (recomendado)
npm install -g pm2
pm2 start dist/server.js --name "ibas-api"
```

### Docker (opcional)
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist ./dist
EXPOSE 5000
CMD ["node", "dist/server.js"]
```

## 📝 Scripts Disponibles

```bash
npm run dev          # Desarrollo con nodemon
npm run build        # Compilar TypeScript
npm start            # Ejecutar versión compilada
npm test             # Ejecutar tests
npm run test:watch   # Tests en modo watch
npm run lint         # Linting con ESLint
npm run lint:fix     # Fix automático de linting
npm run seed         # Poblar DB con datos de prueba
```

## 🧪 Testing

### Configuración de Tests
```typescript
// jest.config.js
export default {
  preset: 'ts-jest',
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/src/tests/setup.ts'],
  testMatch: ['**/__tests__/**/*.ts', '**/?(*.)+(spec|test).ts'],
};
```

### Estructura de Tests
```
src/
├── __tests__/
│   ├── auth.test.ts
│   ├── users.test.ts
│   └── integration/
└── tests/
    ├── setup.ts
    └── helpers/
```

## 📚 Ejemplos de Uso

### Registro de Usuario
```bash
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "nuevo@ejemplo.com",
    "password": "password123",
    "nombre": "Juan",
    "apellido": "Pérez",
    "rol": "alumno"
  }'
```

### Login
```bash
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "nuevo@ejemplo.com",
    "password": "password123"
  }'
```

### Acceso a Recurso Protegido
```bash
curl -X GET http://localhost:5000/api/v1/auth/me \
  -H "Authorization: Bearer TU_ACCESS_TOKEN"
```

## 🤝 Contribución

1. Fork el proyecto
2. Crear rama de feature (`git checkout -b feature/AmazingFeature`)
3. Commit cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir Pull Request

### Estándares de Código
- Usar TypeScript estricto
- Seguir convenciones de ESLint
- Tests para nuevas funcionalidades
- Documentar endpoints complejos

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver `LICENSE` para más detalles.

## 👥 Equipo de Desarrollo

- **Backend Lead**: Sistema Académico IBAS
- **DevOps**: Configuración de servidores
- **QA**: Testing y validación

## 📞 Soporte

Para soporte técnico:
- Email: soporte@ibas.edu
- Issues: GitHub Issues
- Documentación: `/docs` endpoint cuando esté disponible

---

**Desarrollado con ❤️ para el Instituto IBAS**
