const db = require('../config/db');
const escuelaSchema = require('../validators/escuelaValidator');
const { filtrarPorSeccional, agregarFiltroSeccional } = require('../middlewares/seccional');

// Obtener todas las escuelas con información del encargado
exports.obtenerEscuelas = async (req, res, next) => {
  try {
    let baseQuery = `
      SELECT DISTINCT
        e.id,
        e.nombre,
        e.direccion,
        e.seccional_nombre,
        e.subcircuito,
        e.cantidad_mesas,
        e.electores,
        e.id_encargado,
        m.nombre as encargado_nombre,
        m.apellido as encargado_apellido,
        m.telefono as encargado_telefono,
        m.instagram as encargado_instagram,
        MIN(mes.numero_mesa) as primera_mesa
      FROM escuelas e
      LEFT JOIN militantes m ON e.id_encargado = m.id AND m.categoria = 'encargado de escuela'
      LEFT JOIN mesas mes ON e.id = mes.escuela_id
    `;
    
    let params = [];
    
    // Si es usuario seccional, filtrar por su seccional
    if (req.user && req.user.rol === 'seccional' && req.user.seccional_asignada) {
      baseQuery += ` WHERE e.seccional_nombre = ?`;
      params.push(req.user.seccional_asignada.toString());
    }
    
    baseQuery += ` GROUP BY e.id ORDER BY MIN(mes.numero_mesa) ASC, e.id ASC`;

    const [escuelas] = await db.query(baseQuery, params);
    
    res.json(escuelas);
  } catch (err) {
    console.error('Error al obtener escuelas:', err);
    res.status(500).json({ 
      error: true, 
      message: 'Error al cargar escuelas: ' + err.message 
    });
  }
};

// Obtener escuela por ID con detalles completos del encargado
exports.obtenerEscuelaPorId = async (req, res, next) => {
  try {
    const { id } = req.params;
    const [escuelas] = await db.query(`
      SELECT 
        e.*,
        m.id as encargado_id,
        m.nombre as encargado_nombre,
        m.apellido as encargado_apellido,
        m.telefono as encargado_telefono,
        m.instagram as encargado_instagram,
        m.fecha_nacimiento as encargado_fecha_nacimiento,
        m.trabaja as encargado_trabaja,
        m.dependencia as encargado_dependencia,
        m.tipo_trabajo as encargado_tipo_trabajo,
        b.nombre as encargado_barrio_nombre
      FROM escuelas e
      LEFT JOIN militantes m ON e.id_encargado = m.id AND m.categoria = 'encargado de escuela'
      LEFT JOIN barrios b ON m.id_barrio = b.id
      WHERE e.id = ?
    `, [id]);
    
    if (escuelas.length === 0) {
      return res.status(404).json({ 
        error: true, 
        message: 'Escuela no encontrada' 
      });
    }
    
    res.json(escuelas[0]);
  } catch (err) {
    console.error('Error al obtener escuela:', err);
    res.status(500).json({ 
      error: true, 
      message: 'Error al cargar escuela: ' + err.message 
    });
  }
};

// Asignar encargado a escuela
exports.asignarEncargado = async (req, res, next) => {
  try {
    const { id } = req.params; // ID de la escuela
    const { encargado_id } = req.body;
    
    // Verificar que el militante existe y tiene la categoría correcta
    const [militante] = await db.query(
      'SELECT id FROM militantes WHERE id = ? AND categoria = "encargado de escuela"',
      [encargado_id]
    );
    
    if (militante.length === 0) {
      return res.status(400).json({ 
        error: true, 
        message: 'El militante especificado no existe o no tiene la categoría "encargado de escuela"' 
      });
    }
    
    // Verificar que el encargado no esté ya asignado a otra escuela
    const [escuelaExistente] = await db.query(
      'SELECT id FROM escuelas WHERE id_encargado = ? AND id != ?',
      [encargado_id, id]
    );
    
    if (escuelaExistente.length > 0) {
      return res.status(400).json({ 
        error: true, 
        message: 'Este encargado ya está asignado a otra escuela' 
      });
    }
    
    // Asignar el encargado
    await db.query(
      'UPDATE escuelas SET id_encargado = ? WHERE id = ?',
      [encargado_id, id]
    );
    
    res.json({ message: 'Encargado asignado exitosamente' });
  } catch (err) {
    console.error('Error al asignar encargado:', err);
    res.status(500).json({ 
      error: true, 
      message: 'Error al asignar encargado: ' + err.message 
    });
  }
};

// Remover encargado de escuela
exports.removerEncargado = async (req, res, next) => {
  try {
    const { id } = req.params; // ID de la escuela
    
    await db.query(
      'UPDATE escuelas SET id_encargado = NULL WHERE id = ?',
      [id]
    );
    
    res.json({ message: 'Encargado removido exitosamente' });
  } catch (err) {
    console.error('Error al remover encargado:', err);
    res.status(500).json({ 
      error: true, 
      message: 'Error al remover encargado: ' + err.message 
    });
  }
};

// Obtener militantes que pueden ser encargados de escuela
exports.obtenerEncargadosDisponibles = async (req, res, next) => {
  try {
    const [encargados] = await db.query(`
      SELECT 
        m.id,
        m.nombre,
        m.apellido,
        m.telefono,
        m.instagram,
        b.nombre as barrio_nombre,
        CASE 
          WHEN e.id IS NOT NULL THEN 'Asignado'
          ELSE 'Disponible'
        END as estado,
        e.nombre as escuela_asignada
      FROM militantes m
      LEFT JOIN barrios b ON m.id_barrio = b.id
      LEFT JOIN escuelas e ON e.id_encargado = m.id
      WHERE m.categoria = 'encargado de escuela'
      ORDER BY m.apellido ASC, m.nombre ASC
    `);
    
    res.json(encargados);
  } catch (err) {
    console.error('Error al obtener encargados disponibles:', err);
    res.status(500).json({ 
      error: true, 
      message: 'Error al cargar encargados disponibles: ' + err.message 
    });
  }
};

// Crear escuela
exports.crearEscuela = async (req, res, next) => {
  try {
    const { error } = escuelaSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: true, message: error.details[0].message });
    }

    const { nombre, direccion, id_barrio } = req.body;
    const [result] = await db.query(
      'INSERT INTO escuelas (nombre, direccion, id_barrio) VALUES (?, ?, ?)',
      [nombre, direccion, id_barrio]
    );
    res.status(201).json({ message: 'Escuela creada', id: result.insertId });
  } catch (err) {
    next(err);
  }
};

// Actualizar escuela
exports.actualizarEscuela = async (req, res, next) => {
  try {
    const { error } = escuelaSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: true, message: error.details[0].message });
    }

    const { id } = req.params;
    const { nombre, direccion, id_barrio } = req.body;
    const [result] = await db.query(
      'UPDATE escuelas SET nombre = ?, direccion = ?, id_barrio = ? WHERE id = ?',
      [nombre, direccion, id_barrio, id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: true, message: 'Escuela no encontrada' });
    }
    res.json({ message: 'Escuela actualizada' });
  } catch (err) {
    next(err);
  }
};

// Eliminar escuela
exports.eliminarEscuela = async (req, res, next) => {
  try {
    const { id } = req.params;
    const [result] = await db.query('DELETE FROM escuelas WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: true, message: 'Escuela no encontrada' });
    }
    res.json({ message: 'Escuela eliminada' });
  } catch (err) {
    next(err);
  }
};

