import React, { useEffect, useState } from "react";
import {
  Typography, Paper, Box, Button, TextField, Divider, MenuItem, FormControl, InputLabel, Select, Alert, ToggleButton, ToggleButtonGroup,
  Card, CardContent, Grid, Stepper, Step, StepLabel, Chip, Table, TableHead, TableRow, TableCell, TableBody, TableContainer,
  IconButton, Tooltip, InputAdornment
} from "@mui/material";
import {
  HowToVote,
  School,
  AccountBalance,
  Add,
  Save,
  Refresh,
  Assessment,
  TableChart,
  LocationOn,
  DateRange,
  CheckCircle,
  Error as ErrorIcon
} from '@mui/icons-material';
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import esLocale from "date-fns/locale/es";
import apiService from "../services/apiService";
import * as subcircuitosService from "../services/subcircuitosService";

const LISTAS_DEFAULT = [
  { codigo: "frente_civico", nombre_lista: "Frente Civico" },
  { codigo: "peronismo", nombre_lista: "Peronismo" },
  { codigo: "otro", nombre_lista: "Otro" }
];

const TIPOS_ELECCION = [
  { value: "1", label: "Vecinal" },
  { value: "2", label: "Municipal" },
  { value: "3", label: "Provincial" },
  { value: "4", label: "Nacional" }
];

const CargarResultadosPage = () => {
  // Estados principales
  const [modo, setModo] = useState("escuela"); // "escuela" o "subcircuito"
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [etapa, setEtapa] = useState(1);

  // Estados para modo "Por Escuela"
  const [escuelas, setEscuelas] = useState([]);
  const [mesas, setMesas] = useState([]);
  const [resultados, setResultados] = useState([]);

  // Estados para modo "Por Subcircuito"
  const [seccionales, setSeccionales] = useState([]);
  const [subcircuitos, setSubcircuitos] = useState([]);
  const [resultadosSubcircuito, setResultadosSubcircuito] = useState([]);

  // Estado del formulario
  const [formulario, setFormulario] = useState({
    fecha: null,
    id_tipo_eleccion: "",
    // Para modo escuela
    id_escuela: "",
    id_mesa: "",
    // Para modo subcircuito
    numero_seccional: "",
    subcircuito: "",
    // Común
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

  // Cargar datos iniciales según el modo
  useEffect(() => {
    if (modo === "escuela") {
      cargarEscuelas();
    } else {
      cargarSeccionales();
    }
  }, [modo]);

  const cargarEscuelas = async () => {
    try {
      const data = await apiService.getEscuelas();
      setEscuelas(Array.isArray(data) ? data : (Array.isArray(data.escuelas) ? data.escuelas : []));
    } catch (err) {
      console.error("Error al cargar escuelas:", err);
      setError(`Error al cargar escuelas: ${err.message}`);
      setEscuelas([]);
    }
  };

  const cargarSeccionales = async () => {
    try {
      const data = await subcircuitosService.getSeccionales();
      setSeccionales(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error al cargar seccionales:", err);
      setError(`Error al cargar seccionales: ${err.message}`);
      setSeccionales([]);
    }
  };

  // Cargar mesas cuando se selecciona una escuela
  useEffect(() => {
    if (modo === "escuela" && formulario.id_escuela) {
      apiService.getMesas(formulario.id_escuela)
        .then(data => {
          setMesas(Array.isArray(data) ? data : []);
          console.log("Mesas recibidas:", data);
        })
        .catch(err => {
          console.error("Error al cargar mesas:", err);
          setError(`Error al cargar mesas: ${err.message}`);
          setMesas([]);
        });
    } else {
      setMesas([]);
    }
  }, [formulario.id_escuela, modo]);

  // Cargar subcircuitos cuando se selecciona una seccional
  useEffect(() => {
    if (modo === "subcircuito" && formulario.numero_seccional) {
      subcircuitosService.getSubcircuitosBySeccional(formulario.numero_seccional)
        .then(data => {
          setSubcircuitos(Array.isArray(data) ? data : []);
          console.log("Subcircuitos recibidos:", data);
        })
        .catch(err => {
          console.error("Error al cargar subcircuitos:", err);
          setError(`Error al cargar subcircuitos: ${err.message}`);
          setSubcircuitos([]);
        });
    } else {
      setSubcircuitos([]);
    }
  }, [formulario.numero_seccional, modo]);

  // Cargar resultados existentes
  useEffect(() => {
    if (modo === "escuela" && formulario.id_escuela) {
      apiService.getResultados(formulario.id_escuela)
        .then(data => setResultados(Array.isArray(data) ? data : []))
        .catch(err => {
          console.error("Error al cargar resultados:", err);
          setError(`Error al cargar resultados: ${err.message}`);
          setResultados([]);
        });
    } else if (modo === "subcircuito" && formulario.numero_seccional) {
      subcircuitosService.getResultadosSubcircuito(formulario.numero_seccional)
        .then(data => setResultadosSubcircuito(Array.isArray(data) ? data : []))
        .catch(err => {
          console.error("Error al cargar resultados de subcircuito:", err);
          setError(`Error al cargar resultados de subcircuito: ${err.message}`);
          setResultadosSubcircuito([]);
        });
    } else {
      setResultados([]);
      setResultadosSubcircuito([]);
    }
  }, [formulario.id_escuela, formulario.numero_seccional, modo, success]);

  // Calcula votos "otro" automáticamente
  useEffect(() => {
    if (
      etapa === 2 &&
      formulario.total_votantes &&
      formulario.votos_por_lista.frente_civico !== "" &&
      formulario.votos_por_lista.peronismo !== "" &&
      formulario.total_nulos !== "" &&
      formulario.total_blancos !== ""
    ) {
      const totalVotantes = parseInt(formulario.total_votantes) || 0;
      const frenteCivico = parseInt(formulario.votos_por_lista.frente_civico) || 0;
      const peronismo = parseInt(formulario.votos_por_lista.peronismo) || 0;
      const nulos = parseInt(formulario.total_nulos) || 0;
      const blancos = parseInt(formulario.total_blancos) || 0;
      const votosOtro = totalVotantes - (frenteCivico + peronismo + nulos + blancos);
      setFormulario((prev) => ({
        ...prev,
        votos_por_lista: {
          ...prev.votos_por_lista,
          otro: votosOtro > 0 ? votosOtro : 0
        }
      }));
    }
  }, [
    etapa,
    formulario.total_votantes,
    formulario.votos_por_lista.frente_civico,
    formulario.votos_por_lista.peronismo,
    formulario.total_nulos,
    formulario.total_blancos
  ]);

  // Manejo de cambios
  const handleChange = (field, value) => {
    setFormulario((prev) => ({
      ...prev,
      [field]: value
    }));
    // Limpiar errores cuando el usuario empiece a escribir
    if (error) setError("");
  };

  const handleListaChange = (codigo, value) => {
    setFormulario((prev) => ({
      ...prev,
      votos_por_lista: {
        ...prev.votos_por_lista,
        [codigo]: value
      }
    }));
    if (error) setError("");
  };

  const handleModoChange = (event, newModo) => {
    if (newModo !== null) {
      setModo(newModo);
      // Resetear formulario al cambiar de modo
      setFormulario({
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
      setEtapa(1);
      setError("");
      setSuccess("");
    }
  };

  // Validación para avanzar de etapa
  const puedeAvanzarEtapa1 = () => {
    const base = formulario.fecha && formulario.id_tipo_eleccion && formulario.total_votantes && formulario.total_electores_padron;
    if (modo === "escuela") {
      return base && formulario.id_escuela && formulario.id_mesa;
    } else {
      return base && formulario.numero_seccional && formulario.subcircuito;
    }
  };

  const puedeAvanzarEtapa2 =
    formulario.votos_por_lista.frente_civico !== "" &&
    formulario.votos_por_lista.peronismo !== "" &&
    formulario.total_nulos !== "" &&
    formulario.total_blancos !== "";

  // Validación de suma de votos
  const validarSumaVotos = () => {
    const totalVotantes = parseInt(formulario.total_votantes) || 0;
    const frenteCivico = parseInt(formulario.votos_por_lista.frente_civico) || 0;
    const peronismo = parseInt(formulario.votos_por_lista.peronismo) || 0;
    const otro = parseInt(formulario.votos_por_lista.otro) || 0;
    const nulos = parseInt(formulario.total_nulos) || 0;
    const blancos = parseInt(formulario.total_blancos) || 0;
    const suma = frenteCivico + peronismo + otro + nulos + blancos;
    
    return suma === totalVotantes;
  };

  // Envío de datos
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Validar suma de votos antes de enviar
    if (!validarSumaVotos()) {
      const totalVotantes = parseInt(formulario.total_votantes) || 0;
      const suma = (parseInt(formulario.votos_por_lista.frente_civico) || 0) + 
                   (parseInt(formulario.votos_por_lista.peronismo) || 0) + 
                   (parseInt(formulario.votos_por_lista.otro) || 0) + 
                   (parseInt(formulario.total_nulos) || 0) + 
                   (parseInt(formulario.total_blancos) || 0);
      setError(`La suma de votos (${suma}) no coincide con el total de votantes (${totalVotantes})`);
      return;
    }

    const basePayload = {
      fecha: formulario.fecha ? formulario.fecha.toISOString().split("T")[0] : "",
      id_tipo_eleccion: parseInt(formulario.id_tipo_eleccion),
      total_votantes: parseInt(formulario.total_votantes) || 0,
      frente_civico: parseInt(formulario.votos_por_lista.frente_civico) || 0,
      peronismo: parseInt(formulario.votos_por_lista.peronismo) || 0,
      otro: parseInt(formulario.votos_por_lista.otro) || 0,
      total_nulos: parseInt(formulario.total_nulos) || 0,
      total_blancos: parseInt(formulario.total_blancos) || 0
    };

    let payload;
    if (modo === "escuela") {
      payload = {
        ...basePayload,
        total_electores_padron: parseInt(formulario.total_electores_padron) || 0,
        id_escuela: parseInt(formulario.id_escuela),
        id_mesa: parseInt(formulario.id_mesa)
      };
    } else {
      payload = {
        ...basePayload,
        total_electores_padron: parseInt(formulario.total_electores_padron) || 0,
        numero_seccional: parseInt(formulario.numero_seccional),
        subcircuito: formulario.subcircuito
      };
    }

    console.log("Enviando payload:", payload);

    try {
      let data;
      if (modo === "escuela") {
        data = await apiService.crearResultado(payload);
      } else {
        data = await subcircuitosService.createResultadoSubcircuito(payload);
      }
      console.log("Respuesta del servidor:", data);
      
      setSuccess(`Resultado cargado correctamente ${modo === "escuela" ? "por escuela" : "por subcircuito"}`);
      // Resetear formulario
      setFormulario({
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
      setEtapa(1);
    } catch (error) {
      console.error("Error al enviar resultado:", error);
      setError(error.message || "Error al guardar el resultado");
    }
  };

  const eliminarResultado = async (id) => {
    if (!window.confirm("¿Seguro que desea eliminar este resultado?")) return;
    
    try {
      if (modo === "escuela") {
        await apiService.eliminarResultado(id);
        setResultados(resultados.filter(r => r.id !== id));
      } else {
        await subcircuitosService.deleteResultadoSubcircuito(id);
        setResultadosSubcircuito(resultadosSubcircuito.filter(r => r.id !== id));
      }
      setSuccess("Resultado eliminado correctamente");
    } catch (err) {
      console.error("Error al eliminar:", err);
      setError(err.message || "Error al eliminar el resultado");
    }
  };

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
          <HowToVote fontSize="large" />
          Cargar Resultados Electorales
        </Typography>
        <Typography variant="body1" color="textSecondary">
          Sistema de carga de resultados por escuela/mesa o por subcircuito
        </Typography>
      </Box>
      
      {error && (
        <Alert 
          severity="error" 
          sx={{ mb: 3 }} 
          onClose={() => setError("")}
          icon={<ErrorIcon />}
        >
          {error}
        </Alert>
      )}
      
      {success && (
        <Alert 
          severity="success" 
          sx={{ mb: 3 }} 
          onClose={() => setSuccess("")}
          icon={<CheckCircle />}
        >
          {success}
        </Alert>
      )}

      

      {/* Selector de modo mejorado */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Typography variant="h6" sx={{ mb: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
              <HowToVote color="primary" />
              Seleccionar Modo de Carga
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Selecciona el modo de carga de resultados según el tipo de elección
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
            <ToggleButtonGroup
              value={modo}
              exclusive
              onChange={handleModoChange}
              aria-label="modo de carga"
              sx={{ boxShadow: 1 }}
            >
              <ToggleButton 
                value="escuela" 
                aria-label="por escuela"
                sx={{ 
                  px: 4, 
                  py: 2,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 1,
                  minWidth: 160
                }}
              >
                <School fontSize="small" />
                Por Escuela/Mesa
              </ToggleButton>
              <ToggleButton 
                value="subcircuito" 
                aria-label="por subcircuito"
                sx={{ 
                  px: 4, 
                  py: 2,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 1,
                  minWidth: 160
                }}
              >
                <LocationOn fontSize="small" />
                Por Subcircuito
              </ToggleButton>
            </ToggleButtonGroup>
          </Box>

          <Alert 
            severity="info" 
            sx={{ maxWidth: 600, mx: 'auto' }}
            icon={modo === "escuela" ? <School /> : <LocationOn />}
          >
            {modo === "escuela" 
              ? "Modo actual: Carga por escuela/mesa (elecciones recientes y organizadas por mesas)" 
              : "Modo actual: Carga por subcircuito (elecciones históricas organizadas por subcircuitos)"}
          </Alert>
        </CardContent>
      </Card>

      {/* Stepper para mostrar progreso */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Stepper activeStep={etapa - 1} alternativeLabel>
            <Step>
              <StepLabel>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <DateRange fontSize="small" />
                  Datos Generales
                </Box>
              </StepLabel>
            </Step>
            <Step>
              <StepLabel>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Assessment fontSize="small" />
                  Votos por Lista
                </Box>
              </StepLabel>
            </Step>
            <Step>
              <StepLabel>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CheckCircle fontSize="small" />
                  Confirmación
                </Box>
              </StepLabel>
            </Step>
          </Stepper>
        </CardContent>
      </Card>

      {/* Formulario principal */}
      <Card sx={{ maxWidth: 800, mx: "auto" }}>
        <Box sx={{ 
          p: 3, 
          backgroundColor: 'primary.main', 
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          gap: 1
        }}>
          {etapa === 1 && <DateRange />}
          {etapa === 2 && <Assessment />}
          {etapa === 3 && <CheckCircle />}
          <Typography variant="h6" fontWeight={600}>
            {etapa === 1 && "Etapa 1: Datos Generales"}
            {etapa === 2 && "Etapa 2: Votos por Lista"}
            {etapa === 3 && "Etapa 3: Confirmación"}
          </Typography>
        </Box>

        <CardContent sx={{ p: 4 }}>
          <form onSubmit={handleSubmit}>
            {/* ETAPA 1 */}
            {etapa === 1 && (
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <DateRange color="primary" />
                    Datos Generales de la Elección
                  </Typography>
                </Grid>

                <Grid item xs={12} md={6}>
                  <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={esLocale}>
                    <DatePicker
                      label="Fecha de la Elección"
                      value={formulario.fecha}
                      onChange={(newValue) => handleChange("fecha", newValue)}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          required: true,
                          InputProps: {
                            startAdornment: (
                              <InputAdornment position="start">
                                <DateRange />
                              </InputAdornment>
                            ),
                          }
                        }
                      }}
                    />
                  </LocalizationProvider>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth required>
                    <InputLabel id="tipo-eleccion-label">Tipo de Elección</InputLabel>
                    <Select
                      labelId="tipo-eleccion-label"
                      value={formulario.id_tipo_eleccion}
                      label="Tipo de Elección"
                      onChange={e => handleChange("id_tipo_eleccion", e.target.value)}
                      startAdornment={<HowToVote sx={{ mr: 1, color: 'action.active' }} />}
                    >
                      <MenuItem value="">Seleccione</MenuItem>
                      {TIPOS_ELECCION.map(tipo => (
                        <MenuItem key={tipo.value} value={tipo.value}>{tipo.label}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>                
                {/* Campos específicos para cada modo */}
                {modo === "escuela" ? (
                  <>
                    <Grid item xs={12} md={6}>
                      <FormControl fullWidth required>
                        <InputLabel id="escuela-label">Escuela</InputLabel>
                        <Select
                          labelId="escuela-label"
                          value={formulario.id_escuela}
                          label="Escuela"
                          onChange={e => handleChange("id_escuela", e.target.value)}
                          startAdornment={<School sx={{ mr: 1, color: 'action.active' }} />}
                        >
                          <MenuItem value="">Seleccione una escuela</MenuItem>
                          {escuelas.map(e => (
                            <MenuItem key={e.id} value={e.id}>{e.nombre}</MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                      <FormControl fullWidth required>
                        <InputLabel id="mesa-label">Mesa</InputLabel>
                        <Select
                          labelId="mesa-label"
                          value={formulario.id_mesa}
                          label="Mesa"
                          onChange={e => handleChange("id_mesa", e.target.value)}
                          disabled={!formulario.id_escuela}
                          startAdornment={<TableChart sx={{ mr: 1, color: 'action.active' }} />}
                        >
                          <MenuItem value="">Seleccione una mesa</MenuItem>
                          {mesas.map(m => (
                            <MenuItem key={m.id} value={m.id}>
                              {m.numero_mesa !== undefined && m.numero_mesa !== null
                                ? `Mesa ${String(m.numero_mesa).padStart(3, '0')}`
                                : `Mesa ${m.id}`}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                  </>
                ) : (
                  <>
                    <Grid item xs={12} md={6}>
                      <FormControl fullWidth required>
                        <InputLabel id="seccional-label">Seccional</InputLabel>
                        <Select
                          labelId="seccional-label"
                          value={formulario.numero_seccional}
                          label="Seccional"
                          onChange={e => handleChange("numero_seccional", e.target.value)}
                          startAdornment={<LocationOn sx={{ mr: 1, color: 'action.active' }} />}
                        >
                          <MenuItem value="">Seleccione una seccional</MenuItem>
                          {seccionales.map(s => (
                            <MenuItem key={s.numero} value={s.numero}>{s.nombre}</MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                      <FormControl fullWidth required>
                        <InputLabel id="subcircuito-label">Subcircuito</InputLabel>
                        <Select
                          labelId="subcircuito-label"
                          value={formulario.subcircuito}
                          label="Subcircuito"
                          onChange={e => handleChange("subcircuito", e.target.value)}
                          disabled={!formulario.numero_seccional}
                          startAdornment={<AccountBalance sx={{ mr: 1, color: 'action.active' }} />}
                        >
                          <MenuItem value="">Seleccione un subcircuito</MenuItem>
                          {subcircuitos.map(sc => (
                            <MenuItem key={sc.subcircuito} value={sc.subcircuito}>
                              {sc.subcircuito === "Sin letra" ? "Sin letra" : `Subcircuito ${sc.subcircuito}`}
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
                    name="total_electores_padron"
                    type="number"
                    fullWidth
                    value={formulario.total_electores_padron}
                    onChange={e => {
                      const value = Math.max(0, Number(e.target.value));
                      handleChange("total_electores_padron", value);
                    }}
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
                    name="total_votantes"
                    type="number"
                    fullWidth
                    value={formulario.total_votantes}
                    onChange={e => {
                      const value = Math.max(0, Number(e.target.value));
                      // Validar que no sea mayor al padrón
                      if (formulario.total_electores_padron && value > formulario.total_electores_padron) {
                        setError("El total de votantes no puede ser mayor al total de electores en padrón");
                        return;
                      }
                      handleChange("total_votantes", value);
                    }}
                    required
                    inputProps={{ 
                      min: 0, 
                      max: formulario.total_electores_padron || undefined 
                    }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <HowToVote />
                        </InputAdornment>
                      ),
                    }}
                    helperText={`Número de personas que efectivamente votaron${formulario.total_electores_padron ? ` (máx: ${formulario.total_electores_padron})` : ''}`}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                    <Button
                      variant="contained"
                      color="primary"
                      disabled={!puedeAvanzarEtapa1()}
                      onClick={e => {
                        e.preventDefault();
                        setEtapa(2);
                      }}
                      startIcon={<Assessment />}
                      sx={{ minWidth: 200 }}
                    >
                      Siguiente: Votos por Lista
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            )}

            {/* ETAPA 2 */}
            {etapa === 2 && (
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Assessment color="primary" />
                    Votos por Lista y Detalles
                  </Typography>
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    label="Frente Cívico"
                    name="votos_frente_civico"
                    type="number"
                    fullWidth
                    value={formulario.votos_por_lista.frente_civico}
                    onChange={e => handleListaChange("frente_civico", e.target.value)}
                    required
                    inputProps={{ min: 0 }}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    label="Peronismo"
                    name="votos_peronismo"
                    type="number"
                    fullWidth
                    value={formulario.votos_por_lista.peronismo}
                    onChange={e => handleListaChange("peronismo", e.target.value)}
                    required
                    inputProps={{ min: 0 }}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    label="Votos Nulos"
                    name="total_nulos"
                    type="number"
                    fullWidth
                    value={formulario.total_nulos}
                    onChange={e => handleChange("total_nulos", e.target.value)}
                    required
                    inputProps={{ min: 0 }}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    label="Votos en Blanco"
                    name="total_blancos"
                    type="number"
                    fullWidth
                    value={formulario.total_blancos}
                    onChange={e => handleChange("total_blancos", e.target.value)}
                    required
                    inputProps={{ min: 0 }}
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    label="Votos Otros (Calculado Automáticamente)"
                    name="votos_otro"
                    type="number"
                    fullWidth
                    value={formulario.votos_por_lista.otro}
                    InputProps={{ 
                      readOnly: true,
                      startAdornment: (
                        <InputAdornment position="start">
                          <Assessment />
                        </InputAdornment>
                      ),
                    }}
                    sx={{ backgroundColor: "#f5f5f5" }}
                  />
                </Grid>
                
                {/* Mostrar validación de suma */}
                {puedeAvanzarEtapa2 && (
                  <Grid item xs={12}>
                    <Alert 
                      severity={validarSumaVotos() ? "success" : "error"}
                      icon={validarSumaVotos() ? <CheckCircle /> : <ErrorIcon />}
                    >
                      <Typography variant="body2">
                        <strong>Validación:</strong> Suma total: {(parseInt(formulario.votos_por_lista.frente_civico) || 0) + 
                                     (parseInt(formulario.votos_por_lista.peronismo) || 0) + 
                                     (parseInt(formulario.votos_por_lista.otro) || 0) + 
                                     (parseInt(formulario.total_nulos) || 0) + 
                                     (parseInt(formulario.total_blancos) || 0)} / Total votantes: {formulario.total_votantes}
                        {validarSumaVotos() ? " ✓ Coincide correctamente" : " ✗ No coincide"}
                      </Typography>
                    </Alert>
                  </Grid>
                )}
                
                <Grid item xs={12}>
                  <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
                    <Button
                      variant="outlined"
                      color="secondary"
                      fullWidth
                      onClick={() => setEtapa(1)}
                      startIcon={<Refresh />}
                    >
                      Volver
                    </Button>
                    <Button
                      type="submit"
                      variant="contained"
                      color="primary"
                      fullWidth
                      disabled={!puedeAvanzarEtapa2 || !validarSumaVotos()}
                      startIcon={<Save />}
                    >
                      Guardar Resultado
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            )}
          </form>
        </CardContent>
      </Card>

      {/* Resultados existentes */}
      <Card sx={{ mt: 4 }}>
        <Box sx={{ 
          p: 3, 
          backgroundColor: 'secondary.main', 
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          gap: 1
        }}>
          <Assessment />
          <Typography variant="h6" fontWeight={600}>
            Resultados Cargados {modo === "escuela" ? "para esta Escuela" : "para esta Seccional"}
          </Typography>
        </Box>
        
        <CardContent>
          {modo === "escuela" ? (
            resultados.length === 0 ? (
              <Alert severity="info">No hay resultados cargados para esta escuela.</Alert>
            ) : (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: 'grey.50' }}>
                      <TableCell sx={{ fontWeight: 'bold' }}>Mesa</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Electores Padrón</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Votantes</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>% Participación</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>F.C.</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Peronismo</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Otro</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Nulos</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Blancos</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Acciones</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {resultados.map(r => (
                      <TableRow key={r.id} hover>
                        <TableCell>
                          <Chip 
                            label={r.numero_mesa || r.id_mesa} 
                            color="primary" 
                            size="small" 
                            disabled={true}
                            onClick={() => {}}
                          />
                        </TableCell>
                        <TableCell>{r.total_electores_padron || 'N/A'}</TableCell>
                        <TableCell>{r.total_votantes}</TableCell>
                        <TableCell>
                          <Chip 
                            label={r.total_electores_padron ? `${((r.total_votantes / r.total_electores_padron) * 100).toFixed(1)}%` : 'N/A'}
                            color={r.total_electores_padron && (r.total_votantes / r.total_electores_padron) > 0.7 ? 'success' : 'warning'}
                            size="small"
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell>{r.frente_civico}</TableCell>
                        <TableCell>{r.peronismo}</TableCell>
                        <TableCell>{r.otro}</TableCell>
                        <TableCell>{r.total_nulos}</TableCell>
                        <TableCell>{r.total_blancos}</TableCell>
                        <TableCell>
                          <Tooltip title="Eliminar resultado">
                            <IconButton 
                              color="error" 
                              size="small" 
                              onClick={() => eliminarResultado(r.id)}
                            >
                              <ErrorIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )
          ) : (
            resultadosSubcircuito.length === 0 ? (
              <Alert severity="info">No hay resultados cargados para esta seccional.</Alert>
            ) : (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: 'grey.50' }}>
                      <TableCell sx={{ fontWeight: 'bold' }}>Seccional</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Subcircuito</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Fecha</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Electores Padrón</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Votantes</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>% Participación</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>F.C.</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Peronismo</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Otro</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Nulos</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Blancos</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Acciones</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {resultadosSubcircuito.map(r => (
                      <TableRow key={r.id} hover>
                        <TableCell>{r.seccional_nombre}</TableCell>
                        <TableCell>
                          <Chip 
                            label={r.subcircuito_nombre} 
                            color="secondary" 
                            size="small" 
                            disabled={true}
                            onClick={() => {}}
                          />
                        </TableCell>
                        <TableCell>{r.fecha}</TableCell>
                        <TableCell>{r.total_electores_padron || 'N/A'}</TableCell>
                        <TableCell>{r.total_votantes}</TableCell>
                        <TableCell>
                          <Chip 
                            label={r.total_electores_padron ? `${((r.total_votantes / r.total_electores_padron) * 100).toFixed(1)}%` : 'N/A'}
                            color={r.total_electores_padron && (r.total_votantes / r.total_electores_padron) > 0.7 ? 'success' : 'warning'}
                            size="small"
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell>{r.frente_civico}</TableCell>
                        <TableCell>{r.peronismo}</TableCell>
                        <TableCell>{r.otro}</TableCell>
                        <TableCell>{r.total_nulos}</TableCell>
                        <TableCell>{r.total_blancos}</TableCell>
                        <TableCell>
                          <Tooltip title="Eliminar resultado">
                            <IconButton 
                              color="error" 
                              size="small" 
                              onClick={() => eliminarResultado(r.id)}
                            >
                              <ErrorIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default CargarResultadosPage;
