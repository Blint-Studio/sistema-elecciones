const express = require('express');
const router = express.Router();
const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Endpoint de debug temporal para verificar el problema del JWT
router.post('/debug-login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    console.log('🔍 DEBUG LOGIN - Email:', email);
    
    // 1. Buscar usuario en BD
    const [users] = await db.query('SELECT * FROM usuarios WHERE email = ?', [email]);
    
    if (users.length === 0) {
      return res.status(401).json({ error: true, message: 'Usuario no encontrado' });
    }
    
    const user = users[0];
    console.log('🔍 DEBUG - Usuario encontrado en BD:', {
      id: user.id,
      email: user.email,
      rol: user.rol,
      seccional_asignada: user.seccional_asignada,
      seccional_asignada_type: typeof user.seccional_asignada
    });
    
    // 2. Verificar contraseña
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(401).json({ error: true, message: 'Contraseña incorrecta' });
    }
    
    // 3. Preparar payload del JWT
    const jwtPayload = {
      id: user.id,
      email: user.email,
      rol: user.rol,
      seccional_asignada: user.seccional_asignada
    };
    
    console.log('🔍 DEBUG - Payload para JWT:', jwtPayload);
    
    // 4. Crear token
    const token = jwt.sign(jwtPayload, process.env.JWT_SECRET || 'secreto');
    
    // 5. Decodificar token para verificar
    const decoded = jwt.decode(token);
    console.log('🔍 DEBUG - Token decodificado:', decoded);
    
    // 6. Preparar respuesta del usuario
    const userResponse = {
      id: user.id,
      nombre: user.nombre,
      email: user.email,
      rol: user.rol,
      seccional_asignada: user.seccional_asignada
    };
    
    console.log('🔍 DEBUG - Respuesta usuario:', userResponse);
    
    res.json({
      token,
      usuario: userResponse,
      debug: {
        bd_seccional_asignada: user.seccional_asignada,
        jwt_payload: jwtPayload,
        jwt_decoded: decoded
      }
    });
    
  } catch (error) {
    console.error('❌ ERROR en debug-login:', error);
    res.status(500).json({ error: true, message: error.message });
  }
});

module.exports = router;
