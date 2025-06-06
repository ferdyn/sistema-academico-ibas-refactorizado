// Constantes utilizadas en toda la aplicación

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';

export const USER_ROLES = {
  ALUMNO: 'alumno',
  MAESTRO: 'maestro',
  ADMINISTRADOR: 'administrador',
} as const;

export const ROUTES = {
  LOGIN: '/login',
  DASHBOARD: '/dashboard',
  MATERIAS: '/materias',
  CURSOS: '/cursos',
  FINANZAS: '/finanzas',
  CALENDARIO: '/calendario',
  PERFIL: '/perfil',
  USERS: '/users',
} as const;

export const STORAGE_KEYS = {
  AUTH_TOKEN: 'ibas_auth_token',
  REFRESH_TOKEN: 'ibas_refresh_token',
  USER_DATA: 'ibas_user',
  THEME: 'ibas_theme',
} as const;

export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  PAGE_SIZE_OPTIONS: [5, 10, 20, 50],
} as const;

export const DATE_FORMATS = {
  FULL: 'dd/MM/yyyy HH:mm',
  DATE_ONLY: 'dd/MM/yyyy',
  TIME_ONLY: 'HH:mm',
} as const;
