const EncargadosEscuela = require('../models/encargadosEscuelaModel');

exports.getAll = async (req, res) => {
  try {
    const encargados = await EncargadosEscuela.getAll();
    res.json(encargados);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener los encargados de escuela' });
  }
};

exports.getById = async (req, res) => {
  try {
    const encargado = await EncargadosEscuela.getById(req.params.id);
    if (!encargado) return res.status(404).json({ error: 'Encargado no encontrado' });
    res.json(encargado);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener el encargado' });
  }
};

exports.create = async (req, res) => {
  try {
    const { nombre, telefono, id_escuela } = req.body;
    if (!nombre || !telefono || !id_escuela) {
      return res.status(400).json({ error: 'Faltan datos requeridos' });
    }
    const nuevo = await EncargadosEscuela.create({ nombre, telefono, id_escuela });
    res.status(201).json(nuevo);
  } catch (err) {
    res.status(500).json({ error: 'Error al crear el encargado' });
  }
};

exports.update = async (req, res) => {
  try {
    const { nombre, telefono, id_escuela } = req.body;
    if (!nombre || !telefono || !id_escuela) {
      return res.status(400).json({ error: 'Faltan datos requeridos' });
    }
    const encargado = await EncargadosEscuela.getById(req.params.id);
    if (!encargado) return res.status(404).json({ error: 'Encargado no encontrado' });
    const actualizado = await EncargadosEscuela.update(req.params.id, { nombre, telefono, id_escuela });
    res.json(actualizado);
  } catch (err) {
    res.status(500).json({ error: 'Error al actualizar el encargado' });
  }
};

exports.delete = async (req, res) => {
  try {
    const encargado = await EncargadosEscuela.getById(req.params.id);
    if (!encargado) return res.status(404).json({ error: 'Encargado no encontrado' });
    await EncargadosEscuela.delete(req.params.id);
    res.json({ message: 'Encargado eliminado' });
  } catch (err) {
    res.status(500).json({ error: 'Error al eliminar el encargado' });
  }
};