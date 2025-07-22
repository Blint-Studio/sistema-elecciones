const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET || "secreto";

module.exports = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    return res.status(401).json({ 
      error: true, 
      message: "Token no proporcionado" 
    });
  }

  let token;
  
  // Verificar si el token viene con "Bearer " o directamente
  if (authHeader.startsWith("Bearer ")) {
    token = authHeader.split(" ")[1];
  } else {
    token = authHeader;
  }

  if (!token) {
    return res.status(401).json({ 
      error: true, 
      message: "Token no proporcionado correctamente" 
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    console.error("Error verificando token:", err.message);
    return res.status(401).json({ 
      error: true, 
      message: "Token inválido o expirado" 
    });
  }
};
