import Database from '@/config/database';

/**
 * Script para probar la conexión a MongoDB
 */
const testConnection = async () => {
  try {
    console.log('🔍 Probando conexión a MongoDB...\n');

    // Intentar conectar
    await Database.connect();
    
    // Verificar salud de la base de datos
    const health = Database.isHealthy();
    console.log(`✅ Estado de la conexión: ${health ? 'SALUDABLE' : 'NO SALUDABLE'}`);
    
    // Obtener información de la conexión
    const connection = Database.getConnection();
    console.log(`📍 Host: ${connection.host}`);
    console.log(`📊 Base de datos: ${connection.name}`);
    console.log(`🔌 Estado: ${getReadyStateText(connection.readyState)}`);
    
    // Probar una operación simple
    const collections = await connection.db.listCollections().toArray();
    console.log(`📂 Colecciones disponibles: ${collections.length}`);
    
    if (collections.length > 0) {
      console.log('   Colecciones encontradas:');
      collections.forEach(col => {
        console.log(`   - ${col.name}`);
      });
    }
    
    console.log('\n🎉 ¡Conexión a MongoDB exitosa!');
    
    return true;
    
  } catch (error: any) {
    console.error('\n❌ Error de conexión a MongoDB:');
    console.error(`   Mensaje: ${error.message}`);
    
    if (error.message.includes('ECONNREFUSED')) {
      console.error('\n💡 Posibles soluciones:');
      console.error('   1. Verificar que MongoDB esté corriendo');
      console.error('   2. Comprobar la URL de conexión en .env');
      console.error('   3. Verificar que el puerto 27017 esté disponible');
    }
    
    if (error.message.includes('authentication failed')) {
      console.error('\n💡 Problema de autenticación:');
      console.error('   1. Verificar usuario y contraseña en MONGODB_URI');
      console.error('   2. Comprobar que el usuario tenga permisos');
    }
    
    if (error.message.includes('getaddrinfo ENOTFOUND')) {
      console.error('\n💡 Problema de DNS/Red:');
      console.error('   1. Verificar la URL del servidor MongoDB');
      console.error('   2. Comprobar conexión a internet (si es Atlas)');
    }
    
    return false;
    
  } finally {
    await Database.disconnect();
  }
};

const getReadyStateText = (state: number): string => {
  switch (state) {
    case 0: return 'Desconectado';
    case 1: return 'Conectado';
    case 2: return 'Conectando';
    case 3: return 'Desconectando';
    case 99: return 'No inicializado';
    default: return 'Estado desconocido';
  }
};

// Ejecutar test si este archivo es llamado directamente
if (require.main === module) {
  testConnection().then((success) => {
    process.exit(success ? 0 : 1);
  });
}

export default testConnection;
