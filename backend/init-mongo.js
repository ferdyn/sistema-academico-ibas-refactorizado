// Script de inicialización para MongoDB en Docker
// Este script se ejecuta automáticamente cuando se inicia el contenedor

print('🚀 Iniciando configuración de MongoDB para IBAS...');

// Cambiar a la base de datos del proyecto
db = db.getSiblingDB('ibas_academic');

// Crear usuario específico para la aplicación
db.createUser({
  user: 'ibas_user',
  pwd: 'ibas_password',
  roles: [
    {
      role: 'readWrite',
      db: 'ibas_academic'
    },
    {
      role: 'readWrite', 
      db: 'ibas_academic_test'
    }
  ]
});

print('✅ Usuario ibas_user creado con permisos de lectura/escritura');

// Crear colecciones principales
const collections = [
  'users',
  'niveles', 
  'materias',
  'cursos',
  'inscripciones',
  'calificaciones',
  'tareas',
  'entregas',
  'examenes',
  'resultados',
  'pagos',
  'nominas',
  'eventos',
  'notificaciones',
  'configuraciones'
];

collections.forEach(collectionName => {
  db.createCollection(collectionName);
  print(`📄 Colección '${collectionName}' creada`);
});

// Crear índices básicos para performance
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ rol: 1 });
db.cursos.createIndex({ materiaId: 1 });
db.cursos.createIndex({ maestroId: 1 });
db.inscripciones.createIndex({ cursoId: 1, alumnoId: 1 }, { unique: true });
db.tareas.createIndex({ cursoId: 1 });
db.pagos.createIndex({ alumnoId: 1 });

print('📊 Índices básicos creados para optimización');

// Configurar base de datos de testing
db = db.getSiblingDB('ibas_academic_test');
collections.forEach(collectionName => {
  db.createCollection(collectionName);
});

print('🧪 Base de datos de testing configurada');

print('🎉 Configuración de MongoDB completada exitosamente!');
print('');
print('📋 Información de conexión:');
print('   Host: localhost:27017');
print('   Usuario: ibas_user');
print('   Contraseña: ibas_password');
print('   Base de datos: ibas_academic');
print('   String de conexión: mongodb://ibas_user:ibas_password@localhost:27017/ibas_academic');
print('');
print('🌐 Mongo Express disponible en: http://localhost:8081');
print('   Usuario: admin');
print('   Contraseña: admin123');
