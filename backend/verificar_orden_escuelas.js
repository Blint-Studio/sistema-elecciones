const db = require('./config/db');

async function verificarOrdenEscuelas() {
  try {
    console.log('=== VERIFICANDO ORDEN DE ESCUELAS ===\n');
    
    // Probar endpoint principal de escuelas
    const [escuelas] = await db.query(`
      SELECT DISTINCT
        e.id,
        e.nombre,
        MIN(mes.numero_mesa) as primera_mesa
      FROM escuelas e
      LEFT JOIN mesas mes ON e.id = mes.escuela_id
      GROUP BY e.id
      ORDER BY MIN(mes.numero_mesa) ASC, e.id ASC
      LIMIT 15
    `);
    
    console.log('PRIMERAS 15 ESCUELAS (ordenadas por primera mesa):');
    escuelas.forEach((e, i) => {
      console.log(`${i+1}. Escuela ${e.id}: ${e.nombre} - Primera mesa: ${e.primera_mesa || 'Sin mesas'}`);
    });
    
    // Probar endpoint de extraController
    const [escuelasSimple] = await db.query(`
      SELECT e.id, e.nombre, MIN(m.numero_mesa) as primera_mesa
      FROM escuelas e
      LEFT JOIN mesas m ON e.id = m.escuela_id
      GROUP BY e.id
      ORDER BY MIN(m.numero_mesa) ASC, e.id ASC
      LIMIT 10
    `);
    
    console.log('\nENDPOINT EXTRA (primeras 10 escuelas):');
    escuelasSimple.forEach((e, i) => {
      console.log(`${i+1}. ID: ${e.id} - ${e.nombre} - Mesa: ${e.primera_mesa || 'Sin mesas'}`);
    });
    
    console.log('\n✅ Verificación completada');
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    process.exit();
  }
}

verificarOrdenEscuelas();
