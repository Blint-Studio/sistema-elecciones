const db = require('../config/db');
const bcrypt = require('bcryptjs');

async function crearUsuarioAdmin() {
  try {
    const passwordHash = await bcrypt.hash('admin123', 10);
    
    // Verificar si ya existe el usuario
    const [existing] = await db.query(
      'SELECT id FROM usuarios WHERE email = ?',
      ['admin@cordoba.com']
    );
    
    if (existing.length > 0) {
      console.log('Usuario admin ya existe');
      return;
    }
    
    await db.query(
      'INSERT INTO usuarios (email, password, rol) VALUES (?, ?, ?)',
      ['admin@cordoba.com', passwordHash, 'admin']
    );
    console.log('Usuario admin creado exitosamente');
    console.log('Email: admin@cordoba.com');
    console.log('Password: admin123');
  } catch (error) {
    console.error('Error al crear usuario admin:', error);
  } finally {
    process.exit();
  }
}

crearUsuarioAdmin();
