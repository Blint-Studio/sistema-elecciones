const EncargadosSeccional = require('../models/encargadosSeccionalModel');

exports.getAll = async (req, res, next) => {
  try {
    const encargados = await EncargadosSeccional.getAll();
    res.json(encargados);
  } catch (err) {
    next(err);
  }
};

exports.getById = async (req, res, next) => {
  try {
    const encargado = await EncargadosSeccional.getById(req.params.id);
    if (!encargado) return res.status(404).json({ error: 'Encargado no encontrado' });
    res.json(encargado);
  } catch (err) {
    next(err);
  }
};

exports.create = async (req, res, next) => {
  try {
    const { nombre, telefono, id_seccional } = req.body;
    if (!nombre || !telefono || !id_seccional) {
      return res.status(400).json({ error: 'Faltan datos requeridos' });
    }
    const nuevo = await EncargadosSeccional.create({ nombre, telefono, id_seccional });
    res.status(201).json(nuevo);
  } catch (err) {
    next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    const { nombre, telefono, id_seccional } = req.body;
    if (!nombre || !telefono || !id_seccional) {
      return res.status(400).json({ error: 'Faltan datos requeridos' });
    }
    const encargado = await EncargadosSeccional.getById(req.params.id);
    if (!encargado) return res.status(404).json({ error: 'Encargado no encontrado' });
    const actualizado = await EncargadosSeccional.update(req.params.id, { nombre, telefono, id_seccional });
    res.json(actualizado);
  } catch (err) {
    next(err);
  }
};

exports.delete = async (req, res, next) => {
  try {
    const encargado = await EncargadosSeccional.getById(req.params.id);
    if (!encargado) return res.status(404).json({ error: 'Encargado no encontrado' });
    await EncargadosSeccional.delete(req.params.id);
    res.json({ message: 'Encargado eliminado' });
  } catch (err) {
    next(err);
  }
};