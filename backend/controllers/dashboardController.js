const db = require('../config/db');

exports.paneoSeccionales = async (req, res, next) => {
  try {
    const sql = `
      SELECT 
        s.id as seccional_id, 
        s.nombre as seccional_nombre,
        COUNT(DISTINCT b.id) as total_barrios,
        COUNT(DISTINCT i.id) as total_instituciones,
        COUNT(DISTINCT m.id) as total_militantes
      FROM seccionales s
      LEFT JOIN barrios b ON b.seccional_nombre = s.nombre
      LEFT JOIN instituciones i ON i.id_barrio = b.id
      LEFT JOIN militantes m ON m.id_barrio = b.id
      GROUP BY s.id;
    `;
    const [rows] = await db.query(sql);
    res.json(rows);
  } catch (err) {
    next(err);
  }
};