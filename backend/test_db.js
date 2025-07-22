const db = require('./config/db');

async function testDB() {
  try {
    console.log('=== Verificando estructura de tablas ===');
    
    // Verificar estructura de resultados_subcircuito
    console.log('\n--- Tabla resultados_subcircuito ---');
    const [resultadosSubcircuito] = await db.query('DESCRIBE resultados_subcircuito');
    resultadosSubcircuito.forEach(col => {
      console.log(`- ${col.Field} (${col.Type}) ${col.Null === 'YES' ? 'NULL' : 'NOT NULL'}`);
    });
    
    // Verificar estructura de resultados
    console.log('\n--- Tabla resultados ---');
    const [resultados] = await db.query('DESCRIBE resultados');
    resultados.forEach(col => {
      console.log(`- ${col.Field} (${col.Type}) ${col.Null === 'YES' ? 'NULL' : 'NOT NULL'}`);
    });
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    process.exit(0);
  }
}

testDB();
