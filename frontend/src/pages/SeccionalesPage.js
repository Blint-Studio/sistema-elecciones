import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  CircularProgress,
  Alert,
  Chip,
  Grid,
  Card,
  CardContent,
  Divider,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Tooltip
} from "@mui/material";
import {
  Download as DownloadIcon,
  LocationOn as LocationIcon,
  School as SchoolIcon,
  Group as GroupIcon,
  HowToVote as VoteIcon,
  Assessment as AssessmentIcon,
  Equalizer,
  Search,
  FilterList,
  TrendingUp,
  Business as BusinessIcon,
  Person as PersonIcon
} from "@mui/icons-material";
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { getResumenSeccionales } from "../services/seccionalesService";
import { PermissionButton, PermissionIconButton } from '../components/PermissionComponents';
import { useCachedData } from '../hooks/useCachedData';

function SeccionalesPage() {
  // Usar el nuevo sistema de cache para obtener datos actualizados
  const { 
    data: seccionales, 
    loading, 
    error, 
    refetch 
  } = useCachedData('seccionales_resumen', getResumenSeccionales);
  
  // Estados para filtros modernos
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRango, setSelectedRango] = useState("");
  const [filteredSeccionales, setFilteredSeccionales] = useState([]);
  const [localError, setLocalError] = useState("");

  // Filtrar seccionales cuando cambien los filtros o los datos
  useEffect(() => {
    filtrarSeccionales();
  }, [searchTerm, selectedRango, seccionales]);

  const filtrarSeccionales = () => {
    // Asegurar que seccionales sea un array válido
    let filtered = Array.isArray(seccionales) ? [...seccionales] : [];
    
    if (searchTerm) {
      filtered = filtered.filter(seccional =>
        seccional.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        seccional.numero?.toString().includes(searchTerm)
      );
    }
    
    if (selectedRango) {
      const totalMilitantes = s => s.estadisticas?.total_militantes || 0;
      switch (selectedRango) {
        case "alto":
          filtered = filtered.filter(s => totalMilitantes(s) > 50);
          break;
        case "medio":
          filtered = filtered.filter(s => totalMilitantes(s) >= 20 && totalMilitantes(s) <= 50);
          break;
        case "bajo":
          filtered = filtered.filter(s => totalMilitantes(s) < 20);
          break;
        default:
          break;
      }
    }
    
    setFilteredSeccionales(filtered);
  };

  const exportarAExcel = () => {
    try {
      // Preparar datos para el Excel (usando datos filtrados)
      const datosParaExcel = filteredSeccionales.map(seccional => ({
        'Número': seccional.numero,
        'Nombre': seccional.nombre,
        'Total Barrios': seccional.estadisticas.total_barrios,
        'Total Militantes': seccional.estadisticas.total_militantes,
        'Total Escuelas': seccional.estadisticas.total_escuelas || 0,
        'Total Mesas': seccional.estadisticas.total_mesas,
        'Total Instituciones': seccional.estadisticas.total_instituciones || 0,
        'Total Dirigentes': seccional.estadisticas.total_dirigentes || 0
      }));

      // Crear workbook y worksheet
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(datosParaExcel);

      // Configurar anchos de columna
      const colWidths = [
        { wch: 10 }, // Número
        { wch: 15 }, // Nombre
        { wch: 15 }, // Total Barrios
        { wch: 15 }, // Total Escuelas
        { wch: 16 }, // Total Militantes
        { wch: 12 }, // Total Mesas
        { wch: 18 }, // Total Instituciones
        { wch: 16 }  // Total Dirigentes
      ];
      ws['!cols'] = colWidths;

      // Agregar hoja al workbook
      XLSX.utils.book_append_sheet(wb, ws, "Seccionales");

      // Generar archivo y descargarlo
      const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      const dataBlob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      
      const fecha = new Date().toISOString().split('T')[0];
      saveAs(dataBlob, `resumen_seccionales_${fecha}.xlsx`);
    } catch (err) {
      console.error("Error al exportar:", err);
      setLocalError("Error al exportar los datos a Excel");
    }
  };

  const calcularTotales = () => {
    if (!Array.isArray(filteredSeccionales) || filteredSeccionales.length === 0) {
      return {
        barrios: 0,
        escuelas: 0,
        militantes: 0,
        mesas: 0,
        instituciones: 0,
        dirigentes: 0
      };
    }

    return filteredSeccionales.reduce((acc, seccional) => ({
      barrios: acc.barrios + (seccional.estadisticas?.total_barrios || 0),
      escuelas: acc.escuelas + (seccional.estadisticas?.total_escuelas || 0),
      militantes: acc.militantes + (seccional.estadisticas?.total_militantes || 0),
      mesas: acc.mesas + (seccional.estadisticas?.total_mesas || 0),
      instituciones: acc.instituciones + (seccional.estadisticas?.total_instituciones || 0),
      dirigentes: acc.dirigentes + (seccional.estadisticas?.total_dirigentes || 0)
    }), {
      barrios: 0,
      escuelas: 0,
      militantes: 0,
      mesas: 0,
      instituciones: 0,
      dirigentes: 0
    });
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  const totales = calcularTotales();

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
          <Equalizer fontSize="large" />
          Resumen de Seccionales Electorales
        </Typography>
        <Typography variant="body1" color="textSecondary">
          Información consolidada de las 14 seccionales electorales
        </Typography>
      </Box>

      {(error || localError) && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setLocalError("")}>
          {error || localError}
        </Alert>
      )}

      {/* Estadísticas */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={2}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <LocationIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
              <Typography variant="h4" color="primary.main">{totales.barrios}</Typography>
              <Typography variant="body2" color="textSecondary">Barrios Totales</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <GroupIcon sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
              <Typography variant="h4" color="success.main">{totales.militantes}</Typography>
              <Typography variant="body2" color="textSecondary">Militantes</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <SchoolIcon sx={{ fontSize: 40, color: 'secondary.main', mb: 1 }} />
              <Typography variant="h4" color="secondary.main">{totales.escuelas}</Typography>
              <Typography variant="body2" color="textSecondary">Escuelas</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <VoteIcon sx={{ fontSize: 40, color: 'warning.main', mb: 1 }} />
              <Typography variant="h4" color="warning.main">{totales.mesas}</Typography>
              <Typography variant="body2" color="textSecondary">Mesas Electorales</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <AssessmentIcon sx={{ fontSize: 40, color: 'error.main', mb: 1 }} />
              <Typography variant="h4" color="error.main">{totales.instituciones}</Typography>
              <Typography variant="body2" color="textSecondary">Instituciones</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <TrendingUp sx={{ fontSize: 40, color: 'info.main', mb: 1 }} />
              <Typography variant="h4" color="info.main">{totales.dirigentes}</Typography>
              <Typography variant="body2" color="textSecondary">Dirigentes</Typography>
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
                placeholder="Buscar por número o nombre de seccional..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
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
                <InputLabel>Rango de Militantes</InputLabel>
                <Select
                  value={selectedRango}
                  onChange={(e) => setSelectedRango(e.target.value)}
                  label="Rango de Militantes"
                  startAdornment={<FilterList sx={{ mr: 1, color: 'action.active' }} />}
                >
                  <MenuItem value="">Todos</MenuItem>
                  <MenuItem value="alto">Alto (&gt; 50 militantes)</MenuItem>
                  <MenuItem value="medio">Medio (20-50 militantes)</MenuItem>
                  <MenuItem value="bajo">Bajo (&lt; 20 militantes)</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <Alert severity="info" sx={{ mb: 0 }}>
                Mostrando {filteredSeccionales.length} de {seccionales.length} seccionales
              </Alert>
            </Grid>
            <Grid item xs={12} md={2}>
              <PermissionButton
                requiredPermission="export"
                variant="contained"
                startIcon={<DownloadIcon />}
                onClick={exportarAExcel}
                fullWidth
                sx={{ 
                  boxShadow: 2,
                  '&:hover': { boxShadow: 4 }
                }}
                tooltip="Exportar datos filtrados a Excel"
              >
                Excel
              </PermissionButton>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Tabla detallada */}
      <Card>
        <Box sx={{ 
          p: 3, 
          backgroundColor: 'primary.main', 
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          gap: 1
        }}>
          <Equalizer />
          <Box>
            <Typography variant="h6" fontWeight={600}>
              Detalle por Seccional
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              Información consolidada de las 14 seccionales electorales
            </Typography>
          </Box>
        </Box>
        
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: 'grey.50' }}>
                <TableCell sx={{ fontWeight: 'bold', minWidth: 200 }}>Seccional</TableCell>
                <TableCell align="center" sx={{ fontWeight: 'bold', minWidth: 100 }}>Barrios</TableCell>
                <TableCell align="center" sx={{ fontWeight: 'bold', minWidth: 100 }}>Militantes</TableCell>
                <TableCell align="center" sx={{ fontWeight: 'bold', minWidth: 100 }}>Escuelas</TableCell>
                <TableCell align="center" sx={{ fontWeight: 'bold', minWidth: 100 }}>Mesas</TableCell>
                <TableCell align="center" sx={{ fontWeight: 'bold', minWidth: 120 }}>Instituciones</TableCell>
                <TableCell align="center" sx={{ fontWeight: 'bold', minWidth: 100 }}>Dirigentes</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredSeccionales.map((seccional, index) => (
                <TableRow 
                  key={seccional.numero}
                  hover
                  sx={{ 
                    '&:nth-of-type(odd)': { bgcolor: '#fafafa' },
                    '&:hover': { 
                      bgcolor: '#f0f7ff',
                      transform: 'scale(1.001)',
                      boxShadow: 1
                    },
                    transition: 'all 0.2s ease'
                  }}
                >
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Chip 
                        label={seccional.numero} 
                        color="primary" 
                        size="small" 
                        variant="filled"
                        onClick={() => {}}
                        sx={{ fontWeight: 'bold', minWidth: 40, color: 'white' }}
                      />
                      <Chip
                        label={capitalizar(seccional.nombre)}
                        color="success"
                        size="small"
                        variant="filled"
                        onClick={() => {}}
                        sx={{ color: 'white' }}
                      />
                    </Box>
                  </TableCell>
                  <TableCell align="center">
                    <Chip
                      label={seccional.estadisticas.total_barrios}
                      color="primary"
                      size="small"
                      icon={<LocationIcon />}
                      variant="outlined"
                      onClick={() => {}}
                      sx={{ 
                        fontWeight: 'bold',
                        '& .MuiChip-icon': { color: 'primary.main' }
                      }}
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Chip
                      label={seccional.estadisticas.total_militantes}
                      color="success"
                      size="small"
                      icon={<GroupIcon />}
                      variant="outlined"
                      onClick={() => {}}
                      sx={{ 
                        fontWeight: 'bold',
                        '& .MuiChip-icon': { color: 'success.main' }
                      }}
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Chip
                      label={seccional.estadisticas.total_escuelas || 0}
                      color="secondary"
                      size="small"
                      icon={<SchoolIcon />}
                      variant="outlined"
                      onClick={() => {}}
                      sx={{ 
                        fontWeight: 'bold',
                        '& .MuiChip-icon': { color: 'secondary.main' }
                      }}
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Chip
                      label={seccional.estadisticas.total_mesas}
                      color="warning"
                      size="small"
                      icon={<VoteIcon />}
                      variant="outlined"
                      onClick={() => {}}
                      sx={{ 
                        fontWeight: 'bold',
                        '& .MuiChip-icon': { color: 'warning.main' }
                      }}
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Chip
                      label={seccional.estadisticas.total_instituciones || 0}
                      color="error"
                      size="small"
                      icon={<BusinessIcon />}
                      variant="outlined"
                      onClick={() => {}}
                      sx={{ 
                        fontWeight: 'bold',
                        '& .MuiChip-icon': { color: 'error.main' }
                      }}
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Chip
                      label={seccional.estadisticas.total_dirigentes || 0}
                      color="info"
                      size="small"
                      icon={<PersonIcon />}
                      variant="outlined"
                      onClick={() => {}}
                      sx={{ 
                        fontWeight: 'bold',
                        '& .MuiChip-icon': { color: 'info.main' }
                      }}
                    />
                  </TableCell>
                </TableRow>
              ))}
              
              {/* Fila de totales */}
              <TableRow sx={{ backgroundColor: 'primary.light', borderTop: '2px solid', borderTopColor: 'primary.main' }}>
                <TableCell sx={{ fontWeight: 'bold', fontSize: '1rem', color: 'primary.main' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Equalizer />
                    TOTALES
                  </Box>
                </TableCell>
                <TableCell align="center">
                  <Chip
                    label={totales.barrios}
                    color="primary"
                    variant="filled"
                    onClick={() => {}}
                    sx={{ fontWeight: 'bold', color: 'white' }}
                  />
                </TableCell>
                <TableCell align="center">
                  <Chip
                    label={totales.militantes}
                    color="success"
                    variant="filled"
                    onClick={() => {}}
                    sx={{ fontWeight: 'bold', color: 'white' }}
                  />
                </TableCell>
                <TableCell align="center">
                  <Chip
                    label={totales.escuelas}
                    color="secondary"
                    variant="filled"
                    onClick={() => {}}
                    sx={{ fontWeight: 'bold', color: 'white' }}
                  />
                </TableCell>
                <TableCell align="center">
                  <Chip
                    label={totales.mesas}
                    color="warning"
                    variant="filled"
                    onClick={() => {}}
                    sx={{ fontWeight: 'bold', color: 'white' }}
                  />
                </TableCell>
                <TableCell align="center">
                  <Chip
                    label={totales.instituciones}
                    color="error"
                    variant="filled"
                    onClick={() => {}}
                    sx={{ fontWeight: 'bold', color: 'white' }}
                  />
                </TableCell>
                <TableCell align="center">
                  <Chip
                    label={totales.dirigentes}
                    color="info"
                    variant="filled"
                    onClick={() => {}}
                    sx={{ fontWeight: 'bold', color: 'white' }}
                  />
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      <Box sx={{ mt: 3, p: 2, bgcolor: '#f5f5f5', borderRadius: 2 }}>
        <Typography variant="body2" color="text.secondary">
          <strong>Nota:</strong> Los datos mostrados representan información consolidada de las 14 seccionales electorales. 
          Se incluyen barrios, escuelas electorales, militantes registrados, mesas electorales, instituciones 
          y dirigentes por cada seccional.
        </Typography>
      </Box>
    </Box>
  );
}

// Función para capitalizar texto
const capitalizar = (texto) => {
  if (!texto || typeof texto !== 'string') return "";
  return texto.charAt(0).toUpperCase() + texto.slice(1).toLowerCase();
};

export default SeccionalesPage;
