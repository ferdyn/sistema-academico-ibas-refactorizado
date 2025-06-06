import { useState, useCallback, useMemo } from 'react';

type ValidationRule = {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: any) => string | null;
};

type ValidationRules<T> = {
  [K in keyof T]?: ValidationRule;
};

type ValidationErrors<T> = {
  [K in keyof T]?: string;
};

interface UseFormValidationReturn<T> {
  values: T;
  errors: ValidationErrors<T>;
  isValid: boolean;
  isSubmitting: boolean;
  setValue: (field: keyof T, value: any) => void;
  setValues: (values: Partial<T>) => void;
  setError: (field: keyof T, error: string) => void;
  clearError: (field: keyof T) => void;
  clearErrors: () => void;
  validateField: (field: keyof T) => boolean;
  validateForm: () => boolean;
  handleSubmit: (onSubmit: (values: T) => Promise<void> | void) => (e?: React.FormEvent) => Promise<void>;
  resetForm: () => void;
}

export function useFormValidation<T extends Record<string, any>>(
  initialValues: T,
  validationRules: ValidationRules<T> = {}
): UseFormValidationReturn<T> {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<ValidationErrors<T>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Validar un campo específico
  const validateField = useCallback((field: keyof T): boolean => {
    const value = values[field];
    const rules = validationRules[field];
    
    if (!rules) return true;

    // Required validation
    if (rules.required && (!value || (typeof value === 'string' && value.trim() === ''))) {
      setErrors(prev => ({ ...prev, [field]: 'Este campo es requerido' }));
      return false;
    }

    // MinLength validation
    if (rules.minLength && typeof value === 'string' && value.length < rules.minLength) {
      setErrors(prev => ({ 
        ...prev, 
        [field]: `Debe tener al menos ${rules.minLength} caracteres` 
      }));
      return false;
    }

    // MaxLength validation
    if (rules.maxLength && typeof value === 'string' && value.length > rules.maxLength) {
      setErrors(prev => ({ 
        ...prev, 
        [field]: `No debe exceder ${rules.maxLength} caracteres` 
      }));
      return false;
    }

    // Pattern validation
    if (rules.pattern && typeof value === 'string' && !rules.pattern.test(value)) {
      setErrors(prev => ({ ...prev, [field]: 'Formato inválido' }));
      return false;
    }

    // Custom validation
    if (rules.custom) {
      const customError = rules.custom(value);
      if (customError) {
        setErrors(prev => ({ ...prev, [field]: customError }));
        return false;
      }
    }

    // Clear error if validation passes
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });

    return true;
  }, [values, validationRules]);

  // Validar todo el formulario
  const validateForm = useCallback((): boolean => {
    let isFormValid = true;
    
    Object.keys(validationRules).forEach(field => {
      const fieldValid = validateField(field as keyof T);
      if (!fieldValid) {
        isFormValid = false;
      }
    });

    return isFormValid;
  }, [validateField, validationRules]);

  // Actualizar valor de un campo
  const setValue = useCallback((field: keyof T, value: any) => {
    setValues(prev => ({ ...prev, [field]: value }));
    
    // Validar campo después de cambio
    setTimeout(() => {
      validateField(field);
    }, 100);
  }, [validateField]);

  // Actualizar múltiples valores
  const setValuesCallback = useCallback((newValues: Partial<T>) => {
    setValues(prev => ({ ...prev, ...newValues }));
  }, []);

  // Establecer error manualmente
  const setError = useCallback((field: keyof T, error: string) => {
    setErrors(prev => ({ ...prev, [field]: error }));
  }, []);

  // Limpiar error específico
  const clearError = useCallback((field: keyof T) => {
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  }, []);

  // Limpiar todos los errores
  const clearErrors = useCallback(() => {
    setErrors({});
  }, []);

  // Manejar envío del formulario
  const handleSubmit = useCallback((
    onSubmit: (values: T) => Promise<void> | void
  ) => {
    return async (e?: React.FormEvent) => {
      if (e) {
        e.preventDefault();
      }

      setIsSubmitting(true);
      
      try {
        const isFormValid = validateForm();
        
        if (isFormValid) {
          await onSubmit(values);
        }
      } catch (error) {
        console.error('Error submitting form:', error);
        // Aquí podrías manejar errores de envío
      } finally {
        setIsSubmitting(false);
      }
    };
  }, [values, validateForm]);

  // Resetear formulario
  const resetForm = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setIsSubmitting(false);
  }, [initialValues]);

  // Calcular si el formulario es válido
  const isValid = useMemo(() => {
    return Object.keys(errors).length === 0 && 
           Object.keys(validationRules).every(field => {
             const rules = validationRules[field as keyof T];
             const value = values[field as keyof T];
             
             if (rules?.required) {
               return value && (typeof value !== 'string' || value.trim() !== '');
             }
             
             return true;
           });
  }, [errors, values, validationRules]);

  return {
    values,
    errors,
    isValid,
    isSubmitting,
    setValue,
    setValues: setValuesCallback,
    setError,
    clearError,
    clearErrors,
    validateField,
    validateForm,
    handleSubmit,
    resetForm
  };
}

// Hook especializado para formularios comunes
export const useLoginForm = () => {
  return useFormValidation(
    { email: '', password: '' },
    {
      email: {
        required: true,
        pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        custom: (value) => {
          if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
            return 'Ingresa un email válido';
          }
          return null;
        }
      },
      password: {
        required: true,
        minLength: 6,
        custom: (value) => {
          if (value && value.length < 6) {
            return 'La contraseña debe tener al menos 6 caracteres';
          }
          return null;
        }
      }
    }
  );
};

export const useUserForm = () => {
  return useFormValidation(
    {
      nombre: '',
      apellido: '',
      email: '',
      telefono: '',
      rol: 'alumno' as const
    },
    {
      nombre: { required: true, minLength: 2, maxLength: 50 },
      apellido: { required: true, minLength: 2, maxLength: 50 },
      email: {
        required: true,
        pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      },
      telefono: {
        pattern: /^\+?[\d\s-()]+$/,
        custom: (value) => {
          if (value && !/^\+?[\d\s-()]+$/.test(value)) {
            return 'Ingresa un teléfono válido';
          }
          return null;
        }
      }
    }
  );
};
