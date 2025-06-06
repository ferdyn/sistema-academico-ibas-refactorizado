import Database from '@/config/database';
import { User, Nivel, Materia, Curso, Inscripcion, Tarea, Pago } from '@/models';
import { UserRole } from '@/types';

/**
 * Script para poblar la base de datos con datos de prueba
 */

const seedUsers = async () => {
  console.log('📤 Creando usuarios...');

  const users = [
    // Administrador
    {
      email: 'admin@ibas.edu',
      password: 'admin123',
      nombre: 'Carlos',
      apellido: 'Mendoza',
      telefono: '+58 414-123-4567',
      direccion: 'Caracas, Venezuela',
      fechaNacimiento: new Date('1975-03-15'),
      rol: 'administrador' as UserRole,
      activo: true,
      emailVerificado: true
    },
    
    // Maestros
    {
      email: 'jsanchez@ibas.edu',
      password: 'maestro123',
      nombre: 'José',
      apellido: 'Sánchez',
      telefono: '+58 412-987-6543',
      direccion: 'Valencia, Venezuela',
      fechaNacimiento: new Date('1980-07-22'),
      rol: 'maestro' as UserRole,
      activo: true,
      emailVerificado: true
    },
    {
      email: 'mrodriguez@ibas.edu',
      password: 'maestro123',
      nombre: 'María',
      apellido: 'Rodríguez',
      telefono: '+58 424-555-7890',
      direccion: 'Maracaibo, Venezuela',
      fechaNacimiento: new Date('1978-11-10'),
      rol: 'maestro' as UserRole,
      activo: true,
      emailVerificado: true
    },
    
    // Alumnos
    {
      email: 'pedro.garcia@estudiante.ibas.edu',
      password: 'alumno123',
      nombre: 'Pedro',
      apellido: 'García',
      telefono: '+58 426-111-2222',
      direccion: 'Barquisimeto, Venezuela',
      fechaNacimiento: new Date('2000-05-18'),
      rol: 'alumno' as UserRole,
      activo: true,
      emailVerificado: true
    },
    {
      email: 'ana.lopez@estudiante.ibas.edu',
      password: 'alumno123',
      nombre: 'Ana',
      apellido: 'López',
      telefono: '+58 414-333-4444',
      direccion: 'Maracay, Venezuela',
      fechaNacimiento: new Date('1999-12-03'),
      rol: 'alumno' as UserRole,
      activo: true,
      emailVerificado: true
    },
    {
      email: 'luis.martinez@estudiante.ibas.edu',
      password: 'alumno123',
      nombre: 'Luis',
      apellido: 'Martínez',
      telefono: '+58 412-555-6666',
      direccion: 'San Cristóbal, Venezuela',
      fechaNacimiento: new Date('2001-08-25'),
      rol: 'alumno' as UserRole,
      activo: true,
      emailVerificado: true
    }
  ];

  const createdUsers = await User.insertMany(users);
  console.log(`✅ ${createdUsers.length} usuarios creados`);
  
  return createdUsers;
};

const seedNiveles = async () => {
  console.log('📤 Creando niveles académicos...');

  const niveles = [
    {
      nombre: 'Básico',
      descripcion: 'Nivel básico de educación',
      orden: 1,
      activo: true
    },
    {
      nombre: 'Intermedio',
      descripcion: 'Nivel intermedio de educación',
      orden: 2,
      activo: true
    },
    {
      nombre: 'Avanzado',
      descripcion: 'Nivel avanzado de educación',
      orden: 3,
      activo: true
    }
  ];

  const createdNiveles = await Nivel.insertMany(niveles);
  console.log(`✅ ${createdNiveles.length} niveles creados`);
  
  return createdNiveles;
};

const seedMaterias = async (niveles: any[]) => {
  console.log('📤 Creando materias...');

  const materias = [
    // Nivel Básico
    {
      codigo: 'MAT101',
      nombre: 'Matemáticas Básicas',
      descripcion: 'Fundamentos de matemáticas: aritmética, álgebra básica y geometría',
      creditos: 4,
      nivelId: niveles[0]._id,
      prerequisitos: [],
      activa: true
    },
    {
      codigo: 'ESP101',
      nombre: 'Español y Literatura',
      descripcion: 'Fundamentos de lengua española, gramática y literatura básica',
      creditos: 3,
      nivelId: niveles[0]._id,
      prerequisitos: [],
      activa: true
    },
    {
      codigo: 'CIE101',
      nombre: 'Ciencias Naturales',
      descripcion: 'Introducción a la biología, química y física',
      creditos: 4,
      nivelId: niveles[0]._id,
      prerequisitos: [],
      activa: true
    },
    
    // Nivel Intermedio
    {
      codigo: 'MAT201',
      nombre: 'Álgebra Intermedia',
      descripcion: 'Ecuaciones, funciones y sistemas algebraicos',
      creditos: 4,
      nivelId: niveles[1]._id,
      prerequisitos: [],
      activa: true
    },
    {
      codigo: 'FIS201',
      nombre: 'Física General',
      descripcion: 'Mecánica clásica, termodinámica y ondas',
      creditos: 5,
      nivelId: niveles[1]._id,
      prerequisitos: [],
      activa: true
    },
    
    // Nivel Avanzado
    {
      codigo: 'CAL301',
      nombre: 'Cálculo Diferencial',
      descripcion: 'Límites, derivadas y aplicaciones del cálculo diferencial',
      creditos: 5,
      nivelId: niveles[2]._id,
      prerequisitos: [],
      activa: true
    }
  ];

  const createdMaterias = await Materia.insertMany(materias);
  
  // Agregar prerequisitos después de crear todas las materias
  await Materia.findByIdAndUpdate(createdMaterias[3]._id, {
    prerequisitos: [createdMaterias[0]._id] // Álgebra Intermedia requiere Matemáticas Básicas
  });
  
  await Materia.findByIdAndUpdate(createdMaterias[5]._id, {
    prerequisitos: [createdMaterias[3]._id] // Cálculo requiere Álgebra Intermedia
  });

  console.log(`✅ ${createdMaterias.length} materias creadas`);
  
  return createdMaterias;
};

const seedCursos = async (materias: any[], maestros: any[]) => {
  console.log('📤 Creando cursos...');

  const fechaInicio = new Date();
  fechaInicio.setDate(fechaInicio.getDate() + 7); // Curso inicia en una semana
  
  const fechaFin = new Date(fechaInicio);
  fechaFin.setMonth(fechaFin.getMonth() + 4); // Curso dura 4 meses

  const cursos = [
    {
      materiaId: materias[0]._id,
      maestroId: maestros[0]._id, // José Sánchez
      nombre: 'Matemáticas Básicas - Grupo A',
      descripcion: 'Curso introductorio de matemáticas para estudiantes principiantes',
      fechaInicio,
      fechaFin,
      modalidad: 'presencial',
      aula: 'Aula 101',
      horario: 'Lunes y Miércoles 8:00-10:00 AM',
      cupoMaximo: 25,
      activo: true,
      estudiantesInscritos: 0
    },
    {
      materiaId: materias[1]._id,
      maestroId: maestros[1]._id, // María Rodríguez
      nombre: 'Español y Literatura - Grupo A',
      descripcion: 'Desarrollo de habilidades de comunicación oral y escrita',
      fechaInicio,
      fechaFin,
      modalidad: 'hibrida',
      aula: 'Aula 102',
      horario: 'Martes y Jueves 2:00-4:00 PM',
      cupoMaximo: 20,
      activo: true,
      estudiantesInscritos: 0
    },
    {
      materiaId: materias[2]._id,
      maestroId: maestros[0]._id, // José Sánchez
      nombre: 'Ciencias Naturales - Grupo A',
      descripcion: 'Exploración de conceptos fundamentales de ciencias naturales',
      fechaInicio,
      fechaFin,
      modalidad: 'virtual',
      horario: 'Viernes 10:00-12:00 PM',
      cupoMaximo: 30,
      activo: true,
      estudiantesInscritos: 0
    }
  ];

  const createdCursos = await Curso.insertMany(cursos);
  console.log(`✅ ${createdCursos.length} cursos creados`);
  
  return createdCursos;
};

const seedInscripciones = async (cursos: any[], alumnos: any[]) => {
  console.log('📤 Creando inscripciones...');

  const inscripciones = [
    // Pedro García inscrito en todos los cursos
    {
      cursoId: cursos[0]._id,
      alumnoId: alumnos[0]._id,
      fechaInscripcion: new Date(),
      estado: 'inscrito'
    },
    {
      cursoId: cursos[1]._id,
      alumnoId: alumnos[0]._id,
      fechaInscripcion: new Date(),
      estado: 'inscrito'
    },
    
    // Ana López inscrita en 2 cursos
    {
      cursoId: cursos[0]._id,
      alumnoId: alumnos[1]._id,
      fechaInscripcion: new Date(),
      estado: 'inscrito'
    },
    {
      cursoId: cursos[2]._id,
      alumnoId: alumnos[1]._id,
      fechaInscripcion: new Date(),
      estado: 'inscrito'
    },
    
    // Luis Martínez inscrito en 1 curso
    {
      cursoId: cursos[1]._id,
      alumnoId: alumnos[2]._id,
      fechaInscripcion: new Date(),
      estado: 'inscrito'
    }
  ];

  const createdInscripciones = await Inscripcion.insertMany(inscripciones);
  
  // Actualizar contador de estudiantes en cursos
  for (const curso of cursos) {
    const count = createdInscripciones.filter(i => 
      i.cursoId.toString() === curso._id.toString()
    ).length;
    
    await Curso.findByIdAndUpdate(curso._id, {
      estudiantesInscritos: count
    });
  }

  console.log(`✅ ${createdInscripciones.length} inscripciones creadas`);
  
  return createdInscripciones;
};

const seedTareas = async (cursos: any[]) => {
  console.log('📤 Creando tareas...');

  const fechaVencimiento = new Date();
  fechaVencimiento.setDate(fechaVencimiento.getDate() + 14); // Vence en 2 semanas

  const tareas = [
    {
      cursoId: cursos[0]._id,
      titulo: 'Ejercicios de Aritmética Básica',
      descripcion: 'Resolver los ejercicios del capítulo 1 del libro de texto. Incluye operaciones básicas con números enteros y decimales.',
      fechaVencimiento,
      puntaje: 20,
      activa: true,
      instrucciones: 'Resuelva todos los ejercicios mostrando el procedimiento completo. Entregue en formato PDF.',
      criteriosEvaluacion: 'Se evaluará procedimiento (60%), resultado correcto (30%) y presentación (10%)'
    },
    {
      cursoId: cursos[1]._id,
      titulo: 'Ensayo sobre Literatura Venezolana',
      descripcion: 'Escribir un ensayo de 500 palabras sobre un autor venezolano de su elección.',
      fechaVencimiento,
      puntaje: 25,
      activa: true,
      instrucciones: 'El ensayo debe incluir introducción, desarrollo y conclusión. Mínimo 3 fuentes bibliográficas.',
      criteriosEvaluacion: 'Contenido (40%), estructura (30%), ortografía y gramática (20%), fuentes (10%)'
    },
    {
      cursoId: cursos[2]._id,
      titulo: 'Informe de Laboratorio Virtual',
      descripcion: 'Realizar experimento virtual sobre el ciclo del agua y presentar informe.',
      fechaVencimiento,
      puntaje: 30,
      activa: true,
      instrucciones: 'Utilizar el simulador proporcionado y documentar observaciones paso a paso.',
      criteriosEvaluacion: 'Observaciones (50%), análisis (30%), conclusiones (20%)'
    }
  ];

  const createdTareas = await Tarea.insertMany(tareas);
  console.log(`✅ ${createdTareas.length} tareas creadas`);
  
  return createdTareas;
};

const seedPagos = async (alumnos: any[]) => {
  console.log('📤 Creando pagos...');

  const fechaVencimiento = new Date();
  fechaVencimiento.setDate(fechaVencimiento.getDate() + 30); // Vence en 30 días

  const pagos = [
    // Pagos para Pedro García
    {
      alumnoId: alumnos[0]._id,
      concepto: 'Matrícula Semestre 2024-1',
      monto: 150.00,
      fechaVencimiento,
      estado: 'pendiente'
    },
    {
      alumnoId: alumnos[0]._id,
      concepto: 'Mensualidad Enero 2024',
      monto: 50.00,
      fechaVencimiento: new Date('2024-01-31'),
      fechaPago: new Date('2024-01-28'),
      metodoPago: 'transferencia',
      referencia: 'TRF123456',
      estado: 'pagado'
    },
    
    // Pagos para Ana López
    {
      alumnoId: alumnos[1]._id,
      concepto: 'Matrícula Semestre 2024-1',
      monto: 150.00,
      fechaVencimiento,
      estado: 'pendiente'
    },
    {
      alumnoId: alumnos[1]._id,
      concepto: 'Mensualidad Enero 2024',
      monto: 50.00,
      fechaVencimiento: new Date('2024-01-31'),
      fechaPago: new Date('2024-01-30'),
      metodoPago: 'deposito',
      referencia: 'DEP789012',
      estado: 'pagado'
    },
    
    // Pagos para Luis Martínez
    {
      alumnoId: alumnos[2]._id,
      concepto: 'Matrícula Semestre 2024-1',
      monto: 150.00,
      fechaVencimiento,
      estado: 'pendiente'
    }
  ];

  const createdPagos = await Pago.insertMany(pagos);
  console.log(`✅ ${createdPagos.length} pagos creados`);
  
  return createdPagos;
};

/**
 * Función principal de seeding
 */
const seedDatabase = async () => {
  try {
    console.log('🌱 Iniciando proceso de seeding...\n');

    // Conectar a la base de datos
    await Database.connect();

    // Limpiar base de datos existente
    console.log('🧹 Limpiando base de datos existente...');
    await Promise.all([
      User.deleteMany({}),
      Nivel.deleteMany({}),
      Materia.deleteMany({}),
      Curso.deleteMany({}),
      Inscripcion.deleteMany({}),
      Tarea.deleteMany({}),
      Pago.deleteMany({})
    ]);
    console.log('✅ Base de datos limpiada\n');

    // Crear datos de prueba
    const users = await seedUsers();
    const admin = users.find(u => u.rol === 'administrador');
    const maestros = users.filter(u => u.rol === 'maestro');
    const alumnos = users.filter(u => u.rol === 'alumno');

    const niveles = await seedNiveles();
    const materias = await seedMaterias(niveles);
    const cursos = await seedCursos(materias, maestros);
    const inscripciones = await seedInscripciones(cursos, alumnos);
    const tareas = await seedTareas(cursos);
    const pagos = await seedPagos(alumnos);

    console.log('\n🎉 Seeding completado exitosamente!\n');
    
    console.log('👥 Usuarios de prueba creados:');
    console.log(`   Administrador: admin@ibas.edu (contraseña: admin123)`);
    console.log(`   Maestros: jsanchez@ibas.edu, mrodriguez@ibas.edu (contraseña: maestro123)`);
    console.log(`   Alumnos: pedro.garcia@estudiante.ibas.edu, ana.lopez@estudiante.ibas.edu, luis.martinez@estudiante.ibas.edu (contraseña: alumno123)`);
    
    console.log('\n📊 Estadísticas:');
    console.log(`   Usuarios: ${users.length}`);
    console.log(`   Niveles: ${niveles.length}`);
    console.log(`   Materias: ${materias.length}`);
    console.log(`   Cursos: ${cursos.length}`);
    console.log(`   Inscripciones: ${inscripciones.length}`);
    console.log(`   Tareas: ${tareas.length}`);
    console.log(`   Pagos: ${pagos.length}`);

  } catch (error) {
    console.error('❌ Error durante el seeding:', error);
  } finally {
    await Database.disconnect();
    process.exit(0);
  }
};

// Ejecutar seeding si este archivo es llamado directamente
if (require.main === module) {
  seedDatabase();
}

export default seedDatabase;
