const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const errorHandler = require('./middlewares/errorHandler');
const swaggerDocs = require('./swagger');

// Rutas
const authRoutes = require("./routes/authRoutes");
const debugRoutes = require("./routes/debugRoutes");
const resultadosRoutes = require("./routes/resultadosRoutes");
const resultadosSubcircuitoRoutes = require("./routes/resultadosSubcircuitoRoutes");
const extraEndpoints = require("./routes/extraEndpoints");
const barriosRoutes = require('./routes/barriosRoutes');
const escuelasRoutes = require('./routes/escuelasRoutes');
const mesasRoutes = require('./routes/mesasRoutes');
const encargadoSeccionalRoutes = require('./routes/encargadoSeccionalRoutes');
const encargadoEscuelaRoutes = require('./routes/encargadoEscuelaRoutes');
const militantesRoutes = require('./routes/militantesRoutes');
const seccionalesRoutes = require('./routes/seccionalesRoutes');
const subcircuitosRoutes = require('./routes/subcircuitosRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Endpoints públicos para el mapa (sin autenticación)
app.get('/api/public/barrios', async (req, res) => {
  try {
    const db = require('./config/db');
    const [barrios] = await db.query(`
      SELECT b.id, b.nombre, b.seccional_nombre, b.subcircuito,
        (SELECT COUNT(*) FROM militantes m WHERE m.id_barrio = b.id) AS cantidad_militantes
      FROM barrios b
      GROUP BY b.id
      ORDER BY b.nombre
    `);
    res.json(barrios);
  } catch (error) {
    console.error('Error en /api/public/barrios:', error);
    res.status(500).json({ error: true, message: error.message });
  }
});

app.get('/api/public/seccionales', async (req, res) => {
  try {
    const db = require('./config/db');
    const [seccionales] = await db.query('SELECT * FROM seccionales ORDER BY nombre');
    res.json(seccionales);
  } catch (error) {
    console.error('Error en /api/public/seccionales:', error);
    res.status(500).json({ error: true, message: error.message });
  }
});

app.get('/api/public/militantes', async (req, res) => {
  try {
    const db = require('./config/db');
    const [militantes] = await db.query(`
      SELECT id, nombre, apellido, categoria, id_barrio
      FROM militantes 
      ORDER BY apellido, nombre
    `);
    res.json(militantes);
  } catch (error) {
    console.error('Error en /api/public/militantes:', error);
    res.status(500).json({ error: true, message: error.message });
  }
});

app.get('/api/public/instituciones', async (req, res) => {
  try {
    const db = require('./config/db');
    const [instituciones] = await db.query(`
      SELECT id, nombre, tipo, relacion, id_barrio
      FROM instituciones 
      ORDER BY nombre
    `);
    res.json(instituciones);
  } catch (error) {
    console.error('Error en /api/public/instituciones:', error);
    res.status(500).json({ error: true, message: error.message });
  }
});

// Rutas normales (con autenticación)
app.use("/api/auth", authRoutes);
app.use("/api/debug", debugRoutes);
app.use("/api/resultados", resultadosRoutes);
app.use("/api/resultados-subcircuito", resultadosSubcircuitoRoutes);
app.use("/api/extra", extraEndpoints);
app.use('/api/barrios', barriosRoutes);
app.use('/api/escuelas', escuelasRoutes);
app.use('/api/mesas', mesasRoutes);
app.use('/api/encargados-seccional', encargadoSeccionalRoutes);
app.use('/api/encargados-escuela', encargadoEscuelaRoutes);
app.use('/api/militantes', militantesRoutes);
app.use('/api/seccionales', seccionalesRoutes);
app.use('/api/subcircuitos', subcircuitosRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/tipos_institucion', require('./routes/tiposInstitucionRoutes'));
app.use('/api/instituciones', require('./routes/institucionesRoutes'));

// Ruta raíz
app.get("/", (req, res) => {
  res.send("¡API Elecciones Córdoba funcionando!");
});

// Swagger (siempre después de las rutas)
swaggerDocs(app);

// Manejo de errores (siempre al final)
app.use(errorHandler);

module.exports = app;