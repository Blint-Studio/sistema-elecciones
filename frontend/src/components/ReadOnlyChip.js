import React from 'react';
import { Chip } from '@mui/material';

/**
 * Componente Chip personalizado que evita el error "onClick is not a function"
 * al ser clickeado por el usuario.
 */
const ReadOnlyChip = ({ label, color, size, variant, icon, ...props }) => {
  // Función vacía para el onClick para evitar errores
  const handleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    return false;
  };

  return (
    <Chip
      label={label}
      color={color}
      size={size || 'small'}
      variant={variant || 'outlined'}
      icon={icon}
      onClick={handleClick}
      clickable={false}
      {...props}
    />
  );
};

export default ReadOnlyChip;
