const db = require('../config/db');

async function eliminarDuplicadosEscuelas() {
  try {
    console.log('Iniciando análisis de duplicados en escuelas...');
    
    // Primero, vamos a ver cuántas escuelas hay en total
    const [totalEscuelas] = await db.query('SELECT COUNT(*) as total FROM escuelas');
    console.log(`Total de escuelas en la base de datos: ${totalEscuelas[0].total}`);
    
    // Identificar duplicados basándose en nombre y dirección
    console.log('\nIdentificando duplicados por nombre y dirección...');
    const [duplicados] = await db.query(`
      SELECT 
        nombre, 
        direccion, 
        COUNT(*) as cantidad,
        GROUP_CONCAT(id ORDER BY id) as ids
      FROM escuelas 
      GROUP BY nombre, direccion 
      HAVING COUNT(*) > 1
      ORDER BY cantidad DESC, nombre
    `);
    
    if (duplicados.length === 0) {
      console.log('No se encontraron duplicados exactos por nombre y dirección.');
    } else {
      console.log(`\nSe encontraron ${duplicados.length} grupos de duplicados:`);
      duplicados.forEach((grupo, index) => {
        console.log(`${index + 1}. "${grupo.nombre}" - "${grupo.direccion}"`);
        console.log(`   Cantidad de duplicados: ${grupo.cantidad}`);
        console.log(`   IDs: ${grupo.ids}`);
        console.log('');
      });
    }
    
    // También buscar duplicados similares (solo por nombre)
    console.log('\nBuscando duplicados similares por nombre...');
    const [duplicadosNombre] = await db.query(`
      SELECT 
        nombre, 
        COUNT(*) as cantidad,
        GROUP_CONCAT(CONCAT(id, ':', direccion) ORDER BY id SEPARATOR ' | ') as escuelas_info
      FROM escuelas 
      GROUP BY nombre 
      HAVING COUNT(*) > 1
      ORDER BY cantidad DESC, nombre
    `);
    
    if (duplicadosNombre.length > 0) {
      console.log(`Se encontraron ${duplicadosNombre.length} nombres de escuelas duplicados:`);
      duplicadosNombre.forEach((grupo, index) => {
        console.log(`${index + 1}. "${grupo.nombre}" (${grupo.cantidad} veces)`);
        console.log(`   Escuelas: ${grupo.escuelas_info}`);
        console.log('');
      });
    }
    
    // Mostrar algunas escuelas para análisis manual
    console.log('\nPrimeras 20 escuelas para análisis:');
    const [muestraEscuelas] = await db.query(`
      SELECT id, nombre, direccion, seccional_nombre, cantidad_mesas, electores 
      FROM escuelas 
      ORDER BY nombre, direccion 
      LIMIT 20
    `);
    
    muestraEscuelas.forEach(escuela => {
      console.log(`ID: ${escuela.id} | ${escuela.nombre} | ${escuela.direccion} | Seccional: ${escuela.seccional_nombre}`);
    });
    
    // Preguntar si desea proceder con la eliminación automática
    console.log('\n¿Desea proceder con la eliminación automática de duplicados exactos?');
    console.log('Se mantendrá el registro con ID más bajo y se eliminarán los demás.');
    
    return { duplicados, duplicadosNombre, totalEscuelas: totalEscuelas[0].total };
    
  } catch (error) {
    console.error('Error al analizar duplicados:', error);
  }
}

async function eliminarDuplicadosConDependencias() {
  try {
    console.log('\nEliminando duplicados manejando dependencias...');
    
    // Primero, obtener todos los grupos de duplicados
    const [duplicados] = await db.query(`
      SELECT 
        nombre, 
        direccion, 
        COUNT(*) as cantidad,
        GROUP_CONCAT(id ORDER BY id) as ids
      FROM escuelas 
      GROUP BY nombre, direccion 
      HAVING COUNT(*) > 1
      ORDER BY cantidad DESC, nombre
    `);
    
    let totalEliminados = 0;
    
    for (const grupo of duplicados) {
      const ids = grupo.ids.split(',').map(id => parseInt(id));
      const idPrincipal = ids[0]; // Mantener el ID más bajo
      const idsAEliminar = ids.slice(1); // Eliminar los demás
      
      console.log(`\nProcesando: "${grupo.nombre}" - "${grupo.direccion}"`);
      console.log(`Manteniendo ID: ${idPrincipal}, Eliminando IDs: ${idsAEliminar.join(', ')}`);
      
      for (const idAEliminar of idsAEliminar) {
        try {
          // 1. Transferir mesas del duplicado al principal
          const [mesasResult] = await db.query(
            'UPDATE mesas SET escuela_id = ? WHERE escuela_id = ?',
            [idPrincipal, idAEliminar]
          );
          
          if (mesasResult.affectedRows > 0) {
            console.log(`  - Transferidas ${mesasResult.affectedRows} mesas del ID ${idAEliminar} al ID ${idPrincipal}`);
          }
          
          // 2. Transferir encargados si existen
          const [encargadoResult] = await db.query(
            'SELECT id_encargado FROM escuelas WHERE id = ? AND id_encargado IS NOT NULL',
            [idAEliminar]
          );
          
          if (encargadoResult.length > 0) {
            const [principalEncargado] = await db.query(
              'SELECT id_encargado FROM escuelas WHERE id = ?',
              [idPrincipal]
            );
            
            if (!principalEncargado[0].id_encargado) {
              await db.query(
                'UPDATE escuelas SET id_encargado = ? WHERE id = ?',
                [encargadoResult[0].id_encargado, idPrincipal]
              );
              console.log(`  - Transferido encargado del ID ${idAEliminar} al ID ${idPrincipal}`);
            }
          }
          
          // 3. Transferir otros datos importantes si faltan en el principal
          const [datosPrincipal] = await db.query(
            'SELECT seccional_nombre, subcircuito, cantidad_mesas, electores FROM escuelas WHERE id = ?',
            [idPrincipal]
          );
          
          const [datosDuplicado] = await db.query(
            'SELECT seccional_nombre, subcircuito, cantidad_mesas, electores FROM escuelas WHERE id = ?',
            [idAEliminar]
          );
          
          if (datosPrincipal.length > 0 && datosDuplicado.length > 0) {
            const principal = datosPrincipal[0];
            const duplicado = datosDuplicado[0];
            
            let updates = [];
            let values = [];
            
            if (!principal.seccional_nombre && duplicado.seccional_nombre) {
              updates.push('seccional_nombre = ?');
              values.push(duplicado.seccional_nombre);
            }
            
            if (!principal.subcircuito && duplicado.subcircuito) {
              updates.push('subcircuito = ?');
              values.push(duplicado.subcircuito);
            }
            
            if (!principal.cantidad_mesas && duplicado.cantidad_mesas) {
              updates.push('cantidad_mesas = ?');
              values.push(duplicado.cantidad_mesas);
            }
            
            if (!principal.electores && duplicado.electores) {
              updates.push('electores = ?');
              values.push(duplicado.electores);
            }
            
            if (updates.length > 0) {
              values.push(idPrincipal);
              await db.query(
                `UPDATE escuelas SET ${updates.join(', ')} WHERE id = ?`,
                values
              );
              console.log(`  - Actualizados datos faltantes en ID ${idPrincipal}`);
            }
          }
          
          // 4. Ahora eliminar el duplicado
          const [deleteResult] = await db.query('DELETE FROM escuelas WHERE id = ?', [idAEliminar]);
          
          if (deleteResult.affectedRows > 0) {
            console.log(`  - Eliminado registro duplicado ID ${idAEliminar}`);
            totalEliminados++;
          }
          
        } catch (error) {
          console.error(`  - Error procesando ID ${idAEliminar}:`, error.message);
        }
      }
    }
    
    console.log(`\n✅ Proceso completado. Se eliminaron ${totalEliminados} registros duplicados.`);
    
    // Verificar el resultado final
    const [totalDespues] = await db.query('SELECT COUNT(*) as total FROM escuelas');
    console.log(`📊 Total de escuelas después de la limpieza: ${totalDespues[0].total}`);
    
    return totalEliminados;
    
  } catch (error) {
    console.error('❌ Error al eliminar duplicados:', error);
    return 0;
  }
}

// Función principal
async function main() {
  console.log('=== ANÁLISIS Y ELIMINACIÓN DE DUPLICADOS EN ESCUELAS ===\n');
  
  const analisis = await eliminarDuplicadosEscuelas();
  
  if (analisis && analisis.duplicados.length > 0) {
    console.log('\n=== PROCEDIENDO CON ELIMINACIÓN INTELIGENTE ===');
    const eliminados = await eliminarDuplicadosConDependencias();
    
    if (eliminados > 0) {
      console.log('\n=== VERIFICACIÓN FINAL ===');
      await eliminarDuplicadosEscuelas();
    }
  } else {
    console.log('\nNo hay duplicados exactos para eliminar.');
  }
  
  console.log('\n=== PROCESO COMPLETADO ===');
  process.exit(0);
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  main();
}

module.exports = { eliminarDuplicadosEscuelas, eliminarDuplicadosConDependencias };
