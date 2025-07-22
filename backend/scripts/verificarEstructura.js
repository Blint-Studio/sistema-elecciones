const db = require('../config/db');

async function verificarEstructuraTablas() {
  try {
    console.log('Verificando estructura de tablas...');

    // Verificar estructura de barrios
    console.log('\n=== ESTRUCTURA TABLA BARRIOS ===');
    const [barriosStructure] = await db.query('DESCRIBE barrios');
    console.table(barriosStructure);

    // Verificar estructura de seccionales
    console.log('\n=== ESTRUCTURA TABLA SECCIONALES ===');
    const [seccionalesStructure] = await db.query('DESCRIBE seccionales');
    console.table(seccionalesStructure);

    // Verificar estructura de resultados_subcircuito
    console.log('\n=== ESTRUCTURA TABLA RESULTADOS_SUBCIRCUITO ===');
    try {
      const [resultadosStructure] = await db.query('DESCRIBE resultados_subcircuito');
      console.table(resultadosStructure);
    } catch (err) {
      console.log('Tabla resultados_subcircuito no existe:', err.message);
    }

    // Ver algunos datos de ejemplo
    console.log('\n=== DATOS EXISTENTES ===');
    const [seccionales] = await db.query('SELECT * FROM seccionales LIMIT 5');
    console.log('Seccionales:', seccionales);

    const [barrios] = await db.query('SELECT * FROM barrios LIMIT 5');
    console.log('Barrios:', barrios);

  } catch (error) {
    console.error('Error al verificar estructura:', error);
  } finally {
    process.exit();
  }
}

verificarEstructuraTablas();
