// backend/scripts/updateBarrios.js
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

  try {
    console.log("🔄 Iniciando actualización completa: eliminando instituciones y barrios, cargando nuevos barrios...");

    // 1. Cargar el Excel
    const workbook = XLSX.readFile(path.resolve(__dirname, "../data/barrios.xlsx"));
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(sheet, { defval: "" });

    console.log(`📊 Se encontraron ${rows.length} filas en el Excel`);

    // 2. Deshabilitar verificaciones de clave foránea temporalmente
    console.log("🔒 Deshabilitando verificaciones de clave foránea...");
    await db.query("SET FOREIGN_KEY_CHECKS = 0");

    // 3. Limpiar tablas relacionadas (primero las que dependen de barrios)
    console.log("🗑️ Eliminando instituciones existentes...");
    await db.query("DELETE FROM instituciones");
    
    console.log("🗑️ Eliminando barrios existentes...");
    await db.query("DELETE FROM barrios");

    // 4. Resetear los AUTO_INCREMENT
    await db.query("ALTER TABLE instituciones AUTO_INCREMENT = 1");
    await db.query("ALTER TABLE barrios AUTO_INCREMENT = 1");

    // 5. Insertar nuevos barrios
    console.log("📥 Insertando nuevos barrios...");
    let insertados = 0;
    
    for (let row of rows) {
      const nombre = (row.Nombre || '').toString().trim();
      const seccional = (row.Seccional || '').toString().trim();
      const subcircuito = (row.Subcircuito || '').toString().trim() || null;

      // Salta filas sin nombre
      if (!nombre) {
        console.log(`⚠️ Fila omitida: sin nombre`);
        continue;
      }

      await db.query(
        `INSERT INTO barrios (nombre, seccional_nombre, subcircuito)
         VALUES (?, ?, ?)`,
        [nombre, seccional, subcircuito]
      );
      insertados++;
      console.log(`✅ ${insertados}. ${nombre} - ${seccional}${subcircuito ? ` (${subcircuito})` : ''}`);
    }

    // 6. Rehabilitar verificaciones de clave foránea
    console.log("🔓 Rehabilitando verificaciones de clave foránea...");
    await db.query("SET FOREIGN_KEY_CHECKS = 1");

    // 7. Mostrar estadísticas finales
    const [totalBarrios] = await db.query("SELECT COUNT(*) as total FROM barrios");
    const [totalInstituciones] = await db.query("SELECT COUNT(*) as total FROM instituciones");
    console.log(`\n🎉 ¡Actualización completada exitosamente!`);
    console.log(`� Total de barrios en la base de datos: ${totalBarrios[0].total}`);
    console.log(`📊 Total de instituciones en la base de datos: ${totalInstituciones[0].total}`);
    console.log(`📥 Barrios insertados en esta sesión: ${insertados}`);
    console.log(`💡 Ahora puedes cargar las instituciones desde cero.`);

  } catch (error) {
    console.error("❌ Error durante la actualización:", error);
    
    // Asegurar que las verificaciones de clave foránea se rehabiliten incluso si hay error
    try {
      await db.query("SET FOREIGN_KEY_CHECKS = 1");
      console.log("🔓 Verificaciones de clave foránea rehabilitadas después del error");
    } catch (fkError) {
      console.error("⚠️ Error al rehabilitar verificaciones de clave foránea:", fkError);
    }
    
    throw error;
  } finally {
    await db.end();
    console.log("🔌 Conexión a la base de datos cerrada");
  }
}

main().catch(err => {
  console.error("💥 Error fatal en updateBarrios.js:", err);
  process.exit(1);
});
