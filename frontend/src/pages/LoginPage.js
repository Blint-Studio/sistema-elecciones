import React, { useState } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  CircularProgress,
  Snackbar,
  Alert,
  Fade,
  Avatar,
} from "@mui/material";
import HowToVoteIcon from "@mui/icons-material/HowToVote";
import LocationCityIcon from "@mui/icons-material/LocationCity";

const LoginPage = ({ onLoginSuccess }) => {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "info",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const manejarLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || "Error al iniciar sesión");
      }

      // Guardar datos en localStorage
      localStorage.setItem("token", data.token);
      localStorage.setItem("usuario", JSON.stringify(data.usuario));
      
      // Mostrar mensaje de éxito
      setSnackbar({
        open: true,
        message: "¡Bienvenido! Redirigiendo...",
        severity: "success",
      });
      
      // Pequeño delay para mostrar el mensaje antes de redirigir
      setTimeout(() => {
        onLoginSuccess(data.usuario);
        setLoading(false);
      }, 1000);
      
    } catch (err) {
      setSnackbar({
        open: true,
        message: err.message || "Credenciales incorrectas",
        severity: "error",
      });
      setLoading(false);
    }
  };

  return (
    <Fade in>
      <Box
        sx={{
          minHeight: "100vh",
          background:
            "linear-gradient(135deg, #e3f2fd 0%, #f4f6f8 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Paper
          elevation={6}
          sx={{
            p: 4,
            maxWidth: 400,
            width: "100%",
            borderRadius: 3,
            background: 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)',
            border: '1px solid rgba(25, 118, 210, 0.1)',
            position: 'relative',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '4px',
              background: 'linear-gradient(90deg, #1976d2 0%, #42a5f5 50%, #1976d2 100%)',
              borderRadius: '12px 12px 0 0',
            }
          }}
        >
          <Box sx={{ mb: 3, textAlign: "center" }}>
            {/* Logo Institucional Doble */}
            <Box sx={{ 
              mb: 2, 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center', 
              gap: 2,
              flexWrap: 'wrap'
            }}>
              {/* Logo Institucional (izquierda) */}
              <Box
                component="img"
                src="/logo-institucional.png"
                alt="Logo Institucional"
                sx={{
                  width: 70,
                  height: 70,
                  objectFit: 'contain',
                  filter: 'drop-shadow(0 4px 12px rgba(25, 118, 210, 0.3))',
                  borderRadius: 2,
                  background: 'rgba(255, 255, 255, 0.9)',
                  p: 1,
                  transition: 'transform 0.3s ease',
                  '&:hover': {
                    transform: 'scale(1.05)',
                  },
                  '&:not([src]), &[src=""]': {
                    display: 'none',
                  }
                }}
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />

              {/* Ícono de Ciudad (centro) */}
              <Box sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 50,
                height: 50,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
                boxShadow: '0 4px 12px rgba(25, 118, 210, 0.3)',
                transition: 'transform 0.3s ease',
                '&:hover': {
                  transform: 'scale(1.1)',
                },
              }}>
                <LocationCityIcon sx={{ fontSize: 28, color: 'white' }} />
              </Box>

              {/* Logo Juventud (derecha) */}
              <Box
                component="img"
                src="/logo-juventud.png"
                alt="Logo Juventud"
                sx={{
                  width: 70,
                  height: 70,
                  objectFit: 'contain',
                  filter: 'drop-shadow(0 4px 12px rgba(25, 118, 210, 0.3))',
                  borderRadius: 2,
                  background: 'rgba(255, 255, 255, 0.9)',
                  p: 1,
                  transition: 'transform 0.3s ease',
                  '&:hover': {
                    transform: 'scale(1.05)',
                  },
                  '&:not([src]), &[src=""]': {
                    display: 'none',
                  }
                }}
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />

              {/* Avatar de respaldo (se muestra solo si fallan ambos logos) */}
              <Avatar
                sx={{
                  width: 60,
                  height: 60,
                  bgcolor: 'primary.main',
                  background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
                  boxShadow: '0 4px 12px rgba(25, 118, 210, 0.3)',
                  display: 'none', // Por defecto oculto
                }}
              >
                <HowToVoteIcon sx={{ fontSize: 35, color: 'white' }} />
              </Avatar>
            </Box>
            
            {/* Título Institucional */}
            <Typography
              variant="h6"
              fontWeight={600}
              color="primary"
              gutterBottom
              sx={{ letterSpacing: 0.5 }}
            >
              JUNTA CAPITAL
            </Typography>
            <Typography
              variant="subtitle2"
              color="text.secondary"
              gutterBottom
              sx={{ fontWeight: 500, mb: 1 }}
            >
              Frente Cívico
            </Typography>
            
            <Typography
              variant="h5"
              fontWeight={700}
              color="primary"
              gutterBottom
            >
              Iniciar sesión
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Acceso a la plataforma de Base de Datos y gestión de elecciones
            </Typography>
          </Box>
          <form onSubmit={manejarLogin} autoComplete="off">
            <TextField
              label="Usuario o correo electrónico"
              name="email"
              type="text"
              value={form.email}
              onChange={handleChange}
              fullWidth
              margin="normal"
              required
              autoFocus
              placeholder="Ingrese su usuario o email"
              helperText="Puede ingresar su nombre de usuario o correo electrónico"
            />
            <TextField
              label="Contraseña"
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              fullWidth
              margin="normal"
              required
            />
            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              size="large"
              sx={{ 
                mt: 2, 
                mb: 2,
                boxShadow: 2,
                background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #1565c0 0%, #1976d2 100%)',
                  boxShadow: 3,
                }
              }}
              disabled={loading}
            >
              {loading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                "Ingresar"
              )}
            </Button>
            
            {/* Pie institucional */}
            <Box sx={{ 
              mt: 3, 
              pt: 2, 
              borderTop: '1px solid rgba(0, 0, 0, 0.1)', 
              textAlign: 'center' 
            }}>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
                Sistema Oficial de Gestión Electoral
              </Typography>
              <Typography variant="caption" display="block" color="text.secondary">
                Provincia de Córdoba - Argentina
              </Typography>
            </Box>
          </form>
        </Paper>
        <Snackbar
          open={snackbar.open}
          autoHideDuration={3000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
          TransitionComponent={Fade}
        >
          <Alert
            onClose={handleCloseSnackbar}
            severity={snackbar.severity}
            variant="filled"
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </Fade>
  );
};

export default LoginPage;
