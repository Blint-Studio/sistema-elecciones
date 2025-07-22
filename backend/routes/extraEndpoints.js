// backend/routes/extraEndpoints.js
const express = require("express");
const router = express.Router();
const extraController = require('../controllers/extraController');
const validate = require('../middlewares/validate');
const ejemploSchema = require('../validators/extraValidator');

// Todas las escuelas con su id, ordenadas alfabéticamente
router.get("/escuelas", extraController.getEscuelas);

// Mesas por escuela con validación de entero
router.get("/mesas", extraController.getMesas);

// Todas las listas electorales
router.get("/listas", extraController.getListas);

// Devuelve la jerarquía completa de una mesa
router.get("/mesa/:id", extraController.getMesaJerarquia);

// Todos los barrios
router.get("/barrios", extraController.getBarrios);

// Todas las seccionales
router.get("/seccionales", extraController.getSeccionales);

// Resultados filtrados
router.get("/resultados-filtrados", extraController.getResultadosFiltrados);

// Endpoint profesionalizado de ejemplo
router.get('/algun-endpoint', (req, res) => res.send('OK'));

// Endpoint de ejemplo con validación
router.post('/ejemplo', validate(ejemploSchema), extraController.ejemploMetodo);

module.exports = router;
