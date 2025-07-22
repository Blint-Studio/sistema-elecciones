const db = require('../config/db');
const encargadoEscuelaSchema = require('../validators/encargadoEscuelaValidator');

exports.crearEncargadoEscuela = async (req, res, next) => {
  try {
    const { error } = encargadoEscuelaSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: true, message: error.details[0].message });
    }

    const { nombre, telefono, id_escuela } = req.body;
    const [result] = await db.query(
      'INSERT INTO encargados_escuela (nombre, telefono, id_escuela) VALUES (?, ?, ?)',
      [nombre, telefono, id_escuela]
    );
    res.status(201).json({ message: 'Encargado de escuela creado', id: result.insertId });
  } catch (err) {
    next(err);
  }
};

exports.obtenerEncargadosEscuela = async (req, res, next) => {
  try {
    const [encargados] = await db.query('SELECT * FROM encargados_escuela');
    res.json(encargados);
  } catch (err) {
    next(err);
  }
};

exports.obtenerEncargadoEscuelaPorId = async (req, res, next) => {
  try {
    const { id } = req.params;
    const [encargados] = await db.query('SELECT * FROM encargados_escuela WHERE id = ?', [id]);
    if (encargados.length === 0) {
      return res.status(404).json({ error: true, message: 'Encargado de escuela no encontrado' });
    }
    res.json(encargados[0]);
  } catch (err) {
    next(err);
  }
};

exports.actualizarEncargadoEscuela = async (req, res, next) => {
  try {
    const { error } = encargadoEscuelaSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: true, message: error.details[0].message });
    }

    const { id } = req.params;
    const { nombre, telefono, id_escuela } = req.body;
    const [result] = await db.query(
      'UPDATE encargados_escuela SET nombre = ?, telefono = ?, id_escuela = ? WHERE id = ?',
      [nombre, telefono, id_escuela, id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: true, message: 'Encargado de escuela no encontrado' });
    }
    res.json({ message: 'Encargado de escuela actualizado' });
  } catch (err) {
    next(err);
  }
};

exports.eliminarEncargadoEscuela = async (req, res, next) => {
  try {
    const { id } = req.params;
    const [result] = await db.query('DELETE FROM encargados_escuela WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: true, message: 'Encargado de escuela no encontrado' });
    }
    res.json({ message: 'Encargado de escuela eliminado' });
  } catch (err) {
    next(err);
  }
};

// Ejemplo de función
exports.getAllEncargadosEscuela = async (req, res, next) => {
  try {
    const [encargados] = await db.query('SELECT * FROM encargados_escuela');
    res.json(encargados);
  } catch (err) {
    next(err);
  }
};
