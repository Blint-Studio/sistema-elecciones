const db = require('../config/db');

async function probarEndpoints() {
  try {
    console.log('Probando endpoints del backend...');

    // Probar obtener seccionales
    console.log('\n=== PROBANDO SECCIONALES ===');
    const [seccionales] = await db.query('SELECT * FROM seccionales LIMIT 3');
    console.log('Seccionales disponibles:', seccionales);

    if (seccionales.length > 0) {
      const primeraSeccional = seccionales[0];
      console.log(`\nProbando barrios para seccional: ${primeraSeccional.nombre} (ID: ${primeraSeccional.id})`);
      
      // Extraer número de seccional
      const numeroSeccional = primeraSeccional.nombre.replace(/[^0-9]/g, '');
      console.log(`Número de seccional extraído: ${numeroSeccional}`);
      
      // Buscar barrios
      const [barrios] = await db.query(
        'SELECT * FROM barrios WHERE seccional_nombre = ? LIMIT 5', 
        [numeroSeccional]
      );
      console.log('Barrios encontrados:', barrios);

      if (barrios.length > 0) {
        console.log('\n=== PROBANDO RESULTADOS SUBCIRCUITO ===');
        
        // Probar insertar un resultado de prueba
        const resultadoPrueba = {
          fecha: '2024-01-15',
          id_tipo_eleccion: 1,
          id_seccional: primeraSeccional.id,
          id_barrio: barrios[0].id,
          total_votantes: 100,
          frente_civico: 40,
          peronismo: 35,
          otro: 15,
          total_nulos: 5,
          total_blancos: 5
        };

        console.log('Intentando insertar resultado de prueba:', resultadoPrueba);

        try {
          const [insertResult] = await db.query(
            `INSERT INTO resultados_subcircuito 
            (fecha, id_tipo_eleccion, id_seccional, id_barrio, total_votantes, frente_civico, peronismo, otro, total_nulos, total_blancos)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [resultadoPrueba.fecha, resultadoPrueba.id_tipo_eleccion, resultadoPrueba.id_seccional, 
             resultadoPrueba.id_barrio, resultadoPrueba.total_votantes, resultadoPrueba.frente_civico,
             resultadoPrueba.peronismo, resultadoPrueba.otro, resultadoPrueba.total_nulos, resultadoPrueba.total_blancos]
          );
          
          console.log('Resultado insertado exitosamente. ID:', insertResult.insertId);

          // Probar obtener resultados
          const [resultados] = await db.query(
            `SELECT 
              rs.id,
              rs.fecha,
              rs.id_tipo_eleccion,
              rs.id_seccional,
              rs.id_barrio,
              rs.total_votantes,
              rs.frente_civico,
              rs.peronismo,
              rs.otro,
              rs.total_nulos,
              rs.total_blancos,
              b.nombre AS barrio_nombre,
              s.nombre AS seccional_nombre
            FROM resultados_subcircuito rs
            LEFT JOIN barrios b ON rs.id_barrio = b.id
            LEFT JOIN seccionales s ON rs.id_seccional = s.id
            WHERE rs.id_seccional = ?`,
            [primeraSeccional.id]
          );
          
          console.log('Resultados obtenidos:', resultados);

        } catch (insertError) {
          console.log('Error al insertar (puede ser que ya exista):', insertError.message);
        }
      }
    }

    console.log('\n✅ Pruebas completadas exitosamente');

  } catch (error) {
    console.error('❌ Error en las pruebas:', error);
  } finally {
    process.exit();
  }
}

probarEndpoints();
