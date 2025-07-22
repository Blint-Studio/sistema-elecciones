const db = require('../config/db');

async function insertarDatosPrueba() {
  try {
    console.log('Insertando datos de prueba...');

    // Insertar seccionales de prueba
    const seccionales = [
      'Seccional Norte',
      'Seccional Sur', 
      'Seccional Centro',
      'Seccional Este',
      'Seccional Oeste'
    ];

    for (const nombre of seccionales) {
      const [existingSeccional] = await db.query(
        'SELECT id FROM seccionales WHERE nombre = ?',
        [nombre]
      );

      if (existingSeccional.length === 0) {
        await db.query(
          'INSERT INTO seccionales (nombre) VALUES (?)',
          [nombre]
        );
        console.log(`Seccional creada: ${nombre}`);
      } else {
        console.log(`Seccional ya existe: ${nombre}`);
      }
    }

    // Obtener las seccionales creadas
    const [seccionalesCreadas] = await db.query('SELECT id, nombre FROM seccionales');
    
    // Insertar barrios de prueba para cada seccional
    const barriosPorSeccional = {
      'Seccional Norte': ['Villa Adela', 'Barrio Norte', 'Villa Del Parque'],
      'Seccional Sur': ['Villa Carlos Paz', 'Barrio San Vicente', 'Villa Allende'],
      'Seccional Centro': ['Centro', 'Barrio Güemes', 'Alta Córdoba'],
      'Seccional Este': ['Villa Cabrera', 'Cerro de las Rosas', 'Villa Belgrano'],
      'Seccional Oeste': ['Ciudadela', 'Villa El Libertador', 'Barrio Jardín']
    };

    for (const seccional of seccionalesCreadas) {
      const barrios = barriosPorSeccional[seccional.nombre] || [];
      
      for (const nombreBarrio of barrios) {
        const [existingBarrio] = await db.query(
          'SELECT id FROM barrios WHERE nombre = ? AND id_seccional = ?',
          [nombreBarrio, seccional.id]
        );

        if (existingBarrio.length === 0) {
          await db.query(
            'INSERT INTO barrios (nombre, id_seccional, subcircuito) VALUES (?, ?, ?)',
            [nombreBarrio, seccional.id, `SC-${seccional.id}-${Math.floor(Math.random() * 100)}`]
          );
          console.log(`Barrio creado: ${nombreBarrio} (Seccional: ${seccional.nombre})`);
        } else {
          console.log(`Barrio ya existe: ${nombreBarrio}`);
        }
      }
    }

    console.log('Datos de prueba insertados exitosamente');
  } catch (error) {
    console.error('Error al insertar datos de prueba:', error);
  } finally {
    process.exit();
  }
}

insertarDatosPrueba();
