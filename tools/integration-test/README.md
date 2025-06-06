# 🧪 Herramientas de Diagnóstico de Integración

Este directorio contiene herramientas para diagnosticar y solucionar problemas de integración entre el frontend y backend del Sistema Académico IBAS.

## 🚀 Cómo usar

### **Opción 1: Diagnóstico Automático (Recomendado)**

```bash
# Navegar al directorio de pruebas
cd integration-test

# Ejecutar diagnóstico completo
node diagnose-integration.js
```

Este script verificará automáticamente:
- ✅ Archivos de configuración (.env, package.json)
- ✅ Estado de puertos (5000 para backend, 5173 para frontend)
- ✅ Conexión al backend y base de datos
- ✅ Autenticación y endpoints protegidos
- ✅ Configuración CORS
- ✅ Reporte con pasos a seguir

### **Opción 2: Test Visual Interactivo**

```bash
# Abrir en tu navegador
integration-test/test-frontend.html
```

Esta página te permite:
- 🔍 Verificar estado del backend en tiempo real
- 🔐 Probar login con diferentes usuarios
- 📊 Probar endpoints de la API
- 🌐 Verificar configuración CORS
- 📝 Ver logs detallados de cada operación

### **Opción 3: Test Simple de Backend**

```bash
# Probar solo el backend
node test-backend.js
```

## 🔧 Solución de Problemas Comunes

### **1. Backend no responde**

**Síntomas:**
- Error "fetch failed" o "connection refused"
- Test de health check falla

**Soluciones:**
```bash
# Verificar que el backend esté corriendo
cd ../backend
npm run dev

# Si no tienes dependencias instaladas
npm install

# Si hay problemas con la base de datos
npm run test-db
npm run seed
```

### **2. Error de CORS**

**Síntomas:**
- Error "blocked by CORS policy" en el navegador
- Frontend no puede hacer requests al backend

**Soluciones:**
```bash
# 1. Verificar que el backend esté en puerto 5000
# 2. Verificar que el frontend esté en puerto 5173
# 3. Reiniciar ambos servicios
```

**Configuración CORS del backend:**
```javascript
// En src/server.ts ya está configurado para:
origin: [
  'http://localhost:3000',  // React CRA
  'http://localhost:5173',  // Vite
  'http://localhost:4173'   // Vite preview
]
```

### **3. Problemas de Autenticación**

**Síntomas:**
- Login falla con credenciales correctas
- Token no es válido
- Endpoints protegidos retornan 401

**Soluciones:**
```bash
# 1. Verificar que la base de datos tenga datos
cd ../backend
npm run seed

# 2. Verificar variables de entorno
cat .env
# Debe tener: MONGODB_URI, JWT_SECRET, etc.

# 3. Reiniciar el backend
npm run dev
```

### **4. Base de Datos Vacía**

**Síntomas:**
- Login falla con "Usuario no encontrado"
- API retorna arrays vacíos

**Soluciones:**
```bash
cd ../backend

# Poblar la base de datos con datos de prueba
npm run seed

# Verificar conexión a MongoDB
npm run test-db
```

### **5. Frontend no carga**

**Síntomas:**
- Página en blanco
- Errores en consola del navegador

**Soluciones:**
```bash
cd ../ibas-frontend-refactorizado-completo

# Instalar dependencias
npm install

# Verificar configuración
cat .env
# Debe tener: VITE_API_BASE_URL=http://localhost:5000/api/v1

# Iniciar en modo desarrollo
npm run dev
```

## 👥 Usuarios de Prueba

Una vez que ejecutes `npm run seed` en el backend, tendrás estos usuarios disponibles:

### **Administrador**
```
Email: admin@ibas.edu
Password: admin123
```

### **Maestros**
```
Email: jsanchez@ibas.edu
Password: maestro123

Email: mrodriguez@ibas.edu  
Password: maestro123
```

### **Alumnos**
```
Email: pedro.garcia@estudiante.ibas.edu
Password: alumno123

Email: ana.lopez@estudiante.ibas.edu
Password: alumno123

Email: luis.martinez@estudiante.ibas.edu
Password: alumno123
```

## 📋 Checklist de Verificación

Antes de reportar problemas, asegúrate de que:

- [ ] Backend está corriendo en puerto 5000
- [ ] Frontend está corriendo en puerto 5173
- [ ] MongoDB está conectado (local o Atlas)
- [ ] Archivo .env existe en /backend con todas las variables
- [ ] Base de datos poblada con `npm run seed`
- [ ] No hay errores en la consola del navegador
- [ ] No hay errores en los logs del backend

## 🆘 Si Nada Funciona

1. **Reinicia todo:**
```bash
# Terminal 1: Backend
cd backend
npm run dev

# Terminal 2: Frontend  
cd ibas-frontend-refactorizado-completo
npm run dev

# Terminal 3: Diagnóstico
cd integration-test
node diagnose-integration.js
```

2. **Verifica las URLs:**
   - Backend: http://localhost:5000
   - Frontend: http://localhost:5173
   - API: http://localhost:5000/api/v1

3. **Revisa los logs:**
   - Consola del navegador (F12)
   - Terminal del backend
   - Terminal del frontend

4. **Usa el test visual:**
   - Abre `test-frontend.html` en tu navegador
   - Sigue las instrucciones paso a paso

## 📞 Archivos de Diagnóstico

- `diagnose-integration.js` - Diagnóstico automático completo
- `test-backend.js` - Prueba solo el backend
- `test-frontend.html` - Interfaz visual para pruebas
- `README.md` - Esta guía

---

**💡 Tip:** Siempre ejecuta primero el diagnóstico automático antes de intentar soluciones manuales.
