// Script para probar el backend independientemente
const baseURL = 'http://localhost:5000';

async function testBackend() {
  console.log('🧪 Probando Backend del Sistema IBAS...\n');

  // Test 1: Health Check
  console.log('1️⃣ Probando Health Check...');
  try {
    const response = await fetch(`${baseURL}/api/v1/health`);
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Health Check OK:', data);
    } else {
      console.log('❌ Health Check failed:', response.status);
      return false;
    }
  } catch (error) {
    console.log('❌ Backend no responde:', error.message);
    console.log('\n💡 Posibles soluciones:');
    console.log('   - Asegúrate de que el backend esté corriendo: npm run dev');
    console.log('   - Verifica que esté en el puerto 5000');
    console.log('   - Revisa que MongoDB esté conectado');
    return false;
  }

  // Test 2: Login
  console.log('\n2️⃣ Probando Login...');
  try {
    const loginData = {
      email: 'admin@ibas.edu',
      password: 'admin123'
    };

    const response = await fetch(`${baseURL}/api/v1/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(loginData)
    });

    if (response.ok) {
      const data = await response.json();
      console.log('✅ Login exitoso');
      console.log('   Usuario:', data.data?.user?.nombre);
      console.log('   Rol:', data.data?.user?.rol);
      
      // Guardar token para siguientes pruebas
      const token = data.data?.tokens?.accessToken;
      
      // Test 3: Endpoint protegido
      console.log('\n3️⃣ Probando endpoint protegido...');
      const protectedResponse = await fetch(`${baseURL}/api/v1/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (protectedResponse.ok) {
        const userData = await protectedResponse.json();
        console.log('✅ Endpoint protegido funciona');
        console.log('   Email:', userData.data?.email);
      } else {
        console.log('❌ Endpoint protegido falló:', protectedResponse.status);
      }

    } else {
      const errorData = await response.json();
      console.log('❌ Login falló:', response.status);
      console.log('   Error:', errorData.message);
      console.log('\n💡 Posibles causas:');
      console.log('   - La base de datos no tiene datos (ejecuta: npm run seed)');
      console.log('   - Credenciales incorrectas');
      console.log('   - Problema con JWT secrets');
    }
  } catch (error) {
    console.log('❌ Error en login:', error.message);
  }

  console.log('\n🎉 Pruebas del backend completadas!');
  return true;
}

// Ejecutar si se llama directamente
if (typeof window === 'undefined') {
  testBackend();
}

module.exports = { testBackend };
