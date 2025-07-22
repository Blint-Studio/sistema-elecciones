const db = require('../config/db');

const toCamelCase = (row) => ({
  id: row.id,
  fecha: row.fecha,
  votosPorLista: row.votos_por_lista,
  totalValidos: row.total_validos,
  totalNulos: row.total_nulos,
  totalBlancos: row.total_blancos,
  totalVotantes: row.total_votantes,
  idTipoEleccion: row.id_tipo_eleccion,
  tipoEleccion: row.tipo_eleccion,
  idMesa: row.id_mesa,
  numeroMesa: row.numero_mesa,
  idEscuela: row.id_escuela,
  escuelaNombre: row.escuela_nombre,
  idBarrio: row.id_barrio,
  barrioNombre: row.barrio_nombre,
  idSeccional: row.id_seccional,
  seccionalNombre: row.seccional_nombre
});

// Obtener todos los resultados
const getAllResultados = (callback) => {
    const query = `
        SELECT 
            r.id,
            r.fecha,
            r.votos_por_lista,
            r.total_validos,
            r.total_nulos,
            r.total_blancos,
            r.total_votantes,
            r.id_tipo_eleccion,
            t.nombre AS tipo_eleccion,
            r.id_mesa,
            m.numero_mesa,
            m.id_escuela,
            e.nombre AS escuela_nombre,
            e.id_barrio,
            b.nombre AS barrio_nombre,
            b.id_seccional,
            s.nombre AS seccional_nombre
        FROM resultados r
        LEFT JOIN mesas m ON r.id_mesa = m.id
        LEFT JOIN escuelas e ON m.id_escuela = e.id
        LEFT JOIN barrios b ON e.id_barrio = b.id
        LEFT JOIN seccionales s ON b.id_seccional = s.id
        LEFT JOIN tipos_eleccion t ON r.id_tipo_eleccion = t.id
        ORDER BY r.fecha DESC
    `;
    db.query(query, (err, results) => {
      if (err) return callback(err);
      // Deserializar votos_por_lista
      const resultadosProcesados = results.map(row => ({
        ...row,
        votos_por_lista: row.votos_por_lista ? JSON.parse(row.votos_por_lista) : {}
      }));
      callback(null, resultadosProcesados);
    });
};

exports.getResultados = async () => {
  const [resultados] = await db.query('SELECT * FROM resultados');
  return resultados;
};

module.exports = {
    getAllResultados
};
