# 🌐 Despliegue Gratuito en la Nube - Sistema IBAS

## 🎯 Opciones Recomendadas (100% Gratis)

### **🏆 OPCIÓN 1: Railway (Recomendada)**
**✅ Mejor para principiantes - Todo en una plataforma**

**Ventajas:**
- Frontend + Backend + Base de datos en un solo lugar
- $5 USD de crédito gratis mensual
- Muy fácil de configurar
- Dominio automático
- SSL gratuito

**Límites gratuitos:**
- $5 USD crédito mensual (suficiente para desarrollo)
- 500 horas de ejecución
- 1GB RAM por servicio

---

### **🥇 OPCIÓN 2: Vercel + Render + MongoDB Atlas**
**✅ Más generoso en límites**

**Ventajas:**
- Límites más altos
- Mejor para producción
- Vercel es excelente para React

**Límites gratuitos:**
- Vercel: 100GB bandwidth, builds ilimitados
- Render: 750 horas/mes, 512MB RAM
- MongoDB Atlas: 512MB storage

---

### **🥈 OPCIÓN 3: Netlify + Railway + MongoDB Atlas**
**✅ Alternativa sólida**

## 🚀 Guía Paso a Paso - Railway (Opción Más Fácil)

### **PASO 1: Preparar el Código**

Primero vamos a preparar los archivos para Railway:

```bash
# 1. Extraer los ZIPs que ya tienes
# 2. Crear estructura para Railway:

proyecto-railway/
├── backend/          # Backend del ZIP
├── frontend/         # Frontend del ZIP  
└── railway.json     # Configuración (la crearemos)
```

### **PASO 2: Configurar Backend para Railway**

Crear `backend/railway.toml`:
```toml
[build]
builder = "NIXPACKS"

[deploy]
startCommand = "npm run start"
restartPolicyType = "ON_FAILURE"
restartPolicyMaxRetries = 10

[env]
NODE_ENV = "production"
```

Modificar `backend/package.json` (añadir script):
```json
{
  "scripts": {
    "start": "node dist/server.js",
    "build": "tsc",
    "dev": "tsx watch src/server.ts"
  }
}
```

### **PASO 3: Configurar Frontend para Railway**

Crear `frontend/railway.toml`:
```toml
[build]
builder = "NIXPACKS"

[deploy]
startCommand = "npm run preview"

[env]
NODE_ENV = "production"
```

### **PASO 4: Desplegar en Railway**

1. **Crear cuenta:** https://railway.app (usa GitHub)

2. **Crear nuevo proyecto:**
   - "New Project" → "Deploy from GitHub repo"
   - Conectar tu repositorio

3. **Añadir MongoDB:**
   - En tu proyecto Railway: "Add Service" → "Database" → "MongoDB"
   - Railway creará automáticamente la base de datos

4. **Configurar variables de entorno del backend:**
   ```
   MONGODB_URI=${MONGO_URL}  # Railway lo llena automáticamente
   JWT_SECRET=tu-jwt-secret-aqui
   JWT_REFRESH_SECRET=tu-refresh-secret-aqui
   COOKIE_SECRET=tu-cookie-secret-aqui
   NODE_ENV=production
   CORS_ORIGIN=https://tu-frontend.up.railway.app
   ```

5. **Configurar variables del frontend:**
   ```
   VITE_API_BASE_URL=https://tu-backend.up.railway.app/api/v1
   ```

6. **Hacer deploy:**
   - Railway despliega automáticamente cuando haces push

### **PASO 5: Poblar Base de Datos**

Una vez desplegado el backend:

```bash
# Conectarte a tu instancia Railway y ejecutar:
npm run seed
```

O crear un endpoint temporal en el backend para poblar:
```typescript
// Añadir en src/server.ts (solo para desarrollo)
app.get('/admin/seed', async (req, res) => {
  // Ejecutar tu script de seed aquí
  // REMOVER DESPUÉS DE USAR
});
```

## 🎯 Guía Alternativa - Vercel + Render

### **Frontend en Vercel**

1. **Crear cuenta:** https://vercel.com (usar GitHub)

2. **Nuevo proyecto:**
   - "Add New" → "Project"
   - Importar tu repositorio del frontend
   - Vercel detecta automáticamente que es Vite

3. **Variables de entorno:**
   ```
   VITE_API_BASE_URL=https://tu-backend.onrender.com/api/v1
   ```

4. **Deploy automático** cada vez que hagas push

### **Backend en Render**

1. **Crear cuenta:** https://render.com (usar GitHub)

2. **Nuevo Web Service:**
   - "New" → "Web Service"
   - Conectar repositorio del backend

3. **Configuración:**
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`
   - **Environment:** Node

4. **Variables de entorno:**
   ```
   MONGODB_URI=mongodb+srv://...  # Tu string de MongoDB Atlas
   JWT_SECRET=tu-jwt-secret
   CORS_ORIGIN=https://tu-frontend.vercel.app
   NODE_ENV=production
   ```

### **Base de Datos en MongoDB Atlas**

1. **Crear cuenta:** https://cloud.mongodb.com

2. **Nuevo cluster:**
   - "Build a Database" → "Free" (M0)
   - Elegir región cerca de ti

3. **Configurar acceso:**
   - Database Access: crear usuario
   - Network Access: 0.0.0.0/0 (permitir todo)

4. **Obtener connection string:**
   - "Connect" → "Connect your application"
   - Copiar string y usarlo en MONGODB_URI

## 🆓 Otras Opciones Gratuitas

### **Glitch.com**
- **Ideal para:** Prototipos rápidos
- **Límites:** 1000 horas/mes
- **URL:** https://glitch.com

### **CodeSandbox**
- **Ideal para:** Desarrollo y testing
- **Límites:** Proyectos públicos ilimitados
- **URL:** https://codesandbox.io

### **Cyclic.sh**
- **Ideal para:** APIs Node.js
- **Límites:** 100,000 requests/mes
- **URL:** https://cyclic.sh

## 📋 Checklist de Despliegue

Antes de desplegar, asegúrate de tener:

- [ ] ✅ Código en GitHub/GitLab
- [ ] ✅ Variables de entorno configuradas
- [ ] ✅ Scripts de build correctos
- [ ] ✅ Base de datos accesible públicamente
- [ ] ✅ CORS configurado para dominios de producción

## 🎮 URLs de Ejemplo

Una vez desplegado tendrás URLs como:

**Railway:**
- Frontend: `https://tu-proyecto-frontend.up.railway.app`
- Backend: `https://tu-proyecto-backend.up.railway.app`

**Vercel + Render:**
- Frontend: `https://tu-proyecto.vercel.app`
- Backend: `https://tu-proyecto.onrender.com`

## 🔧 Troubleshooting

### **Error de CORS en producción:**
```typescript
// En backend/src/server.ts, asegurar:
const allowedOrigins = [
  'https://tu-frontend.vercel.app',
  'https://tu-frontend.up.railway.app',
  // etc.
];
```

### **Error de build en frontend:**
```bash
# Verificar que tienes todos los archivos necesarios
npm run build  # Debe completarse sin errores
```

### **Base de datos no conecta:**
```bash
# Verificar string de conexión
# Verificar que la IP está permitida en MongoDB Atlas
# Verificar usuario y contraseña
```

## 💡 Tips de Optimización

1. **Usar CDN:** Vercel y Netlify incluyen CDN automáticamente

2. **Optimizar images:** Usar formatos webp para mejor rendimiento

3. **Environment variables:** Nunca hardcodear URLs o secrets

4. **Monitoring:** Usar las herramientas de monitoring incluidas

5. **Custom domains:** Ambos servicios permiten dominios custom gratis

## 🎯 Recomendación Final

Para empezar rápido: **Railway** (todo en uno)
Para mejor rendimiento: **Vercel + Render + MongoDB Atlas**

¡Cualquiera de estas opciones te permitirá tener tu aplicación online y funcionando en menos de 30 minutos!
