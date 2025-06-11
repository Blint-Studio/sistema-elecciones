const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const app = express();

// Configurar variables de entorno
dotenv.config();

// Middlewares (¡antes de las rutas!)
app.use(cors());
app.use(express.json());

// Rutas
const authRoutes = require("./routes/authRoutes");
const resultadosRoutes = require("./routes/resultadosRoutes");
const extraEndpoints = require("./routes/extraEndpoints");
const barriosRoutes = require('./routes/barriosRoutes');
const escuelasRoutes = require('./routes/escuelasRoutes');
const mesasRoutes = require('./routes/mesasRoutes');
const encargadosSeccionalRoutes = require('./routes/encargadosSeccionalRoutes');
const encargadosEscuelaRoutes = require('./routes/encargadosEscuelaRoutes');

app.use("/auth", authRoutes);
app.use("/resultados", resultadosRoutes);
app.use("/", extraEndpoints);
app.use('/api/barrios', barriosRoutes);
app.use('/api/escuelas', escuelasRoutes);
app.use('/api/mesas', mesasRoutes);
app.use('/api/encargados-seccional', encargadosSeccionalRoutes);
app.use('/api/encargados-escuela', encargadosEscuelaRoutes);

// Ruta raíz de prueba
app.get("/", (req, res) => {
  res.send("¡API Elecciones Córdoba funcionando!");
});

// Arrancar servidor
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});
