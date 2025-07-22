const db = require('../config/db');

async function crearTablaResultadosSubcircuito() {
  try {
    console.log('Creando tabla resultados_subcircuito...');

    const sqlCreateTable = `
      CREATE TABLE IF NOT EXISTS resultados_subcircuito (
        id INT AUTO_INCREMENT PRIMARY KEY,
        fecha DATE NOT NULL,
        id_tipo_eleccion INT NOT NULL,
        id_seccional INT NOT NULL,
        id_barrio INT NOT NULL,
        total_votantes INT NOT NULL DEFAULT 0,
        frente_civico INT NOT NULL DEFAULT 0,
        peronismo INT NOT NULL DEFAULT 0,
        otro INT NOT NULL DEFAULT 0,
        total_nulos INT NOT NULL DEFAULT 0,
        total_blancos INT NOT NULL DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_seccional (id_seccional),
        INDEX idx_barrio (id_barrio),
        INDEX idx_fecha (fecha),
        INDEX idx_tipo_eleccion (id_tipo_eleccion),
        UNIQUE KEY unique_resultado (id_barrio, id_tipo_eleccion, fecha)
      ) ENGINE=InnoDB;
    `;

    await db.query(sqlCreateTable);
    console.log('Tabla resultados_subcircuito creada exitosamente');

    // Verificar que se creó correctamente
    const [structure] = await db.query('DESCRIBE resultados_subcircuito');
    console.log('Estructura de la tabla:');
    console.table(structure);

  } catch (error) {
    console.error('Error al crear tabla:', error);
  } finally {
    process.exit();
  }
}

crearTablaResultadosSubcircuito();
