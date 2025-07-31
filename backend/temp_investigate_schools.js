const db = require('./config/db');

async function investigateSchools() {
    try {
        console.log('=== INVESTIGACIÓN DE ESCUELAS Y SECCIONALES ===\n');
        
        // Ver estructura de tabla escuelas
        console.log('1. Estructura de tabla escuelas:');
        const [structure] = await db.query('DESCRIBE escuelas');
        structure.forEach(col => console.log(`   ${col.Field}: ${col.Type}`));
        
        // Ver muestra de datos de escuelas
        console.log('\n2. Muestra de 5 escuelas:');
        const [schools] = await db.query(`
            SELECT id, nombre, barrio_nombre, seccional_nombre, subcircuito
            FROM escuelas 
            LIMIT 5
        `);
        schools.forEach(s => console.log(`   Escuela: ${s.nombre}, Barrio: ${s.barrio_nombre}, Seccional: ${s.seccional_nombre}`));
        
        // Ver distribución de escuelas por seccional (directa)
        console.log('\n3. Distribución de escuelas por seccional (campo directo):');
        const [distribution] = await db.query(`
            SELECT seccional_nombre, COUNT(*) as total_escuelas
            FROM escuelas
            GROUP BY seccional_nombre
            ORDER BY CAST(seccional_nombre AS UNSIGNED)
        `);
        distribution.forEach(d => console.log(`   Seccional ${d.seccional_nombre}: ${d.total_escuelas} escuelas`));
        
        // Ver si las escuelas tienen columna seccional_nombre
        console.log('\n4. ¿Tienen las escuelas campo seccional_nombre directo?');
        const [directSeccional] = await db.query(`
            SELECT COUNT(*) as total_con_seccional_directo
            FROM escuelas 
            WHERE seccional_nombre IS NOT NULL
        `);
        console.log(`   Escuelas con seccional_nombre directo: ${directSeccional[0].total_con_seccional_directo}`);
        
        // Ver escuelas en seccionales 1-9
        console.log('\n5. Escuelas en seccionales 1-9:');
        const [schoolsIn19] = await db.query(`
            SELECT seccional_nombre, COUNT(*) as total_escuelas
            FROM escuelas
            WHERE CAST(seccional_nombre AS UNSIGNED) BETWEEN 1 AND 9
            GROUP BY seccional_nombre
            ORDER BY CAST(seccional_nombre AS UNSIGNED)
        `);
        schoolsIn19.forEach(s => console.log(`   Seccional ${s.seccional_nombre}: ${s.total_escuelas} escuelas`));
        
        // Ver total de escuelas
        console.log('\n6. Total de escuelas en la base de datos:');
        const [totalSchools] = await db.query('SELECT COUNT(*) as total FROM escuelas');
        console.log(`   Total: ${totalSchools[0].total} escuelas`);
        
        console.log('\n=== FIN INVESTIGACIÓN ===');
        
    } catch (error) {
        console.error('Error en investigación:', error);
    } finally {
        await db.end();
    }
}

investigateSchools();
