const db = require('../config/db');
const mesaSchema = require('../validators/mesaValidator');

exports.crearMesa = async (req, res, next) => {
  try {
    const { error } = mesaSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: true, message: error.details[0].message });
    }

    const { numero_mesa, escuela_id } = req.body;
    const [result] = await db.query(
      'INSERT INTO mesas (numero_mesa, escuela_id) VALUES (?, ?)',
      [numero_mesa, escuela_id]
    );
    res.status(201).json({ message: 'Mesa creada', id: result.insertId });
  } catch (err) {
    next(err);
  }
};

exports.obtenerMesas = async (req, res, next) => {
  try {
    const [mesas] = await db.query('SELECT * FROM mesas ORDER BY numero_mesa ASC');
    res.json(mesas);
  } catch (err) {
    next(err);
  }
};

exports.obtenerMesaPorId = async (req, res, next) => {
  try {
    const { id } = req.params;
    const [mesas] = await db.query('SELECT * FROM mesas WHERE id = ?', [id]);
    if (mesas.length === 0) {
      return res.status(404).json({ error: true, message: 'Mesa no encontrada' });
    }
    res.json(mesas[0]);
  } catch (err) {
    next(err);
  }
};

exports.actualizarMesa = async (req, res, next) => {
  try {
    const { error } = mesaSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: true, message: error.details[0].message });
    }

    const { id } = req.params;
    const { numero_mesa, escuela_id } = req.body;
    const [result] = await db.query(
      'UPDATE mesas SET numero_mesa = ?, escuela_id = ? WHERE id = ?',
      [numero_mesa, escuela_id, id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: true, message: 'Mesa no encontrada' });
    }
    res.json({ message: 'Mesa actualizada' });
  } catch (err) {
    next(err);
  }
};

exports.eliminarMesa = async (req, res, next) => {
  try {
    const { id } = req.params;
    const [result] = await db.query('DELETE FROM mesas WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: true, message: 'Mesa no encontrada' });
    }
    res.json({ message: 'Mesa eliminada' });
  } catch (err) {
    next(err);
  }
};

exports.obtenerMesasPorEscuela = async (req, res, next) => {
  try {
    const escuelaId = req.query.escuela;
    const [mesas] = await db.query(
      'SELECT id, numero_mesa FROM mesas WHERE escuela_id = ? ORDER BY numero_mesa ASC',
      [escuelaId]
    );
    res.json(mesas);
  } catch (err) {
    next(err);
  }
};