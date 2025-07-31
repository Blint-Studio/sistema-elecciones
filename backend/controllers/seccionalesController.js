const SeccionalesModel = require('../models/seccionalesModel');
const db = require('../config/db');

// Obtener todas las seccionales
exports.obtenerSeccionales = async (req, res, next) => {
  try {
    const seccionales = await SeccionalesModel.getAll();
    res.json(seccionales);
  } catch (err) {
    console.error('Error al obtener seccionales:', err);
    res.status(500).json({ 
      error: true, 
      message: 'Error al cargar seccionales: ' + err.message 
    });
  }
};

// Obtener seccional por ID
exports.obtenerSeccionalPorId = async (req, res, next) => {
  try {
    const { id } = req.params;
    const seccional = await SeccionalesModel.getById(id);
    if (!seccional) {
      return res.status(404).json({ 
        error: true, 
        message: 'Seccional no encontrada' 
      });
    }
    res.json(seccional);
  } catch (err) {
    console.error('Error al obtener seccional:', err);
    res.status(500).json({ 
      error: true, 
      message: 'Error al cargar seccional: ' + err.message 
    });
  }
};

// Obtener barrios de una seccional
exports.obtenerBarriosPorSeccional = async (req, res, next) => {
  try {
    const seccionalId = req.query.seccional;
    if (!seccionalId) {
      return res.status(400).json({ 
        error: true, 
        message: 'ID de seccional requerido' 
      });
    }
    
    const barrios = await SeccionalesModel.getBarriosBySeccional(seccionalId);
    res.json(barrios);
  } catch (err) {
    console.error('Error al obtener barrios:', err);
    res.status(500).json({ 
      error: true, 
      message: 'Error al cargar barrios: ' + err.message 
    });
  }
};

// Crear nueva seccional
exports.crearSeccional = async (req, res, next) => {
  try {
    const { nombre } = req.body;
    if (!nombre) {
      return res.status(400).json({ 
        error: true, 
        message: 'Nombre de seccional requerido' 
      });
    }
    
    const nuevaSeccional = await SeccionalesModel.create({ nombre });
    res.status(201).json({ 
      message: 'Seccional creada exitosamente', 
      seccional: nuevaSeccional 
    });
  } catch (err) {
    console.error('Error al crear seccional:', err);
    res.status(500).json({ 
      error: true, 
      message: 'Error al crear seccional: ' + err.message 
    });
  }
};

// Obtener resumen de las 14 seccionales principales con estadísticas
exports.obtenerResumenSeccionales = async (req, res, next) => {
  try {
    const resumenSeccionales = [];
    
    // Generar las 14 seccionales con estadísticas
    for (let i = 1; i <= 14; i++) {
      const numeroSeccional = i.toString().padStart(2, '0'); // "01", "02", etc. (para display)
      const numeroSeccionalDB = i.toString(); // "1", "2", etc. (para consultas DB)
      const nombreSeccional = `Seccional ${numeroSeccional}`;
      
      // TODAS las consultas usan números sin cero porque así están en la DB
      
      // Obtener estadísticas de barrios
      const [barriosStats] = await db.query(`
        SELECT COUNT(DISTINCT id) as total_barrios
        FROM barrios 
        WHERE seccional_nombre = ?
      `, [numeroSeccionalDB]);
      
      // Obtener estadísticas de escuelas 
      const [escuelasStats] = await db.query(`
        SELECT COUNT(DISTINCT id) as total_escuelas
        FROM escuelas 
        WHERE seccional_nombre = ?
      `, [numeroSeccionalDB]);
      
      // Obtener estadísticas de instituciones
      const [institucionesStats] = await db.query(`
        SELECT COUNT(DISTINCT i.id) as total_instituciones
        FROM instituciones i
        JOIN barrios b ON i.id_barrio = b.id
        WHERE b.seccional_nombre = ?
      `, [numeroSeccionalDB]);
      
      // Obtener estadísticas de dirigentes
      const [dirigentesStats] = await db.query(`
        SELECT COUNT(DISTINCT m.id) as total_dirigentes
        FROM militantes m
        JOIN barrios b ON m.id_barrio = b.id
        WHERE b.seccional_nombre = ? AND m.categoria = 'dirigente'
      `, [numeroSeccionalDB]);
      
      // Obtener estadísticas de militantes
      const [militantesStats] = await db.query(`
        SELECT COUNT(DISTINCT m.id) as total_militantes
        FROM militantes m
        JOIN barrios b ON m.id_barrio = b.id
        WHERE b.seccional_nombre = ?
      `, [numeroSeccionalDB]);
      
      // Obtener estadísticas de mesas
      const [mesasStats] = await db.query(`
        SELECT COUNT(DISTINCT m.id) as total_mesas
        FROM mesas m
        JOIN escuelas e ON m.escuela_id = e.id
        WHERE e.seccional_nombre = ?
      `, [numeroSeccionalDB]);
      
      resumenSeccionales.push({
        numero: numeroSeccional,
        nombre: nombreSeccional,
        estadisticas: {
          total_barrios: barriosStats[0]?.total_barrios || 0,
          total_escuelas: escuelasStats[0]?.total_escuelas || 0,
          total_militantes: militantesStats[0]?.total_militantes || 0,
          total_mesas: mesasStats[0]?.total_mesas || 0,
          total_instituciones: institucionesStats[0]?.total_instituciones || 0,
          total_dirigentes: dirigentesStats[0]?.total_dirigentes || 0
        }
      });
    }
    
    res.json(resumenSeccionales);
  } catch (err) {
    console.error('Error al obtener resumen de seccionales:', err);
    res.status(500).json({ 
      error: true, 
      message: 'Error al cargar resumen de seccionales: ' + err.message 
    });
  }
};
