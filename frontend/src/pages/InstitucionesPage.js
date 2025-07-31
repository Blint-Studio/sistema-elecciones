import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Typography, Paper, Box, Button, TextField, Table, TableHead, TableRow, TableCell, TableBody,
  Dialog, DialogTitle, DialogContent, DialogActions, MenuItem, Autocomplete, Chip, Select, FormControl, InputLabel,
  Card, CardContent, Grid, InputAdornment, TableContainer, IconButton, Tooltip, Divider, Alert,
  CircularProgress, Pagination
} from "@mui/material";
import {
  Business as BusinessIcon,
  Search as SearchIcon,
  FileDownload as FileDownloadIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  LocationOn as LocationOnIcon,
  Category as CategoryIcon,
  AccountBalance as AccountBalanceIcon
} from '@mui/icons-material';
import { saveAs } from 'file-saver';
import * as XLSX from "xlsx";
import {
  getInstituciones,
  createInstitucion,
  updateInstitucion,
  deleteInstitucion
} from "../services/institucionesService";
import { getBarrios } from "../services/barriosService";
import { getTiposInstitucion, createTipoInstitucion } from "../services/tiposInstitucionService";
import { PermissionButton, PermissionIconButton } from '../components/PermissionComponents';
import { useCachedData, useCacheInvalidation } from '../hooks/useCachedData';

// Configuración
const ITEMS_PER_PAGE = 25;
const OPCIONES_RELACION = [
  { value: "Hay relacion", label: "Hay relación", color: "success" },
  { value: "No hay Relacion", label: "No hay relación", color: "error" },
  { value: "En Proceso", label: "En proceso", color: "info" },
  { value: "Sin definir", label: "Sin definir", color: "warning" }
];

const InstitucionesPage = React.memo(() => {
  // Usar hooks individuales en lugar de useMultipleCachedData para evitar problemas de dependencias
  const { 
    data: instituciones, 
    loading: institucionesLoading, 
    error: institucionesError,
    refetch: refetchInstituciones 
  } = useCachedData('instituciones', getInstituciones);

  const { 
    data: barrios, 
    loading: barriosLoading, 
    error: barriosError,
    refetch: refetchBarrios 
  } = useCachedData('barrios', getBarrios);

  const { 
    data: tipos, 
    loading: tiposLoading, 
    error: tiposError,
    refetch: refetchTipos 
  } = useCachedData('tipos_institucion', getTiposInstitucion);

  // Estados derivados
  const loading = institucionesLoading || barriosLoading || tiposLoading;
  const dataError = institucionesError || barriosError || tiposError;
  
  const refetchData = useCallback(async () => {
    await Promise.all([
      refetchInstituciones(),
      refetchBarrios(),
      refetchTipos()
    ]);
  }, [refetchInstituciones, refetchBarrios, refetchTipos]);

  const invalidateRelatedCaches = useCacheInvalidation();

  // Estados principales
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [error, setError] = useState("");
  const [localLoading, setLocalLoading] = useState(false);

  // Estados del formulario
  const [form, setForm] = useState({ 
    nombre: "", 
    tipo: "", 
    direccion: "", 
    id_barrio: "", 
    seccional: "", 
    relacion: "" 
  });
  
  // Estados para nuevo tipo
  const [nuevoTipo, setNuevoTipo] = useState("");
  const [mostrarNuevoTipo, setMostrarNuevoTipo] = useState(false);

  // Estados para filtros y búsqueda
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSeccional, setSelectedSeccional] = useState("");
  const [selectedTipo, setSelectedTipo] = useState("");
  const [selectedRelacion, setSelectedRelacion] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // Función para capitalizar texto
  const capitalizar = useCallback((texto) => {
    if (!texto || typeof texto !== 'string') return "";
    return texto.charAt(0).toUpperCase() + texto.slice(1).toLowerCase();
  }, []);

  // Filtrar instituciones optimizado
  const filteredInstituciones = useMemo(() => {
    if (!instituciones || !Array.isArray(instituciones)) return [];
    let filtered = [...instituciones];
    const barriosArray = barrios || [];

    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(inst => 
        inst.nombre?.toLowerCase().includes(search) ||
        inst.tipo?.toLowerCase().includes(search) ||
        inst.direccion?.toLowerCase().includes(search)
      );
    }

    if (selectedSeccional) {
      filtered = filtered.filter(inst => {
        const barrio = barriosArray.find(b => b.id === inst.id_barrio);
        return barrio?.seccional_nombre?.includes(selectedSeccional);
      });
    }

    if (selectedTipo) {
      filtered = filtered.filter(inst => inst.tipo === selectedTipo);
    }

    if (selectedRelacion) {
      filtered = filtered.filter(inst => inst.relacion === selectedRelacion);
    }

    return filtered;
  }, [instituciones, barrios, searchTerm, selectedSeccional, selectedTipo, selectedRelacion]);

  // Paginación
  const totalPages = Math.ceil(filteredInstituciones.length / ITEMS_PER_PAGE);
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredInstituciones.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredInstituciones, currentPage]);

  // Obtener seccionales únicas
  const seccionales = useMemo(() => {
    if (!barrios || !Array.isArray(barrios)) return [];
    const uniqueSeccionales = [...new Set(barrios.map(b => b.seccional_nombre).filter(Boolean))];
    return uniqueSeccionales.sort();
  }, [barrios]);

  // Handlers optimizados
  const handleOpen = useCallback((institucion = null) => {
    if (institucion) {
      const barriosArray = barrios || [];
      const barrio = barriosArray.find(b => b.id === institucion.id_barrio);
      setForm({
        ...institucion,
        seccional: barrio ? barrio.seccional_nombre : ""
      });
      setEditId(institucion.id);
    } else {
      setForm({
        nombre: "",
        tipo: "",
        direccion: "",
        id_barrio: "",
        seccional: "",
        relacion: ""
      });
      setEditId(null);
    }
    setError("");
    setOpen(true);
  }, [barrios]);

  const handleClose = useCallback(() => {
    setOpen(false);
    setMostrarNuevoTipo(false);
    setNuevoTipo("");
  }, []);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    setLocalLoading(true);
    
    try {
      const formData = { ...form };
      delete formData.seccional; // No enviar seccional al backend
      
      if (editId) {
        await updateInstitucion(editId, formData);
      } else {
        await createInstitucion(formData);
      }
      
      // Invalidar cache relacionado y refrescar datos
      invalidateRelatedCaches(['instituciones', 'tipos_institucion']);
      await refetchData();
      handleClose();
    } catch (err) {
      setError(err.message || 'Error al guardar la institución');
    } finally {
      setLocalLoading(false);
    }
  }, [form, editId, invalidateRelatedCaches, refetchData, handleClose]);

  const handleDelete = useCallback(async (id) => {
    if (!window.confirm('¿Está seguro de eliminar esta institución?')) return;
    
    try {
      setLocalLoading(true);
      await deleteInstitucion(id);
      
      // Invalidar cache relacionado y refrescar datos
      invalidateRelatedCaches(['instituciones']);
      await refetchData();
    } catch (err) {
      setError(err.message || 'Error al eliminar la institución');
    } finally {
      setLocalLoading(false);
    }
  }, [invalidateRelatedCaches, refetchData]);

  // Exportar a Excel optimizado
  const exportToExcel = useCallback(() => {
    const dataToExport = filteredInstituciones.map(inst => {
      const barrio = (barrios || []).find(b => b.id === inst.id_barrio);
      return {
        'Nombre': inst.nombre,
        'Tipo': inst.tipo,
        'Dirección': inst.direccion,
        'Barrio': barrio?.nombre || 'Sin asignar',
        'Seccional': barrio?.seccional_nombre || 'Sin asignar',
        'Relación': inst.relacion || 'Sin definir'
      };
    });

    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Instituciones");
    
    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const data = new Blob([excelBuffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
    saveAs(data, `instituciones_${new Date().toISOString().split('T')[0]}.xlsx`);
  }, [filteredInstituciones, barrios]);

  if (loading && (!instituciones || instituciones.length === 0) && (!barrios || barrios.length === 0)) {
    return (
      <Box sx={{ p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
        <CircularProgress size={60} />
        <Typography variant="h6" color="text.secondary">
          Cargando instituciones...
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 4 }}>
      {/* Header */}
      <Typography 
        variant="h4" 
        fontWeight={700} 
        color="primary" 
        gutterBottom
        sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}
      >
        <BusinessIcon fontSize="large" />
        Gestión de Instituciones
      </Typography>

      {(error || dataError) && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>
          {error || dataError}
        </Alert>
      )}

      {/* Tarjetas de resumen */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h6" color="primary">Total</Typography>
              <Typography variant="h3" fontWeight="bold">
                {(instituciones || []).length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h6" color="success.main">Con Relación</Typography>
              <Typography variant="h3" fontWeight="bold">
                {(instituciones || []).filter(i => i.relacion === "Hay relacion").length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h6" color="error.main">Sin Relación</Typography>
              <Typography variant="h3" fontWeight="bold">
                {(instituciones || []).filter(i => i.relacion === "No hay Relacion").length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h6" color="info.main">Tipos</Typography>
              <Typography variant="h3" fontWeight="bold">
                {(tipos || []).length}
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
              placeholder="Buscar instituciones..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1, color: 'action.active' }} />
              }}
            />
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
              <InputLabel>Tipo</InputLabel>
              <Select
                value={selectedTipo}
                onChange={(e) => setSelectedTipo(e.target.value)}
                label="Tipo"
              >
                <MenuItem value="">Todos</MenuItem>
                {(tipos || []).map(tipo => (
                  <MenuItem key={tipo.id} value={tipo.nombre}>
                    {capitalizar(tipo.nombre)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Relación</InputLabel>
              <Select
                value={selectedRelacion}
                onChange={(e) => setSelectedRelacion(e.target.value)}
                label="Relación"
              >
                <MenuItem value="">Todas</MenuItem>
                {OPCIONES_RELACION.map(opcion => (
                  <MenuItem key={opcion.value} value={opcion.value}>
                    {opcion.label}
                  </MenuItem>
                ))}
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
                Nueva
              </PermissionButton>
              <PermissionIconButton
                requiredPermission="export"
                tooltip="Exportar a Excel"
                onClick={exportToExcel}
                color="primary"
                disabled={filteredInstituciones.length === 0}
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
            Instituciones ({filteredInstituciones.length} de {(instituciones || []).length})
          </Typography>
        </Box>
        <TableContainer sx={{ maxHeight: 600 }}>
          <Table stickyHeader size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold', backgroundColor: 'grey.100' }}>
                  Nombre
                </TableCell>
                <TableCell sx={{ fontWeight: 'bold', backgroundColor: 'grey.100' }}>
                  Tipo
                </TableCell>
                <TableCell sx={{ fontWeight: 'bold', backgroundColor: 'grey.100' }}>
                  Barrio/Seccional
                </TableCell>
                <TableCell sx={{ fontWeight: 'bold', backgroundColor: 'grey.100' }}>
                  Relación
                </TableCell>
                <TableCell sx={{ fontWeight: 'bold', backgroundColor: 'grey.100' }} align="center">
                  Acciones
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedData.map((institucion) => {
                const barrio = (barrios || []).find(b => b.id === institucion.id_barrio);
                const relacion = OPCIONES_RELACION.find(r => r.value === institucion.relacion);
                
                return (
                  <TableRow 
                    key={institucion.id}
                    hover
                    sx={{ '&:nth-of-type(odd)': { backgroundColor: 'action.hover' } }}
                  >
                    <TableCell>
                      <Typography variant="body2" fontWeight="medium">
                        {capitalizar(institucion.nombre)}
                      </Typography>
                      {institucion.direccion && (
                        <Typography variant="caption" color="text.secondary" display="block">
                          <LocationOnIcon fontSize="small" sx={{ mr: 0.5, verticalAlign: 'middle' }} />
                          {institucion.direccion}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={capitalizar(institucion.tipo)}
                        color="primary"
                        size="small"
                        variant="filled"
                        onClick={() => {}}
                      />
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
                      <Chip 
                        label={relacion?.label || 'Sin definir'}
                        color={relacion?.color || 'default'}
                        size="small"
                        onClick={() => {}}
                        variant="filled"
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                        <PermissionIconButton
                          requiredPermission="write"
                          tooltip="Editar"
                          size="small"
                          onClick={() => handleOpen(institucion)}
                          color="primary"
                        >
                          <EditIcon fontSize="small" />
                        </PermissionIconButton>
                        <PermissionIconButton
                          requiredPermission="delete"
                          tooltip="Eliminar"
                          size="small"
                          onClick={() => handleDelete(institucion.id)}
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
      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <form onSubmit={handleSubmit}>
          <DialogTitle>
            {editId ? 'Editar Institución' : 'Nueva Institución'}
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <TextField
                  label="Nombre"
                  value={form.nombre}
                  onChange={(e) => setForm(prev => ({ ...prev, nombre: e.target.value }))}
                  fullWidth
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth required>
                  <InputLabel>Tipo</InputLabel>
                  <Select
                    value={form.tipo}
                    onChange={(e) => setForm(prev => ({ ...prev, tipo: e.target.value }))}
                    label="Tipo"
                  >
                    {(tipos || []).map(tipo => (
                      <MenuItem key={tipo.id} value={tipo.nombre}>
                        {capitalizar(tipo.nombre)}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <Autocomplete
                  options={barrios || []}
                  getOptionLabel={(barrio) => `${capitalizar(barrio.nombre)} (${barrio.seccional_nombre})`}
                  value={(barrios || []).find(b => b.id === form.id_barrio) || null}
                  onChange={(_, newValue) => {
                    setForm(prev => ({
                      ...prev,
                      id_barrio: newValue?.id || "",
                      seccional: newValue?.seccional_nombre || ""
                    }));
                  }}
                  renderInput={(params) => (
                    <TextField {...params} label="Barrio" required />
                  )}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Dirección"
                  value={form.direccion}
                  onChange={(e) => setForm(prev => ({ ...prev, direccion: e.target.value }))}
                  fullWidth
                  multiline
                  rows={2}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Relación</InputLabel>
                  <Select
                    value={form.relacion}
                    onChange={(e) => setForm(prev => ({ ...prev, relacion: e.target.value }))}
                    label="Relación"
                  >
                    {OPCIONES_RELACION.map(opcion => (
                      <MenuItem key={opcion.value} value={opcion.value}>
                        {opcion.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Cancelar</Button>
            <Button type="submit" variant="contained" disabled={localLoading}>
              {localLoading ? <CircularProgress size={20} /> : (editId ? 'Actualizar' : 'Crear')}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
});

InstitucionesPage.displayName = 'InstitucionesPage';

export default InstitucionesPage;
