import React, { useState } from 'react';
import { useData, useSearch } from '@/hooks/useData';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Users as UsersIcon, UserPlus, Search, Filter, MoreHorizontal,
  Edit, Trash2, Eye, Mail, Phone, MapPin, Calendar,
  Shield, GraduationCap, BookOpen, Settings, Download,
  UserCheck, UserX, AlertCircle, CheckCircle
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { User, UserRole } from '@/types';

const userSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
  nombre: z.string().min(1, 'El nombre es requerido'),
  apellido: z.string().min(1, 'El apellido es requerido'),
  telefono: z.string().optional(),
  direccion: z.string().optional(),
  fechaNacimiento: z.string().optional(),
  rol: z.enum(['alumno', 'maestro', 'administrador'])
});

type UserForm = z.infer<typeof userSchema>;

const Users: React.FC = () => {
  const { data, loading } = useData();
  const [selectedRole, setSelectedRole] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [isCreateUserOpen, setIsCreateUserOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isEditUserOpen, setIsEditUserOpen] = useState(false);
  const [isViewUserOpen, setIsViewUserOpen] = useState(false);

  const users = data?.users || [];
  
  // Búsqueda de usuarios
  const { searchTerm, setSearchTerm, filteredItems } = useSearch(
    users,
    ['nombre', 'apellido', 'email']
  );

  // Filtrar por rol y estado
  const finalFilteredUsers = filteredItems.filter(user => {
    const roleMatch = selectedRole === 'all' || user.rol === selectedRole;
    const statusMatch = selectedStatus === 'all' || 
      (selectedStatus === 'active' && user.activo) ||
      (selectedStatus === 'inactive' && !user.activo);
    return roleMatch && statusMatch;
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue
  } = useForm<UserForm>({
    resolver: zodResolver(userSchema)
  });

  const onSubmitUser = async (formData: UserForm) => {
    try {
      // Simular creación de usuario
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log('Nuevo usuario:', formData);
      reset();
      setIsCreateUserOpen(false);
      toast.success('Usuario creado exitosamente');
    } catch (error) {
      toast.error('Error al crear el usuario');
    }
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setValue('email', user.email);
    setValue('nombre', user.nombre);
    setValue('apellido', user.apellido);
    setValue('telefono', user.telefono || '');
    setValue('direccion', user.direccion || '');
    setValue('fechaNacimiento', user.fechaNacimiento || '');
    setValue('rol', user.rol);
    setIsEditUserOpen(true);
  };

  const handleViewUser = (user: User) => {
    setSelectedUser(user);
    setIsViewUserOpen(true);
  };

  const handleToggleUserStatus = async (user: User) => {
    try {
      // Simular cambio de estado
      await new Promise(resolve => setTimeout(resolve, 500));
      
      toast.success(`Usuario ${user.activo ? 'desactivado' : 'activado'} exitosamente`);
    } catch (error) {
      toast.error('Error al cambiar el estado del usuario');
    }
  };

  const handleDeleteUser = async (user: User) => {
    if (window.confirm(`¿Estás seguro de eliminar al usuario ${user.nombre} ${user.apellido}?`)) {
      try {
        // Simular eliminación
        await new Promise(resolve => setTimeout(resolve, 500));
        
        toast.success('Usuario eliminado exitosamente');
      } catch (error) {
        toast.error('Error al eliminar el usuario');
      }
    }
  };

  const getRoleLabel = (role: UserRole) => {
    const labels = {
      alumno: 'Estudiante',
      maestro: 'Maestro',
      administrador: 'Administrador'
    };
    return labels[role];
  };

  const getRoleBadgeColor = (role: UserRole) => {
    switch (role) {
      case 'administrador': return 'bg-red-100 text-red-800';
      case 'maestro': return 'bg-blue-100 text-blue-800';
      case 'alumno': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatistics = () => {
    const totalUsers = users.length;
    const activeUsers = users.filter(u => u.activo).length;
    const studentCount = users.filter(u => u.rol === 'alumno').length;
    const teacherCount = users.filter(u => u.rol === 'maestro').length;
    const adminCount = users.filter(u => u.rol === 'administrador').length;

    return {
      totalUsers,
      activeUsers,
      studentCount,
      teacherCount,
      adminCount
    };
  };

  const stats = getStatistics();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Cargando usuarios...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <div>
          <h1 className="text-3xl font-bold">Gestión de Usuarios</h1>
          <p className="text-muted-foreground">
            Administra estudiantes, maestros y personal del instituto
          </p>
        </div>

        <div className="flex space-x-2">
          <Dialog open={isCreateUserOpen} onOpenChange={setIsCreateUserOpen}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="h-4 w-4 mr-2" />
                Nuevo Usuario
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Crear Nuevo Usuario</DialogTitle>
                <DialogDescription>
                  Registra un nuevo usuario en el sistema
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit(onSubmitUser)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="nombre">Nombre</Label>
                    <Input
                      id="nombre"
                      placeholder="Juan"
                      {...register('nombre')}
                    />
                    {errors.nombre && (
                      <p className="text-sm text-destructive">{errors.nombre.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="apellido">Apellido</Label>
                    <Input
                      id="apellido"
                      placeholder="Pérez"
                      {...register('apellido')}
                    />
                    {errors.apellido && (
                      <p className="text-sm text-destructive">{errors.apellido.message}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Correo Electrónico</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="juan.perez@ibas.edu"
                    {...register('email')}
                  />
                  {errors.email && (
                    <p className="text-sm text-destructive">{errors.email.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Contraseña</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    {...register('password')}
                  />
                  {errors.password && (
                    <p className="text-sm text-destructive">{errors.password.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="rol">Rol</Label>
                  <Select onValueChange={(value) => setValue('rol', value as UserRole)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar rol" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="alumno">Estudiante</SelectItem>
                      <SelectItem value="maestro">Maestro</SelectItem>
                      <SelectItem value="administrador">Administrador</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.rol && (
                    <p className="text-sm text-destructive">{errors.rol.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="telefono">Teléfono (opcional)</Label>
                    <Input
                      id="telefono"
                      placeholder="+58 414-123-4567"
                      {...register('telefono')}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="fechaNacimiento">Fecha Nacimiento (opcional)</Label>
                    <Input
                      id="fechaNacimiento"
                      type="date"
                      {...register('fechaNacimiento')}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="direccion">Dirección (opcional)</Label>
                  <Input
                    id="direccion"
                    placeholder="Caracas, Venezuela"
                    {...register('direccion')}
                  />
                </div>

                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setIsCreateUserOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'Creando...' : 'Crear Usuario'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>

          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Usuarios</CardTitle>
            <UsersIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              {stats.activeUsers} activos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Estudiantes</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.studentCount}</div>
            <p className="text-xs text-muted-foreground">
              Alumnos registrados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Maestros</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.teacherCount}</div>
            <p className="text-xs text-muted-foreground">
              Personal docente
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Administradores</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.adminCount}</div>
            <p className="text-xs text-muted-foreground">
              Personal administrativo
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tasa de Actividad</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.totalUsers > 0 ? Math.round((stats.activeUsers / stats.totalUsers) * 100) : 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              Usuarios activos
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Buscar usuarios por nombre o email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={selectedRole} onValueChange={setSelectedRole}>
          <SelectTrigger className="w-full md:w-48">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Filtrar por rol" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los roles</SelectItem>
            <SelectItem value="alumno">Estudiantes</SelectItem>
            <SelectItem value="maestro">Maestros</SelectItem>
            <SelectItem value="administrador">Administradores</SelectItem>
          </SelectContent>
        </Select>

        <Select value={selectedStatus} onValueChange={setSelectedStatus}>
          <SelectTrigger className="w-full md:w-48">
            <SelectValue placeholder="Filtrar por estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los estados</SelectItem>
            <SelectItem value="active">Activos</SelectItem>
            <SelectItem value="inactive">Inactivos</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Usuarios</CardTitle>
          <CardDescription>
            Gestiona todos los usuarios registrados en el sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Usuario</TableHead>
                <TableHead>Rol</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Último Acceso</TableHead>
                <TableHead>Fecha Registro</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {finalFilteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={user.foto} alt={user.nombre} />
                        <AvatarFallback>
                          {user.nombre.charAt(0)}{user.apellido.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{user.nombre} {user.apellido}</p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                        {user.telefono && (
                          <p className="text-xs text-muted-foreground">{user.telefono}</p>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getRoleBadgeColor(user.rol)}>
                      {getRoleLabel(user.rol)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <div className={`h-2 w-2 rounded-full ${
                        user.activo ? 'bg-green-500' : 'bg-red-500'
                      }`} />
                      <span className={user.activo ? 'text-green-700' : 'text-red-700'}>
                        {user.activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {user.ultimoAcceso ? 
                      new Date(user.ultimoAcceso).toLocaleDateString() : 
                      'Nunca'
                    }
                  </TableCell>
                  <TableCell>
                    {new Date(user.fechaCreacion).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => handleViewUser(user)}>
                          <Eye className="mr-2 h-4 w-4" />
                          Ver detalles
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEditUser(user)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleToggleUserStatus(user)}>
                          {user.activo ? (
                            <>
                              <UserX className="mr-2 h-4 w-4" />
                              Desactivar
                            </>
                          ) : (
                            <>
                              <UserCheck className="mr-2 h-4 w-4" />
                              Activar
                            </>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={() => handleDeleteUser(user)}
                          className="text-red-600"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Eliminar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {finalFilteredUsers.length === 0 && (
            <div className="text-center py-12">
              <UsersIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No se encontraron usuarios</h3>
              <p className="text-muted-foreground">
                {searchTerm ? 'Intenta con otros términos de búsqueda.' : 'No hay usuarios registrados aún.'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* User Details Dialog */}
      {selectedUser && (
        <Dialog open={isViewUserOpen} onOpenChange={setIsViewUserOpen}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Detalles del Usuario</DialogTitle>
              <DialogDescription>
                Información completa de {selectedUser.nombre} {selectedUser.apellido}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={selectedUser.foto} alt={selectedUser.nombre} />
                  <AvatarFallback className="text-lg">
                    {selectedUser.nombre.charAt(0)}{selectedUser.apellido.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-lg font-semibold">
                    {selectedUser.nombre} {selectedUser.apellido}
                  </h3>
                  <Badge className={getRoleBadgeColor(selectedUser.rol)}>
                    {getRoleLabel(selectedUser.rol)}
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{selectedUser.email}</span>
                  </div>
                  {selectedUser.telefono && (
                    <div className="flex items-center space-x-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>{selectedUser.telefono}</span>
                    </div>
                  )}
                  {selectedUser.direccion && (
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>{selectedUser.direccion}</span>
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>Registro: {new Date(selectedUser.fechaCreacion).toLocaleDateString()}</span>
                  </div>
                  {selectedUser.ultimoAcceso && (
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>Último acceso: {new Date(selectedUser.ultimoAcceso).toLocaleDateString()}</span>
                    </div>
                  )}
                  <div className="flex items-center space-x-2">
                    {selectedUser.activo ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-red-500" />
                    )}
                    <span>{selectedUser.activo ? 'Usuario activo' : 'Usuario inactivo'}</span>
                  </div>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default Users;
