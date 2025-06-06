import { format } from 'date-fns';
import { es } from 'date-fns/locale';

/**
 * Formatea una fecha en formato legible en español
 */
export const formatDate = (date: string | Date, formatStr: string = 'dd/MM/yyyy'): string => {
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return format(dateObj, formatStr, { locale: es });
  } catch {
    return 'Fecha inválida';
  }
};

/**
 * Formatea fecha y hora completa
 */
export const formatDateTime = (date: string | Date): string => {
  return formatDate(date, 'dd/MM/yyyy HH:mm');
};

/**
 * Formatea tiempo relativo (hace X días, etc.)
 */
export const formatRelativeTime = (date: string | Date): string => {
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - dateObj.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Ahora mismo';
    if (diffInMinutes < 60) return `Hace ${diffInMinutes} min`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `Hace ${diffInHours}h`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `Hace ${diffInDays} días`;
    
    return formatDate(dateObj);
  } catch {
    return 'Fecha inválida';
  }
};

/**
 * Formatea montos de dinero
 */
export const formatCurrency = (amount: number, currency: string = 'USD'): string => {
  return new Intl.NumberFormat('es-VE', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
};

/**
 * Formatea números con separadores de miles
 */
export const formatNumber = (num: number): string => {
  return new Intl.NumberFormat('es-VE').format(num);
};

/**
 * Formatea calificaciones con color
 */
export const formatGrade = (grade: number): { text: string; color: string } => {
  if (grade >= 90) return { text: `${grade}%`, color: 'text-green-600' };
  if (grade >= 80) return { text: `${grade}%`, color: 'text-blue-600' };
  if (grade >= 70) return { text: `${grade}%`, color: 'text-yellow-600' };
  if (grade >= 60) return { text: `${grade}%`, color: 'text-orange-600' };
  return { text: `${grade}%`, color: 'text-red-600' };
};

/**
 * Formatea nombres completos
 */
export const formatFullName = (firstName: string, lastName: string): string => {
  return `${firstName} ${lastName}`.trim();
};

/**
 * Formatea texto truncado
 */
export const truncateText = (text: string, maxLength: number = 100): string => {
  if (text.length <= maxLength) return text;
  return `${text.substring(0, maxLength)}...`;
};

/**
 * Formatea tamaño de archivo
 */
export const formatFileSize = (bytes: number): string => {
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  if (bytes === 0) return '0 Bytes';
  
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${Math.round(bytes / Math.pow(1024, i) * 100) / 100} ${sizes[i]}`;
};
