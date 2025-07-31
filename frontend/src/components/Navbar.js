import React, { useState } from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import AccountCircle from '@mui/icons-material/AccountCircle';
import LogoutIcon from '@mui/icons-material/Logout';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import PersonIcon from '@mui/icons-material/Person';

const Navbar = ({ onMenuClick, usuario, onLogout }) => {
  const [anchorEl, setAnchorEl] = useState(null);

  const handleMenu = (event) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);

  const handleLogout = () => {
    handleClose();
    onLogout();
  };

  return (
    <AppBar 
      position="fixed" 
      color="primary" 
      elevation={3}
      sx={{
        zIndex: (theme) => theme.zIndex.drawer + 1,
        background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
        backdropFilter: 'blur(10px)',
      }}
    >
      <Toolbar sx={{ minHeight: { xs: 56, sm: 64 } }}>
        {/* Botón de menú para móviles */}
        <IconButton
          edge="start"
          color="inherit"
          aria-label="abrir menú"
          onClick={onMenuClick}
          sx={{ 
            mr: 2, 
            display: { sm: 'none' },
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
            }
          }}
        >
          <MenuIcon />
        </IconButton>

        {/* Logo y título */}
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          flexGrow: 1,
          gap: 2
        }}>
          <Box sx={{
            width: 40,
            height: 40,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            borderRadius: 1
          }}>
            <img 
              src="/logo-institucional.png" 
              alt="Logo" 
              style={{ 
                width: '100%', 
                height: '100%', 
                objectFit: 'contain' 
              }} 
            />
          </Box>
          <Typography 
            variant="h6" 
            component="div" 
            sx={{ 
              fontWeight: 700,
              letterSpacing: 0.5,
              textShadow: '0 1px 2px rgba(0,0,0,0.1)',
              display: { xs: 'none', sm: 'block' }
            }}
          >
            Junta Capital
          </Typography>
          <Typography 
            variant="h6" 
            component="div" 
            sx={{ 
              fontWeight: 700,
              letterSpacing: 0.5,
              textShadow: '0 1px 2px rgba(0,0,0,0.1)',
              display: { xs: 'block', sm: 'none' }
            }}
          >
            Elecciones
          </Typography>
        </Box>

        {/* Información del usuario */}
        {usuario && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {/* Chip con rol (solo en desktop) */}
            <Chip
              label={usuario.rol?.toUpperCase() || 'USUARIO'}
              size="small"
              sx={{
                backgroundColor: 'rgba(255, 255, 255, 0.15)',
                color: 'white',
                fontWeight: 600,
                display: { xs: 'none', md: 'flex' },
                border: '1px solid rgba(255, 255, 255, 0.2)'
              }}
            />
            
            {/* Botón de usuario */}
            <IconButton 
              color="inherit" 
              onClick={handleMenu}
              sx={{
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                },
                transition: 'all 0.2s ease-in-out'
              }}
            >
              <AccountCircle sx={{ fontSize: 32 }} />
            </IconButton>

            {/* Menú desplegable */}
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleClose}
              PaperProps={{
                elevation: 8,
                sx: {
                  mt: 1.5,
                  minWidth: 200,
                  borderRadius: 2,
                  '& .MuiMenuItem-root': {
                    borderRadius: 1,
                    margin: '4px',
                    '&:hover': {
                      backgroundColor: 'action.hover',
                    },
                  },
                },
              }}
              transformOrigin={{ horizontal: 'right', vertical: 'top' }}
              anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            >
              {/* Información del usuario */}
              <Box sx={{ px: 2, py: 1, backgroundColor: 'grey.50' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <PersonIcon fontSize="small" />
                  {usuario.email || usuario.nombre}
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  {usuario.rol?.toUpperCase() || 'USUARIO'}
                </Typography>
                {/* Mostrar seccional asignada si aplica */}
                {usuario.rol === 'seccional' && usuario.seccional_asignada && (
                  <Typography variant="caption" sx={{ 
                    display: 'block', 
                    color: 'primary.main', 
                    fontWeight: 600,
                    mt: 0.5
                  }}>
                    📍 SECCIONAL {usuario.seccional_asignada}
                  </Typography>
                )}
              </Box>
              
              <Divider />
              
              {/* Opción de cerrar sesión */}
              <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
                <LogoutIcon sx={{ mr: 1 }} fontSize="small" />
                Cerrar sesión
              </MenuItem>
            </Menu>
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;