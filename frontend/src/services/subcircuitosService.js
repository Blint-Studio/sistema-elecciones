import api from './api';

// Obtener lista de seccionales para subcircuitos (01-14 sin duplicados)
export const getSeccionales = async () => {
  try {
    const response = await api.get('/subcircuitos/seccionales');
    return response.data;
  } catch (error) {
    console.error('Error al obtener seccionales:', error);
    throw error;
  }
};

// Obtener subcircuitos por seccional
export const getSubcircuitosBySeccional = async (numeroSeccional) => {
  try {
    const response = await api.get(`/subcircuitos?seccional=${numeroSeccional}`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener subcircuitos:', error);
    throw error;
  }
};

// Obtener resultados por subcircuito
export const getResultadosSubcircuito = async (numeroSeccional = null) => {
  try {
    const url = numeroSeccional 
      ? `/resultados-subcircuito?seccional=${numeroSeccional}`
      : '/resultados-subcircuito';
    const response = await api.get(url);
    return response.data;
  } catch (error) {
    console.error('Error al obtener resultados de subcircuito:', error);
    throw error;
  }
};

// Crear resultado de subcircuito
export const createResultadoSubcircuito = async (resultadoData) => {
  try {
    const response = await api.post('/resultados-subcircuito', resultadoData);
    return response.data;
  } catch (error) {
    console.error('Error al crear resultado de subcircuito:', error);
    throw error;
  }
};

// Eliminar resultado de subcircuito
export const deleteResultadoSubcircuito = async (id) => {
  try {
    const response = await api.delete(`/resultados-subcircuito/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error al eliminar resultado de subcircuito:', error);
    throw error;
  }
};
