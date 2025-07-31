import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Box, Typography, Paper, Table, TableHead, TableRow, TableCell, TableBody,
  TextField, Dialog, DialogTitle, DialogContent, DialogActions, Button, Chip,
  Card, CardContent, Grid, InputAdornment, TableContainer, IconButton, Tooltip, Alert,
  CircularProgress, Pagination, FormControl, InputLabel, Select, MenuItem
} from '@mui/material';
import {
  LocationCity as LocationCityIcon,
  Search as SearchIcon,
  FileDownload as FileDownloadIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  LocationOn as LocationOnIcon,
  People as PeopleIcon,
  AccountTree as AccountTreeIcon,
  Person as PersonIcon
} from '@mui/icons-material';
import { saveAs } from 'file-saver';
import * as XLSX from "xlsx";
import { getBarrios, getBarrioMilitantes, getBarriosConDirigentes } from '../services/barriosService';
import { fetchApi } from '../services/api';
import { PermissionButton, PermissionIconButton } from '../components/PermissionComponents';
import { useCachedData, useCacheInvalidation, useMultipleCachedData } from '../hooks/useCachedData';

// Configuración
const ITEMS_PER_PAGE = 30;

// Componente principal optimizado
const BarriosPage = React.memo(() => {
  // Usar nuevo sistema de cache para barrios y dirigentes
  const { 
    data: barrios, 
    loading: barriosLoading, 
    error: barriosError, 
    refetch: refetchBarrios 
  } = useCachedData('barrios', getBarrios);

  const { 
    data: barriosConDirigentes, 
    loading: dirigentesLoading, 
    error: dirigentesError 
  } = useCachedData('barrios_dirigentes', getBarriosConDirigentes);

  const invalidateRelatedCaches = useCacheInvalidation();

  // Estados principales
  const loading = barriosLoading || dirigentesLoading;
  const error = barriosError || dirigentesError;
  const [localLoading, setLocalLoading] = useState(false);
  const [localError, setLocalError] = useState('');
  
  // Estados para diálogos
  const [open, setOpen] = useState(false);
  const [openForm, setOpenForm] = useState(false);
  const [barrioActual, setBarrioActual] = useState(null);
  const [militantesBarrio, setMilitantesBarrio] = useState([]);
  
  // Estados del formulario
  const [form, setForm] = useState({ 
    nombre: '', 
    seccional_nombre: '', 
    subcircuito: '' 
  });
  const [editId, setEditId] = useState(null);
  
  // Estados para filtros y búsqueda
  const [busqueda, setBusqueda] = useState('');
  const [seccionalFiltro, setSeccionalFiltro] = useState('');
  const [dirigenteFiltro, setDirigenteFiltro] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // Función para capitalizar texto
  const capitalizar = useCallback((texto) => {
    if (!texto || typeof texto !== 'string') return "";
    return texto.charAt(0).toUpperCase() + texto.slice(1).toLowerCase();
  }, []);

  // Combinar datos de barrios con información de dirigentes
  const barriosConInfoDirigentes = useMemo(() => {
    if (!barrios || !Array.isArray(barrios)) return [];
    const dirigentesArray = barriosConDirigentes || [];
    
    return barrios.map(barrio => {
      const infoDirigente = dirigentesArray.find(d => d.id === barrio.id);
      return {
        ...barrio,
        dirigentes_count: infoDirigente?.dirigentes_count || 0,
        dirigentes_nombres: infoDirigente?.dirigentes_nombres || null,
        tieneDirigente: (infoDirigente?.dirigentes_count || 0) > 0
      };
    });
  }, [barrios, barriosConDirigentes]);

  // Filtrar barrios optimizado
  const filteredBarrios = useMemo(() => {
    let filtered = [...barriosConInfoDirigentes];

    if (busqueda) {
      const search = busqueda.toLowerCase();
      filtered = filtered.filter(barrio => 
        barrio.nombre?.toLowerCase().includes(search) ||
        barrio.seccional_nombre?.toLowerCase().includes(search) ||
        barrio.subcircuito?.toLowerCase().includes(search)
      );
    }

    if (seccionalFiltro) {
      filtered = filtered.filter(barrio => 
        barrio.seccional_nombre?.includes(seccionalFiltro)
      );
    }

    // Filtrar por presencia de dirigente
    if (dirigenteFiltro !== 'todos') {
      if (dirigenteFiltro === 'con_dirigente') {
        filtered = filtered.filter(barrio => barrio.tieneDirigente);
      } else if (dirigenteFiltro === 'sin_dirigente') {
        filtered = filtered.filter(barrio => !barrio.tieneDirigente);
      }
    }

    return filtered.sort((a, b) => a.nombre?.localeCompare(b.nombre) || 0);
  }, [barriosConInfoDirigentes, busqueda, seccionalFiltro, dirigenteFiltro]);

  // Paginación
  const totalPages = Math.ceil(filteredBarrios.length / ITEMS_PER_PAGE);
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredBarrios.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredBarrios, currentPage]);

  // Obtener seccionales únicas
  const seccionales = useMemo(() => {
    const uniqueSeccionales = [...new Set(barrios.map(b => b.seccional_nombre).filter(Boolean))];
    return uniqueSeccionales.sort();
  }, [barrios]);

  // Estadísticas memoizadas
  const estadisticas = useMemo(() => {
    return {
      total: barrios.length,
      conSeccional: barrios.filter(b => b.seccional_nombre).length,
      conSubcircuito: barrios.filter(b => b.subcircuito).length,
      seccionales: seccionales.length
    };
  }, [barrios, seccionales]);

  // Handlers optimizados
  const verMilitantes = useCallback(async (barrio) => {
    try {
      setBarrioActual(barrio);
      setLocalLoading(true);
      setLocalError('');
      const militantes = await getBarrioMilitantes(barrio.id);
      setMilitantesBarrio(militantes || []);
      setOpen(true);
    } catch (err) {
      console.error('Error al cargar militantes:', err);
      setLocalError('Error al cargar militantes del barrio');
    } finally {
      setLocalLoading(false);
    }
  }, []);

  const handleOpenForm = useCallback((barrio = null) => {
    setEditId(barrio ? barrio.id : null);
    setForm(barrio ? {
      nombre: barrio.nombre || '',
      seccional_nombre: barrio.seccional_nombre || '',
      subcircuito: barrio.subcircuito || ''
    } : { nombre: '', seccional_nombre: '', subcircuito: '' });
    setLocalError('');
    setOpenForm(true);
  }, []);

  const handleCloseForm = useCallback(() => {
    setOpenForm(false);
    setEditId(null);
    setForm({ nombre: '', seccional_nombre: '', subcircuito: '' });
  }, []);

  const handleSubmitForm = useCallback(async (e) => {
    e.preventDefault();
    try {
      setLocalLoading(true);
      setLocalError('');
      
      if (editId) {
        await fetchApi(`/barrios/${editId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form)
        });
      } else {
        await fetchApi('/barrios', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form)
        });
      }
      
      // Invalidar cache relacionado y refrescar datos
      invalidateRelatedCaches(['barrios', 'barrios_dirigentes']);
      await refetchBarrios();
      handleCloseForm();
      
    } catch (err) {
      console.error('Error al guardar barrio:', err);
      setLocalError('Error al guardar el barrio');
    } finally {
      setLocalLoading(false);
    }
  }, [form, editId, invalidateRelatedCaches, refetchBarrios, handleCloseForm]);

  const handleEliminarBarrio = useCallback(async (id) => {
    if (!window.confirm('¿Seguro que deseas eliminar este barrio?')) return;
    
    try {
      setLocalLoading(true);
      setLocalError('');
      await fetchApi(`/barrios/${id}`, { method: 'DELETE' });
      
      // Invalidar cache relacionado y refrescar datos
      invalidateRelatedCaches(['barrios', 'barrios_dirigentes']);
      await refetchBarrios();
      
    } catch (err) {
      console.error('Error al eliminar barrio:', err);
      setLocalError('Error al eliminar el barrio');
    } finally {
      setLocalLoading(false);
    }
  }, [invalidateRelatedCaches, refetchBarrios]);

  // Exportar a Excel optimizado
  const exportToExcel = useCallback(() => {
    const dataToExport = filteredBarrios.map(barrio => ({
      'Nombre': barrio.nombre || '',
      'Seccional': barrio.seccional_nombre || 'Sin asignar',
      'Subcircuito': barrio.subcircuito || 'Sin asignar',
      'ID': barrio.id
    }));

    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Barrios");
    
    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const data = new Blob([excelBuffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
    saveAs(data, `barrios_${new Date().toISOString().split('T')[0]}.xlsx`);
  }, [filteredBarrios]);

  if (loading && barrios.length === 0) {
    return (
      <Box sx={{ p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
        <CircularProgress size={60} />
        <Typography variant="h6" color="text.secondary">
          Cargando barrios...
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Typography 
        variant="h4" 
        fontWeight={700} 
        color="primary" 
        gutterBottom
        sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}
      >
        <LocationCityIcon fontSize="large" />
        Gestión de Barrios
      </Typography>

      {(error || localError) && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setLocalError('')}>
          {error || localError}
        </Alert>
      )}

      {/* Tarjetas de estadísticas */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h6" color="primary">Total Barrios</Typography>
              <Typography variant="h3" fontWeight="bold">
                {estadisticas.total}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h6" color="success.main">Con Seccional</Typography>
              <Typography variant="h3" fontWeight="bold">
                {estadisticas.conSeccional}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h6" color="info.main">Con Subcircuito</Typography>
              <Typography variant="h3" fontWeight="bold">
                {estadisticas.conSubcircuito}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h6" color="secondary.main">Seccionales</Typography>
              <Typography variant="h3" fontWeight="bold">
                {estadisticas.seccionales}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h6" color="secondary.main">Con Dirigente</Typography>
              <Typography variant="h3" fontWeight="bold" color="success.main">
                {barriosConInfoDirigentes.filter(b => b.tieneDirigente).length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                de {barriosConInfoDirigentes.length} barrios
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
              placeholder="Buscar barrios..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1, color: 'action.active' }} />
              }}
            />
          </Grid>
          <Grid item xs={12} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Seccional</InputLabel>
              <Select
                value={seccionalFiltro}
                onChange={(e) => setSeccionalFiltro(e.target.value)}
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
          <Grid item xs={12} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Dirigente</InputLabel>
              <Select
                value={dirigenteFiltro}
                onChange={(e) => setDirigenteFiltro(e.target.value)}
                label="Dirigente"
              >
                <MenuItem value="todos">Todos</MenuItem>
                <MenuItem value="con_dirigente">Con Dirigente</MenuItem>
                <MenuItem value="sin_dirigente">Sin Dirigente</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={5}>
            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
              <PermissionButton
                permiso="write"
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => handleOpenForm()}
              >
                Nuevo Barrio
              </PermissionButton>
              <PermissionIconButton
                permiso="export"
                tooltip="Exportar a Excel"
                onClick={exportToExcel}
                color="primary"
                disabled={filteredBarrios.length === 0}
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
            Barrios ({filteredBarrios.length} de {barrios.length})
          </Typography>
        </Box>
        <TableContainer sx={{ maxHeight: 600 }}>
          <Table stickyHeader size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold', backgroundColor: 'grey.100' }}>
                  Nombre del Barrio
                </TableCell>
                <TableCell sx={{ fontWeight: 'bold', backgroundColor: 'grey.100' }}>
                  Seccional
                </TableCell>
                <TableCell sx={{ fontWeight: 'bold', backgroundColor: 'grey.100' }}>
                  Subcircuito
                </TableCell>
                <TableCell sx={{ fontWeight: 'bold', backgroundColor: 'grey.100' }} align="center">
                  Dirigente
                </TableCell>
                <TableCell sx={{ fontWeight: 'bold', backgroundColor: 'grey.100' }} align="center">
                  Acciones
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedData.map((barrio) => (
                <TableRow 
                  key={barrio.id}
                  hover
                  sx={{ '&:nth-of-type(odd)': { backgroundColor: 'action.hover' } }}
                >
                  <TableCell>
                    <Typography variant="body2" fontWeight="medium">
                      {capitalizar(barrio.nombre)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {/* Seccional */}
                    {barrio.seccional_nombre ? (
                      <Chip 
                        label={barrio.seccional_nombre}
                        color="success"
                        size="small"
                        variant="outlined"
                        icon={<AccountTreeIcon />}
                        onClick={() => {}}
                      />
                    ) : (
                      <Chip 
                        label="Sin asignar"
                        color="error"
                        size="small"
                        variant="outlined"
                        onClick={() => {}}
                      />
                    )}
                  </TableCell>
                  <TableCell>
                    {/* Subcircuito */}
                    {barrio.subcircuito ? (
                      <Chip 
                        label={barrio.subcircuito}
                        color="info"
                        size="small"
                        variant="filled"
                        onClick={() => {}}
                      />
                    ) : (
                      <Typography variant="caption" color="text.secondary">
                        Sin subcircuito
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell align="center">
                    {/* Dirigente */}
                    {barrio.tieneDirigente ? (
                      <Tooltip title={`Dirigente(s): ${barrio.dirigentes_nombres}`}>
                        <Chip 
                          label={`${barrio.dirigentes_count} dirigente${barrio.dirigentes_count > 1 ? 's' : ''}`}
                          color="success"
                          size="small"
                          variant="filled"
                          icon={<PersonIcon />}
                          onClick={() => {}}
                        />
                      </Tooltip>
                    ) : (
                      <Chip 
                        label="Sin dirigente"
                        color="default"
                        size="small"
                        variant="outlined"
                        icon={<PersonIcon />}
                        onClick={() => {}}
                      />
                    )}
                  </TableCell>
                  <TableCell align="center">
                    <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                      <Tooltip title="Ver militantes">
                        <IconButton
                          size="small"
                          onClick={() => verMilitantes(barrio)}
                          color="info"
                        >
                          <PeopleIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <PermissionIconButton
                        permiso="write"
                        tooltip="Editar"
                        size="small"
                        onClick={() => handleOpenForm(barrio)}
                        color="primary"
                      >
                        <EditIcon fontSize="small" />
                      </PermissionIconButton>
                      <PermissionIconButton
                        permiso="delete"
                        tooltip="Eliminar"
                        size="small"
                        onClick={() => handleEliminarBarrio(barrio.id)}
                        color="error"
                      >
                        <DeleteIcon fontSize="small" />
                      </PermissionIconButton>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
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

      {/* Dialog para ver militantes */}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          Militantes del Barrio: {capitalizar(barrioActual?.nombre || '')}
        </DialogTitle>
        <DialogContent>
          {militantesBarrio.length > 0 ? (
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Nombre</TableCell>
                  <TableCell>Categoría</TableCell>
                  <TableCell>Teléfono</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {militantesBarrio.map((militante, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      {capitalizar(militante.nombre)} {capitalizar(militante.apellido)}
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={capitalizar(militante.categoria)} 
                        size="small" 
                        color="primary"
                        variant="outlined"
                        onClick={() => {}}
                      />
                    </TableCell>
                    <TableCell>{militante.telefono || 'Sin teléfono'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <Alert severity="info">
              No hay militantes registrados en este barrio
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cerrar</Button>
        </DialogActions>
      </Dialog>

      {/* Dialog para formulario */}
      <Dialog open={openForm} onClose={handleCloseForm} maxWidth="sm" fullWidth>
        <form onSubmit={handleSubmitForm}>
          <DialogTitle>
            {editId ? 'Editar Barrio' : 'Nuevo Barrio'}
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <TextField
                  label="Nombre del Barrio"
                  value={form.nombre}
                  onChange={(e) => setForm(prev => ({ ...prev, nombre: e.target.value }))}
                  fullWidth
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Seccional"
                  value={form.seccional_nombre}
                  onChange={(e) => setForm(prev => ({ ...prev, seccional_nombre: e.target.value }))}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Subcircuito"
                  value={form.subcircuito}
                  onChange={(e) => setForm(prev => ({ ...prev, subcircuito: e.target.value }))}
                  fullWidth
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseForm}>Cancelar</Button>
            <Button type="submit" variant="contained" disabled={loading}>
              {loading ? <CircularProgress size={20} /> : (editId ? 'Actualizar' : 'Crear')}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
});

BarriosPage.displayName = 'BarriosPage';

export default BarriosPage;
