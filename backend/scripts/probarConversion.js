const db = require('../config/db');

async function probarConversion() {
  try {
    const [seccional] = await db.query('SELECT nombre FROM seccionales WHERE id = 1');
    console.log('Seccional:', seccional[0]);
    
    const nombreSeccional = seccional[0].nombre;
    let numeroSeccional = nombreSeccional.replace(/[^0-9]/g, '');
    console.log('Número extraído (antes):', numeroSeccional);
    
    numeroSeccional = parseInt(numeroSeccional).toString();
    console.log('Número extraído (después):', numeroSeccional);
    
    const [barrios] = await db.query(
      'SELECT * FROM barrios WHERE seccional_nombre = ? LIMIT 5', 
      [numeroSeccional]
    );
    console.log('Barrios encontrados:', barrios);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    process.exit();
  }
}

probarConversion();
