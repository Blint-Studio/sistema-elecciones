// Definición de permisos por rol (debe coincidir con el backend)
export const PERMISOS = {
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
    export: true,
    manage_users: false,
    access_all: false, // Solo acceso a su seccional
    access_own_seccional: true
  }
};

// Función para verificar si el usuario tiene un permiso específico
export const tienePermiso = (usuario, permiso) => {
  if (!usuario || !usuario.rol) return false;
  
  const userPermisos = PERMISOS[usuario.rol];
  return userPermisos && userPermisos[permiso];
};

// Función para verificar acceso por seccional
export const puedeAccederSeccional = (usuario, seccionalSolicitada) => {
  if (!usuario || !usuario.rol) return false;
  
  // Admin y super_admin pueden acceder a todas las seccionales
  if (usuario.rol === 'admin' || usuario.rol === 'super_admin') {
    return true;
  }
  
  // Usuario de seccional solo puede acceder a su seccional asignada
  if (usuario.rol === 'seccional') {
    if (!seccionalSolicitada) return true; // Si no se especifica, permitir (se filtrará después)
    
    // Extraer número de seccional si viene como texto
    const numeroSeccional = typeof seccionalSolicitada === 'string' 
      ? parseInt(seccionalSolicitada.replace(/\D/g, '')) 
      : parseInt(seccionalSolicitada);
    
    return numeroSeccional === usuario.seccional_asignada;
  }
  
  return false;
};

// Función para filtrar datos por seccional en frontend
export const filtrarDatosPorSeccional = (usuario, datos, campoSeccional = 'seccional_nombre') => {
  if (!usuario || !datos) return datos;
  
  // Admin y super_admin ven todos los datos
  if (usuario.rol === 'admin' || usuario.rol === 'super_admin') {
    return datos;
  }
  
  // Usuario de seccional solo ve datos de su seccional
  if (usuario.rol === 'seccional' && usuario.seccional_asignada) {
    return datos.filter(item => {
      const seccionalItem = 
        item[campoSeccional] || 
        item.seccional || 
        item.numero_seccional ||
        item.id_seccional;
      
      const numeroSeccional = typeof seccionalItem === 'string' 
        ? parseInt(seccionalItem.replace(/\D/g, '')) 
        : parseInt(seccionalItem);
      
      return numeroSeccional === usuario.seccional_asignada;
    });
  }
  
  return datos;
};

// Función para verificar si el usuario puede acceder a una ruta
export const puedeAcceder = (usuario, ruta) => {
  if (!usuario || !usuario.rol) return false;
  
  // Rutas permitidas por rol
  const rutasPermitidas = {
    admin: [
      '/', '/dashboard', '/barrios', '/seccionales', '/escuelas',
      '/instituciones', '/militantes', '/resultados', '/cargar', '/mapa'
    ],
    operador: [
      '/', '/cargar'
    ],
    lector: [
      '/', '/dashboard', '/barrios', '/seccionales', '/escuelas',
      '/instituciones', '/militantes', '/mapa'
    ],
    seccional: [
      '/', '/barrios', '/escuelas', '/instituciones', '/militantes', '/resultados', '/cargar'
    ]
  };
  
  return rutasPermitidas[usuario.rol]?.includes(ruta) || false;
};

// Función para obtener las rutas disponibles para un rol
export const getRutasDisponibles = (rol) => {
  const rutasPermitidas = {
    admin: [
      { path: '/', title: 'Centro de Carga', icon: 'home' },
      { path: '/dashboard', title: 'Dashboard', icon: 'dashboard' },
      { path: '/barrios', title: 'Barrios', icon: 'location' },
      { path: '/seccionales', title: 'Seccionales', icon: 'business' },
      { path: '/escuelas', title: 'Escuelas', icon: 'school' },
      { path: '/instituciones', title: 'Instituciones', icon: 'account_balance' },
      { path: '/militantes', title: 'Militantes', icon: 'group' },
      { path: '/resultados', title: 'Resultados', icon: 'dashboard' },
      { path: '/cargar', title: 'Cargar Resultados', icon: 'how_to_vote' },
      { path: '/mapa', title: 'Mapa Electoral', icon: 'map' }
    ],
    operador: [
      { path: '/', title: 'Centro de Carga', icon: 'home' },
      { path: '/cargar', title: 'Cargar Resultados', icon: 'how_to_vote' }
    ],
    lector: [
      { path: '/', title: 'Mapa Electoral', icon: 'map' },
      { path: '/dashboard', title: 'Dashboard', icon: 'dashboard' },
      { path: '/barrios', title: 'Barrios', icon: 'location' },
      { path: '/seccionales', title: 'Seccionales', icon: 'business' },
      { path: '/escuelas', title: 'Escuelas', icon: 'school' },
      { path: '/instituciones', title: 'Instituciones', icon: 'account_balance' },
      { path: '/militantes', title: 'Militantes', icon: 'group' }
    ],
    seccional: [
      { path: '/', title: 'Centro de Carga', icon: 'home' },
      { path: '/barrios', title: 'Barrios', icon: 'location' },
      { path: '/escuelas', title: 'Escuelas', icon: 'school' },
      { path: '/instituciones', title: 'Instituciones', icon: 'account_balance' },
      { path: '/militantes', title: 'Militantes', icon: 'group' },
      { path: '/resultados', title: 'Resultados', icon: 'resultados' },
      { path: '/cargar', title: 'Cargar Resultados', icon: 'how_to_vote' }
    ]
  };
  
  return rutasPermitidas[rol] || [];
};

// Componente de HOC para proteger rutas
export const withPermissions = (Component, permisosRequeridos = []) => {
  return (props) => {
    const { usuario } = props;
    
    if (!usuario) {
      return null;
    }
    
    // Si no hay permisos requeridos, solo verificar autenticación
    if (permisosRequeridos.length === 0) {
      return <Component {...props} />;
    }
    
    // Verificar si el usuario tiene todos los permisos requeridos
    const tienePermisos = permisosRequeridos.every(permiso => 
      tienePermiso(usuario, permiso)
    );
    
    if (!tienePermisos) {
      return (
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <h3>Acceso denegado</h3>
          <p>No tienes permisos para acceder a esta sección.</p>
        </div>
      );
    }
    
    return <Component {...props} />;
  };
};

export default { PERMISOS, tienePermiso, puedeAcceder, getRutasDisponibles, withPermissions };
