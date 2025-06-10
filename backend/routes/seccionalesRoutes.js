const express = require('express');
const router = express.Router();
const SeccionalesController = require('../controllers/seccionalesController');

// Definir la ruta GET /seccionales
router.get('/', SeccionalesController.getSeccionales);

module.exports = router;
