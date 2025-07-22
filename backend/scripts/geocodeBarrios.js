// scripts/geocodeBarrios.js
require("dotenv").config();
const mysql = require("mysql2/promise");
const axios = require("axios");

// Configuración de la base de datos
const connectionConfig = {
  host: "localhost",
  user: "root",
  password: process.env.DB_PASSWORD,
  database: "elecciones_cordoba",
};

(async () => {
  const db = await mysql.createConnection(connectionConfig);

  // 1. Obtené todos los barrios
  const [barrios] = await db.execute("SELECT id, nombre FROM barrios WHERE lat IS NULL OR lng IS NULL");

  for (let barrio of barrios) {
    try {
      // 2. Geocodificar con Nominatim
      const query = encodeURIComponent(`${barrio.nombre}, Córdoba, Argentina`);
      const url = `https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=1`;
      const resp = await axios.get(url, {
        headers: { "User-Agent": "TuApp/1.0 (contacto@tudominio.com)" }
      });

      if (resp.data.length > 0) {
        const { lat, lon } = resp.data[0];

        // 3. Guardar en la base
        await db.execute(
          "UPDATE barrios SET lat = ?, lng = ? WHERE id = ?",
          [parseFloat(lat), parseFloat(lon), barrio.id]
        );
        console.log(`OK: ${barrio.nombre} → ${lat},${lon}`);
      } else {
        console.warn(`SIN COORDENADAS: ${barrio.nombre}`);
      }

      // 4. Pausar un poco para no sobrecargar Nominatim
      await new Promise(r => setTimeout(r, 1000));
    } catch (err) {
      console.error(`ERROR en ${barrio.nombre}:`, err.message);
    }
  }

  await db.end();
  console.log("Proceso finalizado.");
})();
