const db = require('../config/db');
const barrioSchema = require('../validators/barrioValidator');
const { filtrarPorSeccional, agregarFiltroSeccional } = require('../middlewares/seccional');

exports.crearBarrio = async (req, res, next) => {
  try {
    const { error } = barrioSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: true, message: error.details[0].message });
    }

    const { nombre } = req.body;
    const [result] = await db.query(
      'INSERT INTO barrios (nombre) VALUES (?)',
      [nombre]
    );
    res.status(201).json({ message: 'Barrio creado', id: result.insertId });
  } catch (err) {
    next(err);
  }
};

exports.obtenerBarrios = async (req, res, next) => {
  try {
    let baseQuery = `
      SELECT b.id, b.nombre, b.seccional_nombre, b.subcircuito,
        (SELECT COUNT(*) FROM militantes m WHERE m.id_barrio = b.id) AS cantidad_militantes
      FROM barrios b
    `;
    
    let params = [];
    
    // Si es usuario seccional, filtrar por su seccional
    if (req.user && req.user.rol === 'seccional' && req.user.seccional_asignada) {
      baseQuery += ` WHERE b.seccional_nombre = ?`;
      params.push(req.user.seccional_asignada.toString());
    }
    
    baseQuery += ` GROUP BY b.id`;
    
    const [barrios] = await db.query(baseQuery, params);
    res.json(barrios);
  } catch (err) {
    next(err);
  }
};

exports.obtenerBarrioPorId = async (req, res, next) => {
  try {
    const { id } = req.params;
    const [barrios] = await db.query('SELECT * FROM barrios WHERE id = ?', [id]);
    if (barrios.length === 0) {
      return res.status(404).json({ error: true, message: 'Barrio no encontrado' });
    }
    res.json(barrios[0]);
  } catch (err) {
    next(err);
  }
};

exports.actualizarBarrio = async (req, res, next) => {
  try {
    const { error } = barrioSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: true, message: error.details[0].message });
    }

    const { id } = req.params;
    const { nombre, seccional_nombre, subcircuito } = req.body;
    const [result] = await db.query(
      'UPDATE barrios SET nombre = ?, seccional_nombre = ?, subcircuito = ? WHERE id = ?',
      [nombre, seccional_nombre, subcircuito, id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: true, message: 'Barrio no encontrado' });
    }
    res.json({ message: 'Barrio actualizado' });
  } catch (err) {
    next(err);
  }
};

exports.eliminarBarrio = async (req, res, next) => {
  try {
    const { id } = req.params;
    // Verifica si el barrio existe antes de intentar eliminar
    const [barrios] = await db.query('SELECT * FROM barrios WHERE id = ?', [id]);
    if (barrios.length === 0) {
      return res.status(404).json({ error: true, message: 'Barrio no encontrado' });
    }

    // Intenta eliminar el barrio
    const [result] = await db.query('DELETE FROM barrios WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: true, message: 'Barrio no encontrado o ya fue eliminado' });
    }
    res.json({ message: 'Barrio eliminado' });
  } catch (err) {
    // Manejo específico de error de clave foránea y otros errores comunes
    if (err.code === 'ER_ROW_IS_REFERENCED_2' || err.errno === 1451) {
      return res.status(400).json({
        error: true,
        message: 'No se puede eliminar el barrio porque tiene militantes asociados. Elimine o reasigne los militantes primero.'
      });
    }
    // Manejo de error de conexión o sintaxis
    if (err.code === 'ER_BAD_FIELD_ERROR') {
      return res.status(500).json({
        error: true,
        message: 'Error de estructura en la base de datos. Verifique los campos y las relaciones.'
      });
    }
    next(err);
  }
};

// Nuevo endpoint para obtener militantes de un barrio
exports.obtenerMilitantesPorBarrio = async (req, res, next) => {
  try {
    const { id } = req.params;
    const [militantes] = await db.query(
      `SELECT * FROM militantes WHERE id_barrio = ?`, [id]
    );
    res.json(militantes);
  } catch (err) {
    next(err);
  }
};

// Nuevo endpoint para obtener resumen de dirigentes por barrio
exports.obtenerResumenDirigentes = async (req, res, next) => {
  try {
    const [barrios] = await db.query(`
      SELECT 
        b.id,
        b.nombre,
        b.seccional_nombre,
        b.subcircuito,
        COUNT(CASE WHEN m.categoria = 'dirigente' THEN 1 END) as dirigentes_count,
        GROUP_CONCAT(
          CASE WHEN m.categoria = 'dirigente' 
          THEN CONCAT(m.nombre, ' ', m.apellido) 
          END SEPARATOR ', '
        ) as dirigentes_nombres
      FROM barrios b
      LEFT JOIN militantes m ON b.id = m.id_barrio
      GROUP BY b.id, b.nombre, b.seccional_nombre, b.subcircuito
      ORDER BY b.nombre
    `);
    res.json(barrios);
  } catch (err) {
    next(err);
  }
};