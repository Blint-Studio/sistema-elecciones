const db = require('./config/db');
async function checkData() {
  try {
    console.log('=== VERIFICANDO ESTRUCTURA DE DATOS ===');
    
    console.log('\n1. Escuelas por seccional:');
    const [escuelas] = await db.query('SELECT seccional_nombre, COUNT(*) as total FROM escuelas GROUP BY seccional_nombre ORDER BY seccional_nombre');
    console.log(escuelas);
    
    console.log('\n2. Mesas por seccional (via escuelas):');
    const [mesas] = await db.query(`
      SELECT e.seccional_nombre, COUNT(m.id) as total_mesas 
      FROM mesas m 
      JOIN escuelas e ON m.escuela_id = e.id 
      GROUP BY e.seccional_nombre 
      ORDER BY e.seccional_nombre
    `);
    console.log(mesas);
    
    console.log('\n3. Militantes por seccional (via barrios):');
    const [militantes] = await db.query(`
      SELECT b.seccional_nombre, COUNT(m.id) as total_militantes 
      FROM militantes m 
      JOIN barrios b ON m.id_barrio = b.id 
      GROUP BY b.seccional_nombre 
      ORDER BY b.seccional_nombre
    `);
    console.log(militantes);
    
    console.log('\n4. Barrios por seccional:');
    const [barrios] = await db.query('SELECT seccional_nombre, COUNT(*) as total FROM barrios GROUP BY seccional_nombre ORDER BY seccional_nombre');
    console.log(barrios);
    
    console.log('\n5. Totales generales:');
    const [totalEscuelas] = await db.query('SELECT COUNT(*) as total FROM escuelas');
    const [totalMesas] = await db.query('SELECT COUNT(*) as total FROM mesas');
    const [totalMilitantes] = await db.query('SELECT COUNT(*) as total FROM militantes');
    const [totalBarrios] = await db.query('SELECT COUNT(*) as total FROM barrios');
    
    console.log('Total escuelas:', totalEscuelas[0].total);
    console.log('Total mesas:', totalMesas[0].total);
    console.log('Total militantes:', totalMilitantes[0].total);
    console.log('Total barrios:', totalBarrios[0].total);
    
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}
checkData();
