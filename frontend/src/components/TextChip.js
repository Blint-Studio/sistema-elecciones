import React from 'react';
import { Box, Typography } from '@mui/material';

/**
 * Componente que imita visualmente a un Chip pero utiliza Typography,
 * evitando completamente los problemas de eventos de clic.
 */
const TextChip = ({ label, color, size, variant, icon }) => {
  // Determinar estilos según las propiedades
  const getStyles = () => {
    const baseStyles = {
      display: 'inline-flex',
      alignItems: 'center',
      borderRadius: '16px',
      padding: '0px 8px',
      height: size === 'small' ? '24px' : '32px',
      fontSize: size === 'small' ? '0.75rem' : '0.875rem',
      fontWeight: 500,
      lineHeight: 1,
      marginRight: '8px',
      border: variant === 'outlined' ? '1px solid' : 'none',
      backgroundColor: variant === 'outlined' ? 'transparent' : `${color}.light`,
      borderColor: variant === 'outlined' ? `${color}.main` : 'transparent',
      color: variant === 'outlined' ? `${color}.main` : `${color}.dark`,
    };

    // Colores según la propiedad
    const colors = {
      primary: {
        main: '#1976d2',
        light: '#e3f2fd',
        dark: '#0d47a1',
      },
      secondary: {
        main: '#9c27b0',
        light: '#f3e5f5',
        dark: '#7b1fa2',
      },
      success: {
        main: '#2e7d32',
        light: '#e8f5e9',
        dark: '#1b5e20',
      },
      error: {
        main: '#d32f2f',
        light: '#ffebee',
        dark: '#b71c1c',
      },
      info: {
        main: '#0288d1',
        light: '#e1f5fe',
        dark: '#01579b',
      },
    };

    // Aplicar colores específicos
    const colorObj = colors[color] || colors.primary;
    
    if (variant === 'outlined') {
      return {
        ...baseStyles,
        border: `1px solid ${colorObj.main}`,
        color: colorObj.main,
        backgroundColor: 'transparent',
      };
    } else {
      return {
        ...baseStyles,
        backgroundColor: colorObj.light,
        color: colorObj.dark,
      };
    }
  };

  return (
    <Box sx={getStyles()}>
      {icon && <Box sx={{ mr: 0.5, display: 'flex', alignItems: 'center' }}>{icon}</Box>}
      <Typography 
        variant="body2" 
        component="span"
        sx={{ whiteSpace: 'nowrap' }}
      >
        {label}
      </Typography>
    </Box>
  );
};

export default TextChip;
