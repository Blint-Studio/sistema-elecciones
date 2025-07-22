// backend/scripts/importBarrios.js
require("dotenv").config();
const mysql = require("mysql2/promise");
const XLSX = require("xlsx");
const path = require("path");

async function main() {
  const db = await mysql.createConnection({
    host: "localhost",
    user: "root",
    password: process.env.DB_PASSWORD,
    database: "elecciones_cordoba",
    multipleStatements: true
  });

  // 1. Cargar el Excel
  const workbook = XLSX.readFile(path.resolve(__dirname, "../data/barrios.xlsx"));
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json(sheet, { defval: "" });

  // 2. Limpiar tabla antes de importar (opcional)
  await db.query("DELETE FROM barrios");

  // 3. Insertar fila por fila
  for (let row of rows) {
    const nombre = (row.Nombre || '').toString().trim();
    const seccional = (row.Seccional || '').toString().trim();
    const subcircuito = (row.Subcircuito || '').toString().trim() || null;
    // const codigo = (row.Codigo || '').toString().trim(); // Solo si lo usas

    // Salta filas sin nombre
    if (!nombre) continue;

    await db.query(
      `INSERT INTO barrios (nombre, seccional_nombre, subcircuito)
       VALUES (?, ?, ?)`,
      [nombre, seccional, subcircuito]
    );
    console.log(`Insertado: ${nombre}`);
  }

  console.log("Importación de barrios finalizada.");
  await db.end();
}

main().catch(err => {
  console.error("Error en importBarrios.js:", err);
  process.exit(1);
});
