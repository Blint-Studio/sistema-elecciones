import { fetchApi } from './api';

export const getBarrios = () => fetchApi('/barrios');
export const getBarrioMilitantes = (id) => fetchApi(`/barrios/${id}/militantes`);
export const getBarrioDetalle = (id) => fetchApi(`/barrios/${id}`);
export const getBarriosConDirigentes = () => fetchApi('/barrios/dirigentes/resumen');
export const createBarrio = (data) => fetchApi('/barrios', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(data)
});