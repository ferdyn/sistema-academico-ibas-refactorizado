import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth, useUserRole } from '@/context/AuthContext';
import { useMaterias, useUserCourses, useSearch } from '@/hooks/useData';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { BookOpen, Users, Clock, Plus, Search, Filter, GraduationCap, Star, ChevronRight } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const materiaSchema = z.object({
  codigo: z.string().min(1, 'El código es requerido'),
  nombre: z.string().min(1, 'El nombre es requerido'),
  descripcion: z.string().min(1, 'La descripción es requerida'),
  creditos: z.number().min(1, 'Los créditos deben ser mayor a 0'),
  nivelId: z.string().min(1, 'El nivel es requerido')
});

type MateriaForm = z.infer<typeof materiaSchema>;

const Materias: React.FC = () => {
  const { user } = useAuth();
  const { isAdmin, isAlumno, isMaestro } = useUserRole();
  const { materias, loading } = useMaterias();
  const { courses } = useUserCourses();
  const [selectedNivel, setSelectedNivel] = useState<string>('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  // Búsqueda de materias
  const { searchTerm, setSearchTerm, filteredItems } = useSearch(
    materias,
    ['nombre', 'codigo', 'descripcion']
  );

  // Filtrar por nivel
  const finalFilteredMaterias = selectedNivel === 'all' 
    ? filteredItems 
    : filteredItems.filter(m => m.nivelId === selectedNivel);

  // Materias disponibles para el usuario actual
  const userMaterias = finalFilteredMaterias.filter(materia => {
    if (isAdmin) return true;
    if (isMaestro) {
      // Mostrar materias donde el maestro tiene cursos
      return courses.some(curso => curso.materiaId === materia.id);
    }
    if (isAlumno) {
      // Mostrar materias donde el alumno está inscrito
      return courses.some(curso => curso.materiaId === materia.id);
    }
    return false;
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<MateriaForm>({
    resolver: zodResolver(materiaSchema)
  });

  const onSubmitMateria = async (data: MateriaForm) => {
    console.log('Nueva materia:', data);
    // Aquí iría la lógica para crear la materia
    reset();
    setIsCreateDialogOpen(false);
  };

  const getMateriaProgress = (materiaId: string) => {
    // Calcular progreso basado en cursos del usuario
    const materiaCourses = courses.filter(c => c.materiaId === materiaId);
    if (materiaCourses.length === 0) return 0;
    
    // Por ahora, retornamos un progreso simulado
    return Math.floor(Math.random() * 100);
  };

  const niveles = Array.from(new Set(materias.map(m => m.nivel?.nombre).filter(Boolean)));

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Cargando materias...</p>
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
            {isAdmin ? 'Gestión de Materias' : 
             isMaestro ? 'Mis Materias' : 
             'Mis Materias'}
          </h1>
          <p className="text-muted-foreground">
            {isAdmin ? 'Administra el pensum académico del instituto' :
             isMaestro ? 'Materias que impartes actualmente' :
             'Materias en las que estás inscrito'}
          </p>
        </div>

        {isAdmin && (
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Nueva Materia
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Crear Nueva Materia</DialogTitle>
                <DialogDescription>
                  Añade una nueva materia al pensum académico
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit(onSubmitMateria)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="codigo">Código</Label>
                  <Input
                    id="codigo"
                    placeholder="BIB101"
                    {...register('codigo')}
                  />
                  {errors.codigo && (
                    <p className="text-sm text-destructive">{errors.codigo.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="nombre">Nombre</Label>
                  <Input
                    id="nombre"
                    placeholder="Introducción a la Biblia"
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
                    placeholder="Descripción de la materia..."
                    {...register('descripcion')}
                  />
                  {errors.descripcion && (
                    <p className="text-sm text-destructive">{errors.descripcion.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="creditos">Créditos</Label>
                    <Input
                      id="creditos"
                      type="number"
                      min="1"
                      max="6"
                      {...register('creditos', { valueAsNumber: true })}
                    />
                    {errors.creditos && (
                      <p className="text-sm text-destructive">{errors.creditos.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="nivelId">Nivel</Label>
                    <Select onValueChange={(value) => register('nivelId').onChange({ target: { value } })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar nivel" />
                      </SelectTrigger>
                      <SelectContent>
                        {materias.map(m => m.nivel).filter((nivel, index, self) =>
                          nivel && self.findIndex(n => n?.id === nivel.id) === index
                        ).map(nivel => (
                          <SelectItem key={nivel!.id} value={nivel!.id}>
                            {nivel!.nombre}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.nivelId && (
                      <p className="text-sm text-destructive">{errors.nivelId.message}</p>
                    )}
                  </div>
                </div>

                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit">
                    Crear Materia
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
            placeholder="Buscar materias..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={selectedNivel} onValueChange={setSelectedNivel}>
          <SelectTrigger className="w-full md:w-48">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Filtrar por nivel" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los niveles</SelectItem>
            {niveles.map(nivel => (
              <SelectItem key={nivel} value={materias.find(m => m.nivel?.nombre === nivel)?.nivelId || ''}>
                {nivel}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Tabs for different views */}
      <Tabs defaultValue="grid" className="w-full">
        <TabsList>
          <TabsTrigger value="grid">Vista de Tarjetas</TabsTrigger>
          <TabsTrigger value="list">Vista de Lista</TabsTrigger>
          {!isAlumno && <TabsTrigger value="stats">Estadísticas</TabsTrigger>}
        </TabsList>

        <TabsContent value="grid" className="space-y-6">
          {/* Statistics Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Materias</CardTitle>
                <BookOpen className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{userMaterias.length}</div>
                <p className="text-xs text-muted-foreground">
                  {isAdmin ? 'En el pensum' : 'Disponibles para ti'}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Cursos Activos</CardTitle>
                <GraduationCap className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{courses.length}</div>
                <p className="text-xs text-muted-foreground">
                  Cursos este semestre
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Promedio Créditos</CardTitle>
                <Star className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {userMaterias.length > 0 ? 
                    (userMaterias.reduce((sum, m) => sum + m.creditos, 0) / userMaterias.length).toFixed(1) : 
                    '0'
                  }
                </div>
                <p className="text-xs text-muted-foreground">
                  Créditos por materia
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Materias Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {userMaterias.map((materia) => {
              const progress = getMateriaProgress(materia.id);
              const materiaCourses = courses.filter(c => c.materiaId === materia.id);
              
              return (
                <Card key={materia.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <Badge variant="outline">{materia.codigo}</Badge>
                        <CardTitle className="text-lg">{materia.nombre}</CardTitle>
                      </div>
                      <Badge variant="secondary">{materia.creditos} créditos</Badge>
                    </div>
                    <CardDescription className="line-clamp-2">
                      {materia.descripcion}
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Nivel:</span>
                      <Badge variant="outline">{materia.nivel?.nombre}</Badge>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Cursos activos:</span>
                      <span className="font-medium">{materiaCourses.length}</span>
                    </div>

                    {isAlumno && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Progreso:</span>
                          <span className="font-medium">{progress}%</span>
                        </div>
                        <div className="w-full bg-secondary rounded-full h-2">
                          <div 
                            className="bg-primary h-2 rounded-full transition-all" 
                            style={{ width: `${progress}%` }}
                          ></div>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-2">
                      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                        <Users className="h-4 w-4" />
                        <span>{materia.totalEstudiantes || 0} estudiantes</span>
                      </div>
                      
                      <Button variant="outline" size="sm" asChild>
                        <Link to={`/materias/${materia.id}`}>
                          Ver Detalles
                          <ChevronRight className="h-4 w-4 ml-1" />
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {userMaterias.length === 0 && (
            <div className="text-center py-12">
              <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No hay materias disponibles</h3>
              <p className="text-muted-foreground">
                {searchTerm ? 'No se encontraron materias que coincidan con tu búsqueda.' :
                 isAdmin ? 'Comienza creando la primera materia del pensum.' :
                 'No tienes materias asignadas actualmente.'}
              </p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="list" className="space-y-4">
          <div className="border rounded-lg">
            <div className="grid grid-cols-5 gap-4 p-4 border-b bg-muted/50 font-medium">
              <div>Código</div>
              <div>Materia</div>
              <div>Nivel</div>
              <div>Créditos</div>
              <div>Acciones</div>
            </div>
            
            {userMaterias.map((materia) => (
              <div key={materia.id} className="grid grid-cols-5 gap-4 p-4 border-b hover:bg-muted/50">
                <div>
                  <Badge variant="outline">{materia.codigo}</Badge>
                </div>
                <div>
                  <div className="font-medium">{materia.nombre}</div>
                  <div className="text-sm text-muted-foreground line-clamp-1">
                    {materia.descripcion}
                  </div>
                </div>
                <div>
                  <Badge variant="secondary">{materia.nivel?.nombre}</Badge>
                </div>
                <div className="font-medium">{materia.creditos}</div>
                <div>
                  <Button variant="outline" size="sm" asChild>
                    <Link to={`/materias/${materia.id}`}>Ver</Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        {!isAlumno && (
          <TabsContent value="stats" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Distribución por Nivel</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {niveles.map(nivel => {
                      const count = userMaterias.filter(m => m.nivel?.nombre === nivel).length;
                      const percentage = userMaterias.length > 0 ? (count / userMaterias.length) * 100 : 0;
                      
                      return (
                        <div key={nivel} className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span>{nivel}</span>
                            <span className="font-medium">{count} materias</span>
                          </div>
                          <div className="w-full bg-secondary rounded-full h-2">
                            <div 
                              className="bg-primary h-2 rounded-full transition-all" 
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Estadísticas Generales</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Total de créditos:</span>
                    <span className="font-medium">
                      {userMaterias.reduce((sum, m) => sum + m.creditos, 0)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Promedio de créditos:</span>
                    <span className="font-medium">
                      {userMaterias.length > 0 ? 
                        (userMaterias.reduce((sum, m) => sum + m.creditos, 0) / userMaterias.length).toFixed(1) : 
                        '0'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Total estudiantes:</span>
                    <span className="font-medium">
                      {userMaterias.reduce((sum, m) => sum + (m.totalEstudiantes || 0), 0)}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
};

export default Materias;
