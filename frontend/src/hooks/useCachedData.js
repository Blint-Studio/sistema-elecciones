import { useState, useCallback, useEffect } from 'react';
import globalCache, { invalidateRelatedCaches } from '../utils/globalCache';

/**
 * Hook personalizado para manejo optimizado de datos con cache
 * @param {string} cacheKey - Clave del cache
 * @param {Function} fetchFunction - Función para obtener los datos
 * @param {Array} dependencies - Dependencias para recargar los datos
 * @returns {Object} - { data, loading, error, refetch, invalidate }
 */
export const useCachedData = (cacheKey, fetchFunction, dependencies = []) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchData = useCallback(async (forceRefresh = false) => {
    try {
      // Intentar obtener del cache primero si no es refresh forzado
      if (!forceRefresh) {
        const cachedData = globalCache.get(cacheKey);
        if (cachedData) {
          setData(cachedData);
          setLoading(false);
          return cachedData;
        }
      }

      setLoading(true);
      setError('');
      
      const result = await fetchFunction();
      const dataArray = Array.isArray(result) ? result : [];
      
      // Guardar en cache
      globalCache.set(cacheKey, dataArray);
      setData(dataArray);
      
      return dataArray;
    } catch (err) {
      console.error(`Error fetching ${cacheKey}:`, err);
      setError(err.message || `Error al cargar ${cacheKey}`);
      
      // En caso de error, intentar usar datos del cache aunque estén expirados
      const cachedData = globalCache.caches[cacheKey]?.data;
      if (cachedData) {
        setData(cachedData);
      } else {
        setData([]);
      }
    } finally {
      setLoading(false);
    }
  }, [cacheKey, fetchFunction]);

  // Función para invalidar el cache específico
  const invalidate = useCallback(() => {
    globalCache.invalidate(cacheKey);
  }, [cacheKey]);

  // Función para refrescar los datos
  const refetch = useCallback((forceRefresh = true) => {
    return fetchData(forceRefresh);
  }, [fetchData]);

  // Cargar datos inicial - ARREGLADO: usar solo dependencies, no fetchData
  useEffect(() => {
    fetchData();
  }, [cacheKey, ...dependencies]); // Cambié fetchData por cacheKey

  return {
    data,
    loading,
    error,
    refetch,
    invalidate
  };
};

/**
 * Hook simplificado para invalidación de cache
 * @returns {Function} - Función para invalidar caches
 */
export const useCacheInvalidation = () => {
  return useCallback((caches) => {
    if (Array.isArray(caches)) {
      // Si es un array, invalidar directamente
      globalCache.invalidateMultiple(caches);
    } else {
      // Si es una acción, usar el sistema de relaciones
      invalidateRelatedCaches(caches);
    }
  }, []);
};

/**
 * Hook para cargar múltiples tipos de datos en paralelo con cache
 * @param {Array} dataConfigs - Array de configuraciones { key, fetchFn }
 * @returns {Object} - { data, loading, error, refetchAll }
 */
export const useMultipleCachedData = (dataConfigs) => {
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadAllData = useCallback(async (forceRefresh = false) => {
    try {
      setLoading(true);
      setError('');

      const promises = dataConfigs.map(async (config) => {
        // Verificar cache primero
        if (!forceRefresh) {
          const cachedData = globalCache.get(config.key);
          if (cachedData) {
            return { key: config.key, data: cachedData };
          }
        }

        // Obtener datos frescos
        const result = await config.fetchFn();
        const dataArray = Array.isArray(result) ? result : [];
        globalCache.set(config.key, dataArray);
        return { key: config.key, data: dataArray };
      });

      const results = await Promise.all(promises);
      
      const newData = {};
      results.forEach(result => {
        newData[result.key] = result.data;
      });

      setData(newData);
    } catch (err) {
      console.error('Error loading multiple data:', err);
      setError(err.message || 'Error al cargar datos');
    } finally {
      setLoading(false);
    }
  }, [dataConfigs]);

  const refetchAll = useCallback((forceRefresh = true) => {
    return loadAllData(forceRefresh);
  }, [loadAllData]);

  // ARREGLADO: Usar un useEffect más estable
  useEffect(() => {
    if (dataConfigs && dataConfigs.length > 0) {
      loadAllData();
    }
  }, [dataConfigs.length]); // Solo depender de la longitud del array

  return {
    data,
    loading,
    error,
    refetchAll
  };
};
