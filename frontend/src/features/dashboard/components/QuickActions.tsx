import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  Users,
  Calendar,
  FileText,
  Plus,
  Settings,
  DollarSign,
  GraduationCap,
  Upload,
  Download
} from 'lucide-react';

interface QuickActionsProps {
  userRole: 'alumno' | 'maestro' | 'administrador';
}

interface QuickAction {
  label: string;
  description: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  variant?: 'default' | 'outline' | 'secondary';
}

export const QuickActions: React.FC<QuickActionsProps> = ({ userRole }) => {
  const getQuickActions = (): QuickAction[] => {
    switch (userRole) {
      case 'alumno':
        return [
          {
            label: 'Ver Materias',
            description: 'Explora tus materias inscritas',
            href: '/materias',
            icon: BookOpen,
            variant: 'default'
          },
          {
            label: 'Calendario',
            description: 'Consulta tus eventos y tareas',
            href: '/calendario',
            icon: Calendar,
            variant: 'outline'
          },
          {
            label: 'Finanzas',
            description: 'Revisa tu estado financiero',
            href: '/finanzas',
            icon: DollarSign,
            variant: 'outline'
          },
          {
            label: 'Mi Perfil',
            description: 'Actualiza tu información',
            href: '/perfil',
            icon: Settings,
            variant: 'secondary'
          }
        ];

      case 'maestro':
        return [
          {
            label: 'Mis Cursos',
            description: 'Gestiona tus cursos activos',
            href: '/cursos',
            icon: GraduationCap,
            variant: 'default'
          },
          {
            label: 'Crear Tarea',
            description: 'Asigna nueva tarea a estudiantes',
            href: '/cursos/nueva-tarea',
            icon: Plus,
            variant: 'default'
          },
          {
            label: 'Calificaciones',
            description: 'Revisa y actualiza calificaciones',
            href: '/calificaciones',
            icon: FileText,
            variant: 'outline'
          },
          {
            label: 'Calendario',
            description: 'Programa eventos y clases',
            href: '/calendario',
            icon: Calendar,
            variant: 'outline'
          }
        ];

      case 'administrador':
        return [
          {
            label: 'Gestionar Usuarios',
            description: 'Administra estudiantes y maestros',
            href: '/users',
            icon: Users,
            variant: 'default'
          },
          {
            label: 'Nuevo Curso',
            description: 'Crear nuevo curso académico',
            href: '/cursos/nuevo',
            icon: Plus,
            variant: 'default'
          },
          {
            label: 'Reportes Financieros',
            description: 'Generar reportes de ingresos',
            href: '/finanzas/reportes',
            icon: Download,
            variant: 'outline'
          },
          {
            label: 'Configuración',
            description: 'Ajustes del sistema',
            href: '/configuracion',
            icon: Settings,
            variant: 'secondary'
          }
        ];

      default:
        return [];
    }
  };

  const quickActions = getQuickActions();

  return (
    <Card className="h-fit">
      <CardHeader>
        <CardTitle className="text-lg font-semibold flex items-center">
          <Plus className="h-5 w-5 mr-2" />
          Acciones Rápidas
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <div className="grid gap-3">
          {quickActions.map((action, index) => (
            <Button
              key={index}
              variant={action.variant}
              className="h-auto p-4 justify-start text-left"
              asChild
            >
              <Link to={action.href}>
                <div className="flex items-start space-x-3 w-full">
                  <action.icon className="h-5 w-5 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm">
                      {action.label}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {action.description}
                    </div>
                  </div>
                </div>
              </Link>
            </Button>
          ))}
        </div>
        
        {/* Sección adicional para administradores */}
        {userRole === 'administrador' && (
          <div className="mt-6 pt-4 border-t">
            <h4 className="text-sm font-medium mb-3 text-muted-foreground">
              Herramientas Avanzadas
            </h4>
            <div className="grid gap-2">
              <Button variant="ghost" size="sm" className="justify-start" asChild>
                <Link to="/backup">
                  <Upload className="h-4 w-4 mr-2" />
                  Respaldo de Datos
                </Link>
              </Button>
              <Button variant="ghost" size="sm" className="justify-start" asChild>
                <Link to="/logs">
                  <FileText className="h-4 w-4 mr-2" />
                  Logs del Sistema
                </Link>
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
