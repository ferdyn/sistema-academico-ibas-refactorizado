#!/usr/bin/env node

/**
 * Script para preparar el código para despliegue gratuito en la nube
 * Ejecutar con: node prepare-deploy.js
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Colores para consola
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function title(message) {
  log(`\n${'='.repeat(60)}`, 'cyan');
  log(`  ${message}`, 'bright');
  log('='.repeat(60), 'cyan');
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function ask(question) {
  return new Promise(resolve => rl.question(question, resolve));
}

// Configuraciones de despliegue
const deployConfigs = {
  railway: {
    name: 'Railway (Todo en uno)',
    description: 'Frontend + Backend + DB en una plataforma',
    files: {
      'railway.toml': `[build]
builder = "NIXPACKS"

[deploy]
startCommand = "npm run start"
restartPolicyType = "ON_FAILURE"
restartPolicyMaxRetries = 10

[variables]
NODE_ENV = "production"`
    }
  },
  
  vercel: {
    name: 'Vercel (Solo Frontend)',
    description: 'Excelente para React, necesita backend separado',
    files: {
      'vercel.json': `{
  "buildCommand": "npm run build",
  "outputDirectory": "dist", 
  "installCommand": "npm install",
  "framework": "vite",
  "env": {
    "VITE_API_BASE_URL": "https://your-backend.onrender.com/api/v1"
  },
  "rewrites": [
    {
      "source": "/((?!api/).*)",
      "destination": "/index.html"
    }
  ]
}`
    }
  },
  
  render: {
    name: 'Render (Solo Backend)',
    description: 'Excelente para Node.js APIs',
    files: {
      'render.yaml': `services:
  - type: web
    name: ibas-backend
    env: node
    buildCommand: npm install && npm run build
    startCommand: npm run start
    envVars:
      - key: NODE_ENV
        value: production
      - key: MONGODB_URI
        fromDatabase:
          name: ibas-db
          property: connectionString
      - key: JWT_SECRET
        generateValue: true
      - key: CORS_ORIGIN
        value: https://your-frontend.vercel.app
        
databases:
  - name: ibas-db
    databaseName: ibas_academic
    user: ibas_user`
    }
  }
};

// Modificar package.json para producción
function updatePackageJson(type, projectPath) {
  const packagePath = path.join(projectPath, 'package.json');
  
  if (!fs.existsSync(packagePath)) {
    log(`❌ package.json no encontrado en ${projectPath}`, 'red');
    return false;
  }
  
  const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
  
  if (type === 'backend') {
    // Scripts para backend
    pkg.scripts = {
      ...pkg.scripts,
      "start": "node dist/server.js",
      "build": "tsc",
      "deploy": "npm run build && npm run start"
    };
    
    // Engines para Railway/Render
    pkg.engines = {
      "node": ">=18.0.0",
      "npm": ">=8.0.0"
    };
    
  } else if (type === 'frontend') {
    // Scripts para frontend
    pkg.scripts = {
      ...pkg.scripts,
      "preview": "vite preview --host 0.0.0.0 --port $PORT"
    };
  }
  
  fs.writeFileSync(packagePath, JSON.stringify(pkg, null, 2));
  log(`✅ package.json actualizado para ${type}`, 'green');
  return true;
}

// Crear archivo de configuración .env para producción
function createProductionEnv(type, projectPath, config) {
  const envPath = path.join(projectPath, '.env.production');
  let envContent = '';
  
  if (type === 'backend') {
    envContent = `# Configuración para producción
NODE_ENV=production
PORT=\${PORT:-5000}

# Base de datos (Railway la configura automáticamente)
MONGODB_URI=\${MONGODB_URI}

# JWT Secrets (generar nuevos para producción)
JWT_SECRET=\${JWT_SECRET:-${generateSecret()}}
JWT_REFRESH_SECRET=\${JWT_REFRESH_SECRET:-${generateSecret()}}
COOKIE_SECRET=\${COOKIE_SECRET:-${generateSecret(32)}}

# CORS (actualizar con tu dominio de frontend)
CORS_ORIGIN=\${CORS_ORIGIN:-*}

# Configuración de la API
API_PREFIX=/api/v1
ENABLE_DOCS=false

# Rate limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100`;

  } else if (type === 'frontend') {
    envContent = `# Configuración para producción
VITE_API_BASE_URL=\${VITE_API_BASE_URL:-https://your-backend.onrender.com/api/v1}
VITE_APP_NAME=Sistema Académico IBAS
VITE_APP_VERSION=1.0.0`;
  }
  
  fs.writeFileSync(envPath, envContent);
  log(`✅ .env.production creado para ${type}`, 'green');
}

// Generar secreto aleatorio
function generateSecret(length = 64) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Preparar proyecto para Railway
async function prepareForRailway() {
  title('🚂 PREPARANDO PARA RAILWAY');
  
  // Verificar directorios
  const backendPath = 'backend';
  const frontendPath = 'ibas-frontend-refactorizado-completo';
  
  if (!fs.existsSync(backendPath)) {
    log('❌ Directorio backend no encontrado', 'red');
    return false;
  }
  
  if (!fs.existsSync(frontendPath)) {
    log('❌ Directorio frontend no encontrado', 'red');
    return false;
  }
  
  // Preparar backend
  log('📦 Configurando backend...', 'blue');
  fs.writeFileSync(path.join(backendPath, 'railway.toml'), deployConfigs.railway.files['railway.toml']);
  updatePackageJson('backend', backendPath);
  createProductionEnv('backend', backendPath);
  
  // Preparar frontend
  log('🎨 Configurando frontend...', 'blue');
  fs.writeFileSync(path.join(frontendPath, 'railway.toml'), deployConfigs.railway.files['railway.toml']);
  updatePackageJson('frontend', frontendPath);
  createProductionEnv('frontend', frontendPath);
  
  log('\n✅ Proyectos preparados para Railway!', 'green');
  log('\nSiguientes pasos:', 'yellow');
  log('1. Sube tu código a GitHub');
  log('2. Ve a https://railway.app y crea una cuenta');
  log('3. Crea un nuevo proyecto desde GitHub');
  log('4. Añade servicio MongoDB');
  log('5. Configura las variables de entorno');
  
  return true;
}

// Preparar proyecto para Vercel + Render
async function prepareForVercelRender() {
  title('🚀 PREPARANDO PARA VERCEL + RENDER');
  
  const backendPath = 'backend';
  const frontendPath = 'ibas-frontend-refactorizado-completo';
  
  // Preparar frontend para Vercel
  log('🎨 Configurando frontend para Vercel...', 'blue');
  fs.writeFileSync(path.join(frontendPath, 'vercel.json'), deployConfigs.vercel.files['vercel.json']);
  updatePackageJson('frontend', frontendPath);
  createProductionEnv('frontend', frontendPath);
  
  // Preparar backend para Render
  log('📦 Configurando backend para Render...', 'blue');
  fs.writeFileSync(path.join(backendPath, 'render.yaml'), deployConfigs.render.files['render.yaml']);
  updatePackageJson('backend', backendPath);
  createProductionEnv('backend', backendPath);
  
  log('\n✅ Proyectos preparados para Vercel + Render!', 'green');
  log('\nSiguientes pasos:', 'yellow');
  log('Frontend (Vercel):');
  log('1. Ve a https://vercel.com y conecta GitHub');
  log('2. Importa el repositorio del frontend');
  log('3. Configura VITE_API_BASE_URL');
  log('');
  log('Backend (Render):');
  log('1. Ve a https://render.com y conecta GitHub');
  log('2. Crea Web Service del backend');
  log('3. Configura variables de entorno');
  log('4. Usa MongoDB Atlas para la BD');
  
  return true;
}

// Crear instrucciones específicas
function createDeployInstructions(platform) {
  const instructionsPath = `DEPLOY_${platform.toUpperCase()}.md`;
  let content = '';
  
  if (platform === 'railway') {
    content = `# 🚂 Despliegue en Railway

## Pasos rápidos:

1. **Subir a GitHub:**
   \`\`\`bash
   git add .
   git commit -m "Preparado para Railway"
   git push origin main
   \`\`\`

2. **En Railway.app:**
   - Crear cuenta con GitHub
   - "New Project" → "Deploy from GitHub repo"
   - Seleccionar tu repositorio

3. **Añadir MongoDB:**
   - "Add Service" → "Database" → "MongoDB"

4. **Configurar variables del backend:**
   \`\`\`
   MONGODB_URI=\${MONGO_URL}
   JWT_SECRET=tu-jwt-secret-seguro
   CORS_ORIGIN=https://tu-frontend.up.railway.app
   \`\`\`

5. **Configurar variables del frontend:**
   \`\`\`
   VITE_API_BASE_URL=https://tu-backend.up.railway.app/api/v1
   \`\`\`

6. **Poblar base de datos:**
   - Ir a tu backend URL + /admin/seed
   - O usar Railway CLI para ejecutar npm run seed

## URLs finales:
- Frontend: https://tu-proyecto-frontend.up.railway.app
- Backend: https://tu-proyecto-backend.up.railway.app/api/v1
`;
  }
  
  fs.writeFileSync(instructionsPath, content);
  log(`✅ Instrucciones creadas: ${instructionsPath}`, 'green');
}

// Función principal
async function main() {
  try {
    log('🌐 PREPARACIÓN PARA DESPLIEGUE GRATUITO', 'bright');
    log('Sistema Académico IBAS\n', 'cyan');
    
    log('Opciones disponibles:', 'yellow');
    log('1. Railway (Todo en uno) - Recomendado para principiantes');
    log('2. Vercel + Render - Mejor rendimiento');
    log('3. Mostrar todas las opciones gratuitas disponibles');
    
    const choice = await ask('\nElige una opción (1-3): ');
    
    switch (choice) {
      case '1':
        await prepareForRailway();
        createDeployInstructions('railway');
        break;
        
      case '2':
        await prepareForVercelRender();
        createDeployInstructions('vercel_render');
        break;
        
      case '3':
        title('📋 TODAS LAS OPCIONES GRATUITAS');
        Object.entries(deployConfigs).forEach(([key, config]) => {
          log(`\n${config.name}:`, 'green');
          log(`  ${config.description}`, 'blue');
        });
        
        log('\nOtras opciones:', 'green');
        log('  • Glitch.com - Prototipos rápidos', 'blue');
        log('  • CodeSandbox - Desarrollo online', 'blue');
        log('  • Cyclic.sh - APIs Node.js', 'blue');
        log('  • Netlify - Frontend estático', 'blue');
        break;
        
      default:
        log('❌ Opción no válida', 'red');
        break;
    }
    
    if (choice === '1' || choice === '2') {
      log('\n📖 Archivos creados:', 'bright');
      log('  • Configuraciones de despliegue');
      log('  • package.json actualizado');
      log('  • Variables de entorno para producción');
      log('  • Instrucciones específicas');
      
      log('\n🎯 Próximo paso:', 'bright');
      log('¡Sube tu código a GitHub y sigue las instrucciones!', 'green');
    }
    
  } catch (error) {
    log(`\n💥 Error: ${error.message}`, 'red');
  } finally {
    rl.close();
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  main();
}

module.exports = { main, prepareForRailway, prepareForVercelRender };
