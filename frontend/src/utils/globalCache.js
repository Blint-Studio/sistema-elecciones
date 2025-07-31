/**
 * Sistema de cache global optimizado para la aplicación
 * Maneja cache con TTL, invalidación automática y limpieza en logout
 */

// Configuración de TTL (tiempo de vida) por tipo de dato
const CACHE_TTL = {
  militantes: 120000,    // 2 minutos - datos que cambian frecuentemente
  barrios: 300000,       // 5 minutos - datos semi-estáticos
  escuelas: 180000,      // 3 minutos - datos que pueden cambiar con asignaciones
  instituciones: 180000, // 3 minutos
  seccionales: 600000,   // 10 minutos - datos muy estáticos
  seccionales_resumen: 180000, // 3 minutos - resumen que puede cambiar con los datos
  tiposInstitucion: 600000, // 10 minutos - datos muy estáticos
  resultados: 60000,     // 1 minuto - datos que pueden cambiar frecuentemente
  subcircuitos: 300000,  // 5 minutos
  barrios_dirigentes: 180000 // 3 minutos - datos que pueden cambiar
};

class GlobalCache {
  constructor() {
    this.caches = {};
    this.initializeCache();
  }

  initializeCache() {
    // Crear caches para cada tipo de dato
    Object.keys(CACHE_TTL).forEach(key => {
      this.caches[key] = {
        data: null,
        timestamp: null,
        ttl: CACHE_TTL[key]
      };
    });
  }

  // Verificar si un cache es válido
  isValid(key) {
    const cache = this.caches[key];
    if (!cache || !cache.data || !cache.timestamp) return false;
    return (Date.now() - cache.timestamp) < cache.ttl;
  }

  // Obtener datos del cache
  get(key) {
    return this.isValid(key) ? this.caches[key].data : null;
  }

  // Guardar datos en el cache
  set(key, data) {
    if (this.caches[key]) {
      this.caches[key].data = data;
      this.caches[key].timestamp = Date.now();
    }
  }

  // Invalidar un cache específico
  invalidate(key) {
    if (this.caches[key]) {
      this.caches[key].data = null;
      this.caches[key].timestamp = null;
    }
  }

  // Invalidar múltiples caches
  invalidateMultiple(keys) {
    keys.forEach(key => this.invalidate(key));
  }

  // Limpiar todo el cache (útil en logout)
  clear() {
    Object.keys(this.caches).forEach(key => {
      this.invalidate(key);
    });
  }

  // Obtener estadísticas del cache
  getStats() {
    const stats = {};
    Object.keys(this.caches).forEach(key => {
      const cache = this.caches[key];
      stats[key] = {
        hasData: !!cache.data,
        isValid: this.isValid(key),
        age: cache.timestamp ? Date.now() - cache.timestamp : null,
        ttl: cache.ttl
      };
    });
    return stats;
  }
}

// Crear instancia global
const globalCache = new GlobalCache();

// Hacer accesible globalmente para debugging y limpieza en logout
window.globalCache = globalCache;

// Función helper para invalidar caches relacionados
export const invalidateRelatedCaches = (caches) => {
  // Si recibe un array de cache keys, invalidar directamente
  if (Array.isArray(caches)) {
    globalCache.invalidateMultiple(caches);
    return;
  }

  // Mantener la lógica anterior para compatibilidad
  const action = caches;
  switch (action) {
    case 'militante_created':
    case 'militante_updated':
    case 'militante_deleted':
      globalCache.invalidateMultiple(['militantes', 'escuelas', 'seccionales_resumen']);
      break;
    case 'barrio_created':
    case 'barrio_updated':
    case 'barrio_deleted':
      globalCache.invalidateMultiple(['barrios', 'militantes', 'instituciones', 'seccionales_resumen']);
      break;
    case 'escuela_updated':
      globalCache.invalidateMultiple(['escuelas', 'militantes', 'seccionales_resumen']);
      break;
    case 'institucion_created':
    case 'institucion_updated':
    case 'institucion_deleted':
      globalCache.invalidateMultiple(['instituciones', 'seccionales_resumen']);
      break;
    case 'resultado_created':
    case 'resultado_updated':
      globalCache.invalidate('resultados');
      break;
    case 'logout':
      globalCache.clear();
      break;
    default:
      break;
  }
};

export default globalCache;
