import { fetchApi } from './api';

export const getTiposInstitucion = () => fetchApi('/tipos_institucion');
export const createTipoInstitucion = (data) => fetchApi('/tipos_institucion', { method: 'POST', body: JSON.stringify(data) });