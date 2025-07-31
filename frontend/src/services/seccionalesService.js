import { fetchApi } from './api';

export async function getSeccionales() {
  return fetchApi('/seccionales');
}

export async function getResumenSeccionales() {
  return fetchApi('/seccionales/resumen');
}
