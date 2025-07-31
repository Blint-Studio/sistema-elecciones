console.log('Script iniciado');

const db = require('./config/db');

console.log('DB requerido');

async function test() {
    console.log('Función test iniciada');
    
    try {
        console.log('Ejecutando query...');
        const result = await db.query('SELECT COUNT(*) as total FROM barrios');
        console.log('Resultado:', result);
    } catch (error) {
        console.error('Error:', error);
    } finally {
        console.log('Cerrando...');
        await db.end();
    }
}

console.log('Llamando a test()');
test().then(() => {
    console.log('Test completado');
}).catch(err => {
    console.error('Error en test:', err);
});
