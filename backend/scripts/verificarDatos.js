const db = require('../config/db');

async function verificarDatos() {
  try {
    console.log('Verificando datos existentes...');

    // Ver valores únicos de seccional_nombre en barrios
    const [seccionalesNombre] = await db.query(
      'SELECT DISTINCT seccional_nombre FROM barrios ORDER BY seccional_nombre'
    );
    console.log('Valores únicos de seccional_nombre en barrios:', seccionalesNombre);

    // Ver algunos barrios de ejemplo
    const [ejemplosBarrios] = await db.query(
      'SELECT id, nombre, seccional_nombre FROM barrios LIMIT 10'
    );
    console.log('Ejemplos de barrios:', ejemplosBarrios);

    // Ver seccionales
    const [seccionales] = await db.query('SELECT * FROM seccionales LIMIT 10');
    console.log('Seccionales:', seccionales);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    process.exit();
  }
}

verificarDatos();
