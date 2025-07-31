import React, { useEffect, useState } from "react";
import { 
  Box, 
  Typography, 
  Paper, 
  Autocomplete, 
  TextField, 
  Button, 
  TableContainer, 
  Table, 
  TableHead, 
  TableRow, 
  TableCell, 
  TableBody, 
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Grid,
  Alert
} from '@mui/material';
import api from '../services/api';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { useCachedData, useCacheInvalidation } from '../hooks/useCachedData';

const ResultadosPage = () => {
  // Usar cache para cargar seccionales (datos relativamente estáticos)
  const { 
    data: seccionales, 
    loading: seccionalesLoading, 
    error: seccionalesError 
  } = useCachedData('seccionales', () => 
    api.get('/subcircuitos/seccionales').then(res => res.data)
  );

  const [selectedSeccionales, setSelectedSeccionales] = useState([]);
  const [subcircuitos, setSubcircuitos] = useState([]);
  const [selectedSubcircuitos, setSelectedSubcircuitos] = useState([]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [tipoEleccion, setTipoEleccion] = useState('');
  const [anio, setAnio] = useState('');
  const [error, setError] = useState('');

  const tiposEleccion = [
    { id: 1, nombre: 'Vecinal' },
    { id: 2, nombre: 'Municipal' },
    { id: 3, nombre: 'Provincial' },
    { id: 4, nombre: 'Nacional' }
  ];
  
  const aniosDisponibles = ['2019', '2021', '2023', '2025'];

  // Combinar errores
  const finalError = error || seccionalesError;

  // Cargar subcircuitos cuando cambian las seccionales seleccionadas
  useEffect(() => {
    const cargarSubcircuitos = async () => {
      if (!selectedSeccionales || selectedSeccionales.length === 0) {
        setSubcircuitos([]);
        setSelectedSubcircuitos([]);
        return;
      }

      try {
        const promesas = selectedSeccionales.map(seccional => 
          api.get(`/subcircuitos?seccional=${seccional}`)
        );
        const responses = await Promise.all(promesas);
        
        // Combinar todos los subcircuitos y eliminar duplicados
        const todosSubcircuitos = responses.flatMap(res => res.data);
        const subcircuitosUnicos = todosSubcircuitos.reduce((acc, current) => {
          const existe = acc.find(item => 
            item.subcircuito === current.subcircuito && 
            item.numero_seccional === current.numero_seccional
          );
          if (!existe) {
            acc.push(current);
          }
          return acc;
        }, []);
        
        setSubcircuitos(subcircuitosUnicos);
      } catch (error) {
        console.error('Error al cargar subcircuitos:', error);
        setError('Error al cargar los subcircuitos');
      }
    };

    cargarSubcircuitos();
  }, [selectedSeccionales]);

  // Cargar resultados cuando cambian los filtros
  useEffect(() => {
    if (selectedSeccionales.length === 0) {
      setResults([]);
      return;
    }

    const fetchResults = async () => {
      setLoading(true);
      setError('');
      
      try {
        const params = new URLSearchParams();
        
        // Filtrar por seccionales
        if (selectedSeccionales.length > 0) {
          params.append('seccionales', selectedSeccionales.join(','));
        }
        
        // Filtrar por subcircuitos específicos
        if (selectedSubcircuitos.length > 0) {
          params.append('subcircuitos', selectedSubcircuitos.join(','));
        }
        
        // Filtrar por tipo de elección
        if (tipoEleccion) {
          params.append('tipo_eleccion', tipoEleccion);
        }
        
        // Filtrar por año
        if (anio) {
          params.append('anio', anio);
        }

        const response = await api.get(`/resultados/combinados?${params.toString()}`);
        setResults(response.data);
      } catch (error) {
        console.error('Error al cargar resultados:', error);
        setError('Error al cargar los resultados');
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [selectedSeccionales, selectedSubcircuitos, tipoEleccion, anio]);

  const exportarAExcel = () => {
    if (results.length === 0) {
      setError('No hay resultados para exportar');
      return;
    }

    const dataToExport = results.map(r => ({
      'Fecha': new Date(r.fecha).toLocaleDateString(),
      'Seccional': r.numero_seccional,
      'Subcircuito': r.subcircuito && r.subcircuito !== 'null' ? r.subcircuito : 'Sin letra',
      'Escuela': r.escuela_nombre || 'N/A',
      'Mesa': r.numero_mesa || 'N/A',
      'Tipo de Elección': r.tipo_eleccion_nombre,
      'Origen': r.origen === 'escuela' ? 'Mesa' : 'Subcircuito',
      'Total Votantes': r.total_votantes,
      'Total Electores Padrón': r.total_electores_padron && r.total_electores_padron > 0 ? r.total_electores_padron : 'N/A',
      'Frente Cívico': r.frente_civico,
      'Peronismo': r.peronismo,
      'Otro': r.otro,
      'Votos Nulos': r.total_nulos,
      'Votos en Blanco': r.total_blancos,
      'Participación %': r.total_electores_padron && r.total_electores_padron > 0 ? 
        ((r.total_votantes / r.total_electores_padron) * 100).toFixed(2) : 'N/A'
    }));

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(dataToExport);
    
    // Ajustar ancho de columnas
    const colWidths = Object.keys(dataToExport[0] || {}).map(() => ({ width: 15 }));
    ws['!cols'] = colWidths;
    
    XLSX.utils.book_append_sheet(wb, ws, 'Resultados');
    const buf = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    
    const filename = `resultados_${new Date().toISOString().split('T')[0]}.xlsx`;
    saveAs(new Blob([buf], { type: 'application/octet-stream' }), filename);
  };

  const limpiarFiltros = () => {
    setSelectedSeccionales([]);
    setSelectedSubcircuitos([]);
    setTipoEleccion('');
    setAnio('');
  };

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" fontWeight={700} gutterBottom>
        Resultados Electorales
      </Typography>
      
      {finalError && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {finalError}
        </Alert>
      )}

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Filtros
        </Typography>
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Autocomplete
              multiple
              options={seccionales || []}
              getOptionLabel={(option) => `${option.numero} - ${option.nombre}`}
              value={(seccionales || []).filter(s => selectedSeccionales.includes(s.numero))}
              onChange={(event, newValue) => {
                setSelectedSeccionales(newValue.map(v => v.numero));
              }}
              loading={seccionalesLoading}
              renderInput={(params) => (
                <TextField 
                  {...params} 
                  label="Seccionales" 
                  placeholder="Seleccione seccionales"
                />
              )}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                  <Chip
                    key={option.numero}
                    variant="outlined"
                    label={option.numero}
                    size="small"
                    {...getTagProps({ index })}
                  />
                ))
              }
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <Autocomplete
              multiple
              options={subcircuitos}
              getOptionLabel={(option) => `Seccional ${option.numero_seccional} - ${option.nombre}`}
              value={subcircuitos.filter(s => selectedSubcircuitos.includes(s.subcircuito))}
              onChange={(event, newValue) => {
                setSelectedSubcircuitos(newValue.map(v => v.subcircuito));
              }}
              disabled={selectedSeccionales.length === 0}
              renderInput={(params) => (
                <TextField 
                  {...params} 
                  label="Subcircuitos" 
                  placeholder="Todos los subcircuitos (opcional)"
                />
              )}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                  <Chip
                    key={`${option.numero_seccional}-${option.subcircuito}`}
                    variant="outlined"
                    label={`${option.numero_seccional}-${option.subcircuito}`}
                    size="small"
                    {...getTagProps({ index })}
                  />
                ))
              }
            />
          </Grid>

          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel>Tipo de Elección</InputLabel>
              <Select
                value={tipoEleccion}
                label="Tipo de Elección"
                onChange={(e) => setTipoEleccion(e.target.value)}
              >
                <MenuItem value="">Todos los tipos</MenuItem>
                {tiposEleccion.map((tipo) => (
                  <MenuItem key={tipo.id} value={tipo.id}>
                    {tipo.nombre}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel>Año</InputLabel>
              <Select
                value={anio}
                label="Año"
                onChange={(e) => setAnio(e.target.value)}
              >
                <MenuItem value="">Todos los años</MenuItem>
                {aniosDisponibles.map((año) => (
                  <MenuItem key={año} value={año}>
                    {año}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={4}>
            <Box sx={{ display: 'flex', gap: 1, height: '100%', alignItems: 'center' }}>
              <Button 
                variant="outlined" 
                onClick={limpiarFiltros}
                fullWidth
              >
                Limpiar Filtros
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6">
          Resultados encontrados: {results.length}
        </Typography>
        <Button 
          variant="contained" 
          onClick={exportarAExcel}
          disabled={results.length === 0}
        >
          Exportar a Excel
        </Button>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper} sx={{ mb: 4 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Fecha</TableCell>
                <TableCell>Seccional</TableCell>
                <TableCell>Subcircuito</TableCell>
                <TableCell>Tipo</TableCell>
                <TableCell>Origen</TableCell>
                <TableCell align="right">Votantes</TableCell>
                <TableCell align="right">Padrón</TableCell>
                <TableCell align="right">Participación %</TableCell>
                <TableCell align="right">F. Cívico</TableCell>
                <TableCell align="right">Peronismo</TableCell>
                <TableCell align="right">Otro</TableCell>
                <TableCell align="right">Nulos</TableCell>
                <TableCell align="right">Blancos</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {results.map((resultado, idx) => {
                const participacion = resultado.total_electores_padron && resultado.total_electores_padron > 0 ? 
                  ((resultado.total_votantes / resultado.total_electores_padron) * 100).toFixed(2) : 'N/A';
                
                return (
                  <TableRow key={idx}>
                    <TableCell>
                      {new Date(resultado.fecha).toLocaleDateString()}
                    </TableCell>
                    <TableCell>{resultado.numero_seccional}</TableCell>
                    <TableCell>
                      {resultado.subcircuito && resultado.subcircuito !== 'null' ? resultado.subcircuito : 'Sin letra'}
                      {resultado.escuela_nombre && (
                        <Typography variant="caption" display="block" color="text.secondary">
                          {resultado.escuela_nombre}
                          {resultado.numero_mesa && ` - Mesa ${resultado.numero_mesa}`}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>{resultado.tipo_eleccion_nombre}</TableCell>
                    <TableCell>
                      <Chip 
                        label={resultado.origen === 'escuela' ? 'Mesa' : 'Subcircuito'} 
                        size="small"
                        color={resultado.origen === 'escuela' ? 'primary' : 'secondary'}
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell align="right">{resultado.total_votantes}</TableCell>
                    <TableCell align="right">
                      {resultado.total_electores_padron && resultado.total_electores_padron > 0 ? 
                        resultado.total_electores_padron : 'N/A'}
                    </TableCell>
                    <TableCell align="right">
                      {participacion !== 'N/A' ? `${participacion}%` : 'N/A'}
                    </TableCell>
                    <TableCell align="right">{resultado.frente_civico}</TableCell>
                    <TableCell align="right">{resultado.peronismo}</TableCell>
                    <TableCell align="right">{resultado.otro}</TableCell>
                    <TableCell align="right">{resultado.total_nulos}</TableCell>
                    <TableCell align="right">{resultado.total_blancos}</TableCell>
                  </TableRow>
                );
              })}
              {results.length === 0 && !loading && (
                <TableRow>
                  <TableCell colSpan={13} align="center">
                    <Typography variant="body2" color="text.secondary">
                      {selectedSeccionales.length === 0 
                        ? 'Seleccione al menos una seccional para ver los resultados'
                        : 'No se encontraron resultados con los filtros seleccionados'
                      }
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

ResultadosPage.displayName = 'ResultadosPage';
export default ResultadosPage;
