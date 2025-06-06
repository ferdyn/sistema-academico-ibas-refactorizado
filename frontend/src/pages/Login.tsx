import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { School, Eye, EyeOff, Loader2, Users, BookOpen, Calendar } from 'lucide-react';
import { useTheme } from 'next-themes';

const loginSchema = z.object({
  email: z.string().email('Correo electrónico inválido'),
  password: z.string().min(1, 'La contraseña es requerida')
});

type LoginForm = z.infer<typeof loginSchema>;

const Login: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
  const { login, isAuthenticated, isLoading } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: ''
    }
  });

  // Redireccionar si ya está autenticado
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const onSubmit = async (data: LoginForm) => {
    setLoginError('');
    
    try {
      const success = await login(data.email, data.password);
      if (success) {
        navigate('/dashboard');
      } else {
        setLoginError('Credenciales incorrectas. Por favor, verifica tu correo y contraseña.');
      }
    } catch (error) {
      setLoginError('Error al iniciar sesión. Por favor, intenta nuevamente.');
    }
  };

  // Cuentas demo para facilitar las pruebas
  const demoAccounts = [
    {
      role: 'Administrador',
      email: 'admin@ibas.edu',
      password: 'admin123',
      description: 'Acceso completo al sistema'
    },
    {
      role: 'Maestro',
      email: 'jsanchez@ibas.edu',
      password: 'maestro123',
      description: 'Gestión de cursos y calificaciones'
    },
    {
      role: 'Estudiante',
      email: 'pedro.garcia@estudiante.ibas.edu',
      password: 'alumno123',
      description: 'Acceso a materias y calificaciones'
    }
  ];

  const handleDemoLogin = (email: string, password: string) => {
    // Llenar el formulario con las credenciales demo
    const form = document.getElementById('login-form') as HTMLFormElement;
    const emailInput = form.querySelector('input[name="email"]') as HTMLInputElement;
    const passwordInput = form.querySelector('input[name="password"]') as HTMLInputElement;
    
    emailInput.value = email;
    passwordInput.value = password;
    
    // Trigger the form submission
    handleSubmit(onSubmit)();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-900 dark:to-slate-800">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="text-lg">Cargando...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-900 dark:to-slate-800 p-4">
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        
        {/* Información del Sistema - Lado Izquierdo */}
        <div className="space-y-8">
          <div className="text-center lg:text-left">
            <div className="flex items-center justify-center lg:justify-start space-x-3 mb-6">
              <div className="p-3 bg-primary rounded-xl">
                <School className="h-8 w-8 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-foreground">IBAS</h1>
                <p className="text-lg text-muted-foreground">Instituto Bíblico Apostólico Sur</p>
              </div>
            </div>
            
            <h2 className="text-2xl lg:text-3xl font-bold text-foreground mb-4">
              Sistema de Gestión Académica
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Plataforma integral para estudiantes, maestros y administradores del instituto
            </p>
          </div>

          {/* Características del Sistema */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex flex-col items-center p-6 bg-card rounded-lg border shadow-sm">
              <div className="p-3 bg-primary/10 rounded-full mb-4">
                <BookOpen className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Gestión Académica</h3>
              <p className="text-sm text-muted-foreground text-center">
                Materias, cursos, calificaciones y tareas
              </p>
            </div>
            
            <div className="flex flex-col items-center p-6 bg-card rounded-lg border shadow-sm">
              <div className="p-3 bg-primary/10 rounded-full mb-4">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Gestión de Usuarios</h3>
              <p className="text-sm text-muted-foreground text-center">
                Estudiantes, maestros y administradores
              </p>
            </div>
            
            <div className="flex flex-col items-center p-6 bg-card rounded-lg border shadow-sm">
              <div className="p-3 bg-primary/10 rounded-full mb-4">
                <Calendar className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Calendario</h3>
              <p className="text-sm text-muted-foreground text-center">
                Eventos académicos y administrativos
              </p>
            </div>
          </div>

          {/* Cuentas Demo */}
          <div className="bg-card p-6 rounded-lg border">
            <h3 className="text-lg font-semibold mb-4">Cuentas de Demostración</h3>
            <div className="space-y-3">
              {demoAccounts.map((account, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <Badge variant="outline">{account.role}</Badge>
                      <span className="text-sm font-medium">{account.email}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{account.description}</p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleDemoLogin(account.email, account.password)}
                    className="ml-2"
                  >
                    Probar
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Formulario de Login - Lado Derecho */}
        <div className="flex items-center justify-center">
          <Card className="w-full max-w-md shadow-xl">
            <CardHeader className="space-y-1 text-center">
              <CardTitle className="text-2xl font-bold">Iniciar Sesión</CardTitle>
              <CardDescription>
                Ingresa tus credenciales para acceder al sistema
              </CardDescription>
            </CardHeader>
            
            <form id="login-form" onSubmit={handleSubmit(onSubmit)}>
              <CardContent className="space-y-4">
                {loginError && (
                  <Alert variant="destructive">
                    <AlertDescription>{loginError}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email">Correo Electrónico</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="tu.correo@ibas.edu"
                    {...register('email')}
                    className={errors.email ? 'border-destructive' : ''}
                  />
                  {errors.email && (
                    <p className="text-sm text-destructive">{errors.email.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Contraseña</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      {...register('password')}
                      className={errors.password ? 'border-destructive pr-10' : 'pr-10'}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      )}
                    </Button>
                  </div>
                  {errors.password && (
                    <p className="text-sm text-destructive">{errors.password.message}</p>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <input
                      id="remember"
                      type="checkbox"
                      className="rounded border-gray-300"
                    />
                    <Label htmlFor="remember" className="text-sm">
                      Recordarme
                    </Label>
                  </div>
                  <Link
                    to="/forgot-password"
                    className="text-sm text-primary hover:underline"
                  >
                    ¿Olvidaste tu contraseña?
                  </Link>
                </div>
              </CardContent>

              <CardFooter className="flex flex-col space-y-4">
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Iniciando sesión...
                    </>
                  ) : (
                    'Iniciar Sesión'
                  )}
                </Button>

                <Separator />

                <div className="text-center">
                  <p className="text-sm text-muted-foreground">
                    ¿Necesitas ayuda?{' '}
                    <Link to="/contact" className="text-primary hover:underline">
                      Contacta al administrador
                    </Link>
                  </p>
                </div>
              </CardFooter>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Login;
