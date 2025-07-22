const db = require('./config/db');
const fs = require('fs');

async function addElectoresPadronColumn() {
  try {
    console.log('=== AGREGANDO COLUMNA total_electores_padron ===');
    
    // Agregar columna a resultados_subcircuito
    try {
      await db.query(`
        ALTER TABLE resultados_subcircuito 
        ADD COLUMN total_electores_padron INT NOT NULL DEFAULT 0 
        AFTER total_votantes
      `);
      console.log('✓ Columna total_electores_padron agregada a resultados_subcircuito');
    } catch (err) {
      if (err.code === 'ER_DUP_FIELDNAME') {
        console.log('✓ Columna total_electores_padron ya existe en resultados_subcircuito');
      } else {
        throw err;
      }
    }

    // Verificar si existe en resultados
    const [columns] = await db.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME = 'resultados' 
        AND COLUMN_NAME = 'total_electores_padron'
    `);

    if (columns.length === 0) {
      await db.query(`
        ALTER TABLE resultados 
        ADD COLUMN total_electores_padron INT NOT NULL DEFAULT 0 
        AFTER total_votantes
      `);
      console.log('✓ Columna total_electores_padron agregada a resultados');
    } else {
      console.log('✓ Columna total_electores_padron ya existe en resultados');
    }

    // Mostrar estructuras actualizadas
    console.log('\n=== ESTRUCTURA resultados_subcircuito ===');
    const [subcircuitoStructure] = await db.query('DESCRIBE resultados_subcircuito');
    subcircuitoStructure.forEach((col, i) => console.log(`${i}: ${col.Field} - ${col.Type}`));

    console.log('\n=== ESTRUCTURA resultados ===');
    const [resultadosStructure] = await db.query('DESCRIBE resultados');
    resultadosStructure.forEach((col, i) => console.log(`${i}: ${col.Field} - ${col.Type}`));

  } catch (err) {
    console.error('Error:', err);
  } finally {
    process.exit();
  }
}

addElectoresPadronColumn();
