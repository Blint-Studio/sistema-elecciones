
const mysql = require("mysql2");
const bcrypt = require("bcryptjs");

// Conexión
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "1234", // cambiá si tenés otra
  database: "elecciones_cordoba"
});

const email = "admin@cordoba.com";
const passwordPlano = "admin123";
const nombre = "Admin Córdoba";
const rol = "admin";

const passwordHasheado = bcrypt.hashSync(passwordPlano, 10);

db.query(
  "INSERT INTO usuarios (nombre, email, password, rol) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE password = VALUES(password), nombre = VALUES(nombre), rol = VALUES(rol)",
  [nombre, email, passwordHasheado, rol],
  (err, result) => {
    if (err) {
      console.error("❌ Error al crear usuario:", err);
    } else {
      console.log("✅ Usuario admin creado o actualizado correctamente.");
    }
    db.end();
  }
);
