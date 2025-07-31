// Definición de permisos por rol
const PERMISOS = {
  admin: {
    read: true,
    write: true,
    delete: true,
    export: true,
    manage_users: true,
    access_all: true
  },
  operador: {
    read: true,
    write: true,
    delete: false,
    export: false,
    manage_users: false,
    access_all: false
  },
  lector: {
    read: true,
    write: false,
    delete: false,
    export: false,
    manage_users: false,
    access_all: false
  },
  seccional: {
    read: true,
    write: true,
    delete: true,
    export: false,
    manage_users: false,
    access_all: false
  }
};

// Middleware para verificar roles
function verificarRol(rolesPermitidos) {
  return (req, res, next) => {
    if (!req.user || !rolesPermitidos.includes(req.user.rol)) {
      return res.status(403).json({ 
        error: true, 
        message: "No tienes permisos para realizar esta acción" 
      });
    }
    next();
  };
}

// Middleware para verificar permisos específicos
function verificarPermiso(permiso) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        error: true, 
        message: "Usuario no autenticado" 
      });
    }

    const userPermisos = PERMISOS[req.user.rol];
    if (!userPermisos || !userPermisos[permiso]) {
      return res.status(403).json({ 
        error: true, 
        message: "No tienes permisos para realizar esta acción" 
      });
    }
    
    next();
  };
}

module.exports = verificarRol;
module.exports.verificarPermiso = verificarPermiso;
module.exports.PERMISOS = PERMISOS;
