const Mesas = require('../models/mesasModel');

exports.getAllMesas = async (req, res) => {
  try {
    const mesas = await Mesas.getAll();
    res.json(mesas);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener las mesas' });
  }
};

exports.getMesaById = async (req, res) => {
  try {
    const mesa = await Mesas.getById(req.params.id);
    if (!mesa) return res.status(404).json({ error: 'Mesa no encontrada' });
    res.json(mesa);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener la mesa' });
  }
};

exports.createMesa = async (req, res) => {
  try {
    const { numero, id_escuela } = req.body;
    if (!numero || !id_escuela) {
      return res.status(400).json({ error: 'Faltan datos requeridos' });
    }
    const nuevaMesa = await Mesas.create({ numero, id_escuela });
    res.status(201).json(nuevaMesa);
  } catch (err) {
    res.status(500).json({ error: 'Error al crear la mesa' });
  }
};

exports.updateMesa = async (req, res) => {
  try {
    const { numero, id_escuela } = req.body;
    if (!numero || !id_escuela) {
      return res.status(400).json({ error: 'Faltan datos requeridos' });
    }
    const mesa = await Mesas.getById(req.params.id);
    if (!mesa) return res.status(404).json({ error: 'Mesa no encontrada' });
    const actualizada = await Mesas.update(req.params.id, { numero, id_escuela });
    res.json(actualizada);
  } catch (err) {
    res.status(500).json({ error: 'Error al actualizar la mesa' });
  }
};

exports.deleteMesa = async (req, res) => {
  try {
    const mesa = await Mesas.getById(req.params.id);
    if (!mesa) return res.status(404).json({ error: 'Mesa no encontrada' });
    await Mesas.delete(req.params.id);
    res.json({ message: 'Mesa eliminada' });
  } catch (err) {
    res.status(500).json({ error: 'Error al eliminar la mesa' });
  }
};