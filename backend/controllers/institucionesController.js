const db = require('../config/db');
const Instituciones = require('../models/institucionesModel');
const { filtrarPorSeccional, agregarFiltroSeccional } = require('../middlewares/seccional');

exports.getAll = async (req, res, next) => {
  try {
    let baseQuery = `SELECT * FROM instituciones`;
    let params = [];
    
    // Si es usuario seccional, filtrar por su seccional
    if (req.user && req.user.rol === 'seccional' && req.user.seccional_asignada) {
      baseQuery += ` WHERE seccional = ?`;
      params.push(req.user.seccional_asignada.toString());
    }
    
    const [instituciones] = await db.query(baseQuery, params);
    res.json(instituciones);
  } catch (err) {
    next(err);
  }
};

exports.getById = async (req, res, next) => {
  try {
    const [institucion] = await Instituciones.getById(req.params.id);
    if (!institucion.length) {
      return res.status(404).json({ error: true, message: 'Institución no encontrada' });
    }
    res.json(institucion[0]);
  } catch (err) {
    next(err);
  }
};

exports.create = async (req, res) => {
  const { nombre, tipo, direccion, id_barrio, seccional, relacion } = req.body;
  console.log("Datos recibidos:", req.body); // <-- Agrega esta línea
  try {
    await db.query(
      'INSERT INTO instituciones (nombre, tipo, direccion, id_barrio, seccional, relacion) VALUES (?, ?, ?, ?, ?, ?)',
      [nombre, tipo, direccion, id_barrio, seccional, relacion]
    );
    res.json({ success: true });
  } catch (err) {
    console.error("Error al crear institución:", err);
    res.status(500).json({ error: true, message: err.message });
  }
};

exports.update = async (req, res, next) => {
  try {
    const [rows] = await Instituciones.getById(req.params.id);
    if (!rows.length) {
      return res.status(404).json({ error: true, message: 'Institución no encontrada' });
    }
    await Instituciones.update(req.params.id, req.body);
    res.json({ message: 'Institución actualizada' });
  } catch (err) {
    next(err);
  }
};

exports.delete = async (req, res, next) => {
  try {
    const [rows] = await Instituciones.getById(req.params.id);
    if (!rows.length) {
      return res.status(404).json({ error: true, message: 'Institución no encontrada' });
    }
    await Instituciones.delete(req.params.id);
    res.json({ message: 'Institución eliminada' });
  } catch (err) {
    next(err);
  }
};