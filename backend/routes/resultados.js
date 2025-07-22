const express = require('express');
const router = express.Router();
const resultadosController = require('../controllers/resultadosController');
const verificarToken = require('../middlewares/auth');
const verificarRol = require('../middlewares/roles');

// Proteger el endpoint de creación
router.post(
  '/',
  verificarToken,
  verificarRol(['admin', 'fiscal']),
  resultadosController.createResultado
);

// Otros endpoints...
module.exports = router;