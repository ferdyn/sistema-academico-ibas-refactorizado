import crypto from 'crypto';

/**
 * Script para generar secretos seguros para JWT y otras configuraciones
 */

const generateSecrets = () => {
  console.log('🔐 Generando secretos seguros para el backend...\n');

  const jwtSecret = crypto.randomBytes(64).toString('hex');
  const refreshSecret = crypto.randomBytes(64).toString('hex');
  const cookieSecret = crypto.randomBytes(32).toString('hex');

  console.log('📝 Copia estos valores en tu archivo .env:\n');
  
  console.log('# JWT Secrets');
  console.log(`JWT_SECRET=${jwtSecret}`);
  console.log(`JWT_REFRESH_SECRET=${refreshSecret}`);
  console.log('');
  
  console.log('# Cookie Secret');
  console.log(`COOKIE_SECRET=${cookieSecret}`);
  console.log('');
  
  console.log('✅ Secretos generados exitosamente!');
  console.log('');
  console.log('💡 Consejos de seguridad:');
  console.log('   - Nunca compartas estos secretos');
  console.log('   - Usa secretos diferentes para desarrollo y producción');
  console.log('   - Almacena los secretos de producción de forma segura');
  console.log('   - Regenera los secretos periódicamente en producción');
};

// Ejecutar si este archivo es llamado directamente
if (require.main === module) {
  generateSecrets();
}

export default generateSecrets;
