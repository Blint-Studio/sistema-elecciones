const db = require('./config/db');

async function analizarYCorregirMesas() {
  try {
    console.log('=== ANÁLISIS EXHAUSTIVO DE MESAS ===\n');
    
    // 1. Análisis general
    const [stats] = await db.query(`
      SELECT 
        COUNT(DISTINCT e.id) as total_escuelas,
        COUNT(DISTINCT m.id) as total_mesas,
        MIN(m.numero_mesa) as mesa_min,
        MAX(m.numero_mesa) as mesa_max,
        COUNT(DISTINCT m.numero_mesa) as numeros_unicos
      FROM escuelas e
      LEFT JOIN mesas m ON e.id = m.escuela_id
    `);
    
    console.log('ESTADÍSTICAS GENERALES:');
    console.log(`Total escuelas: ${stats[0].total_escuelas}`);
    console.log(`Total mesas: ${stats[0].total_mesas}`);
    console.log(`Número mesa mínimo: ${stats[0].mesa_min}`);
    console.log(`Número mesa máximo: ${stats[0].mesa_max}`);
    console.log(`Números únicos de mesa: ${stats[0].numeros_unicos}`);
    
    // 2. Análisis de inconsistencias
    console.log('\n=== ANÁLISIS DE INCONSISTENCIAS ===');
    
    const [inconsistencias] = await db.query(`
      SELECT 
        e.id,
        e.nombre,
        e.cantidad_mesas as deberia_tener,
        COUNT(m.id) as tiene_actualmente,
        MIN(m.numero_mesa) as primera_mesa,
        MAX(m.numero_mesa) as ultima_mesa,
        (e.cantidad_mesas - COUNT(m.id)) as diferencia
      FROM escuelas e 
      LEFT JOIN mesas m ON e.id = m.escuela_id 
      WHERE e.cantidad_mesas > 0
      GROUP BY e.id 
      HAVING diferencia != 0 OR primera_mesa IS NULL
      ORDER BY diferencia DESC, e.id ASC
      LIMIT 30
    `);
    
    console.log(`Escuelas con problemas de mesas: ${inconsistencias.length}`);
    inconsistencias.forEach((e, i) => {
      console.log(`${i+1}. Escuela ${e.id}: ${e.nombre}`);
      console.log(`   Debería: ${e.deberia_tener}, Tiene: ${e.tiene_actualmente}, Diferencia: ${e.diferencia}`);
      console.log(`   Rango mesas: ${e.primera_mesa || 'N/A'} - ${e.ultima_mesa || 'N/A'}`);
    });
    
    // 3. Detectar números de mesa duplicados
    console.log('\n=== NÚMEROS DE MESA DUPLICADOS ===');
    
    const [duplicados] = await db.query(`
      SELECT 
        numero_mesa,
        COUNT(*) as veces_usado,
        GROUP_CONCAT(CONCAT('Escuela ', escuela_id) SEPARATOR ', ') as escuelas
      FROM mesas 
      GROUP BY numero_mesa 
      HAVING veces_usado > 1
      ORDER BY veces_usado DESC
      LIMIT 20
    `);
    
    console.log(`Números de mesa duplicados: ${duplicados.length}`);
    duplicados.forEach(d => {
      console.log(`Mesa ${d.numero_mesa}: usada ${d.veces_usado} veces en ${d.escuelas}`);
    });
    
    // 4. Análisis de gaps en numeración
    console.log('\n=== ANÁLISIS DE GAPS EN NUMERACIÓN ===');
    
    const [mesasOrdenadas] = await db.query(`
      SELECT DISTINCT numero_mesa 
      FROM mesas 
      ORDER BY numero_mesa ASC
    `);
    
    let gaps = [];
    for (let i = 1; i < mesasOrdenadas.length; i++) {
      const actual = mesasOrdenadas[i].numero_mesa;
      const anterior = mesasOrdenadas[i-1].numero_mesa;
      if (actual - anterior > 1) {
        gaps.push({
          desde: anterior + 1,
          hasta: actual - 1,
          tamaño: actual - anterior - 1
        });
      }
    }
    
    console.log(`Gaps encontrados: ${gaps.length}`);
    gaps.slice(0, 10).forEach(g => {
      console.log(`Gap de ${g.desde} a ${g.hasta} (${g.tamaño} números faltantes)`);
    });
    
    // 5. CORRECCIÓN: Renumerar todas las mesas secuencialmente
    console.log('\n=== INICIANDO CORRECCIÓN SECUENCIAL ===');
    
    // Obtener todas las escuelas con sus mesas actuales
    const [escuelasConMesas] = await db.query(`
      SELECT 
        e.id,
        e.nombre,
        e.cantidad_mesas,
        COUNT(m.id) as mesas_actuales
      FROM escuelas e 
      LEFT JOIN mesas m ON e.id = m.escuela_id 
      WHERE e.cantidad_mesas > 0
      GROUP BY e.id
      ORDER BY e.id ASC
    `);
    
    console.log(`Procesando ${escuelasConMesas.length} escuelas...`);
    
    let numeroMesaActual = 1;
    let escuelasCorregidas = 0;
    let mesasCreadas = 0;
    let mesasActualizadas = 0;
    
    for (const escuela of escuelasConMesas) {
      console.log(`\nProcesando Escuela ${escuela.id}: ${escuela.nombre}`);
      console.log(`  Debería tener: ${escuela.cantidad_mesas} mesas`);
      console.log(`  Tiene actualmente: ${escuela.mesas_actuales} mesas`);
      
      // Obtener mesas actuales de esta escuela
      const [mesasEscuela] = await db.query(`
        SELECT id, numero_mesa 
        FROM mesas 
        WHERE escuela_id = ? 
        ORDER BY numero_mesa ASC
      `, [escuela.id]);
      
      // Si tiene más mesas de las que debería, eliminar las extras
      if (mesasEscuela.length > escuela.cantidad_mesas) {
        const mesasAEliminar = mesasEscuela.slice(escuela.cantidad_mesas);
        for (const mesa of mesasAEliminar) {
          await db.query('DELETE FROM mesas WHERE id = ?', [mesa.id]);
          console.log(`  ✗ Mesa ${mesa.numero_mesa} eliminada (extra)`);
        }
        mesasEscuela.splice(escuela.cantidad_mesas);
      }
      
      // Renumerar mesas existentes secuencialmente
      for (let i = 0; i < mesasEscuela.length; i++) {
        const mesa = mesasEscuela[i];
        if (mesa.numero_mesa !== numeroMesaActual) {
          await db.query(
            'UPDATE mesas SET numero_mesa = ? WHERE id = ?',
            [numeroMesaActual, mesa.id]
          );
          console.log(`  ↻ Mesa ${mesa.numero_mesa} → ${numeroMesaActual}`);
          mesasActualizadas++;
        } else {
          console.log(`  ✓ Mesa ${numeroMesaActual} ya correcta`);
        }
        numeroMesaActual++;
      }
      
      // Crear mesas faltantes si es necesario
      const mesasFaltantes = escuela.cantidad_mesas - mesasEscuela.length;
      for (let i = 0; i < mesasFaltantes; i++) {
        await db.query(
          'INSERT INTO mesas (numero_mesa, escuela_id) VALUES (?, ?)',
          [numeroMesaActual, escuela.id]
        );
        console.log(`  + Mesa ${numeroMesaActual} creada`);
        numeroMesaActual++;
        mesasCreadas++;
      }
      
      escuelasCorregidas++;
    }
    
    console.log('\n=== RESUMEN DE CORRECCIÓN ===');
    console.log(`Escuelas procesadas: ${escuelasCorregidas}`);
    console.log(`Mesas actualizadas: ${mesasActualizadas}`);
    console.log(`Mesas creadas: ${mesasCreadas}`);
    console.log(`Próximo número de mesa: ${numeroMesaActual}`);
    
    // 6. Verificación final
    console.log('\n=== VERIFICACIÓN FINAL ===');
    
    const [verificacion] = await db.query(`
      SELECT 
        COUNT(DISTINCT e.id) as escuelas_con_mesas_correctas
      FROM escuelas e 
      LEFT JOIN mesas m ON e.id = m.escuela_id 
      WHERE e.cantidad_mesas > 0
      GROUP BY e.id
      HAVING COUNT(m.id) = e.cantidad_mesas
    `);
    
    const [totalEscuelasConMesas] = await db.query(`
      SELECT COUNT(*) as total 
      FROM escuelas 
      WHERE cantidad_mesas > 0
    `);
    
    const [nuevasStats] = await db.query(`
      SELECT 
        COUNT(DISTINCT m.numero_mesa) as numeros_unicos,
        MIN(m.numero_mesa) as nuevo_min,
        MAX(m.numero_mesa) as nuevo_max,
        COUNT(*) as total_mesas_final
      FROM mesas m
    `);
    
    console.log(`Escuelas con mesas correctas: ${verificacion.length || 0}/${totalEscuelasConMesas[0].total}`);
    console.log(`Nuevo rango de mesas: ${nuevasStats[0].nuevo_min} - ${nuevasStats[0].nuevo_max}`);
    console.log(`Total mesas final: ${nuevasStats[0].total_mesas_final}`);
    console.log(`Números únicos: ${nuevasStats[0].numeros_unicos}`);
    
    if (nuevasStats[0].numeros_unicos === nuevasStats[0].total_mesas_final) {
      console.log('✅ ÉXITO: Todas las mesas tienen números únicos secuenciales');
    } else {
      console.log('❌ ADVERTENCIA: Aún existen números duplicados');
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    process.exit();
  }
}

analizarYCorregirMesas();
