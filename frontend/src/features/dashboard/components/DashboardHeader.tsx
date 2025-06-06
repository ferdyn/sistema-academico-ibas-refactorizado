import React from 'react';
import { User } from '@/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CalendarDays, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';

interface DashboardHeaderProps {
  user: User;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({ user }) => {
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Buenos días';
    if (hour < 18) return 'Buenas tardes';
    return 'Buenas noches';
  };

  const getRoleBadgeVariant = (rol: string) => {
    switch (rol) {
      case 'administrador':
        return 'default';
      case 'maestro':
        return 'secondary';
      case 'alumno':
        return 'outline';
      default:
        return 'outline';
    }
  };

  const getRoleDisplayName = (rol: string) => {
    switch (rol) {
      case 'administrador':
        return 'Administrador';
      case 'maestro':
        return 'Maestro';
      case 'alumno':
        return 'Alumno';
      default:
        return rol;
    }
  };

  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
      <div className="space-y-2">
        <div className="flex items-center space-x-3">
          <h1 className="text-2xl md:text-3xl font-bold">
            {getGreeting()}, {user.nombre}
          </h1>
          <Badge variant={getRoleBadgeVariant(user.rol)}>
            {getRoleDisplayName(user.rol)}
          </Badge>
        </div>
        <p className="text-muted-foreground">
          Bienvenido al Sistema de Gestión Académica IBAS
        </p>
      </div>
      
      <div className="flex items-center space-x-2">
        <Button variant="outline" size="sm" asChild>
          <Link to="/calendario">
            <CalendarDays className="h-4 w-4 mr-2" />
            Ver Calendario
          </Link>
        </Button>
        <Button variant="outline" size="sm" asChild>
          <Link to="/perfil">
            <Settings className="h-4 w-4 mr-2" />
            Configuración
          </Link>
        </Button>
      </div>
    </div>
  );
};
