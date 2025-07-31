import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2', // azul Google
    },
    secondary: {
      main: '#f50057', // acento
    },
    background: {
      default: '#f4f6f8', // gris claro
      paper: '#fff',
    },
  },
  shape: {
    borderRadius: 12,
  },
  transitions: {
    // Transiciones suaves globales
    easing: {
      easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    },
    duration: {
      shortest: 150,
      shorter: 200,
      short: 250,
      standard: 300,
      complex: 375,
      enteringScreen: 225,
      leavingScreen: 195,
    },
  },
});

export default theme;