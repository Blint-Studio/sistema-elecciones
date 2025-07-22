const db = require('./config/db');

async function corregirMesasFaltantes() {
  try {
    console.log('=== ANALIZANDO ESCUELAS SIN MESAS SUFICIENTES ===');
    
    // Obtener escuelas que tienen menos mesas de las que deberían
    const [escuelasProblematicas] = await db.query(`
      SELECT 
        e.id,
        e.nombre,
        e.cantidad_mesas as deberia_tener,
        COUNT(m.id) as tiene_actualmente,
        (e.cantidad_mesas - COUNT(m.id)) as faltan
      FROM escuelas e 
      LEFT JOIN mesas m ON e.id = m.escuela_id 
      GROUP BY e.id 
      HAVING faltan > 0
      ORDER BY faltan DESC
      LIMIT 20
    `);
    
    console.log('Escuelas que necesitan más mesas:');
    escuelasProblematicas.forEach(e => {
      console.log(`Escuela ${e.id}: ${e.nombre} - Debería: ${e.deberia_tener}, Tiene: ${e.tiene_actualmente}, Faltan: ${e.faltan}`);
    });
    
    console.log('\n=== ESCUELAS SIN MESAS PERO CON cantidad_mesas > 0 ===');
    const [escuelasSinMesas] = await db.query(`
      SELECT 
        e.id,
        e.nombre,
        e.cantidad_mesas
      FROM escuelas e 
      LEFT JOIN mesas m ON e.id = m.escuela_id 
      WHERE m.id IS NULL AND e.cantidad_mesas > 0
      ORDER BY e.cantidad_mesas DESC
      LIMIT 10
    `);
    
    escuelasSinMesas.forEach(e => {
      console.log(`Escuela ${e.id}: ${e.nombre} - Debería tener ${e.cantidad_mesas} mesas pero no tiene ninguna`);
    });
    
    // Obtener el siguiente número de mesa disponible
    const [maxMesa] = await db.query('SELECT MAX(numero_mesa) as max_numero FROM mesas');
    let siguienteNumero = (maxMesa[0].max_numero || 0) + 1;
    
    console.log(`\n=== CREANDO MESAS FALTANTES (empezando desde ${siguienteNumero}) ===`);
    
    let mesasCreadas = 0;
    
    for (const escuela of escuelasSinMesas) {
      console.log(`\nCreando ${escuela.cantidad_mesas} mesas para escuela ${escuela.id}: ${escuela.nombre}`);
      
      for (let i = 0; i < escuela.cantidad_mesas; i++) {
        await db.query(
          'INSERT INTO mesas (numero_mesa, escuela_id) VALUES (?, ?)',
          [siguienteNumero, escuela.id]
        );
        console.log(`  Mesa ${siguienteNumero} creada`);
        siguienteNumero++;
        mesasCreadas++;
      }
    }
    
    // También crear mesas para escuelas que tienen algunas pero no suficientes
    for (const escuela of escuelasProblematicas.slice(0, 10)) { // Solo las primeras 10 para no saturar
      if (escuela.faltan <= 20) { // Solo si faltan pocas mesas
        console.log(`\nCreando ${escuela.faltan} mesas adicionales para escuela ${escuela.id}: ${escuela.nombre}`);
        
        for (let i = 0; i < escuela.faltan; i++) {
          await db.query(
            'INSERT INTO mesas (numero_mesa, escuela_id) VALUES (?, ?)',
            [siguienteNumero, escuela.id]
          );
          console.log(`  Mesa ${siguienteNumero} creada`);
          siguienteNumero++;
          mesasCreadas++;
        }
      }
    }
    
    console.log(`\n=== RESUMEN ===`);
    console.log(`Total de mesas creadas: ${mesasCreadas}`);
    console.log(`Siguiente número disponible: ${siguienteNumero}`);
    
    // Verificación final
    const [nuevasStats] = await db.query(`
      SELECT 
        COUNT(*) as total_escuelas,
        SUM(CASE WHEN tiene_mesas = 0 THEN 1 ELSE 0 END) as sin_mesas,
        SUM(CASE WHEN faltan_mesas > 0 THEN 1 ELSE 0 END) as con_mesas_faltantes
      FROM (
        SELECT 
          e.id,
          e.cantidad_mesas as deberia_tener,
          COUNT(m.id) as tiene_mesas,
          GREATEST(0, e.cantidad_mesas - COUNT(m.id)) as faltan_mesas
        FROM escuelas e 
        LEFT JOIN mesas m ON e.id = m.escuela_id 
        WHERE e.cantidad_mesas > 0
        GROUP BY e.id
      ) as stats
    `);
    
    console.log(`\nEscuelas con cantidad_mesas > 0: ${nuevasStats[0].total_escuelas}`);
    console.log(`Escuelas aún sin mesas: ${nuevasStats[0].sin_mesas}`);
    console.log(`Escuelas con mesas faltantes: ${nuevasStats[0].con_mesas_faltantes}`);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    process.exit();
  }
}

corregirMesasFaltantes();
