import React, { useCallback, useState } from 'react';
import { Box, Toolbar } from '@mui/material';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import { UserProvider } from './PermissionComponents';

const drawerWidth = 220;
const collapsedDrawerWidth = 60;

const MainLayout = React.memo(({ children, usuario, onLogout }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const handleDrawerToggle = useCallback(() => {
    setMobileOpen(prev => !prev);
  }, []);

  const handleDrawerClose = useCallback(() => {
    setMobileOpen(false);
  }, []);

  const handleSidebarToggle = useCallback(() => {
    setSidebarCollapsed(prev => !prev);
  }, []);

  return (
    <UserProvider usuario={usuario}>
      <Box sx={{ display: 'flex' }}>
        <Navbar onMenuClick={handleDrawerToggle} usuario={usuario} onLogout={onLogout} />
        <Sidebar
          variant="permanent"
          sx={{ display: { xs: 'none', sm: 'block' } }}
          open
          usuario={usuario}
          collapsed={sidebarCollapsed}
          onToggleCollapse={handleSidebarToggle}
        />
        <Sidebar
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerClose}
          usuario={usuario}
          sx={{ display: { xs: 'block', sm: 'none' } }}
          collapsed={false}
          onToggleCollapse={() => {}}
        />
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: 3,
            width: { 
              sm: `calc(100% - ${sidebarCollapsed ? collapsedDrawerWidth : drawerWidth}px)` 
            },
            minHeight: '100vh',
            backgroundColor: 'background.default',
            transition: 'width 0.3s ease-in-out',
          }}
        >
          <Toolbar />
          {children}
        </Box>
      </Box>
    </UserProvider>
  );
});

MainLayout.displayName = 'MainLayout';

export default MainLayout;