import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth, useUserRole } from '@/context/AuthContext';
import { useData, useStudentGrades, useCourseTasks, useCourseExams } from '@/hooks/useData';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  BookOpen, Users, Clock, Calendar, FileText, BarChart3,
  Download, Upload, Star, Award, TrendingUp, ChevronLeft,
  Video, MapPin, User, GraduationCap, Plus, Eye, Edit
} from 'lucide-react';
import { useForm } from 'react-hook-form';

const MateriaDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { isAdmin, isAlumno, isMaestro } = useUserRole();
  const { data, loading } = useData();
  const { grades } = useStudentGrades();
  const [selectedCourseId, setSelectedCourseId] = useState<string>('');

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Cargando información de la materia...</p>
        </div>
      </div>
    );
  }

  if (!data || !id) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-4">Materia no encontrada</h2>
        <Button asChild>
          <Link to="/materias">Volver a Materias</Link>
        </Button>
      </div>
    );
  }

  const materia = data.materias.find(m => m.id === id);
  const nivel = materia ? data.niveles.find(n => n.id === materia.nivelId) : null;
  const cursos = data.cursos.filter(c => c.materiaId === id && c.activo);
  
  // Obtener curso específico para el usuario
  const userCourse = cursos.find(curso => {
    if (isAlumno) {
      return data.inscripciones.some(i => i.cursoId === curso.id && i.alumnoId === user?.id);
    } else if (isMaestro) {
      return curso.maestroId === user?.id;
    }
    return true; // Admin puede ver todos
  });

  const courseToShow = selectedCourseId ? 
    cursos.find(c => c.id === selectedCourseId) : 
    userCourse || cursos[0];

  if (!materia) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-4">Materia no encontrada</h2>
        <Button asChild>
          <Link to="/materias">Volver a Materias</Link>
        </Button>
      </div>
    );
  }

  // Obtener datos específicos del curso
  const tasks = courseToShow ? data.tareas.filter(t => t.cursoId === courseToShow.id && t.activa) : [];
  const exams = courseToShow ? data.examenes.filter(e => e.cursoId === courseToShow.id && e.activo) : [];
  const inscripciones = courseToShow ? data.inscripciones.filter(i => i.cursoId === courseToShow.id) : [];
  
  // Calificaciones del alumno en esta materia
  const materiaGrades = grades.filter(g => g.materia?.id === id);
  const averageGrade = materiaGrades.length > 0 ? 
    materiaGrades.reduce((sum, g) => sum + (g.nota / g.notaMaxima * 20), 0) / materiaGrades.length : 0;

  // Obtener maestro del curso
  const maestro = courseToShow ? data.users.find(u => u.id === courseToShow.maestroId) : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button variant="outline" size="icon" asChild>
          <Link to="/materias">
            <ChevronLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-1">
            <Badge variant="outline">{materia.codigo}</Badge>
            <Badge variant="secondary">{nivel?.nombre}</Badge>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold">{materia.nombre}</h1>
          <p className="text-muted-foreground">{materia.descripcion}</p>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Créditos</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{materia.creditos}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cursos Activos</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{cursos.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Estudiantes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {cursos.reduce((total, curso) => {
                return total + data.inscripciones.filter(i => i.cursoId === curso.id).length;
              }, 0)}
            </div>
          </CardContent>
        </Card>

        {isAlumno && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Mi Promedio</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{averageGrade.toFixed(1)}</div>
              <Progress value={averageGrade * 5} className="mt-2" />
            </CardContent>
          </Card>
        )}
      </div>

      {/* Course Selection for Admin */}
      {isAdmin && cursos.length > 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Seleccionar Curso</CardTitle>
            <CardDescription>
              Esta materia tiene múltiples cursos activos. Selecciona uno para ver detalles específicos.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {cursos.map((curso) => {
                const isSelected = selectedCourseId === curso.id || (!selectedCourseId && curso.id === courseToShow?.id);
                const maestroCurso = data.users.find(u => u.id === curso.maestroId);
                const estudiantesCurso = data.inscripciones.filter(i => i.cursoId === curso.id);

                return (
                  <Card 
                    key={curso.id} 
                    className={`cursor-pointer transition-all ${isSelected ? 'ring-2 ring-primary' : 'hover:shadow-md'}`}
                    onClick={() => setSelectedCourseId(curso.id)}
                  >
                    <CardContent className="p-4">
                      <div className="space-y-2">
                        <h3 className="font-medium">{curso.nombre}</h3>
                        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                          <User className="h-4 w-4" />
                          <span>{maestroCurso?.nombre} {maestroCurso?.apellido}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                          <Users className="h-4 w-4" />
                          <span>{estudiantesCurso.length} estudiantes</span>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {curso.modalidad}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Content Tabs */}
      {courseToShow && (
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-6">
            <TabsTrigger value="overview">Información</TabsTrigger>
            {isAlumno && <TabsTrigger value="grades">Calificaciones</TabsTrigger>}
            <TabsTrigger value="tasks">Tareas</TabsTrigger>
            <TabsTrigger value="exams">Exámenes</TabsTrigger>
            {(isMaestro || isAdmin) && <TabsTrigger value="students">Estudiantes</TabsTrigger>}
            {(isMaestro || isAdmin) && <TabsTrigger value="manage">Gestionar</TabsTrigger>}
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Course Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Información del Curso</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Modalidad:</span>
                    <Badge variant="outline">{courseToShow.modalidad}</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Horario:</span>
                    <span className="font-medium">{courseToShow.horario}</span>
                  </div>
                  
                  {courseToShow.aula && (
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Aula:</span>
                      <span className="font-medium">{courseToShow.aula}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Período:</span>
                    <span className="font-medium">
                      {new Date(courseToShow.fechaInicio).toLocaleDateString()} - {' '}
                      {new Date(courseToShow.fechaFin).toLocaleDateString()}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Cupo máximo:</span>
                    <span className="font-medium">{courseToShow.cupoMaximo}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Inscritos:</span>
                    <span className="font-medium">{inscripciones.length}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Teacher Information */}
              {maestro && (
                <Card>
                  <CardHeader>
                    <CardTitle>Profesor</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center space-x-4">
                      <Avatar className="h-16 w-16">
                        <AvatarImage src={maestro.foto} alt={maestro.nombre} />
                        <AvatarFallback>
                          {maestro.nombre.charAt(0)}{maestro.apellido.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="space-y-1">
                        <h3 className="text-lg font-semibold">
                          {maestro.nombre} {maestro.apellido}
                        </h3>
                        <p className="text-muted-foreground">{maestro.email}</p>
                        {maestro.telefono && (
                          <p className="text-sm text-muted-foreground">{maestro.telefono}</p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Course Description */}
            {courseToShow.descripcion && (
              <Card>
                <CardHeader>
                  <CardTitle>Descripción del Curso</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{courseToShow.descripcion}</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {isAlumno && (
            <TabsContent value="grades" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Mis Calificaciones</CardTitle>
                  <CardDescription>
                    Historial de calificaciones en esta materia
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {materiaGrades.length === 0 ? (
                    <div className="text-center py-8">
                      <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">No hay calificaciones registradas aún</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {materiaGrades.map((grade) => (
                        <div key={grade.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="space-y-1">
                            <h4 className="font-medium">{grade.descripcion}</h4>
                            <div className="flex items-center space-x-2">
                              <Badge variant="outline">{grade.tipo}</Badge>
                              <span className="text-sm text-muted-foreground">
                                Peso: {grade.peso}%
                              </span>
                              <span className="text-sm text-muted-foreground">
                                {new Date(grade.fecha).toLocaleDateString()}
                              </span>
                            </div>
                            {grade.comentarios && (
                              <p className="text-sm text-muted-foreground">{grade.comentarios}</p>
                            )}
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold">
                              {grade.nota}/{grade.notaMaxima}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {((grade.nota / grade.notaMaxima) * 20).toFixed(1)}/20
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          )}

          <TabsContent value="tasks" className="space-y-6">
            <TasksList 
              tasks={tasks} 
              courseId={courseToShow.id}
              canManage={isMaestro || isAdmin}
              isStudent={isAlumno}
            />
          </TabsContent>

          <TabsContent value="exams" className="space-y-6">
            <ExamsList 
              exams={exams} 
              courseId={courseToShow.id}
              canManage={isMaestro || isAdmin}
              isStudent={isAlumno}
            />
          </TabsContent>

          {(isMaestro || isAdmin) && (
            <TabsContent value="students" className="space-y-6">
              <StudentsList inscripciones={inscripciones} />
            </TabsContent>
          )}

          {(isMaestro || isAdmin) && (
            <TabsContent value="manage" className="space-y-6">
              <CourseManagement course={courseToShow} />
            </TabsContent>
          )}
        </Tabs>
      )}
    </div>
  );
};

// Componente para lista de tareas
const TasksList: React.FC<{
  tasks: any[];
  courseId: string;
  canManage: boolean;
  isStudent: boolean;
}> = ({ tasks, courseId, canManage, isStudent }) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Tareas</CardTitle>
          <CardDescription>
            {isStudent ? 'Tareas asignadas en este curso' : 'Gestiona las tareas del curso'}
          </CardDescription>
        </div>
        {canManage && (
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Nueva Tarea
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {tasks.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No hay tareas asignadas</p>
          </div>
        ) : (
          <div className="space-y-4">
            {tasks.map((task) => (
              <div key={task.id} className="border rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <h3 className="font-medium">{task.titulo}</h3>
                    <p className="text-sm text-muted-foreground">{task.descripcion}</p>
                    <div className="flex items-center space-x-4 text-sm">
                      <span className="text-muted-foreground">
                        Vence: {new Date(task.fechaVencimiento).toLocaleDateString()}
                      </span>
                      <Badge variant="outline">{task.puntaje} pts</Badge>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-1" />
                      Ver
                    </Button>
                    {canManage && (
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4 mr-1" />
                        Editar
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Componente para lista de exámenes
const ExamsList: React.FC<{
  exams: any[];
  courseId: string;
  canManage: boolean;
  isStudent: boolean;
}> = ({ exams, courseId, canManage, isStudent }) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Exámenes</CardTitle>
          <CardDescription>
            {isStudent ? 'Exámenes programados' : 'Gestiona los exámenes del curso'}
          </CardDescription>
        </div>
        {canManage && (
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Examen
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {exams.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No hay exámenes programados</p>
          </div>
        ) : (
          <div className="space-y-4">
            {exams.map((exam) => (
              <div key={exam.id} className="border rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <h3 className="font-medium">{exam.titulo}</h3>
                    <p className="text-sm text-muted-foreground">{exam.descripcion}</p>
                    <div className="flex items-center space-x-4 text-sm">
                      <span className="text-muted-foreground">
                        Fecha: {new Date(exam.fechaExamen).toLocaleDateString()}
                      </span>
                      <span className="text-muted-foreground">
                        Duración: {exam.duracion} min
                      </span>
                      <Badge variant="outline">{exam.puntaje} pts</Badge>
                      <Badge variant="secondary">{exam.tipo}</Badge>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-1" />
                      Ver
                    </Button>
                    {canManage && (
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4 mr-1" />
                        Editar
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Componente para lista de estudiantes
const StudentsList: React.FC<{ inscripciones: any[] }> = ({ inscripciones }) => {
  const { data } = useData();
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Estudiantes Inscritos</CardTitle>
        <CardDescription>
          Lista de estudiantes en este curso
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {inscripciones.map((inscripcion) => {
            const estudiante = data?.users.find(u => u.id === inscripcion.alumnoId);
            if (!estudiante) return null;
            
            return (
              <div key={inscripcion.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <Avatar>
                    <AvatarImage src={estudiante.foto} alt={estudiante.nombre} />
                    <AvatarFallback>
                      {estudiante.nombre.charAt(0)}{estudiante.apellido.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-medium">{estudiante.nombre} {estudiante.apellido}</h3>
                    <p className="text-sm text-muted-foreground">{estudiante.email}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="outline">{inscripcion.estado}</Badge>
                  {inscripcion.calificacionFinal && (
                    <Badge variant="secondary">{inscripcion.calificacionFinal}/20</Badge>
                  )}
                  <Button variant="outline" size="sm">Ver Perfil</Button>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

// Componente para gestión del curso
const CourseManagement: React.FC<{ course: any }> = ({ course }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Configuración del Curso</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button className="w-full justify-start">
            <Edit className="h-4 w-4 mr-2" />
            Editar Información del Curso
          </Button>
          <Button className="w-full justify-start" variant="outline">
            <Users className="h-4 w-4 mr-2" />
            Gestionar Inscripciones
          </Button>
          <Button className="w-full justify-start" variant="outline">
            <Calendar className="h-4 w-4 mr-2" />
            Programar Clases
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Herramientas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button className="w-full justify-start" variant="outline">
            <BarChart3 className="h-4 w-4 mr-2" />
            Reporte de Calificaciones
          </Button>
          <Button className="w-full justify-start" variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Exportar Lista de Estudiantes
          </Button>
          <Button className="w-full justify-start" variant="outline">
            <FileText className="h-4 w-4 mr-2" />
            Generar Certificados
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default MateriaDetail;
