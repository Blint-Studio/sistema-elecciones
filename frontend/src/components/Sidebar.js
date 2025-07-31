import React from 'react';
import { Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Divider, Toolbar, Typography, Box, IconButton } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import HowToVoteIcon from '@mui/icons-material/HowToVote';
import GroupIcon from '@mui/icons-material/Group';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import SchoolIcon from '@mui/icons-material/School';
import MapIcon from '@mui/icons-material/Map';
import BusinessIcon from '@mui/icons-material/Business';
import AssessmentIcon from '@mui/icons-material/Assessment';
import BarChartIcon from '@mui/icons-material/BarChart';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import MenuIcon from '@mui/icons-material/Menu';
import { Link } from 'react-router-dom';
import { getRutasDisponibles } from '../utils/permisos';

const drawerWidth = 220;
const collapsedDrawerWidth = 60;

const Sidebar = ({ open, onClose, variant = 'permanent', usuario, collapsed = false, onToggleCollapse }) => {
  // Obtener rutas disponibles según el rol del usuario
  const rutasDisponibles = getRutasDisponibles(usuario?.rol || '');

  // Mapeo de iconos
  const iconMap = {
    home: <HomeIcon />,
    location: <LocationOnIcon />,
    business: <AccountBalanceIcon />,
    school: <SchoolIcon />,
    account_balance: <BusinessIcon />,
    resultados: <BarChartIcon />, // Icono específico para Resultados
    group: <GroupIcon />,
    how_to_vote: <HowToVoteIcon />,
    map: <MapIcon />
  };

  // Organizar rutas por secciones
  const seccionPrincipal = rutasDisponibles.filter(ruta => 
    ['/'].includes(ruta.path)
  );

  const seccionGestion = rutasDisponibles.filter(ruta => 
    ['/barrios', '/seccionales', '/escuelas', '/instituciones', '/militantes', '/resultados'].includes(ruta.path)
  );

  const seccionAvanzada = rutasDisponibles.filter(ruta => 
    ['/cargar', '/mapa'].includes(ruta.path)
  );

  const renderSeccion = (titulo, rutas) => {
    if (rutas.length === 0) return null;

    return (
      <>
        <List>
          {!collapsed && (
            <Box sx={{ px: 2, py: 1 }}>
              <Typography variant="overline" color="textSecondary" sx={{ fontWeight: 600 }}>
                {titulo}
              </Typography>
            </Box>
          )}
          {rutas.map((ruta) => (
            <ListItem key={ruta.path} disablePadding>
              <ListItemButton 
                component={Link} 
                to={ruta.path} 
                onClick={onClose}
                sx={{
                  minHeight: 48,
                  justifyContent: collapsed ? 'center' : 'initial',
                  px: 2.5,
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 0,
                    mr: collapsed ? 'auto' : 3,
                    justifyContent: 'center',
                  }}
                >
                  {iconMap[ruta.icon]}
                </ListItemIcon>
                {!collapsed && <ListItemText primary={ruta.title} />}
              </ListItemButton>
            </ListItem>
          ))}
        </List>
        <Divider />
      </>
    );
  };

  return (
    <Drawer
      variant={variant}
      open={open}
      onClose={onClose}
      sx={{
        width: collapsed ? collapsedDrawerWidth : drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: collapsed ? collapsedDrawerWidth : drawerWidth,
          boxSizing: 'border-box',
          transition: 'width 0.3s ease-in-out',
          overflowX: 'hidden',
        },
        display: { xs: 'block', sm: 'block' },
      }}
    >
      <Toolbar />
      
      {/* Botón de toggle para colapsar/expandir */}
      <Box sx={{ display: 'flex', justifyContent: collapsed ? 'center' : 'flex-end', p: 1 }}>
        <IconButton 
          onClick={onToggleCollapse}
          size="small"
          sx={{ 
            backgroundColor: 'action.hover',
            '&:hover': {
              backgroundColor: 'action.selected',
            }
          }}
        >
          {collapsed ? <MenuIcon /> : <ChevronLeftIcon />}
        </IconButton>
      </Box>
      
      <Divider />
      
      {/* Información del usuario */}
      {usuario && (
        <Box sx={{ 
          px: collapsed ? 1 : 2, 
          py: 1, 
          backgroundColor: 'primary.main', 
          color: 'white',
          textAlign: collapsed ? 'center' : 'left'
        }}>
          {!collapsed ? (
            <>
              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                {usuario.email}
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.8 }}>
                {usuario.rol?.toUpperCase()}
              </Typography>
            </>
          ) : (
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              {usuario.email?.charAt(0).toUpperCase()}
            </Typography>
          )}
        </Box>
      )}
      
      <Divider />
      
      {/* Secciones del menú */}
      {renderSeccion('Principal', seccionPrincipal)}
      {renderSeccion('Gestión de Datos', seccionGestion)}
      {renderSeccion('Herramientas Avanzadas', seccionAvanzada)}
    </Drawer>
  );
};

export default Sidebar;