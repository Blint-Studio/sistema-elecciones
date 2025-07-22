const db = require('./config/db');

async function checkTables() {
  try {
    console.log('=== TABLA RESULTADOS ===');
    const [resultados] = await db.query('SHOW COLUMNS FROM resultados');
    resultados.forEach((r, i) => console.log(`${i}: ${r.Field} - ${r.Type}`));
    
    console.log('\n=== TABLA RESULTADOS_SUBCIRCUITO ===');
    const [subcircuitos] = await db.query('SHOW COLUMNS FROM resultados_subcircuito');
    subcircuitos.forEach((r, i) => console.log(`${i}: ${r.Field} - ${r.Type}`));
    
  } catch (err) {
    console.error('Error:', err);
  } finally {
    process.exit();
  }
}

checkTables();
