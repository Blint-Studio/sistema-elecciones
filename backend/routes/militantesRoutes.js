const express = require('express');
const router = express.Router();
const militantesController = require('../controllers/militantesController');
const auth = require('../middlewares/auth');
const optionalAuth = require('../middlewares/optionalAuth');
const optionalPermission = require('../middlewares/optionalPermission');
const { verificarPermiso } = require('../middlewares/roles');

// Rutas con autenticación opcional (permite acceso público para lectura)
router.get('/', optionalAuth, militantesController.getAll);
router.get('/:id', optionalAuth, militantesController.getById);
router.post('/', auth, verificarPermiso('write'), militantesController.create);
router.put('/:id', auth, verificarPermiso('write'), militantesController.update);
router.delete('/:id', auth, verificarPermiso('delete'), militantesController.delete);

module.exports = router;