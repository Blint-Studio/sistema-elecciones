const Barrios = require('../models/barriosModel');

exports.getAllBarrios = async (req, res) => {
  try {
    const barrios = await Barrios.getAll();
    res.json(barrios);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener los barrios' });
  }
};

exports.getBarrioById = async (req, res) => {
  try {
    const barrio = await Barrios.getById(req.params.id);
    if (!barrio) return res.status(404).json({ error: 'Barrio no encontrado' });
    res.json(barrio);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener el barrio' });
  }
};

exports.createBarrio = async (req, res) => {
  try {
    const { nombre, id_seccional } = req.body;
    if (!nombre || !id_seccional) {
      return res.status(400).json({ error: 'Faltan datos requeridos' });
    }
    const nuevoBarrio = await Barrios.create({ nombre, id_seccional });
    res.status(201).json(nuevoBarrio);
  } catch (err) {
    res.status(500).json({ error: 'Error al crear el barrio' });
  }
};

exports.updateBarrio = async (req, res) => {
  try {
    const { nombre, id_seccional } = req.body;
    if (!nombre || !id_seccional) {
      return res.status(400).json({ error: 'Faltan datos requeridos' });
    }
    const barrio = await Barrios.getById(req.params.id);
    if (!barrio) return res.status(404).json({ error: 'Barrio no encontrado' });
    const actualizado = await Barrios.update(req.params.id, { nombre, id_seccional });
    res.json(actualizado);
  } catch (err) {
    res.status(500).json({ error: 'Error al actualizar el barrio' });
  }
};

exports.deleteBarrio = async (req, res) => {
  try {
    const barrio = await Barrios.getById(req.params.id);
    if (!barrio) return res.status(404).json({ error: 'Barrio no encontrado' });
    await Barrios.delete(req.params.id);
    res.json({ message: 'Barrio eliminado' });
  } catch (err) {
    res.status(500).json({ error: 'Error al eliminar el barrio' });
  }
};