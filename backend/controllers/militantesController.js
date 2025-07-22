const Militantes = require('../models/militantesModel');

exports.getAll = async (req, res, next) => {
  try {
    const [militantes] = await Militantes.getAll();
    res.json(militantes);
  } catch (err) {
    next(err);
  }
};

exports.getById = async (req, res, next) => {
  try {
    const [militante] = await Militantes.getById(req.params.id);
    if (!militante.length) {
      return res.status(404).json({ error: true, message: 'Militante no encontrado' });
    }
    res.json(militante[0]);
  } catch (err) {
    next(err);
  }
};

exports.create = async (req, res, next) => {
  try {
    const nuevo = req.body;
    const [result] = await Militantes.create(nuevo);
    res.status(201).json({ message: 'Militante creado', id: result.insertId });
  } catch (err) {
    next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    const [rows] = await Militantes.getById(req.params.id);
    if (!rows.length) {
      return res.status(404).json({ error: true, message: 'Militante no encontrado' });
    }
    await Militantes.update(req.params.id, req.body);
    res.json({ message: 'Militante actualizado' });
  } catch (err) {
    next(err);
  }
};

exports.delete = async (req, res, next) => {
  try {
    const [rows] = await Militantes.getById(req.params.id);
    if (!rows.length) {
      return res.status(404).json({ error: true, message: 'Militante no encontrado' });
    }
    await Militantes.delete(req.params.id);
    res.json({ message: 'Militante eliminado' });
  } catch (err) {
    next(err);
  }
};