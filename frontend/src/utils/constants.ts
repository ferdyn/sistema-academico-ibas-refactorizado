// Constantes para formato europeo - Sistema IBAS

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';

export const USER_ROLES = {
  ALUMNO: 'alumno',
  PROFESOR: 'profesor', // Cambiado de 'maestro' a 'profesor' (más común en Europa)
  ADMINISTRADOR: 'administrador',
} as const;

export const ROUTES = {
  LOGIN: '/login',
  DASHBOARD: '/dashboard',
  ASIGNATURAS: '/asignaturas', // Cambiado de 'materias' a 'asignaturas'
  CURSOS: '/cursos',
  FINANZAS: '/finanzas',
  CALENDARIO: '/calendario',
  PERFIL: '/perfil',
  USUARIOS: '/usuarios',
} as const;

export const STORAGE_KEYS = {
  AUTH_TOKEN: 'ibas_auth_token',
  REFRESH_TOKEN: 'ibas_refresh_token',
  USER_DATA: 'ibas_user',
  THEME: 'ibas_theme',
  LOCALE: 'ibas_locale',
} as const;

export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  PAGE_SIZE_OPTIONS: [5, 10, 20, 50],
} as const;

export const DATE_FORMATS = {
  FULL: 'dd/MM/yyyy HH:mm',
  DATE_ONLY: 'dd/MM/yyyy',
  TIME_ONLY: 'HH:mm',
  INPUT: 'yyyy-MM-dd',
  MONTH_YEAR: 'MM/yyyy',
} as const;

export const LOCALE_CONFIG = {
  LANGUAGE: 'es-ES',
  CURRENCY: 'EUR',
  DATE_LOCALE: 'es',
  TIMEZONE: 'Europe/Madrid',
} as const;

export const ACADEMIC_TERMS = {
  GRADES: {
    SCALE: '0-10',
    PASS_MARK: 5,
    EXCELLENT: 9,
    GOOD: 7,
    SATISFACTORY: 5,
    FAIL: 0
  },
  PERIODS: {
    FIRST_QUARTER: 'Primer Trimestre',
    SECOND_QUARTER: 'Segundo Trimestre', 
    THIRD_QUARTER: 'Tercer Trimestre',
    FIRST_SEMESTER: 'Primer Semestre',
    SECOND_SEMESTER: 'Segundo Semestre',
    ACADEMIC_YEAR: 'Curso Académico'
  },
  SUBJECTS: {
    MATHEMATICS: 'Matemáticas',
    LANGUAGE: 'Lengua Castellana y Literatura',
    ENGLISH: 'Inglés',
    SCIENCE: 'Ciencias Naturales',
    HISTORY: 'Historia',
    GEOGRAPHY: 'Geografía',
    PHYSICAL_EDUCATION: 'Educación Física',
    ART: 'Educación Artística',
    TECHNOLOGY: 'Tecnología',
    PHILOSOPHY: 'Filosofía'
  }
} as const;

export const CURRENCY_CONFIG = {
  SYMBOL: '€',
  CODE: 'EUR',
  FORMAT: 'symbol',
  DECIMAL_PLACES: 2,
  THOUSANDS_SEPARATOR: '.',
  DECIMAL_SEPARATOR: ',',
} as const;

export const VALIDATION_PATTERNS = {
  SPANISH_DNI: /^[0-9]{8}[TRWAGMYFPDXBNJZSQVHLCKE]$/i,
  SPANISH_PHONE: /^[6789][0-9]{8}$/,
  IBAN: /^ES[0-9]{22}$/,
  POSTAL_CODE: /^[0-9]{5}$/,
  EMAIL: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
} as const;

export const SPANISH_REGIONS = [
  'Andalucía',
  'Aragón', 
  'Asturias',
  'Islas Baleares',
  'Canarias',
  'Cantabria',
  'Castilla y León',
  'Castilla-La Mancha',
  'Cataluña',
  'Comunidad Valenciana',
  'Extremadura',
  'Galicia',
  'Madrid',
  'Murcia',
  'Navarra',
  'País Vasco',
  'La Rioja',
  'Ceuta',
  'Melilla'
] as const;
