const API_URL = 'http://localhost:5000/api/militantes';

function getAuthHeaders() {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
}

async function handleResponse(response) {
  const contentType = response.headers.get("content-type");
  
  if (!response.ok) {
    if (response.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
      throw new Error('Sesión expirada. Por favor, inicia sesión nuevamente.');
    }
    
    let errorMessage = 'Error en la solicitud';
    try {
      if (contentType && contentType.includes("application/json")) {
        const errorData = await response.json();
        errorMessage = errorData.message || errorData.error || errorMessage;
      } else {
        errorMessage = await response.text();
      }
    } catch (e) {
      errorMessage = `Error ${response.status}: ${response.statusText}`;
    }
    throw new Error(errorMessage);
  }
  
  if (contentType && contentType.includes("application/json")) {
    return response.json();
  } else {
    throw new Error("Respuesta no es JSON válido");
  }
}

export const getMilitantes = () =>
  fetch(API_URL, { 
    method: 'GET',
    headers: getAuthHeaders() 
  }).then(handleResponse);

export const getMilitante = (id) =>
  fetch(`${API_URL}/${id}`, { 
    method: 'GET',
    headers: getAuthHeaders() 
  }).then(handleResponse);

export const createMilitante = (data) => {
  // Limpiar y validar datos antes de enviar
  const cleanData = {
    nombre: data.nombre?.trim() || '',
    apellido: data.apellido?.trim() || '',
    fecha_nacimiento: data.fecha_nacimiento || null,
    edad: data.edad ? parseInt(data.edad) : null,
    telefono: data.telefono?.trim() || '',
    instagram: data.instagram?.trim() || '',
    categoria: data.categoria || '',
    id_barrio: data.id_barrio ? parseInt(data.id_barrio) : null,
    trabaja: data.trabaja || '',
    dependencia: data.dependencia?.trim() || '',
    tipo_trabajo: data.tipo_trabajo?.trim() || ''
  };

  return fetch(API_URL, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(cleanData)
  }).then(handleResponse);
};

export const updateMilitante = (id, data) => {
  // Limpiar y validar datos antes de enviar
  const cleanData = {
    nombre: data.nombre?.trim() || '',
    apellido: data.apellido?.trim() || '',
    fecha_nacimiento: data.fecha_nacimiento || null,
    edad: data.edad ? parseInt(data.edad) : null,
    telefono: data.telefono?.trim() || '',
    instagram: data.instagram?.trim() || '',
    categoria: data.categoria || '',
    id_barrio: data.id_barrio ? parseInt(data.id_barrio) : null,
    trabaja: data.trabaja || '',
    dependencia: data.dependencia?.trim() || '',
    tipo_trabajo: data.tipo_trabajo?.trim() || ''
  };

  return fetch(`${API_URL}/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(cleanData)
  }).then(handleResponse);
};

export const deleteMilitante = (id) =>
  fetch(`${API_URL}/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  }).then(handleResponse);