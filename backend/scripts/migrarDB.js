const db = require('../config/db');
const bcrypt = require('bcryptjs');

async function verificarYMigrarDB() {
  try {
    console.log('🔍 Verificando estructura de la base de datos...');

    // Verificar si existe la tabla resultados
    const [resultadosExiste] = await db.query(`
      SELECT COUNT(*) as count 
      FROM information_schema.tables 
      WHERE table_schema = DATABASE() AND table_name = 'resultados'
    `);

    if (resultadosExiste[0].count === 0) {
      console.log('❌ Tabla resultados no existe. Creando...');
      await crearTablaResultados();
    } else {
      // Verificar estructura de resultados
      const [columnas] = await db.query(`
        SELECT COLUMN_NAME 
        FROM information_schema.columns 
        WHERE table_schema = DATABASE() AND table_name = 'resultados'
      `);
      
      const nombreColumnas = columnas.map(col => col.COLUMN_NAME);
      
      if (!nombreColumnas.includes('frente_civico')) {
        console.log('❌ Estructura de resultados incorrecta. Migrando...');
        await migrarTablaResultados();
      } else {
        console.log('✅ Tabla resultados tiene estructura correcta');
      }
    }

    // Verificar tabla usuarios
    await verificarTablaUsuarios();
    
    // Verificar tipos de elección
    await verificarTiposEleccion();
    
    // Verificar tabla mesas
    await verificarTablaMesas();

    console.log('🎉 Verificación y migración completada exitosamente');
    
  } catch (error) {
    console.error('💥 Error durante la migración:', error);
  } finally {
    process.exit();
  }
}

async function crearTablaResultados() {
  await db.query(`
    CREATE TABLE resultados (
      id INT AUTO_INCREMENT PRIMARY KEY,
      fecha DATE NOT NULL,
      id_tipo_eleccion INT NOT NULL,
      id_escuela INT NOT NULL,
      id_mesa INT NOT NULL,
      total_votantes INT NOT NULL DEFAULT 0,
      frente_civico INT NOT NULL DEFAULT 0,
      peronismo INT NOT NULL DEFAULT 0,
      otro INT NOT NULL DEFAULT 0,
      total_nulos INT NOT NULL DEFAULT 0,
      total_blancos INT NOT NULL DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE KEY unique_mesa_tipo (id_mesa, id_tipo_eleccion)
    )
  `);
  console.log('✅ Tabla resultados creada');
}

async function migrarTablaResultados() {
  // Respaldar datos existentes
  const [datosExistentes] = await db.query('SELECT * FROM resultados LIMIT 5');
  
  if (datosExistentes.length > 0) {
    console.log('⚠️  Encontrados datos existentes. Creando respaldo...');
    await db.query('CREATE TABLE resultados_backup AS SELECT * FROM resultados');
  }

  // Eliminar tabla antigua y crear nueva
  await db.query('SET FOREIGN_KEY_CHECKS = 0');
  await db.query('DROP TABLE resultados');
  await crearTablaResultados();
  await db.query('SET FOREIGN_KEY_CHECKS = 1');
  
  console.log('✅ Tabla resultados migrada');
}

async function verificarTablaUsuarios() {
  await db.query(`
    CREATE TABLE IF NOT EXISTS usuarios (
      id INT AUTO_INCREMENT PRIMARY KEY,
      nombre_usuario VARCHAR(100),
      email VARCHAR(150) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      rol ENUM('admin', 'operador', 'lector') NOT NULL DEFAULT 'lector',
      telefono VARCHAR(20),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Verificar si existe usuario admin
  const [adminExiste] = await db.query('SELECT id FROM usuarios WHERE email = ?', ['admin@cordoba.com']);
  
  if (adminExiste.length === 0) {
    const passwordHash = await bcrypt.hash('admin123', 10);
    await db.query(
      'INSERT INTO usuarios (email, password, rol) VALUES (?, ?, ?)',
      ['admin@cordoba.com', passwordHash, 'admin']
    );
    console.log('✅ Usuario admin creado (admin@cordoba.com / admin123)');
  } else {
    console.log('✅ Usuario admin ya existe');
  }
}

async function verificarTiposEleccion() {
  await db.query(`
    CREATE TABLE IF NOT EXISTS tipos_eleccion (
      id INT AUTO_INCREMENT PRIMARY KEY,
      nombre VARCHAR(100) NOT NULL
    )
  `);

  const tipos = [
    { id: 1, nombre: 'Vecinal' },
    { id: 2, nombre: 'Municipal' },
    { id: 3, nombre: 'Provincial' },
    { id: 4, nombre: 'Nacional' }
  ];

  for (const tipo of tipos) {
    await db.query(
      'INSERT IGNORE INTO tipos_eleccion (id, nombre) VALUES (?, ?)',
      [tipo.id, tipo.nombre]
    );
  }
  console.log('✅ Tipos de elección verificados');
}

async function verificarTablaMesas() {
  // Verificar si existe columna escuela_id
  const [columnas] = await db.query(`
    SELECT COLUMN_NAME 
    FROM information_schema.columns 
    WHERE table_schema = DATABASE() AND table_name = 'mesas'
  `);
  
  const nombreColumnas = columnas.map(col => col.COLUMN_NAME);
  
  if (!nombreColumnas.includes('escuela_id') && nombreColumnas.includes('id_escuela')) {
    console.log('⚠️  Renombrando columna id_escuela a escuela_id en tabla mesas...');
    await db.query('ALTER TABLE mesas CHANGE COLUMN id_escuela escuela_id INT');
    console.log('✅ Columna renombrada');
  } else if (!nombreColumnas.includes('escuela_id')) {
    console.log('⚠️  Agregando columna escuela_id a tabla mesas...');
    await db.query('ALTER TABLE mesas ADD COLUMN escuela_id INT AFTER numero_mesa');
    console.log('✅ Columna agregada');
  } else {
    console.log('✅ Tabla mesas tiene estructura correcta');
  }
}

// Ejecutar migración
verificarYMigrarDB();
