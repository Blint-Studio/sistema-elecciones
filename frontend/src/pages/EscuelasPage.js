import React, { useState, useCallback, useMemo } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  TextField,
  InputAdornment,
  Grid,
  Autocomplete
} from '@mui/material';
import {
  School,
  Person,
  PersonAdd,
  PersonRemove,
  Search,
  FileDownload,
  Assignment,
  LocationOn,
  Phone,
  Instagram,
  Person as PersonIcon,
  Work as WorkIcon,
  Phone as PhoneIcon,
  Cake as CakeIcon
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import { PermissionButton, PermissionIconButton } from '../components/PermissionComponents';
import { createMilitante } from '../services/militantesService';
import { getEscuelas } from '../services/escuelasService';
import { getBarrios } from '../services/barriosService';
import { useCachedData, useCacheInvalidation } from '../hooks/useCachedData';
import { invalidateRelatedCaches } from '../utils/globalCache';

// Función helper para obtener escuelas con encargados (fuera del componente para evitar recreaciones)
const getEscuelasWithEncargados = async () => {
  const token = localStorage.getItem('token');
  const response = await fetch('http://localhost:5000/api/escuelas', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (!response.ok) throw new Error('Error al cargar escuelas');
  return response.json();
};

// Componente optimizado para filas de la tabla (React.memo para evitar re-renders innecesarios)
const EscuelaTableRow = React.memo(({ 
  escuela, 
  capitalizar, 
  abrirDialogoAsignar, 
  abrirDialogoRemover 
}) => (
  <TableRow key={escuela.id}>
    <TableCell>
      <Typography variant="body2" fontWeight="bold">
        {escuela.nombre}
      </Typography>
    </TableCell>
    <TableCell>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <LocationOn fontSize="small" color="action" />
        <Typography variant="body2">
          {escuela.direccion}
        </Typography>
      </Box>
    </TableCell>
    <TableCell>
      <Chip
        label={capitalizar(escuela.seccional_nombre)}
        color="info"
        size="small"
        variant="filled"
      />
    </TableCell>
    <TableCell>
      <Typography variant="body2">
        {escuela.cantidad_mesas || 0}
      </Typography>
    </TableCell>
    <TableCell>
      <Typography variant="body2">
        {(escuela.electores || 0).toLocaleString()}
      </Typography>
    </TableCell>
    <TableCell>
      {escuela.id_encargado ? (
        <Chip
          label={`${escuela.encargado_nombre} ${escuela.encargado_apellido}`}
          color="success"
          size="small"
          icon={<Person />}
        />
      ) : (
        <Chip
          label="Sin asignar"
          color="warning"
          size="small"
          icon={<PersonAdd />}
        />
      )}
    </TableCell>
    <TableCell>
      {escuela.encargado_telefono && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Phone fontSize="small" color="action" />
            <Typography variant="caption">
              {escuela.encargado_telefono}
            </Typography>
          </Box>
          {escuela.encargado_instagram && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Instagram fontSize="small" color="action" />
              <Typography variant="caption">
                {escuela.encargado_instagram}
              </Typography>
            </Box>
          )}
        </Box>
      )}
    </TableCell>
    <TableCell>
      <Box sx={{ display: 'flex', gap: 1 }}>
        {escuela.id_encargado ? (
          <PermissionIconButton
            requiredPermission="write"
            tooltip="Remover encargado"
            color="error"
            size="small"
            onClick={() => abrirDialogoRemover(escuela)}
          >
            <PersonRemove />
          </PermissionIconButton>
        ) : (
          <PermissionIconButton
            requiredPermission="write"
            tooltip="Asignar encargado"
            color="primary"
            size="small"
            onClick={() => abrirDialogoAsignar(escuela)}
          >
            <PersonAdd />
          </PermissionIconButton>
        )}
      </Box>
    </TableCell>
  </TableRow>
));

// Constantes compartidas con MilitantesPage (optimizadas como constantes inmutables)
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

// Seccionales como constante inmutable para mejor rendimiento
const SECCIONALES = Object.freeze([
  { numero: '01', nombre: 'PRIMERA' },
  { numero: '02', nombre: 'SEGUNDA' },
  { numero: '03', nombre: 'TERCERA' },
  { numero: '04', nombre: 'CUARTA' },
  { numero: '05', nombre: 'QUINTA' },
  { numero: '06', nombre: 'SEXTA' },
  { numero: '07', nombre: 'SÉPTIMA' },
  { numero: '08', nombre: 'OCTAVA' },
  { numero: '09', nombre: 'NOVENA' },
  { numero: '10', nombre: 'DÉCIMA' },
  { numero: '11', nombre: 'UNDÉCIMA' },
  { numero: '12', nombre: 'DUODÉCIMA' },
  { numero: '13', nombre: 'DECIMOTERCERA' },
  { numero: '14', nombre: 'DECIMOCUARTA' }
]);

// Estado inicial optimizado para nuevo militante
const INITIAL_MILITANTE_STATE = Object.freeze({
  nombre: '',
  apellido: '',
  fecha_nacimiento: '',
  edad: '',
  telefono: '',
  instagram: '',
  categoria: 'encargado de escuela',
  id_barrio: '',
  trabaja: null, // Cambiar a null para evitar problemas con la BD
  dependencia: '',
  tipo_trabajo: ''
});

const EscuelasPage = () => {
  // Usar hooks individuales en lugar de useMultipleCachedData para evitar problemas de dependencias
  const { 
    data: escuelas, 
    loading: escuelasLoading, 
    error: escuelasError,
    refetch: refetchEscuelas 
  } = useCachedData('escuelas', getEscuelasWithEncargados);

  const { 
    data: barrios, 
    loading: barriosLoading, 
    error: barriosError,
    refetch: refetchBarrios 
  } = useCachedData('barrios', getBarrios);

  // Estados derivados
  const loading = escuelasLoading || barriosLoading;
  const loadingError = escuelasError || barriosError;
  
  const refetchAll = useCallback(async () => {
    await Promise.all([
      refetchEscuelas(),
      refetchBarrios()
    ]);
  }, [refetchEscuelas, refetchBarrios]);

  const invalidateRelatedCaches = useCacheInvalidation();

  // Estados locales optimizados
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Estados de filtros optimizados
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSeccional, setSelectedSeccional] = useState('');
  
  // Estados para modales optimizados
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedEscuela, setSelectedEscuela] = useState(null);
  const [selectedEncargado, setSelectedEncargado] = useState('');
  const [dialogType, setDialogType] = useState('');
  const [assignmentType, setAssignmentType] = useState('');
  const [encargadosDisponibles, setEncargadosDisponibles] = useState([]);
  const [militantesDisponibles, setMilitantesDisponibles] = useState([]);
  
  // Estados para crear nuevo militante optimizados
  const [nuevoMilitante, setNuevoMilitante] = useState(INITIAL_MILITANTE_STATE);

  // Función para capitalizar texto (memoizada para mejor rendimiento)
  const capitalizar = useCallback((texto) => {
    if (!texto || typeof texto !== 'string') return "";
    return texto.charAt(0).toUpperCase() + texto.slice(1).toLowerCase();
  }, []);

  // Calcular edad y determinar categoría automáticamente (memoizada)
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

  // Filtrado optimizado con useMemo para evitar recálculos innecesarios
  const filteredEscuelas = useMemo(() => {
    if (!escuelas || !Array.isArray(escuelas)) return [];
    let filtered = [...escuelas];
    
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(escuela =>
        escuela.nombre?.toLowerCase().includes(searchLower) ||
        escuela.direccion?.toLowerCase().includes(searchLower) ||
        (escuela.encargado_nombre && 
         `${escuela.encargado_nombre} ${escuela.encargado_apellido}`.toLowerCase().includes(searchLower))
      );
    }
    
    if (selectedSeccional) {
      filtered = filtered.filter(escuela => 
        escuela.seccional_nombre && escuela.seccional_nombre.includes(selectedSeccional)
      );
    }
    
    return filtered;
  }, [escuelas, searchTerm, selectedSeccional]);

  // Estadísticas optimizadas con useMemo
  const stats = useMemo(() => {
    const total = (escuelas || []).length;
    const filtrado = filteredEscuelas.length;
    const conEncargado = filteredEscuelas.filter(e => e.id_encargado).length;
    const sinEncargado = filtrado - conEncargado;
    const totalMesas = filteredEscuelas.reduce((sum, e) => sum + (e.cantidad_mesas || 0), 0);
    const totalElectores = filteredEscuelas.reduce((sum, e) => sum + (e.electores || 0), 0);

    return { total, filtrado, conEncargado, sinEncargado, totalMesas, totalElectores };
  }, [escuelas, filteredEscuelas]);

  // Función para cargar encargados disponibles cuando se necesite
  const cargarEncargadosDisponibles = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const [encargadosResponse, militantesResponse] = await Promise.all([
        fetch('http://localhost:5000/api/escuelas/encargados/disponibles', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch('http://localhost:5000/api/militantes', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);
      
      if (encargadosResponse.ok) {
        const encargadosData = await encargadosResponse.json();
        setEncargadosDisponibles(encargadosData);
      }
      
      if (militantesResponse.ok) {
        const militantesData = await militantesResponse.json();
        setMilitantesDisponibles(militantesData.filter(m => m.categoria === 'mayores' || m.categoria === 'juventud'));
      }
    } catch (err) {
      console.error('Error al cargar encargados:', err);
    }
  }, []);

  // Funciones de manejo de diálogos optimizadas
  const abrirDialogoAsignar = useCallback((escuela) => {
    setSelectedEscuela(escuela);
    setSelectedEncargado('');
    setAssignmentType('');
    setNuevoMilitante({ ...INITIAL_MILITANTE_STATE });
    setDialogType('assign');
    setDialogOpen(true);
    // Cargar encargados disponibles cuando se abre el diálogo
    cargarEncargadosDisponibles();
  }, [cargarEncargadosDisponibles]);

  const abrirDialogoRemover = useCallback((escuela) => {
    setSelectedEscuela(escuela);
    setDialogType('remove');
    setDialogOpen(true);
  }, []);

  const cerrarDialogo = useCallback(() => {
    setDialogOpen(false);
    setSelectedEscuela(null);
    setSelectedEncargado('');
    setDialogType('');
    setAssignmentType('');
    setNuevoMilitante({ ...INITIAL_MILITANTE_STATE });
  }, []);

  // Función optimizada de asignación de encargado
  const asignarEncargado = useCallback(async () => {
    let encargadoId;

    try {
      const token = localStorage.getItem('token');

      if (assignmentType === 'existing_encargado') {
        encargadoId = selectedEncargado;
      } else if (assignmentType === 'existing') {
        const updateResponse = await fetch(`http://localhost:5000/api/militantes/${selectedEncargado}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ categoria: 'encargado de escuela' })
        });

        if (!updateResponse.ok) {
          throw new Error('Error al actualizar categoría del militante');
        }

        encargadoId = selectedEncargado;
        // Invalidar cache cuando se actualiza un militante
        invalidateRelatedCaches('militante_updated');
      } else {
        // Crear nuevo militante
        const { edad, ...formWithoutEdad } = nuevoMilitante;
        const militanteData = {
          ...formWithoutEdad,
          nombre: capitalizar(nuevoMilitante.nombre.trim()),
          apellido: capitalizar(nuevoMilitante.apellido.trim()),
          telefono: nuevoMilitante.telefono?.trim() || '',
          instagram: nuevoMilitante.instagram?.trim() || '',
          categoria: 'encargado de escuela',
          id_barrio: parseInt(nuevoMilitante.id_barrio),
          fecha_nacimiento: nuevoMilitante.fecha_nacimiento || null,
          trabaja: nuevoMilitante.trabaja || null,
          dependencia: (nuevoMilitante.dependencia?.trim() && nuevoMilitante.trabaja === 'SI') ? nuevoMilitante.dependencia.trim() : null,
          tipo_trabajo: (nuevoMilitante.tipo_trabajo?.trim() && nuevoMilitante.trabaja === 'SI') ? nuevoMilitante.tipo_trabajo.trim() : null
        };

        const createdMilitante = await createMilitante(militanteData);
        encargadoId = createdMilitante.id;
        // Invalidar cache cuando se crea un militante
        await invalidateRelatedCaches();
      }

      // Asignar el encargado a la escuela
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:5000/api/escuelas/${selectedEscuela.id}/encargado`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ encargado_id: encargadoId })
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Error al asignar encargado');
        }

        const result = await response.json();
        
        window.alert('Encargado asignado exitosamente');
        await invalidateRelatedCaches();
        cerrarDialogo();
        await refetchAll();
      } catch (assignError) {
        setError(assignError.message);
      }
    } catch (err) {
      setError(err.message);
    }
  }, [assignmentType, selectedEncargado, selectedEscuela, nuevoMilitante, capitalizar, cerrarDialogo, refetchAll, invalidateRelatedCaches]);

  // Función optimizada para remover encargado
  const removerEncargado = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/escuelas/${selectedEscuela.id}/encargado`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al remover encargado');
      }

      const result = await response.json();
      
      window.alert('Encargado removido exitosamente');
      await invalidateRelatedCaches();
      cerrarDialogo();
      await refetchAll();
    } catch (error) {
      setError(error.message);
    }
  }, [selectedEscuela, cerrarDialogo, refetchAll, invalidateRelatedCaches]);

  // Función optimizada de exportación a Excel
  const exportarExcel = useCallback(() => {
    const datosExport = filteredEscuelas.map(escuela => ({
      'Escuela': escuela.nombre,
      'Dirección': escuela.direccion,
      'Seccional': escuela.seccional_nombre || '',
      'Subcircuito': escuela.subcircuito || '',
      'Cantidad Mesas': escuela.cantidad_mesas || 0,
      'Electores': escuela.electores || 0,
      'Encargado': escuela.encargado_nombre ? 
        `${escuela.encargado_nombre} ${escuela.encargado_apellido}` : 'Sin asignar',
      'Teléfono Encargado': escuela.encargado_telefono || '',
      'Instagram Encargado': escuela.encargado_instagram || ''
    }));

    const ws = XLSX.utils.json_to_sheet(datosExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Escuelas');
    
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    
    saveAs(data, `escuelas_${new Date().toISOString().split('T')[0]}.xlsx`);
  }, [filteredEscuelas]);

  // Handlers optimizados para cambios en el formulario
  const handleInputChange = useCallback((field, value) => {
    setNuevoMilitante(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleDateChange = useCallback((newDate) => {
    if (newDate) {
      const dateStr = newDate.toISOString().split('T')[0];
      const { edad, categoria } = calcularEdadYCategoria(dateStr);
      
      setNuevoMilitante(prev => ({
        ...prev,
        fecha_nacimiento: dateStr,
        edad: edad || "",
        categoria: 'encargado de escuela'
      }));
    } else {
      setNuevoMilitante(prev => ({
        ...prev,
        fecha_nacimiento: "",
        edad: "",
        categoria: 'encargado de escuela'
      }));
    }
  }, [calcularEdadYCategoria]);

  const handleTrabajaChange = useCallback((value) => {
    setNuevoMilitante(prev => ({
      ...prev,
      trabaja: value || null, // Asegurar null en lugar de cadena vacía
      dependencia: value === "SI" ? prev.dependencia : "",
      tipo_trabajo: value === "SI" ? prev.tipo_trabajo : ""
    }));
  }, []);

  // Handlers optimizados para filtros
  const handleSearchChange = useCallback((e) => {
    setSearchTerm(e.target.value);
  }, []);

  const handleSeccionalChange = useCallback((e) => {
    setSelectedSeccional(e.target.value);
  }, []);

  const handleAssignmentTypeChange = useCallback((e) => {
    setAssignmentType(e.target.value);
    setSelectedEncargado(''); // Reset encargado selection
  }, []);

  const handleEncargadoChange = useCallback((e) => {
    setSelectedEncargado(e.target.value);
  }, []);

  // Barrios optimizados para Autocomplete (memoizados)
  const barriosOptions = useMemo(() => 
    (barrios || []).map(barrio => ({
      ...barrio,
      label: `${capitalizar(barrio.nombre)} (${barrio.seccional_nombre || 'Sin seccional'})`
    }))
  , [barrios, capitalizar]);

  // Función para limpiar mensajes
  const clearError = useCallback(() => setError(''), []);
  const clearSuccess = useCallback(() => setSuccess(''), []);

  // Mostrar errores de carga si los hay
  const displayError = error || loadingError;

  if (loading) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography>Cargando escuelas...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <School color="primary" />
        Gestión de Escuelas
      </Typography>

      {displayError && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={clearError}>
          {displayError}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={clearSuccess}>
          {success}
        </Alert>
      )}

      {/* Estadísticas */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <School sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
              <Typography variant="h4" color="primary">{stats.total}</Typography>
              <Typography variant="body2" color="textSecondary">Total Escuelas</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Assignment sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
              <Typography variant="h4" color="success.main">{stats.conEncargado}</Typography>
              <Typography variant="body2" color="textSecondary">Con Encargado</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <PersonAdd sx={{ fontSize: 40, color: 'warning.main', mb: 1 }} />
              <Typography variant="h4" color="warning.main">{stats.sinEncargado}</Typography>
              <Typography variant="body2" color="textSecondary">Sin Encargado</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="info.main">{stats.totalMesas}</Typography>
              <Typography variant="body2" color="textSecondary">Total Mesas</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="info.main">{stats.totalElectores.toLocaleString()}</Typography>
              <Typography variant="body2" color="textSecondary">Total Electores</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filtros y acciones */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                placeholder="Buscar por escuela, dirección o encargado..."
                value={searchTerm}
                onChange={handleSearchChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Filtrar por Seccional</InputLabel>
                <Select
                  value={selectedSeccional}
                  onChange={handleSeccionalChange}
                  label="Filtrar por Seccional"
                >
                  <MenuItem value="">Todas las Seccionales</MenuItem>
                  {SECCIONALES.map((seccional) => (
                    <MenuItem key={seccional.numero} value={seccional.numero}>
                      {seccional.numero} - {seccional.nombre}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={5} sx={{ textAlign: 'right' }}>
              <PermissionButton
                requiredPermission="export"
                variant="outlined"
                startIcon={<FileDownload />}
                onClick={exportarExcel}
                sx={{ mr: 1 }}
              >
                Exportar Excel
              </PermissionButton>
              <Button
                variant="contained"
                onClick={() => refetchAll(true)}
              >
                Actualizar
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Tabla de escuelas */}
      <Card>
        <CardContent>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell><strong>Escuela</strong></TableCell>
                  <TableCell><strong>Dirección</strong></TableCell>
                  <TableCell><strong>Seccional</strong></TableCell>
                  <TableCell><strong>Mesas</strong></TableCell>
                  <TableCell><strong>Electores</strong></TableCell>
                  <TableCell><strong>Encargado</strong></TableCell>
                  <TableCell><strong>Contacto</strong></TableCell>
                  <TableCell><strong>Acciones</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredEscuelas.map((escuela) => (
                  <EscuelaTableRow
                    key={escuela.id}
                    escuela={escuela}
                    capitalizar={capitalizar}
                    abrirDialogoAsignar={abrirDialogoAsignar}
                    abrirDialogoRemover={abrirDialogoRemover}
                  />
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Dialog para asignar/remover encargado */}
      <Dialog open={dialogOpen} onClose={cerrarDialogo} maxWidth="sm" fullWidth>
        <DialogTitle>
          {dialogType === 'assign' ? 'Asignar Encargado' : 'Remover Encargado'}
        </DialogTitle>
        <DialogContent>
          {dialogType === 'assign' ? (
            <>
              <Typography variant="body2" sx={{ mb: 2 }}>
                Escuela: <strong>{selectedEscuela?.nombre}</strong>
              </Typography>
              
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Tipo de Asignación</InputLabel>
                <Select
                  value={assignmentType}
                  onChange={handleAssignmentTypeChange}
                  label="Tipo de Asignación"
                >
                  <MenuItem value="existing_encargado">Encargado ya existente</MenuItem>
                  <MenuItem value="existing">Militante existente (cambiar categoría)</MenuItem>
                  <MenuItem value="new">Crear nuevo militante</MenuItem>
                </Select>
              </FormControl>

              {assignmentType === 'existing_encargado' && (
                <FormControl fullWidth>
                  <InputLabel>Seleccionar Encargado</InputLabel>
                  <Select
                    value={selectedEncargado}
                    onChange={handleEncargadoChange}
                    label="Seleccionar Encargado"
                  >
                    {encargadosDisponibles
                      .filter(enc => enc.estado === 'Disponible')
                      .map((encargado) => (
                      <MenuItem key={encargado.id} value={encargado.id}>
                        {encargado.apellido}, {encargado.nombre}
                        {encargado.barrio_nombre && ` - ${encargado.barrio_nombre}`}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}

              {assignmentType === 'existing' && (
                <FormControl fullWidth>
                  <InputLabel>Seleccionar Militante</InputLabel>
                  <Select
                    value={selectedEncargado}
                    onChange={handleEncargadoChange}
                    label="Seleccionar Militante"
                  >
                    {militantesDisponibles.map((militante) => (
                      <MenuItem key={militante.id} value={militante.id}>
                        {militante.apellido}, {militante.nombre} - {militante.categoria}
                        {militante.barrio_nombre && ` - ${militante.barrio_nombre}`}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}

              {assignmentType === 'new' && (
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <Box sx={{ mt: 3 }}>
                    {/* Sección de Datos Personales */}
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
                            value={nuevoMilitante.nombre}
                            onChange={(e) => handleInputChange('nombre', e.target.value)}
                            fullWidth
                            required
                            variant="outlined"
                            helperText="Nombre del encargado"
                          />
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <TextField
                            label="Apellido *"
                            value={nuevoMilitante.apellido}
                            onChange={(e) => handleInputChange('apellido', e.target.value)}
                            fullWidth
                            required
                            variant="outlined"
                            helperText="Apellido del encargado"
                          />
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <DatePicker
                            label="Fecha de Nacimiento *"
                            value={nuevoMilitante.fecha_nacimiento ? new Date(nuevoMilitante.fecha_nacimiento) : null}
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
                            value={nuevoMilitante.edad ? `${nuevoMilitante.edad} años` : ''}
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

                    {/* Sección de Categorización */}
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
                          <TextField
                            label="Categoría"
                            value="Encargado de escuela"
                            fullWidth
                            disabled
                            variant="outlined"
                            helperText="Categoría asignada automáticamente para encargados de escuela"
                            InputProps={{
                              startAdornment: <PersonIcon sx={{ mr: 1, color: 'action.active' }} />
                            }}
                          />
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <Autocomplete
                            options={barriosOptions}
                            getOptionLabel={(barrio) => barrio.label}
                            value={barriosOptions.find(b => b.id === nuevoMilitante.id_barrio) || null}
                            onChange={(_, newValue) => {
                              handleInputChange('id_barrio', newValue?.id || "");
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
                            filterOptions={(options, { inputValue }) => {
                              const filterValue = inputValue.toLowerCase();
                              return options.filter(option => 
                                option.nombre.toLowerCase().includes(filterValue) ||
                                (option.seccional_nombre && option.seccional_nombre.toLowerCase().includes(filterValue))
                              );
                            }}
                          />
                        </Grid>
                      </Grid>
                    </Box>

                    {/* Sección de Información de Contacto */}
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
                            value={nuevoMilitante.telefono}
                            onChange={(e) => handleInputChange('telefono', e.target.value)}
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
                            value={nuevoMilitante.instagram}
                            onChange={(e) => handleInputChange('instagram', e.target.value)}
                            fullWidth
                            variant="outlined"
                            helperText="Usuario de Instagram (sin @)"
                            InputProps={{
                              startAdornment: <Instagram sx={{ mr: 1, color: 'action.active' }} />
                            }}
                          />
                        </Grid>
                      </Grid>
                    </Box>

                    {/* Sección de Información Laboral */}
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
                              value={nuevoMilitante.trabaja || ''} // Mostrar cadena vacía en lugar de null en el UI
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
                              Indique si el encargado tiene trabajo
                            </Typography>
                          </FormControl>
                        </Grid>
                        <Grid item xs={12} md={4}>
                          <FormControl fullWidth disabled={nuevoMilitante.trabaja !== "SI"} variant="outlined">
                            <InputLabel>Dependencia</InputLabel>
                            <Select
                              value={nuevoMilitante.dependencia}
                              onChange={(e) => handleInputChange('dependencia', e.target.value)}
                              label="Dependencia"
                            >
                              <MenuItem value="">Seleccionar dependencia</MenuItem>
                              {DEPENDENCIAS.map(dep => (
                                <MenuItem key={dep} value={dep}>{dep}</MenuItem>
                              ))}
                            </Select>
                            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, ml: 1 }}>
                              {nuevoMilitante.trabaja === "SI" ? "Seleccione la dependencia donde trabaja" : "Disponible solo si trabaja"}
                            </Typography>
                          </FormControl>
                        </Grid>
                        <Grid item xs={12} md={4}>
                          <FormControl fullWidth disabled={nuevoMilitante.trabaja !== "SI"} variant="outlined">
                            <InputLabel>Tipo de Trabajo</InputLabel>
                            <Select
                              value={nuevoMilitante.tipo_trabajo}
                              onChange={(e) => handleInputChange('tipo_trabajo', e.target.value)}
                              label="Tipo de Trabajo"
                            >
                              <MenuItem value="">Seleccionar tipo</MenuItem>
                              {TIPOS_TRABAJO.map(tipo => (
                                <MenuItem key={tipo} value={tipo}>{tipo}</MenuItem>
                              ))}
                            </Select>
                            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, ml: 1 }}>
                              {nuevoMilitante.trabaja === "SI" ? "Especifique el tipo de trabajo" : "Disponible solo si trabaja"}
                            </Typography>
                          </FormControl>
                        </Grid>
                      </Grid>
                    </Box>
                  </Box>
                </LocalizationProvider>
              )}
            </>
          ) : (
            <Typography variant="body1">
              ¿Está seguro que desea remover el encargado{' '}
              <strong>
                {selectedEscuela?.encargado_nombre} {selectedEscuela?.encargado_apellido}
              </strong>{' '}
              de la escuela <strong>{selectedEscuela?.nombre}</strong>?
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={cerrarDialogo}>Cancelar</Button>
          <Button
            onClick={dialogType === 'assign' ? asignarEncargado : removerEncargado}
            variant="contained"
            color={dialogType === 'assign' ? 'primary' : 'error'}
            disabled={dialogType === 'assign' && (
              !assignmentType || 
              (assignmentType === 'existing_encargado' && !selectedEncargado) ||
              (assignmentType === 'existing' && !selectedEncargado) ||
              (assignmentType === 'new' && (!nuevoMilitante.nombre || !nuevoMilitante.apellido || !nuevoMilitante.id_barrio || !nuevoMilitante.fecha_nacimiento))
            )}
          >
            {dialogType === 'assign' ? 'Asignar' : 'Remover'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default EscuelasPage;
