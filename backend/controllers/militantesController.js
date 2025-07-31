const db = require('../config/db');
const Militantes = require('../models/militantesModel');
const { filtrarPorSeccional, agregarFiltroSeccional } = require('../middlewares/seccional');

exports.getAll = async (req, res, next) => {
  try {
    let baseQuery = `
      SELECT m.*, b.seccional_nombre
      FROM militantes m
      LEFT JOIN barrios b ON m.id_barrio = b.id
    `;
    
    let params = [];
    
    // Si es usuario seccional, filtrar por su seccional
    if (req.user && req.user.rol === 'seccional' && req.user.seccional_asignada) {
      baseQuery += ` WHERE b.seccional_nombre = ?`;
      params.push(req.user.seccional_asignada.toString());
    }
    
    const [militantes] = await db.query(baseQuery, params);
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
    const { edad, ...nuevo } = req.body; // Elimina edad si viene
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
    const { edad, ...datosActualizados } = req.body; // Elimina edad si viene
    await Militantes.update(req.params.id, datosActualizados);
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

    // Verificar si el militante es encargado de alguna escuela
    const [escuelasAsignadas] = await db.query(
      'SELECT id, nombre FROM escuelas WHERE id_encargado = ?',
      [req.params.id]
    );

    // Si es encargado de escuelas, primero removerlo como encargado
    if (escuelasAsignadas.length > 0) {
      await db.query(
        'UPDATE escuelas SET id_encargado = NULL WHERE id_encargado = ?',
        [req.params.id]
      );
      
      // Opcional: informar sobre las escuelas afectadas
      const nombreEscuelas = escuelasAsignadas.map(e => e.nombre).join(', ');
      console.log(`Militante removido como encargado de: ${nombreEscuelas}`);
    }

    // Ahora eliminar el militante
    await Militantes.delete(req.params.id);
    
    const mensaje = escuelasAsignadas.length > 0 
      ? `Militante eliminado. También fue removido como encargado de ${escuelasAsignadas.length} escuela(s).`
      : 'Militante eliminado';
      
    res.json({ message: mensaje });
  } catch (err) {
    next(err);
  }
};