const db = require('./config/db');
const { actualizarTotalesPorSeccional } = require('./utils/seccionalUpdater');

/**
 * Script para recalcular todos los totales por seccional 
 * basándose en los resultados existentes de escuelas
 */
async function recalcularTodosTotales() {
  try {
    console.log('=== INICIANDO RECÁLCULO DE TOTALES POR SECCIONAL ===');
    
    // Obtener todas las combinaciones únicas de seccional, tipo de elección y fecha
    const [combinaciones] = await db.query(`
      SELECT DISTINCT 
        e.seccional_nombre,
        r.id_tipo_eleccion,
        r.fecha
      FROM resultados r
      LEFT JOIN escuelas e ON r.id_escuela = e.id
      WHERE e.seccional_nombre IS NOT NULL
      ORDER BY e.seccional_nombre, r.fecha DESC, r.id_tipo_eleccion
    `);

    console.log(`Encontradas ${combinaciones.length} combinaciones para procesar`);

    let procesadas = 0;
    let errores = 0;

    for (const combo of combinaciones) {
      try {
        console.log(`Procesando: ${combo.seccional_nombre} - Tipo ${combo.id_tipo_eleccion} - ${combo.fecha}`);
        
        await actualizarTotalesPorSeccional(
          combo.seccional_nombre,
          combo.id_tipo_eleccion,
          combo.fecha
        );
        
        procesadas++;
      } catch (error) {
        console.error(`Error procesando ${combo.seccional_nombre}:`, error.message);
        errores++;
      }
    }

    console.log('\n=== RESUMEN ===');
    console.log(`✓ Combinaciones procesadas exitosamente: ${procesadas}`);
    console.log(`✗ Errores: ${errores}`);
    console.log(`📊 Total: ${combinaciones.length}`);

    // Mostrar resumen de resultados de subcircuito creados/actualizados
    const [resumen] = await db.query(`
      SELECT 
        s.nombre as seccional,
        te.nombre as tipo_eleccion,
        rs.fecha,
        rs.total_votantes,
        rs.total_electores_padron
      FROM resultados_subcircuito rs
      LEFT JOIN seccionales s ON rs.id_seccional = s.id
      LEFT JOIN tipos_eleccion te ON rs.id_tipo_eleccion = te.id
      WHERE (s.subcircuito IS NULL OR s.subcircuito = '')
      ORDER BY s.nombre, rs.fecha DESC
    `);

    console.log('\n=== RESULTADOS GENERADOS POR SECCIONAL ===');
    resumen.forEach(r => {
      const participacion = r.total_electores_padron > 0 ? 
        ((r.total_votantes / r.total_electores_padron) * 100).toFixed(2) : 'N/A';
      
      console.log(`${r.seccional} | ${r.tipo_eleccion} | ${r.fecha} | Votantes: ${r.total_votantes} | Padrón: ${r.total_electores_padron} | Participación: ${participacion}%`);
    });

  } catch (error) {
    console.error('Error en recálculo general:', error);
  } finally {
    process.exit();
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  recalcularTodosTotales();
}

module.exports = { recalcularTodosTotales };
