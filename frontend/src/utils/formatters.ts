import { format } from 'date-fns';
import { es } from 'date-fns/locale';

/**
 * Formatea una fecha en formato europeo (dd/MM/yyyy)
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
 * Formatea fecha y hora completa en formato europeo
 */
export const formatDateTime = (date: string | Date): string => {
  return formatDate(date, 'dd/MM/yyyy HH:mm');
};

/**
 * Formatea tiempo relativo en español
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
 * Formatea montos en euros (formato europeo)
 */
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

/**
 * Formatea euros sin símbolo
 */
export const formatEuros = (amount: number): string => {
  return new Intl.NumberFormat('es-ES', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount) + ' €';
};

/**
 * Formatea números con separadores europeos (punto para miles, coma para decimales)
 */
export const formatNumber = (num: number): string => {
  return new Intl.NumberFormat('es-ES').format(num);
};

/**
 * Formatea calificaciones europeas (0-10 escala)
 */
export const formatGrade = (grade: number): { text: string; color: string; description: string } => {
  if (grade >= 9) return { 
    text: `${grade.toFixed(1)}`, 
    color: 'text-green-600', 
    description: 'Sobresaliente' 
  };
  if (grade >= 7) return { 
    text: `${grade.toFixed(1)}`, 
    color: 'text-blue-600', 
    description: 'Notable' 
  };
  if (grade >= 5) return { 
    text: `${grade.toFixed(1)}`, 
    color: 'text-yellow-600', 
    description: 'Aprobado' 
  };
  return { 
    text: `${grade.toFixed(1)}`, 
    color: 'text-red-600', 
    description: 'Suspenso' 
  };
};

/**
 * Formatea nombres completos (europeo: apellidos, nombre)
 */
export const formatFullName = (firstName: string, lastName: string, european: boolean = false): string => {
  if (european) {
    return `${lastName}, ${firstName}`.trim();
  }
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
 * Formatea tamaño de archivo (formato europeo)
 */
export const formatFileSize = (bytes: number): string => {
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  if (bytes === 0) return '0 Bytes';
  
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  const size = (bytes / Math.pow(1024, i)).toLocaleString('es-ES', {
    minimumFractionDigits: i > 0 ? 1 : 0,
    maximumFractionDigits: 2
  });
  return `${size} ${sizes[i]}`;
};

/**
 * Formatea porcentajes
 */
export const formatPercentage = (value: number): string => {
  return new Intl.NumberFormat('es-ES', {
    style: 'percent',
    minimumFractionDigits: 1,
    maximumFractionDigits: 2
  }).format(value / 100);
};

/**
 * Formatea fechas para inputs de tipo date (yyyy-MM-dd)
 */
export const formatDateForInput = (date: string | Date): string => {
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return format(dateObj, 'yyyy-MM-dd');
  } catch {
    return '';
  }
};

/**
 * Convierte fecha de input a formato de visualización
 */
export const formatInputToDisplay = (dateString: string): string => {
  try {
    const [year, month, day] = dateString.split('-');
    return `${day}/${month}/${year}`;
  } catch {
    return dateString;
  }
};
