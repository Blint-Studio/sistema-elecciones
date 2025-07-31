// Middleware para validar acceso por seccional
const validarAccesoSeccional = (req, res, next) => {
  const usuario = req.user;
  
  // Si no hay usuario autenticado (acceso público), permitir acceso sin filtros
  if (!usuario) {
    console.log('🔓 Acceso público - sin filtros de seccional');
    return next();
  }
  
  console.log(`🔍 SECCIONAL MIDDLEWARE - Usuario: ${usuario.email} (${usuario.rol}) - Seccional: ${usuario.seccional_asignada || 'N/A'}`);
  
  // Si es admin o super_admin, puede acceder a todo
  if (usuario.rol === 'admin' || usuario.rol === 'super_admin') {
    return next();
  }
  
  // Si es usuario de seccional, verificar permisos
  if (usuario.rol === 'seccional') {
    // Obtener número de seccional desde diferentes fuentes posibles
    const seccionalSolicitada = 
      req.params?.seccional || 
      req.body?.seccional || 
      req.query?.seccional ||
      req.params?.numero_seccional ||
      req.body?.numero_seccional ||
      req.query?.numero_seccional;
    
    // Si no se especifica seccional en la request, permitir acceso
    // (se filtrará en el controlador)
    if (!seccionalSolicitada) {
      return next();
    }
    
    // Verificar que el usuario solo acceda a su seccional asignada
    if (parseInt(seccionalSolicitada) !== usuario.seccional_asignada) {
      return res.status(403).json({
        error: true,
        message: `Acceso denegado. Solo puede acceder a datos de la Seccional ${usuario.seccional_asignada}`
      });
    }
  }
  
  next();
};

// Función helper para filtrar datos por seccional
const filtrarPorSeccional = (usuario, datos, campoSeccional = 'seccional_nombre') => {
  // Si no hay usuario autenticado (acceso público), devolver todos los datos
  if (!usuario) {
    return datos;
  }
  
  // Si es admin o super_admin, devolver todos los datos
  if (usuario.rol === 'admin' || usuario.rol === 'super_admin') {
    return datos;
  }
  
  // Si es usuario de seccional, filtrar solo sus datos
  if (usuario.rol === 'seccional' && usuario.seccional_asignada) {
    return datos.filter(item => {
      // Manejar diferentes formatos de seccional
      const seccionalItem = 
        item[campoSeccional] || 
        item.seccional || 
        item.numero_seccional ||
        item.id_seccional;
      
      // Extraer número de seccional si viene como texto "Seccional 1"
      const numeroSeccional = typeof seccionalItem === 'string' 
        ? parseInt(seccionalItem.replace(/\D/g, '')) 
        : parseInt(seccionalItem);
      
      return numeroSeccional === usuario.seccional_asignada;
    });
  }
  
  return datos;
};

// Función para agregar filtro WHERE en consultas SQL
const agregarFiltroSeccional = (usuario, baseQuery, params = []) => {
  // Si no hay usuario autenticado (acceso público), no agregar filtro
  if (!usuario) {
    return { query: baseQuery, params };
  }
  
  // Si es admin o super_admin, no agregar filtro
  if (usuario.rol === 'admin' || usuario.rol === 'super_admin') {
    return { query: baseQuery, params };
  }
  
  // Si es usuario de seccional, agregar filtro
  if (usuario.rol === 'seccional' && usuario.seccional_asignada) {
    // Determinar si ya hay WHERE en la query
    const hasWhere = baseQuery.toLowerCase().includes('where');
    const operator = hasWhere ? 'AND' : 'WHERE';
    
    // Agregar filtro por seccional (manejar diferentes nombres de columna)
    const filtroQuery = `${baseQuery} ${operator} (
      seccional_nombre LIKE ? OR 
      numero_seccional = ? OR 
      id_seccional = ?
    )`;
    
    const seccionalParam = `%Seccional ${usuario.seccional_asignada}%`;
    const nuevosParams = [...params, seccionalParam, usuario.seccional_asignada, usuario.seccional_asignada];
    
    return { query: filtroQuery, params: nuevosParams };
  }
  
  return { query: baseQuery, params };
};

module.exports = {
  validarAccesoSeccional,
  filtrarPorSeccional,
  agregarFiltroSeccional
};
