import React from 'react';
import { Chip } from '@mui/material';

/**
 * Componente SafeChip que previene el error "onClick is not a function"
 * al encapsular el componente Chip de Material-UI y añadir las propiedades necesarias.
 * 
 * @param {Object} props - Las propiedades pasadas al componente Chip
 * @returns {JSX.Element} Componente Chip seguro para ser usado en toda la aplicación
 */
const SafeChip = (props) => {
  // Aseguramos que siempre tenga las propiedades disabled y onClick
  return (
    <Chip 
      {...props}
      disabled={true}
      onClick={() => {}}
    />
  );
};

export default SafeChip;
