const db = require('./config/db');

(async () => {
    try {
        const [seccionales] = await db.query(`
            SELECT DISTINCT seccional_nombre 
            FROM escuelas 
            ORDER BY CAST(seccional_nombre AS UNSIGNED)
        `);
        
        console.log('Valores exactos en escuelas.seccional_nombre:');
        seccionales.forEach(s => {
            console.log(`  "${s.seccional_nombre}" (length: ${s.seccional_nombre.length})`);
        });
        
        // Probar consulta específica
        console.log('\nPrueba con seccional "1":');
        const [test1] = await db.query('SELECT COUNT(*) as count FROM escuelas WHERE seccional_nombre = "1"');
        console.log(`  Escuelas con seccional_nombre = "1": ${test1[0].count}`);
        
        console.log('\nPrueba con seccional "01":');
        const [test01] = await db.query('SELECT COUNT(*) as count FROM escuelas WHERE seccional_nombre = "01"');
        console.log(`  Escuelas con seccional_nombre = "01": ${test01[0].count}`);
        
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await db.end();
    }
})();
