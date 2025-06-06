#!/usr/bin/env node

/**
 * Script completo para diagnosticar problemas de integración Frontend-Backend
 * Ejecutar con: node diagnose-integration.js
 */

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const util = require('util');
const execAsync = util.promisify(exec);

const BACKEND_URL = 'http://localhost:5000';
const FRONTEND_URL = 'http://localhost:5173';
const API_BASE = `${BACKEND_URL}/api/v1`;

// Colores para la consola
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
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

function success(message) {
  log(`✅ ${message}`, 'green');
}

function error(message) {
  log(`❌ ${message}`, 'red');
}

function warning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

function info(message) {
  log(`ℹ️  ${message}`, 'blue');
}

// Función para hacer requests HTTP
async function makeRequest(url, options = {}) {
  try {
    const fetch = (await import('node-fetch')).default;
    const response = await fetch(url, options);
    const data = await response.json();
    return { success: response.ok, status: response.status, data, response };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

// Verificar si un puerto está siendo usado
async function checkPort(port) {
  try {
    const { stdout } = await execAsync(`lsof -ti:${port}`, { timeout: 5000 });
    return stdout.trim() !== '';
  } catch {
    return false;
  }
}

// Verificar archivos de configuración
function checkConfigFiles() {
  title('🔍 VERIFICANDO ARCHIVOS DE CONFIGURACIÓN');
  
  const backendPath = path.join(process.cwd(), '..', 'backend');
  const frontendPath = path.join(process.cwd(), '..', 'ibas-frontend-refactorizado-completo');
  
  // Verificar .env del backend
  const backendEnv = path.join(backendPath, '.env');
  if (fs.existsSync(backendEnv)) {
    success('Backend .env existe');
    const envContent = fs.readFileSync(backendEnv, 'utf8');
    
    if (envContent.includes('MONGODB_URI')) {
      success('MONGODB_URI configurado');
    } else {
      error('MONGODB_URI no encontrado en .env');
    }
    
    if (envContent.includes('JWT_SECRET')) {
      success('JWT_SECRET configurado');
    } else {
      error('JWT_SECRET no encontrado en .env');
    }
  } else {
    error('Backend .env no encontrado');
    info('Crea el archivo .env en /backend con las variables necesarias');
  }
  
  // Verificar package.json del backend
  const backendPackage = path.join(backendPath, 'package.json');
  if (fs.existsSync(backendPackage)) {
    success('Backend package.json existe');
  } else {
    error('Backend package.json no encontrado');
  }
  
  // Verificar package.json del frontend
  const frontendPackage = path.join(frontendPath, 'package.json');
  if (fs.existsSync(frontendPackage)) {
    success('Frontend package.json existe');
  } else {
    error('Frontend package.json no encontrado');
  }
}

// Verificar puertos
async function checkPorts() {
  title('🔌 VERIFICANDO PUERTOS');
  
  const backendRunning = await checkPort(5000);
  const frontendRunning = await checkPort(5173);
  
  if (backendRunning) {
    success('Backend corriendo en puerto 5000');
  } else {
    error('Backend NO está corriendo en puerto 5000');
    info('Ejecuta: cd backend && npm run dev');
  }
  
  if (frontendRunning) {
    success('Frontend corriendo en puerto 5173');
  } else {
    warning('Frontend NO está corriendo en puerto 5173');
    info('Ejecuta: cd ibas-frontend-refactorizado-completo && npm run dev');
  }
  
  return { backend: backendRunning, frontend: frontendRunning };
}

// Probar backend
async function testBackend() {
  title('🔧 PROBANDO BACKEND');
  
  // Health check
  info('Probando health check...');
  const healthCheck = await makeRequest(`${API_BASE}/health`);
  
  if (healthCheck.success) {
    success('Health check exitoso');
    info(`Base de datos: ${healthCheck.data?.data?.database || 'unknown'}`);
    info(`Versión: ${healthCheck.data?.data?.version || 'unknown'}`);
  } else {
    error(`Health check falló: ${healthCheck.error || healthCheck.status}`);
    return false;
  }
  
  // Test de login
  info('Probando autenticación...');
  const loginData = {
    email: 'admin@ibas.edu',
    password: 'admin123'
  };
  
  const loginResult = await makeRequest(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(loginData)
  });
  
  if (loginResult.success) {
    success('Login exitoso');
    const token = loginResult.data?.data?.tokens?.accessToken;
    
    if (token) {
      success('Token JWT recibido');
      
      // Test endpoint protegido
      info('Probando endpoint protegido...');
      const protectedResult = await makeRequest(`${API_BASE}/auth/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (protectedResult.success) {
        success('Endpoint protegido funciona');
        return true;
      } else {
        error('Endpoint protegido falló');
        return false;
      }
    } else {
      error('Token JWT no recibido');
      return false;
    }
  } else {
    error(`Login falló: ${loginResult.error || loginResult.data?.message}`);
    
    if (loginResult.data?.message?.includes('Usuario no encontrado')) {
      warning('La base de datos puede estar vacía');
      info('Ejecuta: cd backend && npm run seed');
    }
    
    return false;
  }
}

// Probar CORS
async function testCORS() {
  title('🌐 PROBANDO CONFIGURACIÓN CORS');
  
  try {
    const fetch = (await import('node-fetch')).default;
    const response = await fetch(`${API_BASE}/health`, {
      method: 'OPTIONS'
    });
    
    const allowOrigin = response.headers.get('access-control-allow-origin');
    const allowMethods = response.headers.get('access-control-allow-methods');
    const allowHeaders = response.headers.get('access-control-allow-headers');
    
    if (allowOrigin) {
      success(`CORS Allow-Origin: ${allowOrigin}`);
    } else {
      warning('CORS Allow-Origin no configurado');
    }
    
    if (allowMethods) {
      success(`CORS Allow-Methods: ${allowMethods}`);
    } else {
      warning('CORS Allow-Methods no configurado');
    }
    
    if (allowHeaders) {
      success(`CORS Allow-Headers: ${allowHeaders}`);
    } else {
      warning('CORS Allow-Headers no configurado');
    }
    
    return true;
  } catch (err) {
    error(`Error probando CORS: ${err.message}`);
    return false;
  }
}

// Generar reporte
function generateReport(results) {
  title('📊 REPORTE DE DIAGNÓSTICO');
  
  log('\\nEstado de los servicios:', 'bright');
  log(`Backend: ${results.ports.backend ? '🟢 Online' : '🔴 Offline'}`);
  log(`Frontend: ${results.ports.frontend ? '🟢 Online' : '🔴 Offline'}`);
  log(`API: ${results.backend ? '🟢 Funcional' : '🔴 Con problemas'}`);
  log(`CORS: ${results.cors ? '🟢 Configurado' : '🟠 Revisar'}`);
  
  log('\\nPróximos pasos:', 'bright');
  
  if (!results.ports.backend) {
    log('1. Iniciar el backend:', 'yellow');
    log('   cd backend && npm install && npm run dev');
  }
  
  if (!results.backend) {
    log('2. Verificar configuración del backend:', 'yellow');
    log('   - Revisar archivo .env');
    log('   - Verificar conexión a MongoDB');
    log('   - Ejecutar: npm run seed (para datos de prueba)');
  }
  
  if (!results.ports.frontend) {
    log('3. Iniciar el frontend:', 'yellow');
    log('   cd ibas-frontend-refactorizado-completo && npm install && npm run dev');
  }
  
  if (!results.cors) {
    log('4. Revisar configuración CORS:', 'yellow');
    log('   - Verificar origins permitidos en backend');
    log('   - Asegurar que el frontend use la URL correcta del backend');
  }
  
  log('\\n5. Usar el test visual:', 'bright');
  log('   Abrir: integration-test/test-frontend.html en el navegador');
  log('   Para probar la integración completa de forma interactiva');
}

// Función principal
async function main() {
  try {
    log('🚀 DIAGNÓSTICO DE INTEGRACIÓN FRONTEND-BACKEND', 'bright');
    log('Sistema Académico IBAS\\n', 'cyan');
    
    checkConfigFiles();
    
    const ports = await checkPorts();
    const backend = ports.backend ? await testBackend() : false;
    const cors = ports.backend ? await testCORS() : false;
    
    const results = { ports, backend, cors };
    generateReport(results);
    
    if (ports.backend && backend && cors) {
      log('\\n🎉 ¡Integración funcionando correctamente!', 'green');
      log('Puedes proceder a usar la aplicación.\\n', 'green');
    } else {
      log('\\n⚠️  Se encontraron problemas que necesitan atención.', 'yellow');
      log('Sigue los pasos del reporte para solucionarlos.\\n', 'yellow');
    }
    
  } catch (error) {
    log(`\\n💥 Error durante el diagnóstico: ${error.message}`, 'red');
    process.exit(1);
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  main();
}

module.exports = { main, testBackend, testCORS, checkPorts };
