// Verificar que se pueden cargar las rutas
try {
  console.log('Verificando carga de rutas...');
  
  const seccionalesRoutes = require('../routes/seccionalesRoutes');
  console.log('✓ seccionalesRoutes cargado correctamente');
  
  const resultadosSubcircuitoRoutes = require('../routes/resultadosSubcircuitoRoutes');
  console.log('✓ resultadosSubcircuitoRoutes cargado correctamente');
  
  const SeccionalesController = require('../controllers/seccionalesController');
  console.log('✓ SeccionalesController cargado correctamente');
  
  const resultadosSubcircuitoController = require('../controllers/resultadosSubcircuitoController');
  console.log('✓ resultadosSubcircuitoController cargado correctamente');
  
  console.log('\n✅ Todas las rutas y controladores se cargan correctamente');
  
} catch (error) {
  console.error('❌ Error al cargar:', error.message);
  console.error(error.stack);
}
