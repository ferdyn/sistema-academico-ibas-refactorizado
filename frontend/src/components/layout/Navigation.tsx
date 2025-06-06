import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth, useUserRole } from '@/context/AuthContext';
import { useUserNotifications } from '@/hooks/useData';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useTheme } from 'next-themes';
import {
  Home, BookOpen, Users, Calendar, DollarSign, Settings, 
  LogOut, Menu, Bell, Sun, Moon, User, GraduationCap,
  FileText, UserCheck, BarChart3, CreditCard, School,
  ChevronLeft, ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavigationItem {
  title: string;
  href: string;
  icon: React.ElementType;
  roles: ('alumno' | 'maestro' | 'administrador')[];
  badge?: string;
}

const navigationItems: NavigationItem[] = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: Home,
    roles: ['alumno', 'maestro', 'administrador']
  },
  {
    title: 'Materias',
    href: '/materias',
    icon: BookOpen,
    roles: ['alumno', 'maestro', 'administrador']
  },
  {
    title: 'Cursos',
    href: '/cursos',
    icon: GraduationCap,
    roles: ['maestro', 'administrador']
  },
  {
    title: 'Finanzas',
    href: '/finanzas',
    icon: DollarSign,
    roles: ['alumno', 'maestro', 'administrador']
  },
  {
    title: 'Calendario',
    href: '/calendario',
    icon: Calendar,
    roles: ['alumno', 'maestro', 'administrador']
  },
  {
    title: 'Mi Perfil',
    href: '/perfil',
    icon: User,
    roles: ['alumno', 'maestro', 'administrador']
  },
  {
    title: 'Usuarios',
    href: '/users',
    icon: Users,
    roles: ['administrador']
  },
  {
    title: 'Reportes',
    href: '/reportes',
    icon: BarChart3,
    roles: ['administrador']
  }
];

// Navegación de escritorio
interface DesktopNavigationProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
}

const DesktopNavigation: React.FC<DesktopNavigationProps> = ({ collapsed, onToggleCollapse }) => {
  const location = useLocation();
  const { user } = useAuth();
  const { role } = useUserRole();
  const { notifications, unreadCount } = useUserNotifications();

  const filteredItems = navigationItems.filter(item => 
    role && item.roles.includes(role)
  );

  return (
    <div className={cn(
      'hidden md:flex flex-col h-screen bg-card border-r transition-all duration-300',
      collapsed ? 'w-16' : 'w-64'
    )}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        {!collapsed && (
          <div className="flex items-center space-x-2">
            <School className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-lg font-bold">IBAS</h1>
              <p className="text-xs text-muted-foreground">Instituto Bíblico</p>
            </div>
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleCollapse}
          className="ml-auto"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 p-4 space-y-2">
        {filteredItems.map((item) => {
          const isActive = location.pathname === item.href || 
            (item.href !== '/dashboard' && location.pathname.startsWith(item.href));
          
          return (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                'flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent',
                collapsed && 'justify-center'
              )}
            >
              <item.icon className="h-5 w-5 flex-shrink-0" />
              {!collapsed && <span>{item.title}</span>}
              {!collapsed && item.badge && (
                <Badge variant="secondary" className="ml-auto">
                  {item.badge}
                </Badge>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t">
        <UserProfileDropdown collapsed={collapsed} />
      </div>
    </div>
  );
};

// Navegación móvil
const MobileNavigation: React.FC = () => {
  const location = useLocation();
  const { role } = useUserRole();
  const [isOpen, setIsOpen] = useState(false);

  const filteredItems = navigationItems.filter(item => 
    role && item.roles.includes(role)
  );

  // Mostrar solo los 4 elementos más importantes en la barra inferior
  const primaryItems = filteredItems.slice(0, 4);
  const secondaryItems = filteredItems.slice(4);

  return (
    <>
      {/* Top Bar */}
      <div className="md:hidden flex items-center justify-between p-4 bg-card border-b">
        <div className="flex items-center space-x-2">
          <School className="h-6 w-6 text-primary" />
          <h1 className="text-lg font-bold">IBAS</h1>
        </div>
        
        <div className="flex items-center space-x-2">
          <NotificationBell />
          <UserProfileDropdown collapsed={false} />
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-card border-t">
        <div className="flex items-center justify-around px-4 py-2">
          {primaryItems.map((item) => {
            const isActive = location.pathname === item.href || 
              (item.href !== '/dashboard' && location.pathname.startsWith(item.href));
            
            return (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  'flex flex-col items-center justify-center p-2 rounded-lg transition-colors min-w-[60px]',
                  isActive
                    ? 'text-primary'
                    : 'text-muted-foreground'
                )}
              >
                <item.icon className="h-5 w-5" />
                <span className="text-xs mt-1">{item.title}</span>
              </Link>
            );
          })}
          
          {/* Botón "Más" para opciones adicionales */}
          {secondaryItems.length > 0 && (
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <button className="flex flex-col items-center justify-center p-2 rounded-lg transition-colors min-w-[60px] text-muted-foreground">
                  <Menu className="h-5 w-5" />
                  <span className="text-xs mt-1">Más</span>
                </button>
              </SheetTrigger>
              <SheetContent side="bottom" className="h-auto">
                <div className="grid grid-cols-2 gap-4 p-4">
                  {secondaryItems.map((item) => (
                    <Link
                      key={item.href}
                      to={item.href}
                      onClick={() => setIsOpen(false)}
                      className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-accent transition-colors"
                    >
                      <item.icon className="h-5 w-5 text-primary" />
                      <span className="font-medium">{item.title}</span>
                    </Link>
                  ))}
                </div>
              </SheetContent>
            </Sheet>
          )}
        </div>
      </div>
    </>
  );
};

// Componente de notificaciones
const NotificationBell: React.FC = () => {
  const { notifications, unreadCount } = useUserNotifications();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <div className="p-3 border-b">
          <h3 className="font-semibold">Notificaciones</h3>
          {unreadCount > 0 && (
            <p className="text-sm text-muted-foreground">
              {unreadCount} sin leer
            </p>
          )}
        </div>
        <div className="max-h-96 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground">
              No hay notificaciones
            </div>
          ) : (
            notifications.slice(0, 5).map((notification) => (
              <DropdownMenuItem key={notification.id} className="p-3 cursor-pointer">
                <div className="flex flex-col space-y-1 w-full">
                  <div className="flex items-start justify-between">
                    <h4 className="text-sm font-medium">{notification.titulo}</h4>
                    {!notification.leida && (
                      <div className="h-2 w-2 rounded-full bg-primary flex-shrink-0 mt-1" />
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {notification.mensaje}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(notification.fechaCreacion).toLocaleDateString()}
                  </p>
                </div>
              </DropdownMenuItem>
            ))
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

// Componente de perfil de usuario
interface UserProfileDropdownProps {
  collapsed: boolean;
}

const UserProfileDropdown: React.FC<UserProfileDropdownProps> = ({ collapsed }) => {
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getInitials = (nombre: string, apellido: string) => {
    return `${nombre.charAt(0)}${apellido.charAt(0)}`.toUpperCase();
  };

  const getRoleLabel = (role: string) => {
    const labels = {
      alumno: 'Estudiante',
      maestro: 'Maestro',
      administrador: 'Administrador'
    };
    return labels[role as keyof typeof labels] || role;
  };

  if (!user) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className={cn(
          'w-full justify-start',
          collapsed ? 'px-2' : 'px-3'
        )}>
          <Avatar className="h-8 w-8">
            <AvatarImage src={user.foto} alt={user.nombre} />
            <AvatarFallback>{getInitials(user.nombre, user.apellido)}</AvatarFallback>
          </Avatar>
          {!collapsed && (
            <div className="ml-2 text-left">
              <p className="text-sm font-medium">{user.nombre} {user.apellido}</p>
              <p className="text-xs text-muted-foreground">{getRoleLabel(user.rol)}</p>
            </div>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuItem asChild>
          <Link to="/perfil" className="flex items-center">
            <User className="mr-2 h-4 w-4" />
            Mi Perfil
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/configuracion" className="flex items-center">
            <Settings className="mr-2 h-4 w-4" />
            Configuración
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
          {theme === 'dark' ? (
            <>
              <Sun className="mr-2 h-4 w-4" />
              Modo Claro
            </>
          ) : (
            <>
              <Moon className="mr-2 h-4 w-4" />
              Modo Oscuro
            </>
          )}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout} className="text-destructive">
          <LogOut className="mr-2 h-4 w-4" />
          Cerrar Sesión
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

// Componente principal de navegación
interface NavigationProps {
  children: React.ReactNode;
}

export const Navigation: React.FC<NavigationProps> = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Desktop Navigation */}
      <DesktopNavigation 
        collapsed={collapsed} 
        onToggleCollapse={() => setCollapsed(!collapsed)} 
      />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile Navigation */}
        <MobileNavigation />
        
        {/* Content Area */}
        <main className="flex-1 overflow-y-auto bg-background p-4 md:p-6 pb-20 md:pb-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Navigation;
