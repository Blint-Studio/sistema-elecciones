import apiService from './apiService';

export const getEscuelas = () => {
  return apiService.getEscuelas();
};

export const createEscuela = (escuelaData) => {
  return apiService.createEscuela(escuelaData);
};

export const updateEscuela = (id, escuelaData) => {
  return apiService.updateEscuela(id, escuelaData);
};

export const deleteEscuela = (id) => {
  return apiService.deleteEscuela(id);
};
