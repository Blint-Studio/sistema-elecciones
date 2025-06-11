const Escuelas = require('../models/escuelasModel');

exports.getAllEscuelas = async (req, res) => {
  try {
    const escuelas = await Escuelas.getAll();
    res.json(escuelas);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener las escuelas' });
  }
};

exports.getEscuelaById = async (req, res) => {
  try {
    const escuela = await Escuelas.getById(req.params.id);
    if (!escuela) return res.status(404).json({ error: 'Escuela no encontrada' });
    res.json(escuela);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener la escuela' });
  }
};

exports.createEscuela = async (req, res) => {
  try {
    const { nombre, direccion, id_barrio } = req.body;
    if (!nombre || !direccion || !id_barrio) {
      return res.status(400).json({ error: 'Faltan datos requeridos' });
    }
    const nuevaEscuela = await Escuelas.create({ nombre, direccion, id_barrio });
    res.status(201).json(nuevaEscuela);
  } catch (err) {
    res.status(500).json({ error: 'Error al crear la escuela' });
  }
};

exports.updateEscuela = async (req, res) => {
  try {
    const { nombre, direccion, id_barrio } = req.body;
    if (!nombre || !direccion || !id_barrio) {
      return res.status(400).json({ error: 'Faltan datos requeridos' });
    }
    const escuela = await Escuelas.getById(req.params.id);
    if (!escuela) return res.status(404).json({ error: 'Escuela no encontrada' });
    const actualizada = await Escuelas.update(req.params.id, { nombre, direccion, id_barrio });
    res.json(actualizada);
  } catch (err) {
    res.status(500).json({ error: 'Error al actualizar la escuela' });
  }
};

exports.deleteEscuela = async (req, res) => {
  try {
    const escuela = await Escuelas.getById(req.params.id);
    if (!escuela) return res.status(404).json({ error: 'Escuela no encontrada' });
    await Escuelas.delete(req.params.id);
    res.json({ message: 'Escuela eliminada' });
  } catch (err) {
    res.status(500).json({ error: 'Error al eliminar la escuela' });
  }
};