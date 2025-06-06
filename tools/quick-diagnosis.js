// Quick integration diagnosis - No external dependencies
// Ejecutar con: node quick-diagnosis.js

const http = require('http');
const https = require('https');
const { URL } = require('url');

const BACKEND_URL = 'http://localhost:5000';
const API_BASE = `${BACKEND_URL}/api/v1`;

// Simple HTTP request function
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const client = urlObj.protocol === 'https:' ? https : http;
    
    const requestOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port || (urlObj.protocol === 'https:' ? 443 : 80),
      path: urlObj.pathname + urlObj.search,
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    };

    const req = client.request(requestOptions, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({
            success: res.statusCode >= 200 && res.statusCode < 300,
            status: res.statusCode,
            data: jsonData,
            headers: res.headers
          });
        } catch (e) {
          resolve({
            success: res.statusCode >= 200 && res.statusCode < 300,
            status: res.statusCode,
            data: data,
            headers: res.headers
          });
        }
      });
    });

    req.on('error', (err) => {
      resolve({
        success: false,
        error: err.message
      });
    });

    if (options.body) {
      req.write(typeof options.body === 'string' ? options.body : JSON.stringify(options.body));
    }

    req.end();
  });
}

// Colors for console output
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
  log(`\\n${'='.repeat(50)}`, 'cyan');
  log(`  ${message}`, 'bright');
  log('='.repeat(50), 'cyan');
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

// Test backend health
async function testBackendHealth() {
  title('🔧 PROBANDO BACKEND');
  
  info('Verificando health check...');
  const healthResult = await makeRequest(`${API_BASE}/health`);
  
  if (healthResult.success) {
    success('Backend responde correctamente');
    if (healthResult.data?.data) {
      info(`Base de datos: ${healthResult.data.data.database || 'unknown'}`);
      info(`Entorno: ${healthResult.data.data.environment || 'unknown'}`);
    }
    return true;
  } else {
    error(`Backend no responde: ${healthResult.error || healthResult.status}`);
    
    if (healthResult.error?.includes('ECONNREFUSED')) {
      info('El backend no está corriendo en el puerto 5000');
      info('Ejecuta: cd backend && npm run dev');
    }
    
    return false;
  }
}

// Test authentication
async function testAuthentication() {
  title('🔐 PROBANDO AUTENTICACIÓN');
  
  const loginData = {
    email: 'admin@ibas.edu',
    password: 'admin123'
  };
  
  info('Intentando login con admin...');
  const loginResult = await makeRequest(`${API_BASE}/auth/login`, {
    method: 'POST',
    body: JSON.stringify(loginData)
  });
  
  if (loginResult.success) {
    success('Login exitoso');
    const token = loginResult.data?.data?.tokens?.accessToken;
    
    if (token) {
      success('Token JWT recibido');
      
      // Test protected endpoint
      info('Probando endpoint protegido...');
      const meResult = await makeRequest(`${API_BASE}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (meResult.success) {
        success('Endpoint protegido funciona correctamente');
        info(`Usuario autenticado: ${meResult.data?.data?.email || 'unknown'}`);
        return true;
      } else {
        error('Endpoint protegido falló');
        return false;
      }
    } else {
      error('Token JWT no recibido en la respuesta');
      return false;
    }
  } else {
    error(`Login falló: ${loginResult.error || loginResult.data?.message || loginResult.status}`);
    
    if (loginResult.data?.message?.includes('Usuario no encontrado') || 
        loginResult.data?.message?.includes('not found')) {
      warning('La base de datos puede estar vacía');
      info('Ejecuta: cd backend && npm run seed');
    }
    
    return false;
  }
}

// Test CORS configuration
async function testCORS() {
  title('🌐 PROBANDO CORS');
  
  info('Verificando headers CORS...');
  const corsResult = await makeRequest(`${API_BASE}/health`, {
    method: 'OPTIONS'
  });
  
  if (corsResult.success || corsResult.status === 204) {
    const headers = corsResult.headers || {};
    
    if (headers['access-control-allow-origin']) {
      success(`CORS Allow-Origin: ${headers['access-control-allow-origin']}`);
    } else {
      warning('Header Access-Control-Allow-Origin no encontrado');
    }
    
    if (headers['access-control-allow-methods']) {
      success(`CORS Allow-Methods: ${headers['access-control-allow-methods']}`);
    }
    
    if (headers['access-control-allow-headers']) {
      success(`CORS Allow-Headers: ${headers['access-control-allow-headers']}`);
    }
    
    return true;
  } else {
    warning('No se pudo verificar CORS completamente');
    return false;
  }
}

// Generate final report
function generateReport(results) {
  title('📊 REPORTE FINAL');
  
  log('\\nEstado de la integración:', 'bright');
  log(`Backend Health: ${results.health ? '🟢 OK' : '🔴 ERROR'}`);
  log(`Autenticación: ${results.auth ? '🟢 OK' : '🔴 ERROR'}`);
  log(`CORS: ${results.cors ? '🟢 OK' : '🟠 REVISAR'}`);
  
  log('\\nPróximos pasos:', 'bright');
  
  if (!results.health) {
    log('\\n1. Backend no está funcionando:', 'red');
    log('   cd backend');
    log('   npm install  # Si no has instalado dependencias');
    log('   npm run dev  # Para iniciar el servidor');
  }
  
  if (!results.auth) {
    log('\\n2. Problemas de autenticación:', 'red');
    log('   cd backend');
    log('   npm run test-db  # Verificar conexión a DB');
    log('   npm run seed     # Poblar con datos de prueba');
  }
  
  if (results.health && results.auth) {
    log('\\n✅ Backend funcionando correctamente!', 'green');
    log('\\nPuedes continuar con el frontend:', 'bright');
    log('   cd ibas-frontend-refactorizado-completo');
    log('   npm install  # Si no has instalado dependencias');
    log('   npm run dev  # Para iniciar el frontend');
  }
  
  log('\\nUsuarios de prueba disponibles:', 'bright');
  log('   admin@ibas.edu / admin123 (Administrador)');
  log('   jsanchez@ibas.edu / maestro123 (Maestro)');
  log('   pedro.garcia@estudiante.ibas.edu / alumno123 (Alumno)');
  
  log('\\nHerramientas adicionales:', 'bright');
  log('   Test visual: Abrir integration-test/test-frontend.html');
  log('   Diagnóstico completo: node integration-test/diagnose-integration.js');
}

// Main function
async function main() {
  log('🚀 DIAGNÓSTICO RÁPIDO DE INTEGRACIÓN', 'bright');
  log('Sistema Académico IBAS\\n', 'cyan');
  
  try {
    const health = await testBackendHealth();
    const auth = health ? await testAuthentication() : false;
    const cors = health ? await testCORS() : false;
    
    const results = { health, auth, cors };
    generateReport(results);
    
    if (health && auth) {
      log('\\n🎉 ¡Integración funcionando! Puedes usar la aplicación.', 'green');
    } else {
      log('\\n⚠️  Se encontraron problemas. Sigue los pasos del reporte.', 'yellow');
    }
    
  } catch (error) {
    log(`\\n💥 Error durante el diagnóstico: ${error.message}`, 'red');
    log('Verifica que Node.js esté correctamente instalado.', 'yellow');
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { main, testBackendHealth, testAuthentication, testCORS };
