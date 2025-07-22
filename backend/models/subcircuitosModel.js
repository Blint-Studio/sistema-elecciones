const db = require('../config/db');

const SubcircuitosModel = {
  // Obtener las 14 seccionales principales (sin duplicados)
  getSeccionales: async () => {
    try {
      const seccionales = [];
      for (let i = 1; i <= 14; i++) {
        seccionales.push({
          numero: i.toString().padStart(2, '0'),
          nombre: `Seccional ${i.toString().padStart(2, '0')}`
        });
      }
      return seccionales;
    } catch (err) {
      throw err;
    }
  },

  // Obtener subcircuitos de una seccional específica
  getSubcircuitosBySeccional: async (numeroSeccional) => {
    try {
      const numero = parseInt(numeroSeccional);
      
      // Para seccionales 1, 2, 3: solo "Sin letra" (son subcircuitos únicos)
      if (numero >= 1 && numero <= 3) {
        return [{ 
          id: null, 
          subcircuito: 'Sin letra', 
          nombre: 'Sin letra',
          numero_seccional: numero 
        }];
      }
      
      // Para seccional 4 en adelante: obtener desde la base de datos
      const [results] = await db.query(`
        SELECT DISTINCT subcircuito
        FROM seccionales 
        WHERE nombre = ? 
        ORDER BY subcircuito
      `, [`Seccional ${numero.toString().padStart(2, '0')}`]);
      
      // Formatear resultados
      const subcircuitos = results.map(row => ({
        id: null,
        subcircuito: row.subcircuito || 'Sin letra',
        nombre: row.subcircuito ? `Subcircuito ${row.subcircuito}` : 'Sin letra',
        numero_seccional: numero
      }));
      
      return subcircuitos;
    } catch (err) {
      throw err;
    }
  },

  // Obtener ID de seccional para almacenar en resultados_subcircuito
  getSeccionalIdByNumeroAndSubcircuito: async (numeroSeccional, subcircuito) => {
    try {
      const numero = parseInt(numeroSeccional);
      const nombreSeccional = `Seccional ${numero.toString().padStart(2, '0')}`;
      
      // Buscar el primer registro que coincida (para evitar duplicados)
      const subcircuitoValue = subcircuito === 'Sin letra' ? '' : subcircuito;
      const [results] = await db.query(`
        SELECT id 
        FROM seccionales 
        WHERE nombre = ? AND subcircuito = ?
        LIMIT 1
      `, [nombreSeccional, subcircuitoValue]);
      
      if (results.length > 0) {
        return results[0].id;
      }
      
      // Si no existe, crear uno nuevo
      const [insertResult] = await db.query(`
        INSERT INTO seccionales (nombre, subcircuito) 
        VALUES (?, ?)
      `, [nombreSeccional, subcircuito || '']);
      
      return insertResult.insertId;
    } catch (err) {
      throw err;
    }
  }
};

module.exports = SubcircuitosModel;
