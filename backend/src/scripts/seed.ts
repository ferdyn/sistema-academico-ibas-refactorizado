import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import Database from '../config/database';
import User from '../models/User';
import Nivel from '../models/Nivel';
import Materia from '../models/Materia';
import Curso from '../models/Curso';
import Inscripcion from '../models/Inscripcion';
import Tarea from '../models/Tarea';
import Pago from '../models/Pago';

/**
 * Script de seed para poblar la base de datos con datos de prueba
 * Formato europeo - España
 */

const seedDatabase = async () => {
  try {
    console.log('🌱 Iniciando seed de la base de datos...');
    
    // Conectar a la base de datos
    const db = Database.getInstance();
    await db.connect();
    
    // Limpiar colecciones existentes
    await User.deleteMany({});
    await Nivel.deleteMany({});
    await Materia.deleteMany({});
    await Curso.deleteMany({});
    await Inscripcion.deleteMany({});
    await Tarea.deleteMany({});
    await Pago.deleteMany({});
    
    console.log('🗑️  Colecciones limpiadas');

    // Hash para contraseñas
    const saltRounds = 12;
    const hashPassword = async (password: string) => {
      const salt = await bcrypt.genSalt(saltRounds);
      return bcrypt.hash(password, salt);
    };

    // Crear usuarios
    const usuarios = [
      {
        nombre: 'Ana',
        apellidos: 'Rodríguez García',
        email: 'admin@ibas.edu',
        password: await hashPassword('admin123'),
        rol: 'administrador',
        telefono: '654321098',
        dni: '12345678Z',
        fechaNacimiento: new Date('1985-06-15'),
        direccion: 'Calle Mayor, 123, 28001 Madrid',
        activo: true
      },
      {
        nombre: 'José',
        apellidos: 'Sánchez López',
        email: 'jsanchez@ibas.edu',
        password: await hashPassword('profesor123'),
        rol: 'profesor',
        telefono: '678901234',
        dni: '87654321A',
        fechaNacimiento: new Date('1978-03-22'),
        direccion: 'Avenida de la Constitución, 45, 41001 Sevilla',
        especialidad: 'Matemáticas',
        activo: true
      },
      {
        nombre: 'Carmen',
        apellidos: 'Martínez Ruiz',
        email: 'cmartinez@ibas.edu',
        password: await hashPassword('profesor123'),
        rol: 'profesor',
        telefono: '687123456',
        dni: '56789123C',
        fechaNacimiento: new Date('1982-11-08'),
        direccion: 'Plaza del Ayuntamiento, 12, 46002 Valencia',
        especialidad: 'Lengua Castellana y Literatura',
        activo: true
      },
      {
        nombre: 'Pedro',
        apellidos: 'García Martín',
        email: 'pedro.garcia@estudiante.ibas.edu',
        password: await hashPassword('alumno123'),
        rol: 'alumno',
        telefono: '612345678',
        dni: '45678912B',
        fechaNacimiento: new Date('2008-09-10'),
        direccion: 'Plaza España, 78, 08014 Barcelona',
        tutorLegal: 'María Martín Ruiz',
        telefonoTutor: '698765432',
        activo: true
      },
      {
        nombre: 'María',
        apellidos: 'López Fernández',
        email: 'maria.lopez@estudiante.ibas.edu',
        password: await hashPassword('alumno123'),
        rol: 'alumno',
        telefono: '687654321',
        dni: '78912345D',
        fechaNacimiento: new Date('2007-12-03'),
        direccion: 'Calle Alcalá, 156, 28009 Madrid',
        tutorLegal: 'Carmen Fernández Ruiz',
        telefonoTutor: '654987321',
        activo: true
      },
      {
        nombre: 'Luis',
        apellidos: 'Hernández Torres',
        email: 'luis.hernandez@estudiante.ibas.edu',
        password: await hashPassword('alumno123'),
        rol: 'alumno',
        telefono: '634567890',
        dni: '34567891E',
        fechaNacimiento: new Date('2008-05-20'),
        direccion: 'Calle Gran Vía, 89, 48011 Bilbao',
        tutorLegal: 'Ana Torres López',
        telefonoTutor: '676543210',
        activo: true
      }
    ];

    const usuariosCreados = await User.insertMany(usuarios);
    console.log(`👥 ${usuariosCreados.length} usuarios creados`);

    // Crear niveles educativos
    const niveles = [
      {
        nombre: 'Educación Secundaria Obligatoria (ESO)',
        descripcion: 'Educación secundaria obligatoria en España',
        grados: ['1º ESO', '2º ESO', '3º ESO', '4º ESO'],
        activo: true
      },
      {
        nombre: 'Bachillerato',
        descripcion: 'Educación post-obligatoria preuniversitaria',
        grados: ['1º Bachillerato', '2º Bachillerato'],
        activo: true
      },
      {
        nombre: 'Formación Profesional',
        descripcion: 'Ciclos formativos de grado medio y superior',
        grados: ['Grado Medio', 'Grado Superior'],
        activo: true
      }
    ];

    const nivelesCreados = await Nivel.insertMany(niveles);
    console.log(`📚 ${nivelesCreados.length} niveles educativos creados`);

    // Crear asignaturas
    const materias = [
      {
        nombre: 'Matemáticas',
        codigo: 'MAT',
        descripcion: 'Álgebra, geometría, trigonometría y cálculo',
        creditos: 4,
        nivelId: nivelesCreados[0]._id,
        activa: true
      },
      {
        nombre: 'Lengua Castellana y Literatura',
        codigo: 'LCL',
        descripcion: 'Gramática, literatura española y expresión escrita',
        creditos: 4,
        nivelId: nivelesCreados[0]._id,
        activa: true
      },
      {
        nombre: 'Inglés',
        codigo: 'ING',
        descripcion: 'Idioma extranjero - inglés nivel intermedio',
        creditos: 3,
        nivelId: nivelesCreados[0]._id,
        activa: true
      },
      {
        nombre: 'Ciencias Naturales',
        codigo: 'CCN',
        descripcion: 'Biología, física y química integradas',
        creditos: 3,
        nivelId: nivelesCreados[0]._id,
        activa: true
      },
      {
        nombre: 'Historia de España',
        codigo: 'HIS',
        descripcion: 'Historia contemporánea española',
        creditos: 3,
        nivelId: nivelesCreados[1]._id,
        activa: true
      },
      {
        nombre: 'Filosofía',
        codigo: 'FIL',
        descripcion: 'Introducción a la filosofía y ética',
        creditos: 2,
        nivelId: nivelesCreados[1]._id,
        activa: true
      }
    ];

    const materiasCreadas = await Materia.insertMany(materias);
    console.log(`📖 ${materiasCreadas.length} asignaturas creadas`);

    // Buscar profesores
    const profesorMates = usuariosCreados.find(u => u.especialidad === 'Matemáticas');
    const profesorLengua = usuariosCreados.find(u => u.especialidad === 'Lengua Castellana y Literatura');

    // Crear cursos
    const cursos = [
      {
        materiaId: materiasCreadas[0]._id,
        profesorId: profesorMates!._id,
        nombre: 'Matemáticas 3º ESO - Grupo A',
        descripcion: 'Álgebra y geometría para tercero de ESO',
        periodo: 'Curso 2023-24',
        horario: 'Lunes, Miércoles, Viernes 09:00-10:00',
        aula: 'Aula 205',
        maxEstudiantes: 25,
        activo: true,
        fechaInicio: new Date('2023-09-15'),
        fechaFin: new Date('2024-06-15')
      },
      {
        materiaId: materiasCreadas[1]._id,
        profesorId: profesorLengua!._id,
        nombre: 'Lengua Castellana 3º ESO - Grupo A',
        descripcion: 'Literatura y expresión escrita para tercero de ESO',
        periodo: 'Curso 2023-24',
        horario: 'Martes, Jueves 10:00-11:00',
        aula: 'Aula 103',
        maxEstudiantes: 25,
        activo: true,
        fechaInicio: new Date('2023-09-15'),
        fechaFin: new Date('2024-06-15')
      },
      {
        materiaId: materiasCreadas[2]._id,
        profesorId: profesorMates!._id,
        nombre: 'Inglés 3º ESO - Grupo A',
        descripcion: 'Inglés intermedio para tercero de ESO',
        periodo: 'Curso 2023-24',
        horario: 'Lunes, Miércoles 11:00-12:00',
        aula: 'Aula 301',
        maxEstudiantes: 20,
        activo: true,
        fechaInicio: new Date('2023-09-15'),
        fechaFin: new Date('2024-06-15')
      }
    ];

    const cursosCreados = await Curso.insertMany(cursos);
    console.log(`🎓 ${cursosCreados.length} cursos creados`);

    // Buscar estudiantes
    const estudiantes = usuariosCreados.filter(u => u.rol === 'alumno');

    // Crear inscripciones
    const inscripciones = [];
    estudiantes.forEach(estudiante => {
      cursosCreados.forEach((curso, index) => {
        inscripciones.push({
          estudianteId: estudiante._id,
          cursoId: curso._id,
          fechaInscripcion: new Date('2023-09-01'),
          estado: 'activa',
          notaFinal: 5 + Math.random() * 5, // Notas entre 5 y 10
          asistencia: 85 + Math.random() * 15 // Asistencia entre 85% y 100%
        });
      });
    });

    const inscripcionesCreadas = await Inscripcion.insertMany(inscripciones);
    console.log(`📝 ${inscripcionesCreadas.length} inscripciones creadas`);

    // Crear tareas
    const tareas = [
      {
        cursoId: cursosCreados[0]._id,
        titulo: 'Ecuaciones de segundo grado',
        descripcion: 'Resolver sistemas de ecuaciones cuadráticas usando la fórmula general',
        fechaCreacion: new Date('2024-01-10'),
        fechaVencimiento: new Date('2024-01-25'),
        puntuacionMaxima: 10,
        estado: 'activa',
        instrucciones: 'Completar todos los ejercicios del tema 5, páginas 78-82. Mostrar el procedimiento completo.'
      },
      {
        cursoId: cursosCreados[1]._id,
        titulo: 'Análisis de "La Celestina"',
        descripcion: 'Ensayo sobre los personajes principales de la obra de Fernando de Rojas',
        fechaCreacion: new Date('2024-01-12'),
        fechaVencimiento: new Date('2024-01-30'),
        puntuacionMaxima: 10,
        estado: 'activa',
        instrucciones: 'Ensayo de 500 palabras mínimo. Analizar la evolución de Calisto y Melibea.'
      },
      {
        cursoId: cursosCreados[2]._id,
        titulo: 'Present Perfect Tense',
        descripcion: 'Ejercicios de presente perfecto en inglés',
        fechaCreacion: new Date('2024-01-15'),
        fechaVencimiento: new Date('2024-02-01'),
        puntuacionMaxima: 10,
        estado: 'activa',
        instrucciones: 'Complete exercises 1-15 from workbook page 45. Write 5 original sentences.'
      }
    ];

    const tareasCreadas = await Tarea.insertMany(tareas);
    console.log(`📋 ${tareasCreadas.length} tareas creadas`);

    // Crear pagos
    const pagos = [];
    estudiantes.forEach(estudiante => {
      // Matrícula anual
      pagos.push({
        estudianteId: estudiante._id,
        concepto: 'Matrícula Curso 2023-24',
        descripcion: 'Matrícula completa para el curso académico 2023-2024',
        importe: 450.00,
        fechaVencimiento: new Date('2023-09-30'),
        fechaPago: new Date('2023-09-15'),
        metodoPago: 'transferencia',
        estado: 'pagado',
        numeroRecibo: `MAT-2023-${String(estudiante._id).slice(-3).toUpperCase()}`
      });

      // Material didáctico
      pagos.push({
        estudianteId: estudiante._id,
        concepto: 'Material didáctico',
        descripcion: 'Libros de texto y material escolar',
        importe: 85.50,
        fechaVencimiento: new Date('2023-10-15'),
        fechaPago: Math.random() > 0.5 ? new Date('2023-10-10') : undefined,
        metodoPago: Math.random() > 0.5 ? 'tarjeta' : undefined,
        estado: Math.random() > 0.5 ? 'pagado' : 'pendiente',
        numeroRecibo: `MAT-2023-${String(estudiante._id).slice(-3).toUpperCase()}-B`
      });

      // Actividades extraescolares
      if (Math.random() > 0.3) {
        pagos.push({
          estudianteId: estudiante._id,
          concepto: 'Actividades extraescolares',
          descripcion: 'Actividades deportivas y culturales',
          importe: 120.00,
          fechaVencimiento: new Date('2024-01-31'),
          estado: 'pendiente',
          numeroRecibo: `ACT-2024-${String(estudiante._id).slice(-3).toUpperCase()}`
        });
      }
    });

    const pagosCreados = await Pago.insertMany(pagos);
    console.log(`💰 ${pagosCreados.length} pagos creados`);

    console.log('\n🎉 Seed completado exitosamente!');
    console.log('\n👥 Usuarios de prueba creados:');
    console.log('👑 Administrador: admin@ibas.edu / admin123');
    console.log('👨‍🏫 Profesor (Matemáticas): jsanchez@ibas.edu / profesor123');
    console.log('👨‍🏫 Profesora (Lengua): cmartinez@ibas.edu / profesor123');
    console.log('👨‍🎓 Alumno 1: pedro.garcia@estudiante.ibas.edu / alumno123');
    console.log('👩‍🎓 Alumna 2: maria.lopez@estudiante.ibas.edu / alumno123');
    console.log('👨‍🎓 Alumno 3: luis.hernandez@estudiante.ibas.edu / alumno123');
    console.log('\n💰 Moneda configurada: EUR (Euro)');
    console.log('🗓️ Formato de fechas: dd/MM/yyyy');
    console.log('🇪🇸 Configuración: España');

  } catch (error) {
    console.error('❌ Error durante el seed:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Desconectado de la base de datos');
    process.exit(0);
  }
};

// Ejecutar seed si se llama directamente
if (require.main === module) {
  seedDatabase();
}

export default seedDatabase;
