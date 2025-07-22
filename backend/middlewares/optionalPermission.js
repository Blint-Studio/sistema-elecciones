// Middleware de verificación de permisos opcional
const { verificarPermiso } = require('./roles');

// Permite acceso público para operaciones de lectura, requiere auth para write/delete
module.exports = (operacion = 'read') => {
  return (req, res, next) => {
    // Si es una operación de lectura y no hay usuario autenticado, permitir acceso público
    if (operacion === 'read' && !req.user) {
      return next();
    }
    
    // Si hay usuario autenticado, verificar permisos normalmente
    if (req.user) {
      return verificarPermiso(operacion)(req, res, next);
    }
    
    // Para operaciones que no sean de lectura, requerir autenticación
    return res.status(401).json({ 
      error: true, 
      message: "Se requiere autenticación para esta operación" 
    });
  };
};
