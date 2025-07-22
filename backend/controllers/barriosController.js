const db = require('../config/db');
const barrioSchema = require('../validators/barrioValidator');

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
    const [barrios] = await db.query(`
      SELECT b.id, b.nombre, b.seccional_nombre, b.subcircuito,
        (SELECT COUNT(*) FROM militantes m WHERE m.id_barrio = b.id) AS cantidad_militantes
      FROM barrios b
      GROUP BY b.id
    `);
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
    const [result] = await db.query('DELETE FROM barrios WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: true, message: 'Barrio no encontrado' });
    }
    res.json({ message: 'Barrio eliminado' });
  } catch (err) {
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