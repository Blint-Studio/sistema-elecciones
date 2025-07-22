const db = require('../config/db');
const SubcircuitosModel = require('../models/subcircuitosModel');

/**
 * Actualiza los totales de una seccional basándose en los resultados de las escuelas
 */
async function actualizarTotalesPorSeccional(seccionalNombre, tipoEleccion, fecha) {
  try {
    console.log(`Actualizando totales para ${seccionalNombre}, tipo elección ${tipoEleccion}, fecha ${fecha}`);
    
    // Obtener todos los resultados de escuelas para esta seccional, tipo de elección y fecha
    const [resultadosEscuelas] = await db.query(`
      SELECT 
        SUM(r.total_votantes) as total_votantes,
        SUM(r.total_electores_padron) as total_electores_padron,
        SUM(r.frente_civico) as frente_civico,
        SUM(r.peronismo) as peronismo,
        SUM(r.otro) as otro,
        SUM(r.total_nulos) as total_nulos,
        SUM(r.total_blancos) as total_blancos
      FROM resultados r
      LEFT JOIN escuelas e ON r.id_escuela = e.id
      WHERE e.seccional_nombre = ? 
        AND r.id_tipo_eleccion = ?
        AND DATE(r.fecha) = DATE(?)
    `, [seccionalNombre, tipoEleccion, fecha]);

    if (resultadosEscuelas.length === 0 || !resultadosEscuelas[0].total_votantes) {
      console.log('No hay resultados de escuelas para agregar');
      return;
    }

    const totales = resultadosEscuelas[0];
    console.log('Totales calculados:', totales);

    // Obtener el ID de la seccional (sin subcircuito, "Sin letra")
    const numeroSeccional = seccionalNombre.replace('Seccional ', '');
    const idSeccional = await SubcircuitosModel.getSeccionalIdByNumeroAndSubcircuito(numeroSeccional, 'Sin letra');
    
    if (!idSeccional) {
      console.log('No se pudo obtener el ID de la seccional');
      return;
    }

    // Verificar si ya existe un resultado de subcircuito para esta seccional, tipo y fecha
    const [existeResultado] = await db.query(`
      SELECT id FROM resultados_subcircuito 
      WHERE id_seccional = ? 
        AND id_tipo_eleccion = ? 
        AND DATE(fecha) = DATE(?)
    `, [idSeccional, tipoEleccion, fecha]);

    if (existeResultado.length > 0) {
      // Actualizar registro existente
      await db.query(`
        UPDATE resultados_subcircuito SET
          total_votantes = ?,
          total_electores_padron = ?,
          frente_civico = ?,
          peronismo = ?,
          otro = ?,
          total_nulos = ?,
          total_blancos = ?,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `, [
        totales.total_votantes,
        totales.total_electores_padron,
        totales.frente_civico,
        totales.peronismo,
        totales.otro,
        totales.total_nulos,
        totales.total_blancos,
        existeResultado[0].id
      ]);
      
      console.log(`✓ Actualizado resultado de seccional existente con ID ${existeResultado[0].id}`);
    } else {
      // Crear nuevo registro
      await db.query(`
        INSERT INTO resultados_subcircuito 
        (fecha, id_tipo_eleccion, id_seccional, id_barrio, total_votantes, total_electores_padron, frente_civico, peronismo, otro, total_nulos, total_blancos)
        VALUES (?, ?, ?, NULL, ?, ?, ?, ?, ?, ?, ?)
      `, [
        fecha,
        tipoEleccion,
        idSeccional,
        totales.total_votantes,
        totales.total_electores_padron,
        totales.frente_civico,
        totales.peronismo,
        totales.otro,
        totales.total_nulos,
        totales.total_blancos
      ]);
      
      console.log('✓ Creado nuevo resultado de seccional');
    }

  } catch (error) {
    console.error('Error al actualizar totales por seccional:', error);
    throw error;
  }
}

module.exports = {
  actualizarTotalesPorSeccional
};
