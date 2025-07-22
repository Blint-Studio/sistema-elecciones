const db = require("../config/db");

exports.getEscuelas = async (req, res, next) => {
  try {
    const [results] = await db.query(`
      SELECT e.id, e.nombre 
      FROM escuelas e
      LEFT JOIN mesas m ON e.id = m.escuela_id
      GROUP BY e.id
      ORDER BY MIN(m.numero_mesa) ASC, e.id ASC
    `);
    res.json(results);
  } catch (err) {
    next(err);
  }
};

exports.getMesas = async (req, res, next) => {
  try {
    const { escuela_id } = req.query;
    if (!escuela_id) {
      return res.status(400).json({ error: "Escuela requerida" });
    }
    const id = parseInt(escuela_id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ error: "ID de escuela inválida" });
    }
    const [results] = await db.query(
      "SELECT id, numero_mesa FROM mesas WHERE id_escuela = ?",
      [id]
    );
    res.json(results);
  } catch (err) {
    next(err);
  }
};

exports.getListas = async (req, res, next) => {
  try {
    const [results] = await db.query(
      "SELECT id, codigo, nombre_lista, id_tipo_eleccion FROM listas_electorales ORDER BY nombre_lista ASC"
    );
    res.json(results);
  } catch (err) {
    next(err);
  }
};

exports.getMesaJerarquia = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ error: "ID de mesa inválido" });
    }
    const query = `
      SELECT 
        m.id AS mesa_id, m.numero_mesa,
        e.id AS escuela_id, e.nombre AS escuela_nombre,
        b.id AS barrio_id, b.nombre AS barrio_nombre,
        s.id AS seccional_id, s.nombre AS seccional_nombre
      FROM mesas m
      LEFT JOIN escuelas e ON m.id_escuela = e.id
      LEFT JOIN barrios b ON e.id_barrio = b.id
      LEFT JOIN seccionales s ON b.id_seccional = s.id
      WHERE m.id = ?
    `;
    const [results] = await db.query(query, [id]);
    if (results.length === 0) return res.status(404).json({ error: "Mesa no encontrada" });
    res.json(results[0]);
  } catch (err) {
    next(err);
  }
};

exports.getBarrios = async (req, res, next) => {
  try {
    const [results] = await db.query(
      "SELECT id, nombre, id_seccional FROM barrios ORDER BY nombre ASC"
    );
    res.json(results);
  } catch (err) {
    next(err);
  }
};

exports.getSeccionales = async (req, res, next) => {
  try {
    const [results] = await db.query(
      "SELECT id, nombre FROM seccionales ORDER BY nombre ASC"
    );
    res.json(results);
  } catch (err) {
    next(err);
  }
};

exports.getResultadosFiltrados = async (req, res, next) => {
  try {
    const { seccional_id, barrio_id, escuela_id, tipo_eleccion } = req.query;
    let filters = [];
    let params = [];

    if (seccional_id) {
      filters.push("s.id = ?");
      params.push(seccional_id);
    }
    if (barrio_id) {
      filters.push("b.id = ?");
      params.push(barrio_id);
    }
    if (escuela_id) {
      filters.push("e.id = ?");
      params.push(escuela_id);
    }
    if (tipo_eleccion) {
      filters.push("r.id_tipo_eleccion = ?");
      params.push(tipo_eleccion);
    }

    const where = filters.length ? "WHERE " + filters.join(" AND ") : "";

    const query = `
      SELECT 
        r.*, m.numero_mesa, e.nombre AS escuela_nombre, b.nombre AS barrio_nombre, s.nombre AS seccional_nombre, t.nombre AS tipo_eleccion
      FROM resultados r
      LEFT JOIN mesas m ON r.id_mesa = m.id
      LEFT JOIN escuelas e ON m.id_escuela = e.id
      LEFT JOIN barrios b ON e.id_barrio = b.id
      LEFT JOIN seccionales s ON b.id_seccional = s.id
      LEFT JOIN tipos_eleccion t ON r.id_tipo_eleccion = t.id
      ${where}
      ORDER BY r.fecha DESC
    `;
    const [results] = await db.query(query, params);
    res.json(results);
  } catch (err) {
    next(err);
  }
};

exports.ejemploMetodo = (req, res) => {
  res.send('Ejemplo funcionando');
};