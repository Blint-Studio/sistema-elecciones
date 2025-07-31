import React, { useState, useEffect, useCallback, Suspense, lazy } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Box, CircularProgress, Typography } from "@mui/material";
import MainLayout from "./components/MainLayout";
import LoginPage from "./pages/LoginPage";
import { puedeAcceder } from "./utils/permisos";

// Lazy loading de páginas para mejorar rendimiento
const HomePage = lazy(() => import("./pages/HomePage"));
const CargarResultadosPage = lazy(() => import("./pages/CargarResultadosPage"));
const BarriosPage = lazy(() => import("./pages/BarriosPage"));
const InstitucionesPage = lazy(() => import("./pages/InstitucionesPage"));
const MilitantesPage = lazy(() => import("./pages/MilitantesPage"));
const MapaPage = lazy(() => import("./pages/MapaPage"));
const SeccionalesPage = lazy(() => import("./pages/SeccionalesPage"));
const ResultadosPage = lazy(() => import("./pages/ResultadosPage"));
const EscuelasPage = lazy(() => import("./pages/EscuelasPage"));

// Componente de loading optimizado
const LoadingComponent = React.memo(() => (
  <Box 
    sx={{ 
      display: 'flex', 
      flexDirection: 'column',
      alignItems: 'center', 
      justifyContent: 'center', 
      minHeight: '60vh',
      gap: 2
    }}
  >
    <CircularProgress size={60} />
    <Typography variant="h6" color="text.secondary">
      Cargando página...
    </Typography>
  </Box>
));

LoadingComponent.displayName = 'LoadingComponent';

// Wrapper optimizado para rutas protegidas
const ProtectedRoute = React.memo(({ children, usuario, onLogout }) => (
  <MainLayout usuario={usuario} onLogout={onLogout}>
    <Suspense fallback={<LoadingComponent />}>
      {children}
    </Suspense>
  </MainLayout>
));

ProtectedRoute.displayName = 'ProtectedRoute';

// Wrapper para rutas con autorización mejorada
const AuthorizedRoute = React.memo(({ children, usuario, onLogout, path }) => {
  // Verificar si el usuario puede acceder a esta ruta
  if (!puedeAcceder(usuario, path)) {
    return <Navigate to="/" replace />;
  }
  
  return (
    <ProtectedRoute usuario={usuario} onLogout={onLogout}>
      {children}
    </ProtectedRoute>
  );
});

AuthorizedRoute.displayName = 'AuthorizedRoute';

const App = React.memo(() => {
  const [usuario, setUsuario] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Verificar autenticación al iniciar
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem("token");
        const userData = localStorage.getItem("usuario");
        
        console.log("Verificando estado de autenticación...");
        
        if (token && userData) {
          const parsedUser = JSON.parse(userData);
          console.log("Usuario encontrado:", parsedUser);
          
          // Verificar que el token sea válido haciendo una petición al backend
          try {
            const response = await fetch("http://localhost:5000/api/auth/verify", {
              headers: {
                "Authorization": `Bearer ${token}`
              }
            });
            
            if (response.ok) {
              setUsuario(parsedUser);
              console.log("Token válido, usuario autenticado");
            } else {
              // Token inválido, limpiar datos
              localStorage.removeItem("token");
              localStorage.removeItem("usuario");
              console.log("Token inválido, limpiando datos");
            }
          } catch (error) {
            // Si no se puede verificar el token, asumir que es válido por ahora
            // En producción, deberías limpiar los datos
            console.log("Error al verificar token, usando datos locales");
            setUsuario(parsedUser);
          }
        } else {
          console.log("No hay datos de autenticación");
        }
      } catch (error) {
        console.error("Error parsing user data:", error);
        localStorage.removeItem("token");
        localStorage.removeItem("usuario");
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Handler de logout optimizado
  const handleLogout = useCallback(() => {
    console.log("Cerrando sesión...");
    
    // 1. Limpiar localStorage
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
    
    // 2. Limpiar estado del usuario
    setUsuario(null);
    
    // 3. Limpiar cachés de páginas (variables globales)
    // Militantes Page Cache
    if (window.militantesCache) {
      window.militantesCache.data = null;
      window.militantesCache.timestamp = null;
    }
    if (window.barriosCache) {
      window.barriosCache.data = null;
      window.barriosCache.timestamp = null;
    }
    
    // Instituciones Page Cache
    if (window.institucionesCache) {
      window.institucionesCache.data = null;
      window.institucionesCache.timestamp = null;
    }
    
    // Escuelas Page Cache
    if (window.escuelasCache) {
      window.escuelasCache.data = null;
      window.escuelasCache.timestamp = null;
    }
    
    // 4. Limpiar cachés del navegador
    if ('caches' in window) {
      caches.keys().then(names => {
        names.forEach(name => {
          if (name.includes('api-cache')) {
            caches.delete(name);
          }
        });
      });
    }
    
    // 5. Forzar recarga completa de la página después de un breve delay
    setTimeout(() => {
      window.location.reload();
    }, 100);
    
    console.log("Logout completo - cachés limpiados");
  }, []);

  // Handler de login optimizado
  const handleLoginSuccess = useCallback((userData) => {
    console.log("Login exitoso:", userData);
    
    if (userData && userData.id) {
      // Limpiar cachés al hacer login para evitar datos cruzados
      if (window.militantesCache) {
        window.militantesCache.data = null;
        window.militantesCache.timestamp = null;
      }
      if (window.barriosCache) {
        window.barriosCache.data = null;
        window.barriosCache.timestamp = null;
      }
      if (window.institucionesCache) {
        window.institucionesCache.data = null;
        window.institucionesCache.timestamp = null;
      }
      if (window.escuelasCache) {
        window.escuelasCache.data = null;
        window.escuelasCache.timestamp = null;
      }
      
      setUsuario(userData);
      console.log("Estado del usuario actualizado y cachés limpiados");
    } else {
      console.error("Datos de usuario inválidos");
    }
  }, []);

  // Mostrar loading durante la verificación inicial
  if (isLoading) {
    return <LoadingComponent />;
  }

  // Si no está logueado, solo mostrar LoginPage
  if (!usuario || !usuario.id) {
    console.log("Usuario no autenticado, mostrando login");
    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  }

  console.log("Usuario autenticado:", usuario);

  return (
    <Router>
      <Routes>
        {/* Ruta de login */}
        <Route
          path="/login"
          element={<LoginPage onLoginSuccess={handleLoginSuccess} />}
        />
        
        {/* Ruta principal - HomePage para admin/operador, MapaPage para lector */}
        <Route
          path="/"
          element={
            <ProtectedRoute usuario={usuario} onLogout={handleLogout}>
              {usuario && usuario.rol === 'lector' ? <MapaPage /> : <HomePage />}
            </ProtectedRoute>
          }
        />
        
        
        {/* Mapa - solo admin y lector */}
        <Route
          path="/mapa"
          element={
            <AuthorizedRoute usuario={usuario} onLogout={handleLogout} path="/mapa">
              <MapaPage />
            </AuthorizedRoute>
          }
        />
        
        {/* Rutas de gestión - solo admin y lector */}
        <Route
          path="/barrios"
          element={
            <AuthorizedRoute usuario={usuario} onLogout={handleLogout} path="/barrios">
              <BarriosPage />
            </AuthorizedRoute>
          }
        />
        
        <Route
          path="/instituciones"
          element={
            <AuthorizedRoute usuario={usuario} onLogout={handleLogout} path="/instituciones">
              <InstitucionesPage />
            </AuthorizedRoute>
          }
        />
        
        <Route
          path="/militantes"
          element={
            <AuthorizedRoute usuario={usuario} onLogout={handleLogout} path="/militantes">
              <MilitantesPage />
            </AuthorizedRoute>
          }
        />
        
        <Route
          path="/seccionales"
          element={
            <AuthorizedRoute usuario={usuario} onLogout={handleLogout} path="/seccionales">
              <SeccionalesPage />
            </AuthorizedRoute>
          }
        />
        <Route
          path="/resultados"
          element={
            <AuthorizedRoute usuario={usuario} onLogout={handleLogout} path="/resultados">
              <ResultadosPage />
            </AuthorizedRoute>
          }
        />
        
        <Route
          path="/escuelas"
          element={
            <AuthorizedRoute usuario={usuario} onLogout={handleLogout} path="/escuelas">
              <EscuelasPage />
            </AuthorizedRoute>
          }
        />
        
        {/* Cargar resultados - solo admin y operador */}
        <Route
          path="/cargar"
          element={
            <AuthorizedRoute usuario={usuario} onLogout={handleLogout} path="/cargar">
              <CargarResultadosPage token={localStorage.getItem("token")} />
            </AuthorizedRoute>
          }
        />
        
        {/* Redirección para rutas no encontradas */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
});

App.displayName = 'App';

export default App;
