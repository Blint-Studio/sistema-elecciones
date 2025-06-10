// backend/routes/extraEndpoints.js
const express = require("express");
const router = express.Router();
const db = require("../config/db");

// GET /extra/escuelas → todas las escuelas con su id, ordenadas alfabéticamente
router.get("/escuelas", (req, res) => {
  db.query(
    "SELECT id, nombre FROM escuelas ORDER BY nombre ASC",
    (err, results) => {
      if (err) return res.status(500).json({ error: "Error al obtener escuelas" });
      res.json(results);
    }
  );
});

// GET /extra/mesas?escuela_id=1 → mesas por escuela con validación de entero
router.get("/mesas", (req, res) => {
  const { escuela_id } = req.query;
  if (!escuela_id) {
    return res.status(400).json({ error: "Escuela requerida" });
  }

  const id = parseInt(escuela_id, 10);
  if (isNaN(id)) {
    return res.status(400).json({ error: "ID de escuela inválida" });
  }

  db.query(
    "SELECT id, numero_mesa FROM mesas WHERE escuela_id = ?",
    [id],
    (err, results) => {
      if (err) return res.status(500).json({ error: "Error al obtener mesas" });
      res.json(results);
    }
  );
});

// GET /extra/listas → todas las listas electorales
router.get("/listas", (req, res) => {
  db.query(
    "SELECT id, codigo, nombre_lista, id_tipo_eleccion FROM listas_electorales ORDER BY nombre_lista ASC",
    (err, results) => {
      if (err) return res.status(500).json({ error: "Error al obtener listas" });
      res.json(results);
    }
  );
});

module.exports = router;
