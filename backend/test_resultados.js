const db = require('./config/db');

async function testResultados() {
  try {
    console.log('=== Probando query de resultados combinados ===');
    
    // Probar la query de escuelas simplificada
    console.log('\n1. Probando query de escuelas...');
    const queryEscuelas = `
      SELECT 
        r.id,
        r.fecha,
        r.id_tipo_eleccion,
        r.total_votantes,
        r.total_electores_padron,
        r.frente_civico,
        r.peronismo,
        r.otro,
        r.total_nulos,
        r.total_blancos,
        e.nombre AS escuela_nombre,
        m.numero_mesa,
        e.seccional_nombre AS numero_seccional,
        e.seccional_nombre,
        e.subcircuito AS subcircuito,
        COALESCE(te.nombre, 'N/A') AS tipo_eleccion_nombre,
        'escuela' AS origen
      FROM resultados r
      LEFT JOIN mesas m ON r.id_mesa = m.id
      LEFT JOIN escuelas e ON r.id_escuela = e.id
      LEFT JOIN tipos_eleccion te ON r.id_tipo_eleccion = te.id
      LIMIT 2
    `;
    
    const [resultadosEscuelas] = await db.query(queryEscuelas);
    console.log('Resultados escuelas:', resultadosEscuelas);
    
    // Probar la query de subcircuitos
    console.log('\n2. Probando query de subcircuitos...');
    const querySubcircuitos = `
      SELECT 
        rs.id,
        rs.fecha,
        rs.id_tipo_eleccion,
        rs.total_votantes,
        rs.total_electores_padron,
        rs.frente_civico,
        rs.peronismo,
        rs.otro,
        rs.total_nulos,
        rs.total_blancos,
        NULL AS escuela_nombre,
        NULL AS numero_mesa,
        s.nombre AS numero_seccional,
        s.nombre AS seccional_nombre,
        COALESCE(s.subcircuito, 'Sin letra') AS subcircuito,
        COALESCE(te.nombre, 'N/A') AS tipo_eleccion_nombre,
        'subcircuito' AS origen
      FROM resultados_subcircuito rs
      LEFT JOIN seccionales s ON rs.id_seccional = s.id
      LEFT JOIN tipos_eleccion te ON rs.id_tipo_eleccion = te.id
      LIMIT 2
    `;
    
    const [resultadosSubcircuitos] = await db.query(querySubcircuitos);
    console.log('Resultados subcircuitos:', resultadosSubcircuitos);
    
  } catch (error) {
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    process.exit(0);
  }
}

testResultados();
