const express = require("express");
const router = express.Router();
const db = require("../config/db");
const jwt = require("jsonwebtoken");

router.post("/login", (req, res) => {
  const { email, password } = req.body;

  db.query("SELECT * FROM usuarios WHERE email = ?", [email], (err, results) => {
    if (err) {
      console.error("Error DB:", err);
      return res.status(500).json({ error: "Error en la base de datos" });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    const usuario = results[0];

    // Comparación sin bcrypt (modo desarrollo)
    if (password !== usuario.password) {
      return res.status(401).json({ error: "Contraseña incorrecta (texto plano)" });
    }

    const token = jwt.sign(
      { id: usuario.id, email: usuario.email, rol: usuario.rol },
      process.env.JWT_SECRET || "claveultrasecreta",
      { expiresIn: "8h" }
    );

    res.json({ token, usuario: { email: usuario.email, rol: usuario.rol } });
  });
});

module.exports = router;
