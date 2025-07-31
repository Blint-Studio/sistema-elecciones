// Servicios para datos públicos (sin autenticación requerida)
const API_URL = 'http://localhost:5000/api';

export async function fetchPublicApi(url, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  const res = await fetch(API_URL + url, { ...options, headers });
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`HTTP ${res.status}: ${errorText}`);
  }
  return res.json();
}

// Servicios públicos con endpoints específicos
export const getBarriosPublicos = () => fetchPublicApi('/public/barrios');
export const getSeccionalesPublicas = () => fetchPublicApi('/public/seccionales');
export const getMilitantesPublicos = () => fetchPublicApi('/public/militantes');
export const getInstitucionesPublicas = () => fetchPublicApi('/public/instituciones');
