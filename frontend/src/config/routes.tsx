import { lazy } from 'react';
import { RouteObject } from 'react-router-dom';

// Lazy loading de componentes para mejor performance
const Login = lazy(() => import('@/pages/Login'));
const Dashboard = lazy(() => import('@/pages/Dashboard'));
const Materias = lazy(() => import('@/pages/Materias'));
const MateriaDetail = lazy(() => import('@/pages/MateriaDetail'));
const Cursos = lazy(() => import('@/pages/Cursos'));
const Finanzas = lazy(() => import('@/pages/Finanzas'));
const Calendario = lazy(() => import('@/pages/Calendario'));
const Perfil = lazy(() => import('@/pages/Perfil'));
const Users = lazy(() => import('@/pages/Users'));

export interface AppRoute {
  path: string;
  element: React.ComponentType;
  requireAuth?: boolean;
  allowedRoles?: ('alumno' | 'maestro' | 'administrador')[];
  exact?: boolean;
}

// Configuración declarativa de rutas
export const appRoutes: AppRoute[] = [
  // Rutas públicas
  {
    path: '/login',
    element: Login,
    requireAuth: false
  },

  // Rutas protegidas generales
  {
    path: '/dashboard',
    element: Dashboard,
    requireAuth: true
  },
  {
    path: '/materias',
    element: Materias,
    requireAuth: true
  },
  {
    path: '/materias/:id',
    element: MateriaDetail,
    requireAuth: true
  },
  {
    path: '/finanzas',
    element: Finanzas,
    requireAuth: true
  },
  {
    path: '/calendario',
    element: Calendario,
    requireAuth: true
  },
  {
    path: '/perfil',
    element: Perfil,
    requireAuth: true
  },

  // Rutas con restricciones de rol
  {
    path: '/cursos',
    element: Cursos,
    requireAuth: true,
    allowedRoles: ['maestro', 'administrador']
  },
  {
    path: '/users',
    element: Users,
    requireAuth: true,
    allowedRoles: ['administrador']
  }
];

// Rutas de redirección
export const redirectRoutes = [
  { from: '/', to: '/dashboard' },
  { from: '*', to: '/dashboard' }
];
