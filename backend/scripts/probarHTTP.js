const http = require('http');

// Función para hacer peticiones HTTP
function makeRequest(options, postData = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, data: data });
        }
      });
    });

    req.on('error', reject);
    
    if (postData) {
      req.write(postData);
    }
    
    req.end();
  });
}

async function probarEndpointsHTTP() {
  try {
    console.log('Probando endpoints HTTP del backend...');

    // Probar endpoint de seccionales sin autenticación primero
    console.log('\n=== PROBANDO GET /api/seccionales ===');
    try {
      const response1 = await makeRequest({
        hostname: 'localhost',
        port: 5000,
        path: '/api/seccionales',
        method: 'GET'
      });
      console.log('Respuesta seccionales:', response1);
    } catch (err) {
      console.log('Error seccionales:', err.message);
    }

    // Probar endpoint de barrios por seccional
    console.log('\n=== PROBANDO GET /api/seccionales/barrios?seccional=1 ===');
    try {
      const response2 = await makeRequest({
        hostname: 'localhost',
        port: 5000,
        path: '/api/seccionales/barrios?seccional=1',
        method: 'GET'
      });
      console.log('Respuesta barrios:', response2);
    } catch (err) {
      console.log('Error barrios:', err.message);
    }

    // Probar endpoint de resultados subcircuito
    console.log('\n=== PROBANDO GET /api/resultados-subcircuito ===');
    try {
      const response3 = await makeRequest({
        hostname: 'localhost',
        port: 5000,
        path: '/api/resultados-subcircuito',
        method: 'GET'
      });
      console.log('Respuesta resultados subcircuito:', response3);
    } catch (err) {
      console.log('Error resultados subcircuito:', err.message);
    }

  } catch (error) {
    console.error('Error general:', error);
  }
}

probarEndpointsHTTP();
