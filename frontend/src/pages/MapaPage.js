import React, { useEffect, useState, useMemo, useCallback, memo } from "react";
import { MapContainer, TileLayer, GeoJSON } from "react-leaflet";
import { getBarriosPublicos, getMilitantesPublicos, getInstitucionesPublicas, getSeccionalesPublicas } from "../services/publicService";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Importaciones específicas de MUI para tree shaking
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import Chip from "@mui/material/Chip";
import Divider from "@mui/material/Divider";
import Alert from "@mui/material/Alert";
import IconButton from "@mui/material/IconButton";
import Collapse from "@mui/material/Collapse";
import Snackbar from "@mui/material/Snackbar";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import TableContainer from "@mui/material/TableContainer";
import Table from "@mui/material/Table";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import TableBody from "@mui/material/TableBody";
import Tooltip from "@mui/material/Tooltip";

// Importaciones específicas de iconos
import LocationOnIcon from "@mui/icons-material/LocationOn";
import BusinessIcon from "@mui/icons-material/Business";
import GroupIcon from "@mui/icons-material/Group";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import InputAdornment from "@mui/material/InputAdornment";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import InfoIcon from "@mui/icons-material/Info";
import RefreshIcon from "@mui/icons-material/Refresh";
import MapIcon from "@mui/icons-material/Map";
import PersonIcon from "@mui/icons-material/Person";
import WorkIcon from "@mui/icons-material/Work";

// Fix default marker icon (solo una vez)
if (!L.Icon.Default.prototype._getIconUrl._leafletOriginalFunction) {
  delete L.Icon.Default.prototype._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
    iconUrl: require("leaflet/dist/images/marker-icon.png"),
    shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
  });
}

// Datos mock memoizados para evitar re-creación
const MOCK_GEOJSON = Object.freeze({
  "type": "FeatureCollection",
  "features": Object.freeze([
    Object.freeze({
      "type": "Feature",
      "properties": Object.freeze({ "nombre": "Centro", "id": "centro" }),
      "geometry": Object.freeze({
        "type": "Polygon",
        "coordinates": Object.freeze([[
          [-64.1880, -31.4160], [-64.1860, -31.4160], [-64.1860, -31.4180], 
          [-64.1880, -31.4180], [-64.1880, -31.4160]
        ]])
      })
    }),
    Object.freeze({
      "type": "Feature", 
      "properties": Object.freeze({ "nombre": "Nueva Córdoba", "id": "nueva_cordoba" }),
      "geometry": Object.freeze({
        "type": "Polygon",
        "coordinates": Object.freeze([[
          [-64.1900, -31.4200], [-64.1880, -31.4200], [-64.1880, -31.4220],
          [-64.1900, -31.4220], [-64.1900, -31.4200]
        ]])
      })
    }),
    Object.freeze({
      "type": "Feature",
      "properties": Object.freeze({ "nombre": "Güemes", "id": "guemes" }),
      "geometry": Object.freeze({
        "type": "Polygon", 
        "coordinates": Object.freeze([[
          [-64.1860, -31.4140], [-64.1840, -31.4140], [-64.1840, -31.4160],
          [-64.1860, -31.4160], [-64.1860, -31.4140]
        ]])
      })
    }),
    Object.freeze({
      "type": "Feature",
      "properties": Object.freeze({ "nombre": "Alberdi", "id": "alberdi" }),
      "geometry": Object.freeze({
        "type": "Polygon",
        "coordinates": Object.freeze([[
          [-64.1920, -31.4140], [-64.1900, -31.4140], [-64.1900, -31.4160],
          [-64.1920, -31.4160], [-64.1920, -31.4140]
        ]])
      })
    }),
    Object.freeze({
      "type": "Feature",
      "properties": Object.freeze({ "nombre": "San Vicente", "id": "san_vicente" }),
      "geometry": Object.freeze({
        "type": "Polygon",
        "coordinates": Object.freeze([[
          [-64.1940, -31.4160], [-64.1920, -31.4160], [-64.1920, -31.4180],
          [-64.1940, -31.4180], [-64.1940, -31.4160]
        ]])
      })
    }),
    Object.freeze({
      "type": "Feature",
      "properties": Object.freeze({ "nombre": "Cofico", "id": "cofico" }),
      "geometry": Object.freeze({
        "type": "Polygon",
        "coordinates": Object.freeze([[
          [-64.1800, -31.4100], [-64.1780, -31.4100], [-64.1780, -31.4120],
          [-64.1800, -31.4120], [-64.1800, -31.4100]
        ]])
      })
    })
  ])
});

// Componente principal reestructurado
const MapaPage = memo(() => {
  // Estados optimizados con valores iniciales seguros
  const [barrios, setBarrios] = useState([]);
  const [seccionales, setSeccionales] = useState([]);
  const [militantes, setMilitantes] = useState([]);
  const [instituciones, setInstituciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [geoJsonData, setGeoJsonData] = useState(null);
  
  // Estados para filtros optimizados con useMemo
  const [seccionalFiltrada, setSeccionalFiltrada] = useState(null);
  const [busquedaBarrio, setBusquedaBarrio] = useState('');
  
  // Estados para detalle del barrio
  const [barrioSeleccionado, setBarrioSeleccionado] = useState(null);
  const [expandedMilitantes, setExpandedMilitantes] = useState(false);
  const [expandedInstituciones, setExpandedInstituciones] = useState(false);
  
  // Estados para notificaciones con valores iniciales seguros
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  // Cache GeoJSON para evitar re-fetch
  const geoJsonCache = useMemo(() => {
    let cache = null;
    return {
      get: () => cache,
      set: (data) => { cache = data; },
      clear: () => { cache = null; }
    };
  }, []);

  // Función de carga de datos optimizada con Promise.allSettled
  const cargarDatos = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Intentar cargar GeoJSON desde cache primero
      let geoJsonDataLocal = geoJsonCache.get();
      
      if (!geoJsonDataLocal) {
        try {
          const geoJsonResponse = await fetch('/barrios.geojson');
          if (geoJsonResponse.ok) {
            geoJsonDataLocal = await geoJsonResponse.json();
            geoJsonCache.set(geoJsonDataLocal);
          } else {
            console.warn('Usando datos mock para GeoJSON');
            geoJsonDataLocal = MOCK_GEOJSON;
            geoJsonCache.set(geoJsonDataLocal);
          }
        } catch (geoError) {
          console.warn('Error al cargar GeoJSON, usando mock:', geoError);
          geoJsonDataLocal = MOCK_GEOJSON;
          geoJsonCache.set(geoJsonDataLocal);
        }
      }
      
      setGeoJsonData(geoJsonDataLocal);
        
      // Cargar datos en paralelo con Promise.allSettled para mejor rendimiento
      // Usar solo servicios públicos para evitar problemas de autenticación
      const results = await Promise.allSettled([
        getBarriosPublicos(),
        getSeccionalesPublicas(),
        getMilitantesPublicos(),
        getInstitucionesPublicas()
      ]);
      
      // Procesar resultados con fallbacks seguros
      const [barriosResult, seccionalesResult, militantesResult, institucionesResult] = results;
      
      const barriosData = barriosResult.status === 'fulfilled' ? barriosResult.value : [];
      const seccionalesData = seccionalesResult.status === 'fulfilled' ? seccionalesResult.value : [];
      const militantesData = militantesResult.status === 'fulfilled' ? militantesResult.value : [];
      const institucionesData = institucionesResult.status === 'fulfilled' ? institucionesResult.value : [];
      
      // Actualizar estados de forma batch
      setBarrios(Array.isArray(barriosData) ? barriosData : []);
      setSeccionales(Array.isArray(seccionalesData) ? seccionalesData : []);
      setMilitantes(Array.isArray(militantesData) ? militantesData : []);
      setInstituciones(Array.isArray(institucionesData) ? institucionesData : []);
      
      setLoading(false);
    } catch (error) {
      console.error('Error al cargar datos:', error);
      setError('Error al cargar los datos: ' + error.message);
      setGeoJsonData(MOCK_GEOJSON);
      setLoading(false);
    }
  }, [geoJsonCache]);

  // useEffect optimizado para cargar datos
  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  // Barrios filtrados memoizados para evitar re-cálculos innecesarios
  const barriosFiltrados = useMemo(() => {
    let resultado = barrios;
    
    if (busquedaBarrio.trim() !== '') {
      resultado = resultado.filter(barrio =>
        barrio.nombre?.toLowerCase().includes(busquedaBarrio.toLowerCase())
      );
    }
    
    if (seccionalFiltrada) {
      resultado = resultado.filter(barrio => barrio.seccional_nombre === seccionalFiltrada);
    }
    
    return resultado;
  }, [barrios, busquedaBarrio, seccionalFiltrada]);

  // Datos del barrio seleccionado memoizados
  const { militantesBarrio, institucionesBarrio } = useMemo(() => {
    if (!barrioSeleccionado?.id) {
      return { militantesBarrio: [], institucionesBarrio: [] };
    }

    return {
      militantesBarrio: militantes.filter(m => m.id_barrio === barrioSeleccionado.id),
      institucionesBarrio: instituciones.filter(i => i.id_barrio === barrioSeleccionado.id)
    };
  }, [barrioSeleccionado, militantes, instituciones]);

  // Verificación de barrios faltantes deshabilitada para evitar problemas de autenticación
  // Esta funcionalidad requiere autenticación para crear barrios, por lo que se deshabilita en el modo público

  // Función para obtener datos del barrio optimizada con Map para O(1)
  const barriosMap = useMemo(() => {
    const map = new Map();
    barrios.forEach(barrio => {
      if (barrio.nombre) {
        const key = barrio.nombre.toLowerCase().trim().replace(/\s+/g, ' ');
        map.set(key, barrio);
      }
    });
    return map;
  }, [barrios]);

  const obtenerDatosBarrioPorNombre = useCallback((nombreGeoJSON) => {
    if (!nombreGeoJSON) return null;
    const nombreNormalizado = nombreGeoJSON.toLowerCase().trim().replace(/\s+/g, ' ');
    return barriosMap.get(nombreNormalizado) || null;
  }, [barriosMap]);

  // Map de militantes por barrio para O(1) lookup
  const militantesPorBarrio = useMemo(() => {
    const map = new Map();
    militantes.forEach(militante => {
      if (!map.has(militante.id_barrio)) {
        map.set(militante.id_barrio, []);
      }
      map.get(militante.id_barrio).push(militante);
    });
    return map;
  }, [militantes]);

  // Función para verificar militantes optimizada
  const tieneMilitantes = useCallback((barrioId) => {
    return militantesPorBarrio.has(barrioId) && militantesPorBarrio.get(barrioId).length > 0;
  }, [militantesPorBarrio]);

  // Función para verificar si hay dirigentes en el barrio
  const tieneDirigentes = useCallback((barrioId) => {
    if (!militantesPorBarrio.has(barrioId)) return false;
    const militantesDelBarrio = militantesPorBarrio.get(barrioId);
    return militantesDelBarrio.some(militante => militante.categoria === 'dirigente');
  }, [militantesPorBarrio]);

  // Función para obtener estilo del polígono memoizada
  const getEstiloPoligono = useCallback((feature) => {
    try {
      const nombreBarrio = feature.properties?.Nombre || feature.properties?.nombre;
      const datosBarrio = obtenerDatosBarrioPorNombre(nombreBarrio);
      
      if (!datosBarrio) {
        return {
          fillColor: '#f44336', // Rojo por defecto si no hay datos
          weight: 2,
          opacity: 1,
          color: 'white',
          dashArray: '3',
          fillOpacity: 0.7
        };
      }

      const hasMilitants = tieneMilitantes(datosBarrio.id);
      const hasLeaders = tieneDirigentes(datosBarrio.id);
      
      // Lógica de colores:
      // Verde: Hay dirigentes en el barrio
      // Azul: Hay militantes pero no dirigentes
      // Rojo: No hay militantes
      let fillColor = '#f44336'; // Rojo por defecto (sin militantes)
      
      if (hasLeaders) {
        fillColor = '#4caf50'; // Verde (hay dirigentes)
      } else if (hasMilitants) {
        fillColor = '#2196f3'; // Azul (hay militantes pero no dirigentes)
      }
      
      return {
        fillColor,
        weight: 2,
        opacity: 1,
        color: 'white',
        dashArray: '3',
        fillOpacity: 0.7
      };
    } catch (error) {
      console.error('Error en getEstiloPoligono:', error);
      return {
        fillColor: '#gray',
        weight: 2,
        opacity: 1,
        color: 'white',
        dashArray: '3',
        fillOpacity: 0.7
      };
    }
  }, [obtenerDatosBarrioPorNombre, tieneMilitantes, tieneDirigentes]);

  // Handler optimizado para click en polígono
  const handlePolyClick = useCallback((feature, layer) => {
    const nombreBarrio = feature.properties?.Nombre || feature.properties?.nombre;
    const datosBarrio = obtenerDatosBarrioPorNombre(nombreBarrio);
    
    if (datosBarrio) {
      setBarrioSeleccionado(datosBarrio);
      setExpandedMilitantes(false);
      setExpandedInstituciones(false);
    } else {
      setBarrioSeleccionado({
        nombre: nombreBarrio,
        seccional_nombre: 'No asignado',
        tipo: feature.properties?.TipoBarrio || 'Desconocido'
      });
    }
  }, [obtenerDatosBarrioPorNombre]);

  // Configuración de eventos para features optimizada
  const onEachFeature = useCallback((feature, layer) => {
    try {
      const nombreBarrio = feature.properties?.Nombre || feature.properties?.nombre;
      const datosBarrio = obtenerDatosBarrioPorNombre(nombreBarrio);
      
      // Solo eventos de click y hover, sin popup redundante
      layer.on('click', () => handlePolyClick(feature, layer));
      
      layer.on('mouseover', (e) => {
        e.target.setStyle({
          weight: 3,
          color: '#666',
          dashArray: '',
          fillOpacity: 0.9
        });
      });
      
      layer.on('mouseout', (e) => {
        e.target.setStyle(getEstiloPoligono(feature));
      });
    } catch (error) {
      console.error('Error en onEachFeature:', error);
    }
  }, [obtenerDatosBarrioPorNombre, militantesPorBarrio, instituciones, handlePolyClick, getEstiloPoligono, tieneDirigentes]);

  // Función para capitalizar optimizada con validación
  const capitalizar = useCallback((str) => {
    if (!str || typeof str !== 'string') return '';
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  }, []);

  // Función para obtener texto seguro (evita undefined en props de MUI)
  const textoSeguro = useCallback((texto, fallback = '') => {
    return typeof texto === 'string' ? texto : fallback;
  }, []);

  return (
    <Box sx={{ p: 3, maxWidth: '100vw', margin: '0 auto', minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Header */}
      <Typography variant="h3" fontWeight={700} color="primary" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4, textAlign: 'center', justifyContent: 'center' }}>
        <MapIcon />
        Mapa Interactivo de Barrios
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      
      {loading && (
        <Alert severity="info" sx={{ mb: 2 }}>
          <CircularProgress size={20} sx={{ mr: 1 }} />
          Cargando datos del mapa...
        </Alert>
      )}

      {/* Estadísticas superiores */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ textAlign: 'center', p: 2 }}>
              <LocationOnIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
              <Typography variant="h3" fontWeight="bold" color="primary.main">
                {barrios.length}
              </Typography>
              <Typography variant="h6" color="primary">
                Total Barrios
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ textAlign: 'center', p: 2 }}>
              <GroupIcon sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
              <Typography variant="h3" fontWeight="bold" color="success.main">
                {barrios.filter(b => tieneMilitantes(b.id)).length}
              </Typography>
              <Typography variant="h6" color="success.main">
                Con Militantes
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ textAlign: 'center', p: 2 }}>
              <PersonIcon sx={{ fontSize: 40, color: 'secondary.main', mb: 1 }} />
              <Typography variant="h3" fontWeight="bold" color="secondary.main">
                {militantes.length}
              </Typography>
              <Typography variant="h6" color="secondary.main">
                Total Militantes
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ textAlign: 'center', p: 2 }}>
              <BusinessIcon sx={{ fontSize: 40, color: 'warning.main', mb: 1 }} />
              <Typography variant="h3" fontWeight="bold" color="warning.main">
                {instituciones.length}
              </Typography>
              <Typography variant="h6" color="warning.main">
                Total Instituciones
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Controles y filtros */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              fullWidth
              size="small"
              label="Buscar barrio"
              value={busquedaBarrio}
              onChange={useCallback((e) => setBusquedaBarrio(e.target.value), [])}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: 'action.active' }} />
                  </InputAdornment>
                )
              }}
              placeholder="Ingrese el nombre del barrio..."
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Autocomplete
              size="small"
              options={seccionales}
              getOptionLabel={useCallback((option) => option.nombre || '', [])}
              value={seccionales.find(s => s.nombre === seccionalFiltrada) || null}
              onChange={useCallback((_, newValue) => setSeccionalFiltrada(newValue ? newValue.nombre : null), [seccionales])}
              renderInput={(params) => {
                const { InputProps, InputLabelProps, ...restParams } = params;
                return (
                  <TextField
                    {...restParams}
                    label="Filtrar por seccional"
                    InputProps={{
                      ...InputProps,
                      startAdornment: (
                        <InputAdornment position="start">
                          <FilterListIcon sx={{ color: 'action.active' }} />
                        </InputAdornment>
                      )
                    }}
                    InputLabelProps={InputLabelProps}
                    placeholder="Seleccione una seccional..."
                  />
                );
              }}
              isOptionEqualToValue={useCallback((option, value) => option.id === value.id, [])}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                Barrios: {barriosFiltrados.length}
              </Typography>
              <Button
                size="small"
                variant="outlined"
                onClick={() => {
                  setBusquedaBarrio('');
                  setSeccionalFiltrada(null);
                  setBarrioSeleccionado(null);
                }}
                startIcon={<RefreshIcon />}
              >
                Limpiar
              </Button>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <Button
              variant="contained"
              onClick={() => cargarDatos()}
              disabled={loading}
              startIcon={loading ? <CircularProgress size={16} /> : <RefreshIcon />}
              fullWidth
            >
              Actualizar
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Leyenda */}
      <Paper sx={{ p: 2, mb: 3, backgroundColor: '#f8f9fa' }}>
        <Typography variant="h6" gutterBottom>
          📍 Leyenda del Mapa
        </Typography>
        <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ 
              width: 20, 
              height: 20, 
              borderRadius: '50%', 
              backgroundColor: '#4caf50',
              border: '2px solid white',
              boxShadow: '0 2px 4px rgba(0,0,0,0.3)'
            }} />
            <Typography variant="body2">Barrios con dirigentes</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ 
              width: 20, 
              height: 20, 
              borderRadius: '50%', 
              backgroundColor: '#2196f3',
              border: '2px solid white',
              boxShadow: '0 2px 4px rgba(0,0,0,0.3)'
            }} />
            <Typography variant="body2">Barrios con militantes</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ 
              width: 20, 
              height: 20, 
              borderRadius: '50%', 
              backgroundColor: '#f44336',
              border: '2px solid white',
              boxShadow: '0 2px 4px rgba(0,0,0,0.3)'
            }} />
            <Typography variant="body2">Barrios sin militantes</Typography>
          </Box>
        </Box>
      </Paper>

      {/* Contenedor principal del mapa y panel de info */}
      <Grid container spacing={2} sx={{ height: '85vh', maxWidth: '100%', margin: '0 auto' }}>
        {/* Mapa */}
        <Grid item xs={12} md={8.5}>
          <Paper sx={{ height: '100%', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h5" sx={{ 
              p: 2, 
              borderBottom: 1, 
              borderColor: 'divider', 
              flexShrink: 0,
              backgroundColor: 'primary.main',
              color: 'white',
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }}>
              <MapIcon />
              Mapa de Córdoba {loading ? '(Cargando...)' : `(${geoJsonData?.features?.length || 0} barrios)`}
            </Typography>
            {!loading && !error && geoJsonData ? (
              <MapContainer 
                center={[-31.4167, -64.1833]} 
                zoom={12} 
                style={{ height: "100%", width: "100%", flexGrow: 1 }}
                key="mapa-cordoba"
                preferCanvas={true}
                zoomControl={true}
                doubleClickZoom={true}
                scrollWheelZoom={true}
                dragging={true}
                attributionControl={false}
                zoomAnimation={true}
                fadeAnimation={true}
                markerZoomAnimation={true}
                maxZoom={18}
                minZoom={9}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  maxZoom={18}
                  tileSize={256}
                  zoomOffset={0}
                  keepBuffer={4}
                  updateWhenZooming={false}
                  updateWhenIdle={true}
                />
                <GeoJSON
                  data={geoJsonData}
                  style={getEstiloPoligono}
                  onEachFeature={onEachFeature}
                  key={`geojson-barrios-${geoJsonData.features?.length || 0}`}
                  pane="overlayPane"
                />
              </MapContainer>
            ) : (
              <Box sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8f9fa', flexGrow: 1 }}>
                <Box sx={{ textAlign: 'center' }}>
                  <MapIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="h6" color="text.secondary">
                    {loading ? 'Cargando mapa...' : 'Error al cargar el mapa'}
                  </Typography>
                  {loading && <CircularProgress sx={{ mt: 2 }} />}
                </Box>
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Panel de información */}
        <Grid item xs={12} md={3.5}>
          <Paper sx={{ 
            height: '100%', 
            overflow: 'auto',
            minWidth: '320px',
            maxWidth: '380px'
          }}>
            {barrioSeleccionado ? (
              <Box sx={{ p: 2 }}>
                <Typography variant="h6" color="primary" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, fontWeight: 'bold', borderBottom: 1, borderColor: 'divider', pb: 1 }}>
                  <LocationOnIcon />
                  {capitalizar(barrioSeleccionado.nombre)}
                  <Button
                    size="small"
                    variant="outlined"
                    color="secondary"
                    onClick={() => setBarrioSeleccionado(null)}
                    sx={{ ml: 'auto', fontSize: '0.7rem', minWidth: 'auto', px: 1 }}
                  >
                    ✕
                  </Button>
                </Typography>

                {/* Información básica */}
                <Card sx={{ mb: 2 }}>
                  <CardContent sx={{ p: 2 }}>
                    <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1, color: 'primary.main' }}>
                      📊 Información General
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      <strong>Seccional:</strong> {barrioSeleccionado.seccional_nombre || 'Sin asignar'}
                    </Typography>
                    {barrioSeleccionado.subcircuito && (
                      <Typography variant="body2" sx={{ mb: 2 }}>
                        <strong>Subcircuito:</strong> {barrioSeleccionado.subcircuito}
                      </Typography>
                    )}
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      <Chip 
                        label={`${militantesBarrio.length} militantes`}
                        color={militantesBarrio.length > 0 ? "success" : "error"}
                        size="small"
                        onClick={() => {}}
                        sx={{ fontSize: '0.8rem', height: '28px' }}
                      />
                      <Chip 
                        label={`${institucionesBarrio.length} instituciones`}
                        color={institucionesBarrio.length > 0 ? "info" : "default"}
                        size="small"
                        onClick={() => {}}
                        sx={{ fontSize: '0.8rem', height: '28px' }}
                      />
                    </Box>
                  </CardContent>
                </Card>

                {/* Lista de militantes */}
                <Card sx={{ mb: 2 }}>
                  <CardContent sx={{ p: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="subtitle2" sx={{ display: 'flex', alignItems: 'center', gap: 1, fontWeight: 'bold', color: 'success.main' }}>
                        <GroupIcon fontSize="small" /> Militantes ({militantesBarrio.length})
                      </Typography>
                      {militantesBarrio.length > 0 && (
                        <IconButton size="small" onClick={() => setExpandedMilitantes(!expandedMilitantes)}>
                          {expandedMilitantes ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
                        </IconButton>
                      )}
                    </Box>
                    
                    {militantesBarrio.length === 0 ? (
                      <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                        Sin militantes registrados
                      </Typography>
                    ) : (
                      <Collapse in={expandedMilitantes}>
                        <List dense sx={{ p: 0, maxHeight: 300, overflow: 'auto' }}>
                          {militantesBarrio.map((militante, index) => (
                            <ListItem key={`panel-militante-${militante.id}-${index}`} sx={{ px: 0, py: 1, flexDirection: 'column', alignItems: 'flex-start', borderBottom: index < militantesBarrio.length - 1 ? 1 : 0, borderColor: 'divider' }}>
                              <Typography variant="body2" sx={{ fontWeight: 'bold', fontSize: '0.9rem' }}>
                                {capitalizar(militante.nombre)} {capitalizar(militante.apellido)}
                              </Typography>
                              <Typography variant="caption" sx={{ fontSize: '0.8rem', color: 'text.secondary' }}>
                                {capitalizar(militante.categoria)}
                              </Typography>
                              {militante.telefono && (
                                <Typography variant="caption" sx={{ fontSize: '0.75rem', color: 'primary.main' }}>
                                  📞 {militante.telefono}
                                </Typography>
                              )}
                            </ListItem>
                          ))}
                        </List>
                      </Collapse>
                    )}
                  </CardContent>
                </Card>

                {/* Lista de instituciones */}
                <Card>
                  <CardContent sx={{ p: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="subtitle2" sx={{ display: 'flex', alignItems: 'center', gap: 1, fontWeight: 'bold', color: 'info.main' }}>
                        <BusinessIcon fontSize="small" /> Instituciones ({institucionesBarrio.length})
                      </Typography>
                      {institucionesBarrio.length > 0 && (
                        <IconButton size="small" onClick={() => setExpandedInstituciones(!expandedInstituciones)}>
                          {expandedInstituciones ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
                        </IconButton>
                      )}
                    </Box>
                    
                    {institucionesBarrio.length === 0 ? (
                      <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                        Sin instituciones registradas
                      </Typography>
                    ) : (
                      <Collapse in={expandedInstituciones}>
                        <List dense sx={{ p: 0, maxHeight: 300, overflow: 'auto' }}>
                          {institucionesBarrio.map((institucion, index) => (
                            <ListItem key={`panel-institucion-${institucion.id}-${index}`} sx={{ px: 0, py: 1, flexDirection: 'column', alignItems: 'flex-start', borderBottom: index < institucionesBarrio.length - 1 ? 1 : 0, borderColor: 'divider' }}>
                              <Typography variant="body2" sx={{ fontWeight: 'bold', fontSize: '0.9rem' }}>
                                {capitalizar(institucion.nombre)}
                              </Typography>
                              <Typography variant="caption" sx={{ fontSize: '0.8rem', color: 'text.secondary', mb: 0.5 }}>
                                {capitalizar(institucion.tipo)}
                              </Typography>
                              <Chip 
                                label={institucion.relacion === "Hay relacion" ? "Con relación" : 
                                       institucion.relacion === "No hay Relacion" ? "Sin relación" : "Sin definir"}
                                color={
                                  institucion.relacion === "Hay relacion" ? "success" :
                                  institucion.relacion === "No hay Relacion" ? "error" : "warning"
                                }
                                onClick={() => {}}
                                size="small"
                                sx={{ fontSize: '0.7rem', height: '20px' }}
                              />
                            </ListItem>
                          ))}
                        </List>
                      </Collapse>
                    )}
                  </CardContent>
                </Card>
              </Box>
            ) : (
              <Box sx={{ p: 3, height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Box sx={{ textAlign: 'center' }}>
                  <LocationOnIcon sx={{ fontSize: 60, color: 'action.disabled', mb: 2 }} />
                  <Typography variant="h6" color="text.secondary" gutterBottom sx={{ fontWeight: 'bold' }}>
                    Seleccione un barrio
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Haga click en cualquier zona del mapa para ver información detallada del barrio
                  </Typography>
                </Box>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Sección de barrios creados automáticamente deshabilitada */}
      {/* Esta funcionalidad requiere autenticación, por lo que se mantiene oculta en modo público */}

      {/* Snackbar para notificaciones */}
      <Snackbar
        open={showSnackbar}
        autoHideDuration={6000}
        onClose={() => setShowSnackbar(false)}
        message={textoSeguro(snackbarMessage, 'Notificación')}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </Box>
  );
});

// Exportar componente memoizado
export default MapaPage;
