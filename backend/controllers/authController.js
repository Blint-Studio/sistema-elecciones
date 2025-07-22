const db = require('../config/db');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const JWT_SECRET = process.env.JWT_SECRET || 'secreto';

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    
    // Validar campos obligatorios
    if (!email || !password) {
      return res.status(400).json({ 
        error: true, 
        message: 'Usuario/email y contraseña son requeridos' 
      });
    }

    // Buscar usuario por email O por nombre
    const [users] = await db.query(
      'SELECT * FROM usuarios WHERE email = ? OR nombre = ?', 
      [email, email]
    );
    
    if (users.length === 0) {
      return res.status(401).json({ 
        error: true, 
        message: 'Usuario no encontrado' 
      });
    }
    
    const user = users[0];
    const valid = await bcrypt.compare(password, user.password);
    
    if (!valid) {
      return res.status(401).json({ 
        error: true, 
        message: 'Contraseña incorrecta' 
      });
    }
    
    // Generar token con información del usuario
    const token = jwt.sign(
      { 
        id: user.id, 
        email: user.email, 
        rol: user.rol 
      }, 
      JWT_SECRET, 
      { expiresIn: '8h' }
    );
    
    // Respuesta exitosa
    res.json({ 
      token, 
      usuario: { 
        id: user.id, 
        email: user.email, 
        rol: user.rol,
        nombre: user.nombre || user.email
      } 
    });
  } catch (err) {
    console.error('Error en login:', err);
    next(err);
  }
};

// Verificar token
exports.verify = async (req, res, next) => {
  try {
    // El middleware de auth ya verificó el token y puso el usuario en req.user
    const { id, email, rol } = req.user;
    
    // Verificar que el usuario aún existe en la base de datos
    const [users] = await db.query('SELECT * FROM usuarios WHERE id = ?', [id]);
    
    if (users.length === 0) {
      return res.status(401).json({ 
        error: true, 
        message: 'Usuario no encontrado' 
      });
    }
    
    const user = users[0];
    
    res.json({
      valid: true,
      usuario: {
        id: user.id,
        email: user.email,
        rol: user.rol,
        nombre: user.nombre || user.email
      }
    });
  } catch (err) {
    console.error('Error en verify:', err);
    next(err);
  }
};