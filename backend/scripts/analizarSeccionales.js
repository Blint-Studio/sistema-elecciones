const db = require('../config/db');

async function analizarSeccionales() {
  try {
    console.log('=== ANÁLISIS DE SECCIONALES ===');

    // Ver todas las seccionales
    const [todasSeccionales] = await db.query(`
      SELECT id, nombre, subcircuito 
      FROM seccionales 
      ORDER BY nombre, subcircuito
    `);

    console.log('Todas las seccionales:');
    console.table(todasSeccionales);

    // Agrupar por número de seccional
    const agrupadas = {};
    todasSeccionales.forEach(row => {
      // Extraer número de seccional del nombre
      const match = row.nombre.match(/Seccional (\d+)/);
      if (match) {
        const num = match[1];
        if (!agrupadas[num]) {
          agrupadas[num] = new Set();
        }
        agrupadas[num].add(row.subcircuito || 'Sin letra');
      }
    });

    console.log('\n=== ESTRUCTURA DESEADA ===');
    Object.keys(agrupadas).sort((a, b) => parseInt(a) - parseInt(b)).forEach(num => {
      console.log(`Seccional ${num.padStart(2, '0')}: ${Array.from(agrupadas[num]).join(', ')}`);
    });

    // Ver algunos barrios para entender la relación
    console.log('\n=== MUESTRA DE BARRIOS ===');
    const [barrios] = await db.query(`
      SELECT seccional_nombre, COUNT(*) as cantidad_barrios 
      FROM barrios 
      WHERE seccional_nombre IS NOT NULL 
      GROUP BY seccional_nombre 
      ORDER BY CAST(seccional_nombre AS UNSIGNED)
      LIMIT 10
    `);
    console.table(barrios);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    process.exit();
  }
}

analizarSeccionales();
