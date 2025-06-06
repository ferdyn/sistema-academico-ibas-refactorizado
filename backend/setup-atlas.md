# Configuración MongoDB Atlas - Pasos Finales

## 🔐 **Credenciales Requeridas**

Necesito que me proporciones:
- **Username**: El usuario de tu base de datos en MongoDB Atlas
- **Password**: La contraseña de ese usuario

## 📋 **Pasos que seguiremos:**

### **1. Actualizar conexiones en .env**
```env
# Será algo como:
MONGODB_URI=mongodb+srv://tu_usuario:tu_password@ibas.lvmhmz4.mongodb.net/ibas_academic?retryWrites=true&w=majority&appName=IBAS
```

### **2. Generar secretos JWT seguros**
```bash
cd backend
npm run generate-secrets
```

### **3. Actualizar .env con los secretos generados**

### **4. Probar la conexión**
```bash
npm run test-db
```

### **5. Poblar base de datos con datos de prueba**
```bash
npm run seed
```

### **6. Iniciar el servidor**
```bash
npm run dev
```

## ✅ **Después de la configuración tendrás:**

### **Usuarios de prueba creados automáticamente:**
- **Administrador**: `admin@ibas.edu` (contraseña: `admin123`)
- **Maestro 1**: `jsanchez@ibas.edu` (contraseña: `maestro123`)
- **Maestro 2**: `mrodriguez@ibas.edu` (contraseña: `maestro123`)
- **Alumno 1**: `pedro.garcia@estudiante.ibas.edu` (contraseña: `alumno123`)
- **Alumno 2**: `ana.lopez@estudiante.ibas.edu` (contraseña: `alumno123`)
- **Alumno 3**: `luis.martinez@estudiante.ibas.edu` (contraseña: `alumno123`)

### **Datos completos:**
- ✅ 6 usuarios con diferentes roles
- ✅ 3 niveles académicos
- ✅ 6 materias con prerequisitos
- ✅ 3 cursos activos
- ✅ 5 inscripciones de estudiantes
- ✅ 3 tareas con fechas realistas
- ✅ 5 pagos (algunos pendientes, otros pagados)

### **API funcionando en:**
- **Backend**: http://localhost:5000
- **Health check**: http://localhost:5000/api/v1/health
- **Login endpoint**: http://localhost:5000/api/v1/auth/login

---

## 🚨 **¿Ya verificaste el acceso a tu cluster Atlas?**

Asegúrate de que en MongoDB Atlas:

1. **Network Access** permite tu IP (o 0.0.0.0/0 para desarrollo)
2. **Database Access** tiene un usuario creado
3. **El cluster está activo** (no pausado)

---

**Por favor comparte tu username y password de MongoDB Atlas para continuar.**
