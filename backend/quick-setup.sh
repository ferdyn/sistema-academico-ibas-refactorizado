#!/bin/bash

# Script de configuración rápida para el Backend IBAS
# Este script automatiza la configuración inicial

echo "🚀 Configuración Rápida del Backend IBAS"
echo "========================================"
echo ""

# Verificar si Node.js está instalado
if ! command -v node &> /dev/null; then
    echo "❌ Node.js no está instalado"
    echo "   Instala Node.js desde: https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js detectado: $(node --version)"

# Verificar si npm está instalado
if ! command -v npm &> /dev/null; then
    echo "❌ npm no está instalado"
    exit 1
fi

echo "✅ npm detectado: $(npm --version)"
echo ""

# Instalar dependencias
echo "📦 Instalando dependencias..."
npm install

if [ $? -eq 0 ]; then
    echo "✅ Dependencias instaladas correctamente"
else
    echo "❌ Error instalando dependencias"
    exit 1
fi

echo ""

# Generar secretos JWT
echo "🔐 Generando secretos seguros..."
npm run generate-secrets

echo ""

# Crear archivo .env si no existe
if [ ! -f .env ]; then
    echo "📝 Creando archivo .env..."
    cp .env.example .env
    echo "✅ Archivo .env creado desde .env.example"
    echo ""
    echo "⚠️  IMPORTANTE: Edita el archivo .env y configura:"
    echo "   1. MONGODB_URI con tu conexión a MongoDB"
    echo "   2. Los secretos JWT generados arriba"
    echo "   3. Configuración de email SMTP (opcional)"
    echo ""
else
    echo "📝 Archivo .env ya existe, no se sobrescribirá"
    echo ""
fi

# Preguntar qué opción de MongoDB prefiere
echo "🗄️  ¿Qué opción de MongoDB prefieres?"
echo "   1) MongoDB Local (ya instalado)"
echo "   2) MongoDB Atlas (Cloud)"
echo "   3) MongoDB con Docker (fácil y rápido)"
echo ""
read -p "Selecciona una opción (1-3): " mongodb_option

case $mongodb_option in
    1)
        echo ""
        echo "📋 MongoDB Local seleccionado"
        echo "   Asegúrate de que MongoDB esté corriendo:"
        echo "   sudo systemctl start mongod  # Linux"
        echo "   brew services start mongodb  # macOS"
        echo ""
        echo "   Tu .env debe tener:"
        echo "   MONGODB_URI=mongodb://localhost:27017/ibas_academic"
        ;;
    2)
        echo ""
        echo "☁️  MongoDB Atlas seleccionado"
        echo "   1. Ve a: https://www.mongodb.com/cloud/atlas"
        echo "   2. Crea una cuenta gratuita"
        echo "   3. Crea un cluster gratuito (M0)"
        echo "   4. Configura acceso de red (0.0.0.0/0)"
        echo "   5. Crea un usuario de base de datos"
        echo "   6. Obtén el string de conexión"
        echo "   7. Actualiza MONGODB_URI en .env"
        ;;
    3)
        echo ""
        echo "🐳 MongoDB con Docker seleccionado"
        if command -v docker &> /dev/null; then
            echo "✅ Docker detectado"
            echo "   Iniciando MongoDB con Docker..."
            docker-compose up -d mongodb
            
            if [ $? -eq 0 ]; then
                echo "✅ MongoDB iniciado en Docker"
                echo ""
                echo "   Actualiza tu .env con:"
                echo "   MONGODB_URI=mongodb://ibas_user:ibas_password@localhost:27017/ibas_academic"
                echo ""
                echo "   MongoDB Express disponible en: http://localhost:8081"
                echo "   Usuario: admin, Contraseña: admin123"
            else
                echo "❌ Error iniciando MongoDB con Docker"
            fi
        else
            echo "❌ Docker no está instalado"
            echo "   Instala Docker desde: https://docker.com/"
            echo "   Luego ejecuta: docker-compose up -d mongodb"
        fi
        ;;
    *)
        echo "❌ Opción inválida"
        ;;
esac

echo ""
echo "🧪 Para probar la conexión, ejecuta:"
echo "   npm run test-db"
echo ""
echo "🌱 Para poblar la base de datos con datos de prueba:"
echo "   npm run seed"
echo ""
echo "🚀 Para iniciar el servidor:"
echo "   npm run dev"
echo ""
echo "📚 Para más información, consulta README.md"
echo ""
echo "✨ ¡Configuración completada!"
