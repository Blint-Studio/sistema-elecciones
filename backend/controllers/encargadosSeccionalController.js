const db = require('../config/db');
const encargadoSeccionalSchema = require('../validators/encargadoSeccionalValidator');
const bcrypt = require('bcryptjs');

exports.create = async (req, res, next) => {
  try {
    const { error } = encargadoSeccionalSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: true, message: error.details[0].message });
    }

    const { nombre, email, password, id_seccional } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await db.query(
      'INSERT INTO encargados_seccional (nombre, email, password, id_seccional) VALUES (?, ?, ?, ?)',
      [nombre, email, hashedPassword, id_seccional]
    );
    res.status(201).json({ message: 'Encargado creado correctamente', id: result.insertId });
  } catch (err) {
    next(err);
  }
};

exports.getAll = async (req, res, next) => {
  try {
    const [encargados] = await db.query('SELECT id, nombre, email, id_seccional FROM encargados_seccional');
    res.json(encargados);
  } catch (err) {
    next(err);
  }
};

exports.getById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const [encargados] = await db.query('SELECT id, nombre, email, id_seccional FROM encargados_seccional WHERE id = ?', [id]);
    if (encargados.length === 0) {
      return res.status(404).json({ error: true, message: 'Encargado de seccional no encontrado' });
    }
    res.json(encargados[0]);
  } catch (err) {
    next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    const { error } = encargadoSeccionalSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: true, message: error.details[0].message });
    }

    const { id } = req.params;
    const { nombre, email, password, id_seccional } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await db.query(
      'UPDATE encargados_seccional SET nombre = ?, email = ?, password = ?, id_seccional = ? WHERE id = ?',
      [nombre, email, hashedPassword, id_seccional, id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: true, message: 'Encargado de seccional no encontrado' });
    }
    res.json({ message: 'Encargado de seccional actualizado' });
  } catch (err) {
    next(err);
  }
};

exports.delete = async (req, res, next) => {
  try {
    const { id } = req.params;
    const [result] = await db.query('DELETE FROM encargados_seccional WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: true, message: 'Encargado de seccional no encontrado' });
    }
    res.json({ message: 'Encargado de seccional eliminado' });
  } catch (err) {
    next(err);
  }
};