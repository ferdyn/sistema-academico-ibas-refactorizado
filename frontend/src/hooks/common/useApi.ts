import { useState, useEffect, useCallback } from 'react';

interface UseApiOptions {
  immediate?: boolean;
  onSuccess?: (data: any) => void;
  onError?: (error: Error) => void;
}

interface UseApiReturn<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  clearError: () => void;
}

export function useApi<T = any>(
  apiCall: () => Promise<T>,
  options: UseApiOptions = {}
): UseApiReturn<T> {
  const { immediate = true, onSuccess, onError } = options;
  
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await apiCall();
      setData(result);
      
      if (onSuccess) {
        onSuccess(result);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      
      if (onError && err instanceof Error) {
        onError(err);
      }
    } finally {
      setLoading(false);
    }
  }, [apiCall, onSuccess, onError]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  useEffect(() => {
    if (immediate) {
      fetchData();
    }
  }, [immediate, fetchData]);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
    clearError
  };
}

// Hook especializado para datos mock
export function useMockData<T = any>(
  path: string = '/data/mock-data.json',
  options?: UseApiOptions
): UseApiReturn<T> {
  const fetchMockData = useCallback(async (): Promise<T> => {
    const response = await fetch(path);
    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }
    return response.json();
  }, [path]);

  return useApi(fetchMockData, options);
}

// Hook para datos filtrados
export function useFilteredData<T, R>(
  data: T | null,
  filterFn: (data: T) => R,
  deps: any[] = []
): R | null {
  const [filteredData, setFilteredData] = useState<R | null>(null);

  useEffect(() => {
    if (data) {
      setFilteredData(filterFn(data));
    } else {
      setFilteredData(null);
    }
  }, [data, ...deps]);

  return filteredData;
}
