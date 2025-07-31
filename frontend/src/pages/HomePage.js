import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Autocomplete,
  InputAdornment,
  RadioGroup,
  FormControlLabel,
  Radio,
  FormLabel,
  ToggleButton,
  ToggleButtonGroup,
  CircularProgress
} from '@mui/material';
import {
  Home,
  HowToVote,
  LocationOn,
  Business,
  Group,
  Add,
  Close,
  Save,
  School,
  AccountBalance,
  CheckCircle,
  Error as ErrorIcon,
  Person,
  Work,
  Cake,
  TableChart,
  Assessment
} from '@mui/icons-material';
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import esLocale from "date-fns/locale/es";

// Importar servicios
import { getEscuelas } from "../services/escuelasService";
import { getSeccionales } from "../services/seccionalesService";
import { getBarrios, createBarrio } from "../services/barriosService";
import { getTiposInstitucion, createTipoInstitucion } from "../services/tiposInstitucionService";
import { createInstitucion } from "../services/institucionesService";
import { createMilitante, getMilitantes } from "../services/militantesService";
import * as subcircuitosService from "../services/subcircuitosService";
import apiService from "../services/apiService";
import { useMultipleCachedData } from "../hooks/useCachedData";
import { invalidateRelatedCaches } from "../utils/globalCache";

const TIPOS_ELECCION = [
  { value: "1", label: "Vecinal" },
  { value: "2", label: "Municipal" },
  { value: "3", label: "Provincial" },
  { value: "4", label: "Nacional" }
];

const CATEGORIAS_MILITANTES = [
  "juventud", "mayores", "encargado de escuela", "dirigente"
];

const DEPENDENCIAS = [
  "Concejo", "Legislatura", "Tribunal de cuentas Muni", 
  "Tribunal de cuentas Prov", "Municipalidad", "Provincia", "Senado"
];

const TIPOS_TRABAJO = [
  "Planta Permanente", "Cargo Politico", "Monotributo", "Beca"
];

const HomePage = () => {
  // Usar hook optimizado para cargar múltiples datos con cache
  const { 
    data: cachedData, 
    loading: loadingData,
    refetchAll 
  } = useMultipleCachedData([
    { key: 'escuelas', fetchFn: getEscuelas },
    { key: 'barrios', fetchFn: getBarrios },
    { key: 'tiposInstitucion', fetchFn: getTiposInstitucion },
    { key: 'militantes', fetchFn: getMilitantes }
  ]);

  // Extraer datos del cache
  const escuelas = cachedData.escuelas || [];
  const barrios = cachedData.barrios || [];
  const tiposInstitucion = cachedData.tiposInstitucion || [];
  const militantes = cachedData.militantes || [];

  // Estados principales
  const [openDialog, setOpenDialog] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  // Estados para datos que se cargan dinámicamente
  const [seccionales, setSeccionales] = useState([]);
  const [mesas, setMesas] = useState([]);
  const [subcircuitos, setSubcircuitos] = useState([]);

  // Estados para resultado electoral
  const [modoResultado, setModoResultado] = useState("escuela"); // "escuela" o "subcircuito"

  // Estados de formularios
  const [barrioForm, setBarrioForm] = useState({
    nombre: '',
    seccional_nombre: '',
    subcircuito: ''
  });

  const [institucionForm, setInstitucionForm] = useState({
    nombre: '',
    tipo: '',
    direccion: '',
    id_barrio: '',
    seccional: '',
    relacion: ''
  });

  // Estados adicionales para tipos de institución
  const [nuevoTipo, setNuevoTipo] = useState('');
  const [mostrarNuevoTipo, setMostrarNuevoTipo] = useState(false);

  const [militanteForm, setMilitanteForm] = useState({
    nombre: '',
    apellido: '',
    fecha_nacimiento: '',
    edad: '',
    telefono: '',
    instagram: '',
    categoria: '',
    id_barrio: '',
    seccional: '',
    trabaja: '',
    dependencia: '',
    tipo_trabajo: ''
  });

  const [resultadoForm, setResultadoForm] = useState({
    fecha: null,
    id_tipo_eleccion: '',
    // Para modo escuela
    id_escuela: '',
    id_mesa: '',
    // Para modo subcircuito
    numero_seccional: '',
    subcircuito: '',
    // Común
    total_votantes: '',
    total_electores_padron: '',
    votos_por_lista: {
      frente_civico: '',
      peronismo: '',
      otro: ''
    },
    total_nulos: '',
    total_blancos: ''
  });

  // Cargar datos que necesitan carga dinámica (seccionales)
  useEffect(() => {
    const cargarSeccionales = async () => {
      try {
        const seccionalesData = await subcircuitosService.getSeccionales();
        // Filtrar seccionales únicas por número para evitar duplicados
        const seccionalesUnicas = Array.isArray(seccionalesData) ? 
          seccionalesData.filter((seccional, index, self) => 
            index === self.findIndex(s => s.numero === seccional.numero)
          ) : [];
        setSeccionales(seccionalesUnicas);
      } catch (err) {
        console.error('Error al cargar seccionales:', err);
      }
    };

    cargarSeccionales();
  }, []);

  // Cargar mesas cuando se selecciona una escuela
  useEffect(() => {
    if (modoResultado === "escuela" && resultadoForm.id_escuela) {
      apiService.getMesas(resultadoForm.id_escuela)
        .then(data => setMesas(Array.isArray(data) ? data : []))
        .catch(err => console.error('Error al cargar mesas:', err));
    } else {
      setMesas([]);
    }
  }, [resultadoForm.id_escuela, modoResultado]);

  // Cargar subcircuitos cuando se selecciona una seccional
  useEffect(() => {
    if (modoResultado === "subcircuito" && resultadoForm.numero_seccional) {
      subcircuitosService.getSubcircuitosBySeccional(resultadoForm.numero_seccional)
        .then(data => {
          setSubcircuitos(Array.isArray(data) ? data : []);
          console.log("Subcircuitos recibidos:", data);
        })
        .catch(err => {
          console.error('Error al cargar subcircuitos:', err);
          setError(`Error al cargar subcircuitos: ${err.message}`);
          setSubcircuitos([]);
        });
    } else {
      setSubcircuitos([]);
    }
  }, [resultadoForm.numero_seccional, modoResultado]);

  // Calcula votos "otro" automáticamente
  useEffect(() => {
    if (
      resultadoForm.total_votantes &&
      resultadoForm.votos_por_lista.frente_civico !== "" &&
      resultadoForm.votos_por_lista.peronismo !== "" &&
      resultadoForm.total_nulos !== "" &&
      resultadoForm.total_blancos !== ""
    ) {
      const totalVotantes = parseInt(resultadoForm.total_votantes) || 0;
      const frenteCivico = parseInt(resultadoForm.votos_por_lista.frente_civico) || 0;
      const peronismo = parseInt(resultadoForm.votos_por_lista.peronismo) || 0;
      const nulos = parseInt(resultadoForm.total_nulos) || 0;
      const blancos = parseInt(resultadoForm.total_blancos) || 0;
      const votosOtro = totalVotantes - (frenteCivico + peronismo + nulos + blancos);
      setResultadoForm((prev) => ({
        ...prev,
        votos_por_lista: {
          ...prev.votos_por_lista,
          otro: votosOtro > 0 ? votosOtro : 0
        }
      }));
    }
  }, [
    resultadoForm.total_votantes,
    resultadoForm.votos_por_lista.frente_civico,
    resultadoForm.votos_por_lista.peronismo,
    resultadoForm.total_nulos,
    resultadoForm.total_blancos
  ]);

  const handleCloseDialog = () => {
    setOpenDialog(null);
    setSuccess('');
    setError('');
    setLoading(false);
    setMostrarNuevoTipo(false);
    setNuevoTipo('');
    setModoResultado("escuela");
    setMesas([]);
    setSubcircuitos([]);
    // Reset forms
    setBarrioForm({ nombre: '', seccional_nombre: '', subcircuito: '' });
    setInstitucionForm({ nombre: '', tipo: '', direccion: '', id_barrio: '', seccional: '', relacion: '' });
    setMilitanteForm({ nombre: '', apellido: '', fecha_nacimiento: '', edad: '', telefono: '', instagram: '', categoria: '', id_barrio: '', seccional: '', trabaja: '', dependencia: '', tipo_trabajo: '' });
    setResultadoForm({ 
      fecha: null, 
      id_tipo_eleccion: '', 
      id_escuela: '', 
      id_mesa: '', 
      numero_seccional: '', 
      subcircuito: '', 
      total_votantes: '', 
      total_electores_padron: '',
      votos_por_lista: {
        frente_civico: '',
        peronismo: '',
        otro: ''
      },
      total_nulos: '', 
      total_blancos: '' 
    });
  };

  // Funciones de envío
  const handleSubmitBarrio = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await createBarrio(barrioForm);
      setSuccess('Barrio creado exitosamente');
      // Invalidar cache relacionado
      invalidateRelatedCaches(['barrios']);
      setTimeout(() => handleCloseDialog(), 2000);
    } catch (err) {
      setError(`Error al crear barrio: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitInstitucion = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    let tipoFinal = institucionForm.tipo;
    try {
      if (institucionForm.tipo === "Otro" && nuevoTipo) {
        await createTipoInstitucion({ nombre: nuevoTipo });
        tipoFinal = nuevoTipo;
      }
      const datos = { ...institucionForm, tipo: tipoFinal };
      delete datos.seccional; // No enviar seccional al backend
      await createInstitucion(datos);
      setSuccess('Institución creada exitosamente');
      // Invalidar cache relacionado
      invalidateRelatedCaches(['instituciones', 'tipos_institucion']);
      setTimeout(() => handleCloseDialog(), 2000);
    } catch (err) {
      setError(`Error al crear institución: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitMilitante = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const datos = { ...militanteForm };
      delete datos.seccional; // No se guarda en la tabla, solo para mostrar
      delete datos.edad; // No se guarda, se calcula en el frontend
      await createMilitante(datos);
      
      // Invalidar caches relacionados
      invalidateRelatedCaches('militante_created');
      
      setSuccess('Militante creado exitosamente');
      setTimeout(() => handleCloseDialog(), 2000);
    } catch (err) {
      setError(`Error al crear militante: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitResultado = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    // Validar suma de votos antes de enviar
    if (!validarSumaVotos()) {
      const totalVotantes = parseInt(resultadoForm.total_votantes) || 0;
      const suma = (parseInt(resultadoForm.votos_por_lista.frente_civico) || 0) + 
                   (parseInt(resultadoForm.votos_por_lista.peronismo) || 0) + 
                   (parseInt(resultadoForm.votos_por_lista.otro) || 0) + 
                   (parseInt(resultadoForm.total_nulos) || 0) + 
                   (parseInt(resultadoForm.total_blancos) || 0);
      setError(`La suma de votos (${suma}) no coincide con el total de votantes (${totalVotantes})`);
      setLoading(false);
      return;
    }

    const basePayload = {
      fecha: resultadoForm.fecha ? resultadoForm.fecha.toISOString().split("T")[0] : "",
      id_tipo_eleccion: parseInt(resultadoForm.id_tipo_eleccion),
      total_votantes: parseInt(resultadoForm.total_votantes) || 0,
      frente_civico: parseInt(resultadoForm.votos_por_lista.frente_civico) || 0,
      peronismo: parseInt(resultadoForm.votos_por_lista.peronismo) || 0,
      otro: parseInt(resultadoForm.votos_por_lista.otro) || 0,
      total_nulos: parseInt(resultadoForm.total_nulos) || 0,
      total_blancos: parseInt(resultadoForm.total_blancos) || 0
    };

    let payload;
    if (modoResultado === "escuela") {
      payload = {
        ...basePayload,
        total_electores_padron: parseInt(resultadoForm.total_electores_padron) || 0,
        id_escuela: parseInt(resultadoForm.id_escuela),
        id_mesa: parseInt(resultadoForm.id_mesa)
      };
    } else {
      payload = {
        ...basePayload,
        total_electores_padron: parseInt(resultadoForm.total_electores_padron) || 0,
        numero_seccional: parseInt(resultadoForm.numero_seccional),
        subcircuito: resultadoForm.subcircuito
      };
    }

    console.log("Enviando payload:", payload);

    try {
      let data;
      if (modoResultado === "escuela") {
        data = await apiService.crearResultado(payload);
      } else {
        data = await subcircuitosService.createResultadoSubcircuito(payload);
      }
      console.log("Respuesta del servidor:", data);
      
      setSuccess(`Resultado cargado correctamente ${modoResultado === "escuela" ? "por escuela" : "por subcircuito"}`);
      // Resetear formulario
      setResultadoForm({
        fecha: null,
        id_tipo_eleccion: "",
        id_escuela: "",
        id_mesa: "",
        numero_seccional: "",
        subcircuito: "",
        total_votantes: "",
        total_electores_padron: "",
        votos_por_lista: {
          frente_civico: "",
          peronismo: "",
          otro: ""
        },
        total_nulos: "",
        total_blancos: ""
      });
      setTimeout(() => handleCloseDialog(), 2000);
    } catch (error) {
      console.error("Error al enviar resultado:", error);
      setError(error.message || "Error al guardar el resultado");
    } finally {
      setLoading(false);
    }
  };

  // Funciones auxiliares
  const handleBarrioChange = (e, value) => {
    setInstitucionForm({
      ...institucionForm,
      id_barrio: value ? value.id : '',
      seccional: value ? value.seccional_nombre : ''
    });
  };

  const handleTipoChange = (e) => {
    const value = e.target.value;
    setInstitucionForm({ ...institucionForm, tipo: value });
    if (value === "Otro") {
      setMostrarNuevoTipo(true);
    } else {
      setMostrarNuevoTipo(false);
      setNuevoTipo("");
    }
  };

  const handleMilitanteBarrioChange = (e, value) => {
    setMilitanteForm({
      ...militanteForm,
      id_barrio: value ? value.id : '',
      seccional: value ? value.seccional_nombre : ''
    });
  };

  // Función para capitalizar texto
  const capitalizar = (texto) => {
    if (!texto || typeof texto !== 'string') return "";
    return texto.charAt(0).toUpperCase() + texto.slice(1).toLowerCase();
  };

  // Calcular edad y determinar categoría automáticamente
  const calcularEdadYCategoria = (fechaNacimiento) => {
    if (!fechaNacimiento) return { edad: "", categoria: "" };
    
    const today = new Date();
    const birthDate = new Date(fechaNacimiento);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    const categoria = age > 35 ? "mayores" : "juventud";
    
    return { edad: age, categoria };
  };

  // Handler para cambios en fecha de nacimiento
  const handleDateChange = (newDate) => {
    if (newDate) {
      const fechaStr = newDate.toISOString().split('T')[0];
      const { edad, categoria } = calcularEdadYCategoria(fechaStr);
      
      setMilitanteForm(prev => ({
        ...prev,
        fecha_nacimiento: fechaStr,
        edad: edad,
        categoria: categoria
      }));
    } else {
      setMilitanteForm(prev => ({
        ...prev,
        fecha_nacimiento: '',
        edad: '',
        categoria: ''
      }));
    }
  };

  // Handler para cambios en el campo "trabaja"
  const handleTrabajaChange = (value) => {
    setMilitanteForm(prev => ({
      ...prev,
      trabaja: value,
      dependencia: value === "SI" ? prev.dependencia : "",
      tipo_trabajo: value === "SI" ? prev.tipo_trabajo : ""
    }));
  };

  const handleModoResultadoChange = (event, newModo) => {
    if (newModo !== null) {
      setModoResultado(newModo);
      // Resetear campos específicos del formulario
      setResultadoForm(prev => ({
        ...prev,
        id_escuela: '',
        id_mesa: '',
        numero_seccional: '',
        subcircuito: ''
      }));
      setMesas([]);
      setSubcircuitos([]);
      setError(''); // Limpiar errores también
    }
  };

  // Funciones auxiliares para el formulario de resultados
  const handleResultadoChange = (field, value) => {
    setResultadoForm((prev) => ({
      ...prev,
      [field]: value
    }));
    // Limpiar errores cuando el usuario empiece a escribir
    if (error) setError("");
  };

  const handleListaChange = (codigo, value) => {
    setResultadoForm((prev) => ({
      ...prev,
      votos_por_lista: {
        ...prev.votos_por_lista,
        [codigo]: value
      }
    }));
    if (error) setError("");
  };

  // Validación de suma de votos
  const validarSumaVotos = () => {
    const totalVotantes = parseInt(resultadoForm.total_votantes) || 0;
    const frenteCivico = parseInt(resultadoForm.votos_por_lista.frente_civico) || 0;
    const peronismo = parseInt(resultadoForm.votos_por_lista.peronismo) || 0;
    const otro = parseInt(resultadoForm.votos_por_lista.otro) || 0;
    const nulos = parseInt(resultadoForm.total_nulos) || 0;
    const blancos = parseInt(resultadoForm.total_blancos) || 0;
    const suma = frenteCivico + peronismo + otro + nulos + blancos;
    
    return suma === totalVotantes;
  };

  // Opciones de carga
  const opcionesCarga = [
    {
      id: 'resultado',
      titulo: 'Cargar Resultado Electoral',
      descripcion: 'Registrar resultados de votación por mesa',
      icono: <HowToVote sx={{ fontSize: 40 }} />,
      color: 'primary.main',
      bgColor: 'primary.light'
    },
    {
      id: 'barrio',
      titulo: 'Cargar Nuevo Barrio',
      descripcion: 'Agregar un nuevo barrio al sistema',
      icono: <LocationOn sx={{ fontSize: 40 }} />,
      color: 'success.main',
      bgColor: 'success.light'
    },
    {
      id: 'institucion',
      titulo: 'Cargar Nueva Institución',
      descripcion: 'Registrar una nueva institución',
      icono: <Business sx={{ fontSize: 40 }} />,
      color: 'warning.main',
      bgColor: 'warning.light'
    },
    {
      id: 'militante',
      titulo: 'Cargar Nuevo Militante',
      descripcion: 'Agregar un militante al registro',
      icono: <Group sx={{ fontSize: 40 }} />,
      color: 'secondary.main',
      bgColor: 'secondary.light'
    }
  ];

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" sx={{ 
          fontWeight: 700, 
          color: 'primary.main',
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          mb: 1
        }}>
          <Home fontSize="large" />
          Centro de Carga Electoral
        </Typography>
        <Typography variant="body1" color="textSecondary">
          Hub central para cargar datos en el sistema electoral
        </Typography>
      </Box>

      {/* Mensajes globales */}
      {success && (
        <Alert 
          severity="success" 
          sx={{ mb: 3 }} 
          onClose={() => setSuccess('')}
          icon={<CheckCircle />}
        >
          {success}
        </Alert>
      )}
      
      {error && (
        <Alert 
          severity="error" 
          sx={{ mb: 3 }} 
          onClose={() => setError('')}
          icon={<ErrorIcon />}
        >
          {error}
        </Alert>
      )}

      

      {/* Opciones de carga */}

      <Grid container spacing={3}>
        {opcionesCarga.map((opcion) => (
          <Grid item xs={12} sm={6} md={6} lg={3} key={opcion.id}>
            <Card 
              sx={{ 
                height: '100%',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 4
                }
              }}
              onClick={() => setOpenDialog(opcion.id)}
            >
              <CardContent sx={{ textAlign: 'center', p: 4 }}>
                <Box 
                  sx={{ 
                    backgroundColor: opcion.bgColor, 
                    borderRadius: 2, 
                    p: 2, 
                    mb: 2,
                    display: 'inline-flex',
                    color: opcion.color
                  }}
                >
                  {opcion.icono}
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                  {opcion.titulo}
                </Typography>
                <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                  {opcion.descripcion}
                </Typography>
              </CardContent>
              <CardActions sx={{ justifyContent: 'center', pb: 3 }}>
                <Button 
                  variant="contained" 
                  startIcon={<Add />}
                  sx={{ 
                    backgroundColor: opcion.color,
                    '&:hover': { 
                      backgroundColor: opcion.color,
                      filter: 'brightness(0.9)'
                    }
                  }}
                >
                  Cargar Ahora
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Dialog para Cargar Barrio */}
      <Dialog open={openDialog === 'barrio'} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle sx={{ 
          backgroundColor: 'success.main', 
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          gap: 1
        }}>
          <LocationOn />
          Cargar Nuevo Barrio
          <Box sx={{ flexGrow: 1 }} />
          <IconButton onClick={handleCloseDialog} sx={{ color: 'white' }}>
            <Close />
          </IconButton>
        </DialogTitle>
        <form onSubmit={handleSubmitBarrio}>
          <DialogContent sx={{ mt: 2 }}>
            {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  label="Nombre del Barrio"
                  value={barrioForm.nombre}
                  onChange={(e) => setBarrioForm({...barrioForm, nombre: e.target.value})}
                  fullWidth
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LocationOn />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Seccional"
                  value={barrioForm.seccional_nombre}
                  onChange={(e) => setBarrioForm({...barrioForm, seccional_nombre: e.target.value})}
                  fullWidth
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Subcircuito"
                  value={barrioForm.subcircuito}
                  onChange={(e) => setBarrioForm({...barrioForm, subcircuito: e.target.value})}
                  fullWidth
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button onClick={handleCloseDialog} disabled={loading}>
              Cancelar
            </Button>
            <Button 
              type="submit" 
              variant="contained" 
              disabled={loading}
              startIcon={<Save />}
            >
              {loading ? 'Guardando...' : 'Guardar Barrio'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Dialog para Cargar Institución */}
      <Dialog open={openDialog === 'institucion'} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle sx={{ 
          backgroundColor: 'warning.main', 
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          gap: 1
        }}>
          <Business />
          Cargar Nueva Institución
          <Box sx={{ flexGrow: 1 }} />
          <IconButton onClick={handleCloseDialog} sx={{ color: 'white' }}>
            <Close />
          </IconButton>
        </DialogTitle>
        <form onSubmit={handleSubmitInstitucion}>
          <DialogContent sx={{ mt: 2 }}>
            {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  label="Nombre"
                  value={institucionForm.nombre}
                  onChange={(e) => setInstitucionForm({...institucionForm, nombre: e.target.value})}
                  fullWidth
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth required>
                  <InputLabel>Tipo</InputLabel>
                  <Select
                    value={institucionForm.tipo}
                    onChange={handleTipoChange}
                    label="Tipo"
                  >
                    {tiposInstitucion.map((tipo) => (
                      <MenuItem key={tipo.id || tipo.nombre} value={tipo.nombre}>
                        {tipo.nombre}
                      </MenuItem>
                    ))}
                    <MenuItem value="Otro">Otro (Crear nuevo tipo)</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              {mostrarNuevoTipo && (
                <Grid item xs={12}>
                  <TextField
                    label="Nuevo Tipo de Institución"
                    value={nuevoTipo}
                    onChange={(e) => setNuevoTipo(e.target.value)}
                    fullWidth
                    required
                    helperText="Ingrese el nombre del nuevo tipo de institución"
                  />
                </Grid>
              )}
              <Grid item xs={12} md={6}>
                <Autocomplete
                  options={barrios}
                  getOptionLabel={(option) => `${option.nombre} (${option.seccional_nombre})`}
                  value={barrios.find(b => b.id === institucionForm.id_barrio) || null}
                  onChange={handleBarrioChange}
                  renderInput={(params) => (
                    <TextField {...params} label="Barrio" required />
                  )}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Dirección"
                  value={institucionForm.direccion}
                  onChange={(e) => setInstitucionForm({...institucionForm, direccion: e.target.value})}
                  fullWidth
                  multiline
                  rows={2}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Relación</InputLabel>
                  <Select
                    value={institucionForm.relacion}
                    onChange={(e) => setInstitucionForm({...institucionForm, relacion: e.target.value})}
                    label="Relación"
                  >
                    <MenuItem value="Hay relacion">Hay relación</MenuItem>
                    <MenuItem value="No hay Relacion">No hay relación</MenuItem>
                    <MenuItem value="En Proceso">En proceso</MenuItem>
                    <MenuItem value="Sin definir">Sin definir</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button onClick={handleCloseDialog} disabled={loading}>
              Cancelar
            </Button>
            <Button 
              type="submit" 
              variant="contained" 
              disabled={loading}
              startIcon={<Save />}
            >
              {loading ? 'Guardando...' : 'Guardar Institución'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Dialog para Cargar Militante */}
      <Dialog open={openDialog === 'militante'} onClose={handleCloseDialog} maxWidth="lg" fullWidth>
        <DialogTitle sx={{ 
          backgroundColor: 'secondary.main', 
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          gap: 1
        }}>
          <Group />
          Cargar Nuevo Militante
          <Box sx={{ flexGrow: 1 }} />
          <IconButton onClick={handleCloseDialog} sx={{ color: 'white' }}>
            <Close />
          </IconButton>
        </DialogTitle>
        <form onSubmit={handleSubmitMilitante}>
          <DialogContent sx={{ p: 3 }}>
            {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            
            {/* Datos Personales */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" color="primary" sx={{ 
                mb: 2, 
                pb: 1, 
                borderBottom: 1, 
                borderColor: 'divider',
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}>
                <Person /> Datos Personales
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Nombre *"
                    value={militanteForm.nombre}
                    onChange={(e) => setMilitanteForm({...militanteForm, nombre: e.target.value})}
                    fullWidth
                    required
                    variant="outlined"
                    helperText="Nombre del militante"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Apellido *"
                    value={militanteForm.apellido}
                    onChange={(e) => setMilitanteForm({...militanteForm, apellido: e.target.value})}
                    fullWidth
                    required
                    variant="outlined"
                    helperText="Apellido del militante"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={esLocale}>
                    <DatePicker
                      label="Fecha de Nacimiento *"
                      value={militanteForm.fecha_nacimiento ? new Date(militanteForm.fecha_nacimiento) : null}
                      onChange={handleDateChange}
                      renderInput={(params) => 
                        <TextField 
                          {...params} 
                          fullWidth 
                          required 
                          variant="outlined"
                          helperText="Seleccione la fecha de nacimiento"
                        />
                      }
                    />
                  </LocalizationProvider>
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Edad"
                    value={militanteForm.edad ? `${militanteForm.edad} años` : ''}
                    fullWidth
                    disabled
                    variant="outlined"
                    helperText="Se calcula automáticamente según la fecha de nacimiento"
                    InputProps={{
                      startAdornment: <Cake sx={{ mr: 1, color: 'action.active' }} />
                    }}
                  />
                </Grid>
              </Grid>
            </Box>

            {/* Categorización */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" color="primary" sx={{ 
                mb: 2, 
                pb: 1, 
                borderBottom: 1, 
                borderColor: 'divider',
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}>
                <Work /> Categorización
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth required variant="outlined">
                    <InputLabel>Categoría *</InputLabel>
                    <Select
                      value={militanteForm.categoria}
                      onChange={(e) => setMilitanteForm({...militanteForm, categoria: e.target.value})}
                      label="Categoría *"
                    >
                      {CATEGORIAS_MILITANTES.map(cat => (
                        <MenuItem key={cat} value={cat}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Person fontSize="small" />
                            {capitalizar(cat)}
                          </Box>
                        </MenuItem>
                      ))}
                    </Select>
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, ml: 1 }}>
                      {militanteForm.categoria === "juventud" && "Militantes de hasta 35 años"}
                      {militanteForm.categoria === "mayores" && "Militantes mayores de 35 años"}
                      {militanteForm.categoria === "encargado de escuela" && "Responsables de establecimiento"}
                      {militanteForm.categoria === "dirigente" && "Líderes y referentes políticos"}
                    </Typography>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Autocomplete
                    options={barrios}
                    getOptionLabel={(barrio) => `${capitalizar(barrio.nombre)} (${barrio.seccional_nombre || 'Sin seccional'})`}
                    value={barrios.find(b => b.id === militanteForm.id_barrio) || null}
                    onChange={handleMilitanteBarrioChange}
                    renderInput={(params) => (
                      <TextField 
                        {...params} 
                        label="Barrio *" 
                        required 
                        variant="outlined"
                        helperText="Seleccione el barrio de residencia"
                      />
                    )}
                    isOptionEqualToValue={(option, value) => option.id === value.id}
                  />
                </Grid>
              </Grid>
            </Box>

            {/* Información de Contacto */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" color="primary" sx={{ 
                mb: 2, 
                pb: 1, 
                borderBottom: 1, 
                borderColor: 'divider',
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}>
                <Person /> Información de Contacto
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Teléfono"
                    value={militanteForm.telefono}
                    onChange={(e) => setMilitanteForm({...militanteForm, telefono: e.target.value})}
                    fullWidth
                    variant="outlined"
                    helperText="Número de teléfono celular o fijo"
                    InputProps={{
                      startAdornment: <Person sx={{ mr: 1, color: 'action.active' }} />
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Instagram"
                    value={militanteForm.instagram}
                    onChange={(e) => setMilitanteForm({...militanteForm, instagram: e.target.value})}
                    fullWidth
                    variant="outlined"
                    helperText="Usuario de Instagram (sin @)"
                    InputProps={{
                      startAdornment: <Person sx={{ mr: 1, color: 'action.active' }} />
                    }}
                  />
                </Grid>
              </Grid>
            </Box>

            {/* Información Laboral */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" color="primary" sx={{ 
                mb: 2, 
                pb: 1, 
                borderBottom: 1, 
                borderColor: 'divider',
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}>
                <Work /> Información Laboral
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                  <FormControl fullWidth variant="outlined">
                    <InputLabel>¿Trabaja?</InputLabel>
                    <Select
                      value={militanteForm.trabaja}
                      onChange={(e) => handleTrabajaChange(e.target.value)}
                      label="¿Trabaja?"
                    >
                      <MenuItem value="">
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Work fontSize="small" color="disabled" />
                          No especifica
                        </Box>
                      </MenuItem>
                      <MenuItem value="SI">
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Work fontSize="small" color="success" />
                          Sí, trabaja
                        </Box>
                      </MenuItem>
                      <MenuItem value="NO">
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Work fontSize="small" color="disabled" />
                          No trabaja
                        </Box>
                      </MenuItem>
                    </Select>
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, ml: 1 }}>
                      Indique si el militante tiene trabajo
                    </Typography>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={4}>
                  <FormControl fullWidth disabled={militanteForm.trabaja !== "SI"} variant="outlined">
                    <InputLabel>Dependencia</InputLabel>
                    <Select
                      value={militanteForm.dependencia}
                      onChange={(e) => setMilitanteForm({...militanteForm, dependencia: e.target.value})}
                      label="Dependencia"
                    >
                      <MenuItem value="">Seleccionar dependencia</MenuItem>
                      {DEPENDENCIAS.map(dep => (
                        <MenuItem key={dep} value={dep}>{dep}</MenuItem>
                      ))}
                    </Select>
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, ml: 1 }}>
                      {militanteForm.trabaja === "SI" ? "Seleccione la dependencia donde trabaja" : "Disponible solo si trabaja"}
                    </Typography>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={4}>
                  <FormControl fullWidth disabled={militanteForm.trabaja !== "SI"} variant="outlined">
                    <InputLabel>Tipo de Trabajo</InputLabel>
                    <Select
                      value={militanteForm.tipo_trabajo}
                      onChange={(e) => setMilitanteForm({...militanteForm, tipo_trabajo: e.target.value})}
                      label="Tipo de Trabajo"
                    >
                      <MenuItem value="">Seleccionar tipo</MenuItem>
                      {TIPOS_TRABAJO.map(tipo => (
                        <MenuItem key={tipo} value={tipo}>{tipo}</MenuItem>
                      ))}
                    </Select>
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, ml: 1 }}>
                      {militanteForm.trabaja === "SI" ? "Especifique el tipo de trabajo" : "Disponible solo si trabaja"}
                    </Typography>
                  </FormControl>
                </Grid>
              </Grid>
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 3, backgroundColor: 'grey.50' }}>
            <Button 
              onClick={handleCloseDialog}
              variant="outlined"
              size="large"
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              variant="contained" 
              disabled={loading}
              size="large"
              sx={{ minWidth: 120 }}
            >
              {loading ? <CircularProgress size={20} /> : 'Crear Militante'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Dialog para Cargar Resultado */}
      <Dialog open={openDialog === 'resultado'} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle sx={{ 
          backgroundColor: 'primary.main', 
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          gap: 1
        }}>
          <HowToVote />
          Cargar Resultado Electoral
          <Box sx={{ flexGrow: 1 }} />
          <IconButton onClick={handleCloseDialog} sx={{ color: 'white' }}>
            <Close />
          </IconButton>
        </DialogTitle>
        <form onSubmit={handleSubmitResultado}>
          <DialogContent sx={{ mt: 2 }}>
            {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            
            {/* Selector de modo */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" sx={{ mb: 2, color: 'primary.main' }}>
                Modalidad de Carga
              </Typography>
              <ToggleButtonGroup
                value={modoResultado}
                exclusive
                onChange={handleModoResultadoChange}
                aria-label="modo de carga"
                fullWidth
              >
                <ToggleButton value="escuela" aria-label="por escuela">
                  <School sx={{ mr: 1 }} />
                  Por Escuela/Mesa
                </ToggleButton>
                <ToggleButton value="subcircuito" aria-label="por subcircuito">
                  <TableChart sx={{ mr: 1 }} />
                  Por Subcircuito
                </ToggleButton>
              </ToggleButtonGroup>
            </Box>

            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={esLocale}>
                  <DatePicker
                    label="Fecha de la Elección"
                    value={resultadoForm.fecha}
                    onChange={(newValue) => handleResultadoChange("fecha", newValue)}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        required: true
                      }
                    }}
                  />
                </LocalizationProvider>
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth required>
                  <InputLabel>Tipo de Elección</InputLabel>
                  <Select
                    value={resultadoForm.id_tipo_eleccion}
                    onChange={(e) => handleResultadoChange("id_tipo_eleccion", e.target.value)}
                    label="Tipo de Elección"
                  >
                    {TIPOS_ELECCION.map((tipo) => (
                      <MenuItem key={tipo.value} value={tipo.value}>
                        {tipo.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Campos para modo escuela */}
              {modoResultado === "escuela" && (
                <>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth required>
                      <InputLabel>Escuela</InputLabel>
                      <Select
                        value={resultadoForm.id_escuela}
                        onChange={(e) => handleResultadoChange('id_escuela', e.target.value)}
                        label="Escuela"
                      >
                        {escuelas.map((escuela) => (
                          <MenuItem key={escuela.id} value={escuela.id}>
                            {escuela.nombre}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth required>
                      <InputLabel>Mesa</InputLabel>
                      <Select
                        value={resultadoForm.id_mesa}
                        onChange={(e) => handleResultadoChange('id_mesa', e.target.value)}
                        label="Mesa"
                        disabled={!resultadoForm.id_escuela}
                      >
                        {mesas.map((mesa) => (
                          <MenuItem key={mesa.id} value={mesa.id}>
                            Mesa {mesa.numero_mesa || mesa.id}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                </>
              )}

              {/* Campos para modo subcircuito */}
              {modoResultado === "subcircuito" && (
                <>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth required>
                      <InputLabel>Seccional</InputLabel>
                      <Select
                        value={resultadoForm.numero_seccional}
                        onChange={(e) => {
                          handleResultadoChange('numero_seccional', e.target.value);
                          // Limpiar subcircuito cuando cambia seccional
                          handleResultadoChange('subcircuito', '');
                        }}
                        label="Seccional"
                      >
                        {seccionales.map((seccional) => (
                          <MenuItem key={seccional.numero} value={seccional.numero}>
                            {seccional.nombre}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth required>
                      <InputLabel>Subcircuito</InputLabel>
                      <Select
                        value={resultadoForm.subcircuito}
                        onChange={(e) => handleResultadoChange('subcircuito', e.target.value)}
                        label="Subcircuito"
                        disabled={!resultadoForm.numero_seccional}
                      >
                        {subcircuitos.map((sub) => (
                          <MenuItem key={sub.subcircuito} value={sub.subcircuito}>
                            {sub.subcircuito === "Sin letra" ? "Sin letra" : `Subcircuito ${sub.subcircuito}`}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                </>
              )}

              <Grid item xs={12} md={6}>
                <TextField
                  label="Total de Electores en Padrón"
                  type="number"
                  value={resultadoForm.total_electores_padron}
                  onChange={(e) => {
                    const value = Math.max(0, Number(e.target.value));
                    handleResultadoChange("total_electores_padron", value);
                  }}
                  fullWidth
                  required
                  inputProps={{ min: 0 }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Assessment />
                      </InputAdornment>
                    ),
                  }}
                  helperText="Número total de electores habilitados para votar"
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  label="Total de Votantes"
                  type="number"
                  value={resultadoForm.total_votantes}
                  onChange={(e) => {
                    const value = Math.max(0, Number(e.target.value));
                    // Validar que no sea mayor al padrón
                    if (resultadoForm.total_electores_padron && value > resultadoForm.total_electores_padron) {
                      setError("El total de votantes no puede ser mayor al total de electores en padrón");
                      return;
                    }
                    handleResultadoChange("total_votantes", value);
                  }}
                  fullWidth
                  required
                  inputProps={{ 
                    min: 0, 
                    max: resultadoForm.total_electores_padron || undefined 
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <HowToVote />
                      </InputAdornment>
                    ),
                  }}
                  helperText={`Número de personas que efectivamente votaron${resultadoForm.total_electores_padron ? ` (máx: ${resultadoForm.total_electores_padron})` : ''}`}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  label="Frente Cívico"
                  type="number"
                  value={resultadoForm.votos_por_lista.frente_civico}
                  onChange={(e) => handleListaChange("frente_civico", e.target.value)}
                  fullWidth
                  required
                  inputProps={{ min: 0 }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Peronismo"
                  type="number"
                  value={resultadoForm.votos_por_lista.peronismo}
                  onChange={(e) => handleListaChange("peronismo", e.target.value)}
                  fullWidth
                  required
                  inputProps={{ min: 0 }}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  label="Votos Otros (Calculado Automáticamente)"
                  type="number"
                  value={resultadoForm.votos_por_lista.otro}
                  InputProps={{ 
                    readOnly: true,
                    startAdornment: (
                      <InputAdornment position="start">
                        <Assessment />
                      </InputAdornment>
                    ),
                  }}
                  fullWidth
                  sx={{ backgroundColor: "#f5f5f5" }}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  label="Votos Nulos"
                  type="number"
                  value={resultadoForm.total_nulos}
                  onChange={(e) => handleResultadoChange("total_nulos", e.target.value)}
                  fullWidth
                  required
                  inputProps={{ min: 0 }}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  label="Votos en Blanco"
                  type="number"
                  value={resultadoForm.total_blancos}
                  onChange={(e) => handleResultadoChange("total_blancos", e.target.value)}
                  fullWidth
                  required
                  inputProps={{ min: 0 }}
                />
              </Grid>
              
              {/* Mostrar validación de suma */}
              {resultadoForm.votos_por_lista.frente_civico !== "" &&
               resultadoForm.votos_por_lista.peronismo !== "" &&
               resultadoForm.total_nulos !== "" &&
               resultadoForm.total_blancos !== "" && (
                <Grid item xs={12}>
                  <Alert 
                    severity={validarSumaVotos() ? "success" : "error"}
                    icon={validarSumaVotos() ? <CheckCircle /> : <ErrorIcon />}
                  >
                    <Typography variant="body2">
                      <strong>Validación:</strong> Suma total: {(parseInt(resultadoForm.votos_por_lista.frente_civico) || 0) + 
                                   (parseInt(resultadoForm.votos_por_lista.peronismo) || 0) + 
                                   (parseInt(resultadoForm.votos_por_lista.otro) || 0) + 
                                   (parseInt(resultadoForm.total_nulos) || 0) + 
                                   (parseInt(resultadoForm.total_blancos) || 0)} / Total votantes: {resultadoForm.total_votantes}
                      {validarSumaVotos() ? " ✓ Coincide correctamente" : " ✗ No coincide"}
                    </Typography>
                  </Alert>
                </Grid>
              )}
            </Grid>
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button onClick={handleCloseDialog} disabled={loading}>
              Cancelar
            </Button>
            <Button 
              type="submit" 
              variant="contained" 
              disabled={loading || !validarSumaVotos() || 
                        !resultadoForm.votos_por_lista.frente_civico || 
                        !resultadoForm.votos_por_lista.peronismo || 
                        !resultadoForm.total_nulos || 
                        !resultadoForm.total_blancos}
              startIcon={<Save />}
            >
              {loading ? 'Guardando...' : 'Guardar Resultado'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default HomePage;
