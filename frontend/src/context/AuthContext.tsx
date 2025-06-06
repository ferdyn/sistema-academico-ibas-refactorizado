import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '@/types';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Verificar si hay una sesión guardada al cargar la aplicación
    const savedUser = localStorage.getItem('ibas_user');
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        setUser(userData);
      } catch (error) {
        console.error('Error parsing saved user data:', error);
        localStorage.removeItem('ibas_user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      // Simular una llamada a la API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Obtener datos mock
      const response = await fetch('/data/mock-data.json');
      const data = await response.json();
      
      // Buscar usuario en los datos mock
      const foundUser = data.users.find((u: User) => 
        u.email === email && u.password === password && u.activo
      );
      
      if (foundUser) {
        // Actualizar último acceso
        const userWithLastAccess = {
          ...foundUser,
          ultimoAcceso: new Date().toISOString()
        };
        
        setUser(userWithLastAccess);
        localStorage.setItem('ibas_user', JSON.stringify(userWithLastAccess));
        setIsLoading(false);
        return true;
      } else {
        setIsLoading(false);
        return false;
      }
    } catch (error) {
      console.error('Error during login:', error);
      setIsLoading(false);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('ibas_user');
  };

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      localStorage.setItem('ibas_user', JSON.stringify(updatedUser));
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    updateUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Hook para obtener datos específicos del rol del usuario
export const useUserRole = () => {
  const { user } = useAuth();
  
  return {
    isAdmin: user?.rol === 'administrador',
    isMaestro: user?.rol === 'maestro',
    isAlumno: user?.rol === 'alumno',
    role: user?.rol
  };
};

// Hook para verificar permisos
export const usePermissions = () => {
  const { user } = useAuth();
  
  const hasPermission = (permission: string): boolean => {
    if (!user) return false;
    
    const rolePermissions = {
      administrador: [
        'user.create', 'user.read', 'user.update', 'user.delete',
        'course.create', 'course.read', 'course.update', 'course.delete',
        'grade.create', 'grade.read', 'grade.update', 'grade.delete',
        'payment.create', 'payment.read', 'payment.update', 'payment.delete',
        'event.create', 'event.read', 'event.update', 'event.delete',
        'report.read', 'settings.update'
      ],
      maestro: [
        'course.read', 'course.update',
        'grade.create', 'grade.read', 'grade.update',
        'task.create', 'task.read', 'task.update',
        'exam.create', 'exam.read', 'exam.update',
        'event.create', 'event.read',
        'student.read'
      ],
      alumno: [
        'course.read', 'grade.read', 'task.read', 'exam.read',
        'payment.read', 'event.read', 'profile.update'
      ]
    };
    
    return rolePermissions[user.rol]?.includes(permission) || false;
  };
  
  return { hasPermission };
};
