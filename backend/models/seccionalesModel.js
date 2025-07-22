const db = require('../config/db');

const Seccionales = {
  // Obtener todas las seccionales
  getAll: async () => {
    try {
      const [results] = await db.query('SELECT * FROM seccionales ORDER BY nombre ASC');
      return results;
    } catch (err) {
      throw err;
    }
  },

  // Obtener seccional por ID
  getById: async (id) => {
    try {
      const [results] = await db.query('SELECT * FROM seccionales WHERE id = ?', [id]);
      return results[0];
    } catch (err) {
      throw err;
    }
  },

  // Obtener barrios de una seccional
  getBarriosBySeccional: async (seccional_id) => {
    try {
      // Primero obtenemos el nombre de la seccional
      const [seccional] = await db.query('SELECT nombre FROM seccionales WHERE id = ?', [seccional_id]);
      if (seccional.length === 0) {
        return [];
      }
      
      // Extraemos el número de la seccional del nombre (ej: "Seccional 01" -> "1")
      const nombreSeccional = seccional[0].nombre;
      let numeroSeccional = nombreSeccional.replace(/[^0-9]/g, '');
      // Convertir a número y luego a string para eliminar ceros a la izquierda
      numeroSeccional = parseInt(numeroSeccional).toString();
      
      // Buscar barrios por seccional_nombre
      const [results] = await db.query(
        'SELECT * FROM barrios WHERE seccional_nombre = ? ORDER BY nombre ASC', 
        [numeroSeccional]
      );
      return results;
    } catch (err) {
      throw err;
    }
  },

  // Crear nueva seccional
  create: async (data) => {
    try {
      const [result] = await db.query('INSERT INTO seccionales SET ?', data);
      return { id: result.insertId, ...data };
    } catch (err) {
      throw err;
    }
  },

  // Actualizar seccional
  update: async (id, data) => {
    try {
      await db.query('UPDATE seccionales SET ? WHERE id = ?', [data, id]);
      return { id, ...data };
    } catch (err) {
      throw err;
    }
  },

  // Eliminar seccional
  delete: async (id) => {
    try {
      await db.query('DELETE FROM seccionales WHERE id = ?', [id]);
      return true;
    } catch (err) {
      throw err;
    }
  }
};

module.exports = Seccionales;
