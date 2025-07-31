const API_URL = '/api/instituciones';

function getAuthHeaders() {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export const getInstituciones = () =>
  fetch(API_URL, { headers: getAuthHeaders() })
    .then(res => res.json());

export const getInstitucionById = (id) =>
  fetch(`${API_URL}/${id}`, { headers: getAuthHeaders() })
    .then(res => res.json());

export const createInstitucion = (data) =>
  fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders()
    },
    body: JSON.stringify(data)
  }).then(res => res.json());

export const updateInstitucion = (id, data) =>
  fetch(`${API_URL}/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders()
    },
    body: JSON.stringify(data)
  }).then(res => res.json());

export const deleteInstitucion = (id) =>
  fetch(`${API_URL}/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  }).then(res => res.json());