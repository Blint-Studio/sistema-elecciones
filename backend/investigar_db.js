const db = require('./config/db');

async function investigarEscuelasYMesas() {
  try {
    console.log('=== ESTRUCTURA ESCUELAS ===');
    const [escuelasStructure] = await db.query('DESCRIBE escuelas');
    escuelasStructure.forEach((r, i) => console.log(`${i}: ${r.Field} - ${r.Type}`));
    
    console.log('\n=== ESTRUCTURA MESAS ===');
    const [mesasStructure] = await db.query('DESCRIBE mesas');
    mesasStructure.forEach((r, i) => console.log(`${i}: ${r.Field} - ${r.Type}`));
    
    console.log('\n=== RESUMEN DE ESCUELAS ===');
    const [escuelasCount] = await db.query('SELECT COUNT(*) as total FROM escuelas');
    console.log(`Total escuelas: ${escuelasCount[0].total}`);
    
    console.log('\n=== RESUMEN DE MESAS ===');
    const [mesasCount] = await db.query('SELECT COUNT(*) as total FROM mesas');
    console.log(`Total mesas: ${mesasCount[0].total}`);
    
    console.log('\n=== ESCUELAS CON MESAS ===');
    const [escuelasConMesas] = await db.query(`
      SELECT 
        e.id, 
        e.nombre, 
        COUNT(m.id) as total_mesas,
        MIN(m.numero_mesa) as primera_mesa,
        MAX(m.numero_mesa) as ultima_mesa
      FROM escuelas e 
      LEFT JOIN mesas m ON e.id = m.escuela_id 
      GROUP BY e.id 
      ORDER BY total_mesas DESC 
      LIMIT 15
    `);
    
    escuelasConMesas.forEach(e => {
      console.log(`Escuela ${e.id}: ${e.nombre} - ${e.total_mesas} mesas (${e.primera_mesa}-${e.ultima_mesa})`);
    });
    
    console.log('\n=== ESCUELAS SIN MESAS ===');
    const [escuelasSinMesas] = await db.query(`
      SELECT e.id, e.nombre 
      FROM escuelas e 
      LEFT JOIN mesas m ON e.id = m.escuela_id 
      WHERE m.id IS NULL 
      LIMIT 10
    `);
    
    escuelasSinMesas.forEach(e => {
      console.log(`Escuela ${e.id}: ${e.nombre} - SIN MESAS`);
    });
    
    console.log('\n=== MESAS HUÉRFANAS (sin escuela válida) ===');
    const [mesasHuerfanas] = await db.query(`
      SELECT m.id, m.numero_mesa, m.escuela_id 
      FROM mesas m 
      LEFT JOIN escuelas e ON m.escuela_id = e.id 
      WHERE e.id IS NULL 
      LIMIT 10
    `);
    
    mesasHuerfanas.forEach(m => {
      console.log(`Mesa ${m.id}: número ${m.numero_mesa} - ESCUELA_ID INEXISTENTE: ${m.escuela_id}`);
    });
    
    console.log('\n=== PROBLEMA: NÚMEROS DE MESA EXTRAÑOS ===');
    const [mesasExtranas] = await db.query(`
      SELECT 
        e.nombre as escuela, 
        m.numero_mesa, 
        m.escuela_id 
      FROM mesas m 
      LEFT JOIN escuelas e ON m.escuela_id = e.id 
      WHERE m.numero_mesa > 100 
      ORDER BY m.numero_mesa ASC 
      LIMIT 10
    `);
    
    mesasExtranas.forEach(m => {
      console.log(`Mesa extraña: ${m.numero_mesa} en escuela: ${m.escuela || 'SIN ESCUELA'} (ID: ${m.escuela_id})`);
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    process.exit();
  }
}

investigarEscuelasYMesas();
