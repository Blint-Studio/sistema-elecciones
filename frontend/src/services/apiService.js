// Servicio para manejar peticiones HTTP con autenticación
class ApiService {
  constructor() {
    this.baseURL = 'http://localhost:5000/api';
  }

  // Obtener token del localStorage
  getToken() {
    return localStorage.getItem('token');
  }

  // Verificar si hay token válido
  isAuthenticated() {
    const token = this.getToken();
    return token && token !== 'null' && token !== 'undefined';
  }

  // Headers por defecto con autenticación
  getHeaders(includeContentType = true) {
    const headers = {};
    
    const token = this.getToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    
    if (includeContentType) {
      headers['Content-Type'] = 'application/json';
    }
    
    return headers;
  }

  // Manejar respuestas y errores de autenticación
  async handleResponse(response) {
    if (response.status === 401) {
      // Token inválido o expirado
      localStorage.removeItem('token');
      localStorage.removeItem('usuario');
      window.location.href = '/login';
      throw new Error('Sesión expirada. Por favor, inicia sesión nuevamente.');
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || errorData.error || `Error ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }

  // GET request
  async get(endpoint) {
    if (!this.isAuthenticated()) {
      throw new Error('No hay token de autenticación. Por favor, inicia sesión.');
    }

    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'GET',
      headers: this.getHeaders(false)
    });

    return this.handleResponse(response);
  }

  // POST request
  async post(endpoint, data) {
    if (!this.isAuthenticated()) {
      throw new Error('No hay token de autenticación. Por favor, inicia sesión.');
    }

    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data)
    });

    return this.handleResponse(response);
  }

  // PUT request
  async put(endpoint, data) {
    if (!this.isAuthenticated()) {
      throw new Error('No hay token de autenticación. Por favor, inicia sesión.');
    }

    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(data)
    });

    return this.handleResponse(response);
  }

  // DELETE request
  async delete(endpoint) {
    if (!this.isAuthenticated()) {
      throw new Error('No hay token de autenticación. Por favor, inicia sesión.');
    }

    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'DELETE',
      headers: this.getHeaders(false)
    });

    return this.handleResponse(response);
  }

  // Métodos específicos para la API
  async getEscuelas() {
    return this.get('/escuelas');
  }

  async getMesas(escuelaId) {
    return this.get(`/mesas?escuela=${encodeURIComponent(escuelaId)}`);
  }

  async getResultados(escuelaId = null) {
    const endpoint = escuelaId ? `/resultados?escuela=${encodeURIComponent(escuelaId)}` : '/resultados';
    return this.get(endpoint);
  }

  async crearResultado(data) {
    return this.post('/resultados', data);
  }

  async eliminarResultado(id) {
    return this.delete(`/resultados/${id}`);
  }

  async modificarResultado(id, data) {
    return this.put(`/resultados/${id}`, data);
  }

  // Métodos para seccionales y barrios
  async getSeccionales() {
    return this.get('/seccionales');
  }

  async getBarriosPorSeccional(seccionalId) {
    return this.get(`/seccionales/barrios?seccional=${encodeURIComponent(seccionalId)}`);
  }

  // Métodos para resultados de subcircuito
  async getResultadosSubcircuito(seccionalId = null) {
    const endpoint = seccionalId ? `/resultados-subcircuito?seccional=${encodeURIComponent(seccionalId)}` : '/resultados-subcircuito';
    return this.get(endpoint);
  }

  async crearResultadoSubcircuito(data) {
    return this.post('/resultados-subcircuito', data);
  }

  async eliminarResultadoSubcircuito(id) {
    return this.delete(`/resultados-subcircuito/${id}`);
  }

  async modificarResultadoSubcircuito(id, data) {
    return this.put(`/resultados-subcircuito/${id}`, data);
  }
}

// Exportar una instancia única
const apiService = new ApiService();
export default apiService;
