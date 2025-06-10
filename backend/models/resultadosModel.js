const db = require('../config/db');

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
            r.id_mesa,
            r.id_escuela,
            t.nombre AS tipo_eleccion
        FROM resultados r
        LEFT JOIN tipos_eleccion t ON r.id_tipo_eleccion = t.id
        ORDER BY r.fecha DESC
    `;

    db.query(query, (err, results) => {
        if (err) return callback(err, null);

        // Intenta parsear votos_por_lista si es string
        const safeResults = results.map((r) => ({
            ...r,
            votos_por_lista:
                typeof r.votos_por_lista === 'string'
                    ? JSON.parse(r.votos_por_lista)
                    : r.votos_por_lista
        }));

        callback(null, safeResults);
    });
};

module.exports = {
    getAllResultados
};
