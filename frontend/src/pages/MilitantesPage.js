import React, { useCallback, useMemo, useState } from "react";
import { 
  Typography, Paper, Box, Button, TextField, Table, TableHead, TableRow, TableCell, TableBody, 
  Dialog, DialogTitle, DialogContent, DialogActions, MenuItem, Alert, IconButton, Chip,
  Card, CardContent, Grid, InputAdornment, TableContainer, Tooltip, Select, FormControl, InputLabel,
  CircularProgress, Pagination, Autocomplete
} from "@mui/material";
import {
  People as PeopleIcon,
  Search as SearchIcon,
  FileDownload as FileDownloadIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Person as PersonIcon,
  LocationOn as LocationOnIcon,
  Work as WorkIcon,
  Cake as CakeIcon,
  Phone as PhoneIcon,
  Instagram as InstagramIcon
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { saveAs } from 'file-saver';
import * as XLSX from "xlsx";
import { getMilitantes, createMilitante, updateMilitante, deleteMilitante } from "../services/militantesService";
import { getBarrios } from "../services/barriosService";
import { PermissionButton, PermissionIconButton } from '../components/PermissionComponents';
import { useCachedData, useCacheInvalidation } from '../hooks/useCachedData';

// Configuración optimizada
const ITEMS_PER_PAGE = 25;
const CATEGORIAS_MILITANTES = Object.freeze([
  "juventud", "mayores", "encargado de escuela", "dirigente"
]);

const DEPENDENCIAS = Object.freeze([
  "Concejo", "Legislatura", "Tribunal de cuentas Muni", 
  "Tribunal de cuentas Prov", "Municipalidad", "Provincia", "Senado"
]);

const TIPOS_TRABAJO = Object.freeze([
  "Planta Permanente", "Cargo Politico", "Monotributo", "Beca"
]);

const MilitantesPage = React.memo(() => {
  // Usar hooks optimizados para cache
  const { 
    data: militantes, 
    loading: loadingMilitantes, 
    error: errorMilitantes,
    refetch: refetchMilitantes 
  } = useCachedData('militantes', getMilitantes);

  const { 
    data: barrios, 
    loading: loadingBarrios 
  } = useCachedData('barrios', getBarrios);

  const invalidateRelatedCaches = useCacheInvalidation();

  // Estados locales
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [error, setError] = useState("");

  // Estados del formulario
  const [form, setForm] = useState({
    nombre: "",
    apellido: "",
    fecha_nacimiento: "",
    edad: "",
    telefono: "",
    instagram: "",
    categoria: "",
    id_barrio: "",
    trabaja: "",
    dependencia: "",
    tipo_trabajo: ""
  });

  // Estados para filtros y búsqueda
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategoria, setSelectedCategoria] = useState("");
  const [selectedBarrio, setSelectedBarrio] = useState("");
  const [selectedTrabaja, setSelectedTrabaja] = useState("");
  const [selectedSeccional, setSelectedSeccional] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // Loading global
  const loading = loadingMilitantes || loadingBarrios;

  // Función para capitalizar texto
  const capitalizar = useCallback((texto) => {
    if (!texto || typeof texto !== 'string') return "";
    return texto.charAt(0).toUpperCase() + texto.slice(1).toLowerCase();
  }, []);

  // Calcular edad y determinar categoría automáticamente
  const calcularEdadYCategoria = useCallback((fechaNacimiento) => {
    if (!fechaNacimiento) return { edad: null, categoria: "" };
    
    const today = new Date();
    const birthDate = new Date(fechaNacimiento);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    const categoria = age > 35 ? "mayores" : "juventud";
    
    return { edad: age, categoria };
  }, []);

  // Filtrar militantes optimizado
  const filteredMilitantes = useMemo(() => {
    if (!militantes || !Array.isArray(militantes)) return [];
    let filtered = [...militantes];

    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(militante => 
        militante.nombre?.toLowerCase().includes(search) ||
        militante.apellido?.toLowerCase().includes(search) ||
        militante.telefono?.includes(search) ||
        militante.instagram?.toLowerCase().includes(search)
      );
    }

    if (selectedCategoria) {
      filtered = filtered.filter(militante => militante.categoria === selectedCategoria);
    }

    if (selectedBarrio) {
      filtered = filtered.filter(militante => militante.id_barrio === parseInt(selectedBarrio));
    }

    if (selectedTrabaja) {
      filtered = filtered.filter(militante => militante.trabaja === selectedTrabaja);
    }

    if (selectedSeccional) {
      filtered = filtered.filter(militante => {
        const barrio = (barrios || []).find(b => b.id === militante.id_barrio);
        return barrio?.seccional_nombre?.includes(selectedSeccional);
      });
    }

    return filtered.sort((a, b) => {
      const nombreA = `${a.apellido} ${a.nombre}`.toLowerCase();
      const nombreB = `${b.apellido} ${b.nombre}`.toLowerCase();
      return nombreA.localeCompare(nombreB);
    });
  }, [militantes, barrios, searchTerm, selectedCategoria, selectedBarrio, selectedTrabaja, selectedSeccional]);

  // Paginación
  const totalPages = Math.ceil(filteredMilitantes.length / ITEMS_PER_PAGE);
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredMilitantes.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredMilitantes, currentPage]);

  // Obtener listas únicas para filtros
  const seccionales = useMemo(() => {
    const uniqueSeccionales = [...new Set((barrios || []).map(b => b.seccional_nombre).filter(Boolean))];
    return uniqueSeccionales.sort();
  }, [barrios]);

  const estadisticas = useMemo(() => {
    if (!militantes || !Array.isArray(militantes)) {
      return {
        total: 0,
        juventud: 0,
        mayores: 0,
        encargadosEscuela: 0,
        dirigentes: 0,
        trabajan: 0
      };
    }
    
    return {
      total: militantes.length,
      juventud: militantes.filter(m => m.categoria === "juventud").length,
      mayores: militantes.filter(m => m.categoria === "mayores").length,
      encargadosEscuela: militantes.filter(m => m.categoria === "encargado de escuela").length,
      dirigentes: militantes.filter(m => m.categoria === "dirigente").length,
      trabajan: militantes.filter(m => m.trabaja === "SI").length
    };
  }, [militantes]);

  // Handlers optimizados
  const handleOpen = useCallback((militante = null) => {
    if (militante) {
      const { edad } = calcularEdadYCategoria(militante.fecha_nacimiento);
      setForm({
        ...militante,
        fecha_nacimiento: militante.fecha_nacimiento ? militante.fecha_nacimiento.slice(0, 10) : "",
        edad: edad || "",
        nombre: capitalizar(militante.nombre || ""),
        apellido: capitalizar(militante.apellido || ""),
        dependencia: militante.dependencia || "",
        tipo_trabajo: militante.tipo_trabajo || ""
      });
      setEditId(militante.id);
    } else {
      setForm({
        nombre: "",
        apellido: "",
        fecha_nacimiento: "",
        edad: "",
        telefono: "",
        instagram: "",
        categoria: "",
        id_barrio: "",
        trabaja: "",
        dependencia: "",
        tipo_trabajo: ""
      });
      setEditId(null);
    }
    setError("");
    setOpen(true);
  }, [calcularEdadYCategoria, capitalizar]);

  const handleClose = useCallback(() => {
    setOpen(false);
    setEditId(null);
  }, []);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    
    // Validaciones del formulario
    if (!form.nombre?.trim() || !form.apellido?.trim()) {
      setError('El nombre y apellido son obligatorios');
      return;
    }
    
    if (!form.categoria) {
      setError('La categoría es obligatoria');
      return;
    }
    
    if (!form.id_barrio) {
      setError('El barrio es obligatorio');
      return;
    }

    const { edad, ...formWithoutEdad } = form;
    const formData = {
      ...formWithoutEdad,
      nombre: capitalizar(form.nombre.trim()),
      apellido: capitalizar(form.apellido.trim()),
      telefono: form.telefono?.trim() || '',
      instagram: form.instagram?.trim() || '',
      dependencia: form.dependencia?.trim() || '',
      tipo_trabajo: form.tipo_trabajo?.trim() || '',
      id_barrio: parseInt(form.id_barrio)
    };
    
    try {
      const result = editId ? await updateMilitante(editId, formData) : await createMilitante(formData);
      const message = editId ? 'Militante actualizado exitosamente' : 'Militante creado exitosamente';
      
      window.alert(message);
      await invalidateRelatedCaches();
      await refetchMilitantes();
      handleClose();
    } catch (error) {
      console.error('Error al guardar militante:', error);
      setError(error.response?.data?.message || 'Error al guardar el militante');
    }
  }, [form, editId, capitalizar, updateMilitante, createMilitante, invalidateRelatedCaches, refetchMilitantes, handleClose]);

  const handleDelete = useCallback(async (id) => {
    if (!window.confirm('¿Está seguro de eliminar este militante?')) return;
    
    try {
      const result = await deleteMilitante(id);
      
      window.alert('Militante eliminado exitosamente');
      
      // Mostrar mensaje específico si era encargado de escuela
      if (result?.message && result.message.includes('escuela')) {
        window.alert(result.message);
      }
      
      await invalidateRelatedCaches();
      await refetchMilitantes();
    } catch (error) {
      console.error('Error al eliminar militante:', error);
      setError(error.response?.data?.message || 'Error al eliminar el militante');
    }
  }, [deleteMilitante, invalidateRelatedCaches, refetchMilitantes]);

  // Handlers para cambios en el formulario
  const handleDateChange = useCallback((newDate) => {
    if (newDate) {
      const dateStr = newDate.toISOString().split('T')[0];
      const { edad, categoria } = calcularEdadYCategoria(dateStr);
      
      setForm(prev => ({
        ...prev,
        fecha_nacimiento: dateStr,
        edad: edad || "",
        categoria: editId ? prev.categoria : categoria // Solo auto-asignar si es nuevo militante
      }));
    } else {
      setForm(prev => ({
        ...prev,
        fecha_nacimiento: "",
        edad: "",
        categoria: editId ? prev.categoria : ""
      }));
    }
  }, [calcularEdadYCategoria, editId]);

  const handleTrabajaChange = useCallback((value) => {
    setForm(prev => ({
      ...prev,
      trabaja: value,
      // Limpiar dependencia y tipo_trabajo si no trabaja
      dependencia: value === "SI" ? prev.dependencia : "",
      tipo_trabajo: value === "SI" ? prev.tipo_trabajo : ""
    }));
  }, []);

  // Exportar a Excel optimizado
  const exportToExcel = useCallback(() => {
    const dataToExport = filteredMilitantes.map(militante => {
      const barrio = barrios.find(b => b.id === militante.id_barrio);
      const { edad } = calcularEdadYCategoria(militante.fecha_nacimiento);
      return {
        'Apellido': capitalizar(militante.apellido),
        'Nombre': capitalizar(militante.nombre),
        'Edad': edad || 'N/A',
        'Categoría': capitalizar(militante.categoria),
        'Barrio': capitalizar(barrio?.nombre || 'Sin asignar'),
        'Seccional': barrio?.seccional_nombre || 'Sin asignar',
        'Teléfono': militante.telefono || '',
        'Instagram': militante.instagram || '',
        'Trabaja': militante.trabaja || 'No especifica',
        'Dependencia': militante.dependencia || '',
        'Tipo de Trabajo': militante.tipo_trabajo || ''
      };
    });

    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Militantes");
    
    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const data = new Blob([excelBuffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
    saveAs(data, `militantes_${new Date().toISOString().split('T')[0]}.xlsx`);
  }, [filteredMilitantes, barrios, calcularEdadYCategoria, capitalizar]);

  if (loading && militantes.length === 0) {
    return (
      <Box sx={{ p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
        <CircularProgress size={60} />
        <Typography variant="h6" color="text.secondary">
          Cargando militantes...
        </Typography>
      </Box>
    );
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box sx={{ p: 4 }}>
        {/* Header */}
        <Typography 
          variant="h4" 
          fontWeight={700} 
          color="primary" 
          gutterBottom
          sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}
        >
          <PeopleIcon fontSize="large" />
          Gestión de Militantes
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>
            {error}
          </Alert>
        )}

        {/* Tarjetas de estadísticas */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={2}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h6" color="primary">Total</Typography>
                <Typography variant="h3" fontWeight="bold">
                  {estadisticas.total}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h6" color="success.main">Juventud</Typography>
                <Typography variant="h3" fontWeight="bold">
                  {estadisticas.juventud}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h6" color="info.main">Mayores</Typography>
                <Typography variant="h3" fontWeight="bold">
                  {estadisticas.mayores}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h6" color="warning.main">Encargados</Typography>
                <Typography variant="h3" fontWeight="bold">
                  {estadisticas.encargadosEscuela}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h6" color="error.main">Dirigentes</Typography>
                <Typography variant="h3" fontWeight="bold">
                  {estadisticas.dirigentes}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h6" color="secondary.main">Trabajan</Typography>
                <Typography variant="h3" fontWeight="bold">
                  {estadisticas.trabajan}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Controles y filtros */}
        <Paper sx={{ p: 2, mb: 2 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                size="small"
                placeholder="Buscar militantes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: <SearchIcon sx={{ mr: 1, color: 'action.active' }} />
                }}
              />
            </Grid>
            <Grid item xs={12} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Categoría</InputLabel>
                <Select
                  value={selectedCategoria}
                  onChange={(e) => setSelectedCategoria(e.target.value)}
                  label="Categoría"
                >
                  <MenuItem value="">Todas</MenuItem>
                  {CATEGORIAS_MILITANTES.map(cat => (
                    <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Seccional</InputLabel>
                <Select
                  value={selectedSeccional}
                  onChange={(e) => setSelectedSeccional(e.target.value)}
                  label="Seccional"
                >
                  <MenuItem value="">Todas</MenuItem>
                  {seccionales.map(seccional => (
                    <MenuItem key={seccional} value={seccional}>
                      {seccional}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Trabaja</InputLabel>
                <Select
                  value={selectedTrabaja}
                  onChange={(e) => setSelectedTrabaja(e.target.value)}
                  label="Trabaja"
                >
                  <MenuItem value="">Todos</MenuItem>
                  <MenuItem value="SI">Sí</MenuItem>
                  <MenuItem value="NO">No</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <PermissionButton
                  requiredPermission="write"
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => handleOpen()}
                  sx={{ flexGrow: 1 }}
                >
                  Nuevo
                </PermissionButton>
                <PermissionIconButton
                  requiredPermission="export"
                  tooltip="Exportar a Excel"
                  onClick={exportToExcel}
                  color="primary"
                  disabled={filteredMilitantes.length === 0}
                >
                  <FileDownloadIcon />
                </PermissionIconButton>
              </Box>
            </Grid>
          </Grid>
        </Paper>

        {/* Tabla */}
        <Paper>
          <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
            <Typography variant="h6">
              Militantes ({filteredMilitantes.length} de {militantes.length})
            </Typography>
          </Box>
          <TableContainer sx={{ maxHeight: 600 }}>
            <Table stickyHeader size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold', backgroundColor: 'grey.100' }}>
                    Nombre y Apellido
                  </TableCell>
                  <TableCell sx={{ fontWeight: 'bold', backgroundColor: 'grey.100' }}>
                    Categoría / Estado Laboral
                  </TableCell>
                  <TableCell sx={{ fontWeight: 'bold', backgroundColor: 'grey.100' }}>
                    Barrio/Seccional
                  </TableCell>
                  <TableCell sx={{ fontWeight: 'bold', backgroundColor: 'grey.100' }}>
                    Contacto / Trabajo
                  </TableCell>
                  <TableCell sx={{ fontWeight: 'bold', backgroundColor: 'grey.100' }} align="center">
                    Acciones
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedData.map((militante) => {
                  const barrio = barrios.find(b => b.id === militante.id_barrio);
                  const { edad } = calcularEdadYCategoria(militante.fecha_nacimiento);
                  
                  return (
                    <TableRow 
                      key={militante.id}
                      hover
                      sx={{ '&:nth-of-type(odd)': { backgroundColor: 'action.hover' } }}
                    >
                      <TableCell>
                        <Typography variant="body2" fontWeight="medium">
                          {capitalizar(militante.apellido)}, {capitalizar(militante.nombre)}
                        </Typography>
                        {edad && (
                          <Typography variant="caption" color="text.secondary" display="block">
                            <CakeIcon fontSize="small" sx={{ mr: 0.5, verticalAlign: 'middle' }} />
                            {edad} años
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={capitalizar(militante.categoria)}
                          color={
                            militante.categoria === "juventud" ? "info" :
                            militante.categoria === "mayores" ? "success" : 
                            militante.categoria === "encargado de escuela" ? "warning" :
                            militante.categoria === "dirigente" ? "error" : "default"
                          }
                          size="small"
                          variant="filled"
                          icon={<PersonIcon />}
                          onClick={() => {}}
                        />
                        {/* Indicador de trabajo */}
                        <Box sx={{ mt: 0.5 }}>
                          <Chip 
                            label={militante.trabaja === "SI" ? "Trabaja" : militante.trabaja === "NO" ? "No trabaja" : "Sin especificar"}
                            color={militante.trabaja === "SI" ? "success" : militante.trabaja === "NO" ? "default" : "warning"}
                            size="small"
                            variant="outlined"
                            icon={<WorkIcon />}
                            onClick={() => {}}
                          />
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {capitalizar(barrio?.nombre || 'Sin asignar')}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {barrio?.seccional_nombre || 'Sin seccional'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {militante.telefono && (
                          <Typography variant="caption" display="block" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                            <PhoneIcon fontSize="small" /> {militante.telefono}
                          </Typography>
                        )}
                        {militante.instagram && (
                          <Typography variant="caption" display="block" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                            <InstagramIcon fontSize="small" /> @{militante.instagram}
                          </Typography>
                        )}
                        {militante.trabaja === "SI" && (
                          <Box sx={{ mt: 1, p: 1, backgroundColor: 'success.50', borderRadius: 1 }}>
                            <Typography variant="caption" display="block" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, fontWeight: 'medium' }}>
                              <WorkIcon fontSize="small" color="success" /> Información Laboral
                            </Typography>
                            {militante.dependencia && (
                              <Typography variant="caption" display="block" color="text.secondary">
                                • {militante.dependencia}
                              </Typography>
                            )}
                            {militante.tipo_trabajo && (
                              <Typography variant="caption" display="block" color="text.secondary">
                                • {militante.tipo_trabajo}
                              </Typography>
                            )}
                          </Box>
                        )}
                        {militante.trabaja === "NO" && (
                          <Box sx={{ mt: 1, p: 1, backgroundColor: 'grey.100', borderRadius: 1 }}>
                            <Typography variant="caption" display="block" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <WorkIcon fontSize="small" color="disabled" /> No trabaja
                            </Typography>
                          </Box>
                        )}
                      </TableCell>
                      <TableCell align="center">
                        <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                          <PermissionIconButton
                            requiredPermission="write"
                            tooltip="Editar"
                            size="small"
                            onClick={() => handleOpen(militante)}
                            color="primary"
                          >
                            <EditIcon fontSize="small" />
                          </PermissionIconButton>
                          <PermissionIconButton
                            requiredPermission="delete"
                            tooltip="Eliminar"
                            size="small"
                            onClick={() => handleDelete(militante.id)}
                            color="error"
                          >
                            <DeleteIcon fontSize="small" />
                          </PermissionIconButton>
                        </Box>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
          
          {/* Paginación */}
          {totalPages > 1 && (
            <Box sx={{ p: 2, display: 'flex', justifyContent: 'center' }}>
              <Pagination
                count={totalPages}
                page={currentPage}
                onChange={(_, page) => setCurrentPage(page)}
                color="primary"
                showFirstButton
                showLastButton
              />
            </Box>
          )}
        </Paper>

        {/* Dialog para formulario */}
        <Dialog open={open} onClose={handleClose} maxWidth="lg" fullWidth>
          <form onSubmit={handleSubmit}>
            <DialogTitle sx={{ 
              backgroundColor: 'primary.main', 
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }}>
              <PersonIcon />
              {editId ? 'Editar Militante' : 'Nuevo Militante'}
            </DialogTitle>
            <DialogContent sx={{ p: 3 }}>
              {/* Sección: Datos Personales */}
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
                  <PersonIcon /> Datos Personales
                </Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      label="Nombre *"
                      value={form.nombre}
                      onChange={(e) => setForm(prev => ({ ...prev, nombre: e.target.value }))}
                      fullWidth
                      required
                      variant="outlined"
                      helperText="Nombre del militante"
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      label="Apellido *"
                      value={form.apellido}
                      onChange={(e) => setForm(prev => ({ ...prev, apellido: e.target.value }))}
                      fullWidth
                      required
                      variant="outlined"
                      helperText="Apellido del militante"
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <DatePicker
                      label="Fecha de Nacimiento *"
                      value={form.fecha_nacimiento ? new Date(form.fecha_nacimiento) : null}
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
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      label="Edad"
                      value={form.edad ? `${form.edad} años` : ''}
                      fullWidth
                      disabled
                      variant="outlined"
                      helperText="Se calcula automáticamente según la fecha de nacimiento"
                      InputProps={{
                        startAdornment: <CakeIcon sx={{ mr: 1, color: 'action.active' }} />
                      }}
                    />
                  </Grid>
                </Grid>
              </Box>

              {/* Sección: Categorización */}
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
                  <WorkIcon /> Categorización
                </Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth required variant="outlined">
                      <InputLabel>Categoría *</InputLabel>
                      <Select
                        value={form.categoria}
                        onChange={(e) => setForm(prev => ({ ...prev, categoria: e.target.value }))}
                        label="Categoría *"
                      >
                        {CATEGORIAS_MILITANTES.map(cat => (
                          <MenuItem key={cat} value={cat}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <PersonIcon fontSize="small" />
                              {capitalizar(cat)}
                            </Box>
                          </MenuItem>
                        ))}
                      </Select>
                      <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, ml: 1 }}>
                        {form.categoria === "juventud" && "Militantes de hasta 35 años"}
                        {form.categoria === "mayores" && "Militantes mayores de 35 años"}
                        {form.categoria === "encargado de escuela" && "Responsables de establecimiento"}
                        {form.categoria === "dirigente" && "Líderes y referentes políticos"}
                      </Typography>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Autocomplete
                      options={barrios}
                      getOptionLabel={(barrio) => `${capitalizar(barrio.nombre)} (${barrio.seccional_nombre || 'Sin seccional'})`}
                      value={barrios.find(b => b.id === form.id_barrio) || null}
                      onChange={(_, newValue) => {
                        setForm(prev => ({
                          ...prev,
                          id_barrio: newValue?.id || ""
                        }));
                      }}
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

              {/* Sección: Contacto */}
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
                  <PhoneIcon /> Información de Contacto
                </Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      label="Teléfono"
                      value={form.telefono}
                      onChange={(e) => setForm(prev => ({ ...prev, telefono: e.target.value }))}
                      fullWidth
                      variant="outlined"
                      helperText="Número de teléfono celular o fijo"
                      InputProps={{
                        startAdornment: <PhoneIcon sx={{ mr: 1, color: 'action.active' }} />
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      label="Instagram"
                      value={form.instagram}
                      onChange={(e) => setForm(prev => ({ ...prev, instagram: e.target.value }))}
                      fullWidth
                      variant="outlined"
                      helperText="Usuario de Instagram (sin @)"
                      InputProps={{
                        startAdornment: <InstagramIcon sx={{ mr: 1, color: 'action.active' }} />
                      }}
                    />
                  </Grid>
                </Grid>
              </Box>

              {/* Sección: Información Laboral */}
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
                  <WorkIcon /> Información Laboral
                </Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={4}>
                    <FormControl fullWidth variant="outlined">
                      <InputLabel>¿Trabaja?</InputLabel>
                      <Select
                        value={form.trabaja}
                        onChange={(e) => handleTrabajaChange(e.target.value)}
                        label="¿Trabaja?"
                      >
                        <MenuItem value="">
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <WorkIcon fontSize="small" color="disabled" />
                            No especifica
                          </Box>
                        </MenuItem>
                        <MenuItem value="SI">
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <WorkIcon fontSize="small" color="success" />
                            Sí, trabaja
                          </Box>
                        </MenuItem>
                        <MenuItem value="NO">
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <WorkIcon fontSize="small" color="disabled" />
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
                    <FormControl fullWidth disabled={form.trabaja !== "SI"} variant="outlined">
                      <InputLabel>Dependencia</InputLabel>
                      <Select
                        value={form.dependencia}
                        onChange={(e) => setForm(prev => ({ ...prev, dependencia: e.target.value }))}
                        label="Dependencia"
                      >
                        <MenuItem value="">Seleccionar dependencia</MenuItem>
                        {DEPENDENCIAS.map(dep => (
                          <MenuItem key={dep} value={dep}>{dep}</MenuItem>
                        ))}
                      </Select>
                      <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, ml: 1 }}>
                        {form.trabaja === "SI" ? "Seleccione la dependencia donde trabaja" : "Disponible solo si trabaja"}
                      </Typography>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <FormControl fullWidth disabled={form.trabaja !== "SI"} variant="outlined">
                      <InputLabel>Tipo de Trabajo</InputLabel>
                      <Select
                        value={form.tipo_trabajo}
                        onChange={(e) => setForm(prev => ({ ...prev, tipo_trabajo: e.target.value }))}
                        label="Tipo de Trabajo"
                      >
                        <MenuItem value="">Seleccionar tipo</MenuItem>
                        {TIPOS_TRABAJO.map(tipo => (
                          <MenuItem key={tipo} value={tipo}>{tipo}</MenuItem>
                        ))}
                      </Select>
                      <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, ml: 1 }}>
                        {form.trabaja === "SI" ? "Especifique el tipo de trabajo" : "Disponible solo si trabaja"}
                      </Typography>
                    </FormControl>
                  </Grid>
                </Grid>
              </Box>
            </DialogContent>
            <DialogActions sx={{ p: 3, backgroundColor: 'grey.50' }}>
              <Button 
                onClick={handleClose}
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
                {loading ? <CircularProgress size={20} /> : (editId ? 'Actualizar Militante' : 'Crear Militante')}
              </Button>
            </DialogActions>
          </form>
        </Dialog>
      </Box>
    </LocalizationProvider>
  );
});

MilitantesPage.displayName = 'MilitantesPage';

export default MilitantesPage;
