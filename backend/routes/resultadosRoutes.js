const express = require("express");
const router = express.Router();
const db = require("../config/db");
const { verificarToken, verificarRol } = require("../middlewares/auth");

// Obtener todos los resultados (permitido para todos con token)
router.get("/", verificarToken, (req, res) => {
  db.query("SELECT * FROM resultados", (err, resultados) => {
    if (err) return res.status(500).json({ error: "Error en la base de datos" });
    res.json(resultados);
  });
});

// Cargar nuevos resultados (sólo admin y operador)
router.post("/", verificarToken, verificarRol(["admin", "operador"]), (req, res) => {
  const nuevo = req.body;
  // Validaciones aquí...
  db.query("INSERT INTO resultados SET ?", nuevo, (err, resultado) => {
    if (err) return res.status(500).json({ error: "Error al guardar resultado" });
    res.json({ message: "Resultado guardado", id: resultado.insertId });
  });
});

// Eliminar resultado (solo admin)
router.delete("/:id", verificarToken, verificarRol(["admin"]), (req, res) => {
  db.query("DELETE FROM resultados WHERE id = ?", [req.params.id], (err) => {
    if (err) return res.status(500).json({ error: "Error al eliminar" });
    res.json({ message: "Resultado eliminado" });
  });
});

module.exports = router;
