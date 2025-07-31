import React, { useContext, createContext } from 'react';
import { Button, IconButton, Tooltip } from '@mui/material';
import { tienePermiso } from '../utils/permisos';

// Contexto para el usuario
const UserContext = createContext();

// Provider para el contexto del usuario
export const UserProvider = ({ children, usuario }) => {
  return (
    <UserContext.Provider value={usuario}>
      {children}
    </UserContext.Provider>
  );
};

// Hook para usar el contexto del usuario
const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser debe ser usado dentro de un UserProvider');
  }
  return context;
};

// Componente para botones con permisos
export const PermissionButton = ({ 
  permiso,
  requiredPermission,
  usuario, 
  children, 
  disabled = false, 
  fallback = null,
  ...props 
}) => {
  // Obtener usuario desde contexto o prop
  const contextUser = useUser();
  const currentUser = usuario || contextUser;
  
  const permisoKey = permiso || requiredPermission;
  if (!tienePermiso(currentUser, permisoKey)) {
    return fallback;
  }
  
  return (
    <Button disabled={disabled} {...props}>
      {children}
    </Button>
  );
};

// Componente para botones con iconos y permisos
export const PermissionIconButton = ({ 
  permiso,
  requiredPermission,
  usuario, 
  children, 
  disabled = false, 
  fallback = null,
  tooltip = '',
  ...props 
}) => {
  // Obtener usuario desde contexto o prop
  const contextUser = useUser();
  const currentUser = usuario || contextUser;
  
  const permisoKey = permiso || requiredPermission;
  if (!tienePermiso(currentUser, permisoKey)) {
    return fallback;
  }
  
  const button = (
    <IconButton disabled={disabled} {...props}>
      {children}
    </IconButton>
  );
  
  if (tooltip) {
    return (
      <Tooltip title={tooltip}>
        {button}
      </Tooltip>
    );
  }
  
  return button;
};

// Componente para contenido condicional según permisos
export const PermissionContent = ({ 
  permiso, 
  usuario, 
  children, 
  fallback = null 
}) => {
  // Obtener usuario desde contexto o prop
  const contextUser = useUser();
  const currentUser = usuario || contextUser;
  
  if (!tienePermiso(currentUser, permiso)) {
    return fallback;
  }
  
  return children;
};

// Componente para ocultar contenido si no tiene permisos
export const PermissionHidden = ({ 
  permiso, 
  usuario, 
  children 
}) => {
  // Obtener usuario desde contexto o prop
  const contextUser = useUser();
  const currentUser = usuario || contextUser;
  
  if (!tienePermiso(currentUser, permiso)) {
    return null;
  }
  
  return children;
};

// Componente para mostrar mensaje de permisos insuficientes
export const PermissionDenied = ({ message = "No tienes permisos para realizar esta acción" }) => {
  return (
    <div style={{ 
      textAlign: 'center', 
      padding: '1rem', 
      backgroundColor: '#fff3cd',
      color: '#856404',
      border: '1px solid #ffeaa7',
      borderRadius: '4px',
      fontSize: '0.875rem'
    }}>
      {message}
    </div>
  );
};

export default {
  UserProvider,
  PermissionButton,
  PermissionIconButton,
  PermissionContent,
  PermissionHidden,
  PermissionDenied
};
