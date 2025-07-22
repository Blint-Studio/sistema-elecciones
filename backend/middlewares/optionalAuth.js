// Middleware de autenticación opcional - permite acceso público para lectura
const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET || "secreto";

module.exports = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  // Si no hay header de autorización, continuar sin user (acceso público)
  if (!authHeader) {
    req.user = null;
    return next();
  }

  let token;
  
  // Verificar si el token viene con "Bearer " o directamente
  if (authHeader.startsWith("Bearer ")) {
    token = authHeader.split(" ")[1];
  } else {
    token = authHeader;
  }

  // Si el header existe pero el token está vacío, continuar sin user
  if (!token) {
    req.user = null;
    return next();
  }

  try {
    // Intentar verificar el token
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;
    next();
  } catch (err) {
    // Si el token es inválido, continuar sin user (acceso público)
    req.user = null;
    next();
  }
};
