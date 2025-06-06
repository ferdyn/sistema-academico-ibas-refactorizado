import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth, useUserRole } from '@/context/AuthContext';
import { useUserCourses, useData, useSearch } from '@/hooks/useData';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import {
  GraduationCap, Users, Clock, MapPin, Plus, Search, Filter,
  Calendar, Video, BookOpen, BarChart3, FileText, Settings
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const cursoSchema = z.object({
  materiaId: z.string().min(1, 'La materia es requerida'),
  maestroId: z.string().min(1, 'El maestro es requerido'),
  nombre: z.string().min(1, 'El nombre es requerido'),
  descripcion: z.string().optional(),
  fechaInicio: z.string().min(1, 'La fecha de inicio es requerida'),
  fechaFin: z.string().min(1, 'La fecha de fin es requerida'),
  modalidad: z.enum(['presencial', 'virtual', 'hibrida']),
  aula: z.string().optional(),
  horario: z.string().min(1, 'El horario es requerido'),
  cupoMaximo: z.number().min(1, 'El cupo máximo debe ser mayor a 0')
});

type CursoForm = z.infer<typeof cursoSchema>;

const Cursos: React.FC = () => {
  const { user } = useAuth();
  const { isAdmin, isMaestro } = useUserRole();
  const { courses, loading } = useUserCourses();
  const { data } = useData();
  const [selectedModalidad, setSelectedModalidad] = useState<string>('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  // Búsqueda de cursos
  const { searchTerm, setSearchTerm, filteredItems } = useSearch(
    courses,
    ['nombre']
  );

  // Filtrar por modalidad
  const finalFilteredCourses = selectedModalidad === 'all' 
    ? filteredItems 
    : filteredItems.filter(c => c.modalidad === selectedModalidad);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue
  } = useForm<CursoForm>({
    resolver: zodResolver(cursoSchema)
  });

  const onSubmitCurso = async (formData: CursoForm) => {
    console.log('Nuevo curso:', formData);
    // Aquí iría la lógica para crear el curso
    reset();
    setIsCreateDialogOpen(false);
  };

  const getCourseProgress = (courseId: string) => {
    // Calcular progreso basado en tareas y exámenes completados
    return Math.floor(Math.random() * 100); // Simulado por ahora
  };

  const getEnrollmentPercentage = (courseId: string) => {
    if (!data) return 0;
    const course = data.cursos.find(c => c.id === courseId);
    if (!course) return 0;
    
    const enrolled = data.inscripciones.filter(i => i.cursoId === courseId).length;
    return (enrolled / course.cupoMaximo) * 100;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Cargando cursos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <div>
          <h1 className="text-3xl font-bold">
            {isAdmin ? 'Gestión de Cursos' : 'Mis Cursos'}
          </h1>
          <p className="text-muted-foreground">
            {isAdmin ? 'Administra todos los cursos del instituto' :
             isMaestro ? 'Cursos que impartes actualmente' :
             'Cursos en los que estás inscrito'}
          </p>
        </div>

        {isAdmin && (
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Nuevo Curso
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>Crear Nuevo Curso</DialogTitle>
                <DialogDescription>
                  Configura un nuevo curso para el semestre
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit(onSubmitCurso)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="materiaId">Materia</Label>
                  <Select onValueChange={(value) => setValue('materiaId', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar materia" />
                    </SelectTrigger>
                    <SelectContent>
                      {data?.materias.filter(m => m.activa).map(materia => (
                        <SelectItem key={materia.id} value={materia.id}>
                          {materia.codigo} - {materia.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.materiaId && (
                    <p className="text-sm text-destructive">{errors.materiaId.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="maestroId">Maestro</Label>
                  <Select onValueChange={(value) => setValue('maestroId', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar maestro" />
                    </SelectTrigger>
                    <SelectContent>
                      {data?.users.filter(u => u.rol === 'maestro' && u.activo).map(maestro => (
                        <SelectItem key={maestro.id} value={maestro.id}>
                          {maestro.nombre} {maestro.apellido}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.maestroId && (
                    <p className="text-sm text-destructive">{errors.maestroId.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="nombre">Nombre del Curso</Label>
                  <Input
                    id="nombre"
                    placeholder="Introducción a la Biblia - Grupo A"
                    {...register('nombre')}
                  />
                  {errors.nombre && (
                    <p className="text-sm text-destructive">{errors.nombre.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="descripcion">Descripción</Label>
                  <Textarea
                    id="descripcion"
                    placeholder="Descripción del curso..."
                    {...register('descripcion')}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fechaInicio">Fecha Inicio</Label>
                    <Input
                      id="fechaInicio"
                      type="date"
                      {...register('fechaInicio')}
                    />
                    {errors.fechaInicio && (
                      <p className="text-sm text-destructive">{errors.fechaInicio.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="fechaFin">Fecha Fin</Label>
                    <Input
                      id="fechaFin"
                      type="date"
                      {...register('fechaFin')}
                    />
                    {errors.fechaFin && (
                      <p className="text-sm text-destructive">{errors.fechaFin.message}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="modalidad">Modalidad</Label>
                  <Select onValueChange={(value) => setValue('modalidad', value as any)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar modalidad" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="presencial">Presencial</SelectItem>
                      <SelectItem value="virtual">Virtual</SelectItem>
                      <SelectItem value="hibrida">Híbrida</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.modalidad && (
                    <p className="text-sm text-destructive">{errors.modalidad.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="aula">Aula</Label>
                    <Input
                      id="aula"
                      placeholder="Aula 101"
                      {...register('aula')}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cupoMaximo">Cupo Máximo</Label>
                    <Input
                      id="cupoMaximo"
                      type="number"
                      min="1"
                      {...register('cupoMaximo', { valueAsNumber: true })}
                    />
                    {errors.cupoMaximo && (
                      <p className="text-sm text-destructive">{errors.cupoMaximo.message}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="horario">Horario</Label>
                  <Input
                    id="horario"
                    placeholder="Lunes y Miércoles 7:00 PM - 9:00 PM"
                    {...register('horario')}
                  />
                  {errors.horario && (
                    <p className="text-sm text-destructive">{errors.horario.message}</p>
                  )}
                </div>

                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit">
                    Crear Curso
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Buscar cursos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={selectedModalidad} onValueChange={setSelectedModalidad}>
          <SelectTrigger className="w-full md:w-48">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Filtrar por modalidad" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas las modalidades</SelectItem>
            <SelectItem value="presencial">Presencial</SelectItem>
            <SelectItem value="virtual">Virtual</SelectItem>
            <SelectItem value="hibrida">Híbrida</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Statistics Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Cursos</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{finalFilteredCourses.length}</div>
            <p className="text-xs text-muted-foreground">
              {isAdmin ? 'En el instituto' : 'Asignados a ti'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Estudiantes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data ? finalFilteredCourses.reduce((total, course) => {
                return total + data.inscripciones.filter(i => i.cursoId === course.id).length;
              }, 0) : 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Total inscritos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Modalidad Virtual</CardTitle>
            <Video className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {finalFilteredCourses.filter(c => c.modalidad === 'virtual').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Cursos en línea
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Promedio Ocupación</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {finalFilteredCourses.length > 0 ? 
                Math.round(finalFilteredCourses.reduce((sum, course) => 
                  sum + getEnrollmentPercentage(course.id), 0) / finalFilteredCourses.length) : 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              Capacidad utilizada
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Courses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {finalFilteredCourses.map((course) => {
          const materia = data?.materias.find(m => m.id === course.materiaId);
          const maestro = data?.users.find(u => u.id === course.maestroId);
          const inscripciones = data?.inscripciones.filter(i => i.cursoId === course.id) || [];
          const occupancyPercentage = getEnrollmentPercentage(course.id);
          const progress = getCourseProgress(course.id);
          
          return (
            <Card key={course.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <Badge variant="outline">{materia?.codigo}</Badge>
                    <CardTitle className="text-lg line-clamp-2">{course.nombre}</CardTitle>
                  </div>
                  <Badge 
                    variant={
                      course.modalidad === 'presencial' ? 'default' :
                      course.modalidad === 'virtual' ? 'secondary' : 'outline'
                    }
                  >
                    {course.modalidad}
                  </Badge>
                </div>
                {course.descripcion && (
                  <CardDescription className="line-clamp-2">
                    {course.descripcion}
                  </CardDescription>
                )}
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Teacher Info */}
                {maestro && (
                  <div className="flex items-center space-x-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={maestro.foto} alt={maestro.nombre} />
                      <AvatarFallback>
                        {maestro.nombre.charAt(0)}{maestro.apellido.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">{maestro.nombre} {maestro.apellido}</p>
                      <p className="text-xs text-muted-foreground">Profesor</p>
                    </div>
                  </div>
                )}

                {/* Course Details */}
                <div className="space-y-2 text-sm">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">{course.horario}</span>
                  </div>
                  
                  {course.aula && (
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">{course.aula}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">
                      {inscripciones.length}/{course.cupoMaximo} estudiantes
                    </span>
                  </div>
                </div>

                {/* Enrollment Progress */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Ocupación:</span>
                    <span className="font-medium">{Math.round(occupancyPercentage)}%</span>
                  </div>
                  <Progress value={occupancyPercentage} className="h-2" />
                </div>

                {/* Course Progress (for teachers) */}
                {isMaestro && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Progreso del curso:</span>
                      <span className="font-medium">{progress}%</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                  </div>
                )}

                {/* Course Period */}
                <div className="text-xs text-muted-foreground">
                  {new Date(course.fechaInicio).toLocaleDateString()} - {' '}
                  {new Date(course.fechaFin).toLocaleDateString()}
                </div>

                {/* Actions */}
                <div className="flex space-x-2 pt-2">
                  <Button variant="outline" size="sm" className="flex-1" asChild>
                    <Link to={`/materias/${course.materiaId}`}>
                      <BookOpen className="h-4 w-4 mr-1" />
                      Ver Materia
                    </Link>
                  </Button>
                  
                  {(isMaestro || isAdmin) && (
                    <Button variant="default" size="sm" className="flex-1" asChild>
                      <Link to={`/cursos/${course.id}/gestion`}>
                        <Settings className="h-4 w-4 mr-1" />
                        Gestionar
                      </Link>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {finalFilteredCourses.length === 0 && (
        <div className="text-center py-12">
          <GraduationCap className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No hay cursos disponibles</h3>
          <p className="text-muted-foreground">
            {searchTerm ? 'No se encontraron cursos que coincidan con tu búsqueda.' :
             isAdmin ? 'Comienza creando el primer curso del semestre.' :
             'No tienes cursos asignados actualmente.'}
          </p>
        </div>
      )}
    </div>
  );
};

export default Cursos;
