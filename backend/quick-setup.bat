@echo off
echo 🚀 Configuración Rápida del Backend IBAS
echo ========================================
echo.

REM Verificar si Node.js está instalado
node --version >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Node.js no está instalado
    echo    Instala Node.js desde: https://nodejs.org/
    pause
    exit /b 1
)

echo ✅ Node.js detectado
node --version

REM Verificar si npm está instalado
npm --version >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ❌ npm no está instalado
    pause
    exit /b 1
)

echo ✅ npm detectado
npm --version
echo.

REM Instalar dependencias
echo 📦 Instalando dependencias...
call npm install

if %ERRORLEVEL% NEQ 0 (
    echo ❌ Error instalando dependencias
    pause
    exit /b 1
)

echo ✅ Dependencias instaladas correctamente
echo.

REM Generar secretos JWT
echo 🔐 Generando secretos seguros...
call npm run generate-secrets
echo.

REM Crear archivo .env si no existe
if not exist .env (
    echo 📝 Creando archivo .env...
    copy .env.example .env
    echo ✅ Archivo .env creado desde .env.example
    echo.
    echo ⚠️  IMPORTANTE: Edita el archivo .env y configura:
    echo    1. MONGODB_URI con tu conexión a MongoDB
    echo    2. Los secretos JWT generados arriba
    echo    3. Configuración de email SMTP ^(opcional^)
    echo.
) else (
    echo 📝 Archivo .env ya existe, no se sobrescribirá
    echo.
)

REM Preguntar qué opción de MongoDB prefiere
echo 🗄️  ¿Qué opción de MongoDB prefieres?
echo    1^) MongoDB Local ^(ya instalado^)
echo    2^) MongoDB Atlas ^(Cloud^)
echo    3^) MongoDB con Docker ^(fácil y rápido^)
echo.
set /p mongodb_option="Selecciona una opción (1-3): "

if "%mongodb_option%"=="1" (
    echo.
    echo 📋 MongoDB Local seleccionado
    echo    Asegúrate de que MongoDB esté corriendo como servicio de Windows
    echo    O inicia MongoDB manualmente
    echo.
    echo    Tu .env debe tener:
    echo    MONGODB_URI=mongodb://localhost:27017/ibas_academic
) else if "%mongodb_option%"=="2" (
    echo.
    echo ☁️  MongoDB Atlas seleccionado
    echo    1. Ve a: https://www.mongodb.com/cloud/atlas
    echo    2. Crea una cuenta gratuita
    echo    3. Crea un cluster gratuito ^(M0^)
    echo    4. Configura acceso de red ^(0.0.0.0/0^)
    echo    5. Crea un usuario de base de datos
    echo    6. Obtén el string de conexión
    echo    7. Actualiza MONGODB_URI en .env
) else if "%mongodb_option%"=="3" (
    echo.
    echo 🐳 MongoDB con Docker seleccionado
    docker --version >nul 2>&1
    if %ERRORLEVEL% EQU 0 (
        echo ✅ Docker detectado
        echo    Iniciando MongoDB con Docker...
        docker-compose up -d mongodb
        
        if %ERRORLEVEL% EQU 0 (
            echo ✅ MongoDB iniciado en Docker
            echo.
            echo    Actualiza tu .env con:
            echo    MONGODB_URI=mongodb://ibas_user:ibas_password@localhost:27017/ibas_academic
            echo.
            echo    MongoDB Express disponible en: http://localhost:8081
            echo    Usuario: admin, Contraseña: admin123
        ) else (
            echo ❌ Error iniciando MongoDB con Docker
        )
    ) else (
        echo ❌ Docker no está instalado
        echo    Instala Docker Desktop desde: https://docker.com/
        echo    Luego ejecuta: docker-compose up -d mongodb
    )
) else (
    echo ❌ Opción inválida
)

echo.
echo 🧪 Para probar la conexión, ejecuta:
echo    npm run test-db
echo.
echo 🌱 Para poblar la base de datos con datos de prueba:
echo    npm run seed
echo.
echo 🚀 Para iniciar el servidor:
echo    npm run dev
echo.
echo 📚 Para más información, consulta README.md
echo.
echo ✨ ¡Configuración completada!
echo.
pause
