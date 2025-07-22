const db = require('./config/db');

async function verificarCorrecion() {
  try {
    console.log('=== VERIFICACIÓN POST-CORRECCIÓN ===\n');
    
    // Estadísticas generales
    const [stats] = await db.query(`
      SELECT 
        COUNT(DISTINCT e.id) as total_escuelas,
        COUNT(DISTINCT m.id) as total_mesas,
        MIN(m.numero_mesa) as mesa_min,
        MAX(m.numero_mesa) as mesa_max
      FROM escuelas e
      LEFT JOIN mesas m ON e.id = m.escuela_id
    `);
    
    console.log('ESTADÍSTICAS GENERALES:');
    console.log(`Total escuelas: ${stats[0].total_escuelas}`);
    console.log(`Total mesas: ${stats[0].total_mesas}`);
    console.log(`Rango mesas: ${stats[0].mesa_min} - ${stats[0].mesa_max}`);
    
    // Verificar que no hay duplicados
    const [duplicados] = await db.query(`
      SELECT numero_mesa, COUNT(*) as veces 
      FROM mesas 
      GROUP BY numero_mesa 
      HAVING veces > 1
    `);
    
    console.log(`\nNúmeros duplicados: ${duplicados.length}`);
    
    // Verificar gaps
    const [gaps] = await db.query(`
      SELECT 
        n.numero as deberia_existir
      FROM (
        SELECT @row := @row + 1 as numero
        FROM (SELECT @row := 0) r, mesas m
        LIMIT ${stats[0].mesa_max}
      ) n
      LEFT JOIN mesas m ON n.numero = m.numero_mesa
      WHERE m.numero_mesa IS NULL
      ORDER BY n.numero
      LIMIT 10
    `);
    
    console.log(`\nGaps encontrados: ${gaps.length}`);
    if (gaps.length > 0 && gaps.length <= 10) {
      gaps.forEach(g => console.log(`  Mesa faltante: ${g.deberia_existir}`));
    }
    
    // Muestra de escuelas con sus mesas
    const [muestra] = await db.query(`
      SELECT 
        e.id,
        e.nombre,
        COUNT(m.id) as total_mesas,
        MIN(m.numero_mesa) as primera_mesa,
        MAX(m.numero_mesa) as ultima_mesa
      FROM escuelas e 
      LEFT JOIN mesas m ON e.id = m.escuela_id 
      GROUP BY e.id 
      ORDER BY e.id ASC 
      LIMIT 10
    `);
    
    console.log('\nMUESTRA DE ESCUELAS (primeras 10):');
    muestra.forEach(e => {
      console.log(`Escuela ${e.id}: ${e.nombre}`);
      console.log(`  Mesas: ${e.total_mesas} (${e.primera_mesa || 'N/A'} - ${e.ultima_mesa || 'N/A'})`);
    });
    
    console.log('\n✅ Verificación completada');
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    process.exit();
  }
}

verificarCorrecion();
