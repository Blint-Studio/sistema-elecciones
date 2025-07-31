const db = require('./config/db');

async function testQuery() {
    try {
        // Simular exactamente lo que hace el controlador para seccional 1
        const numeroSeccionalDB = "1";
        
        console.log(`Probando consultas para seccional "${numeroSeccionalDB}"`);
        
        // Test escuelas
        const [escuelasStats] = await db.query(`
            SELECT COUNT(DISTINCT id) as total_escuelas
            FROM escuelas 
            WHERE seccional_nombre = ?
        `, [numeroSeccionalDB]);
        
        console.log(`Escuelas: ${escuelasStats[0].total_escuelas}`);
        
        // Test mesas
        const [mesasStats] = await db.query(`
            SELECT COUNT(DISTINCT m.id) as total_mesas
            FROM mesas m
            JOIN escuelas e ON m.escuela_id = e.id
            WHERE e.seccional_nombre = ?
        `, [numeroSeccionalDB]);
        
        console.log(`Mesas: ${mesasStats[0].total_mesas}`);
        
        // Test barrios
        const [barriosStats] = await db.query(`
            SELECT COUNT(DISTINCT id) as total_barrios
            FROM barrios 
            WHERE seccional_nombre = ?
        `, [numeroSeccionalDB]);
        
        console.log(`Barrios: ${barriosStats[0].total_barrios}`);
        
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await db.end();
    }
}

testQuery();
