const express = require('express');
const router = express.Router();
const institucionesController = require('../controllers/institucionesController');
const auth = require('../middlewares/auth');
const optionalAuth = require('../middlewares/optionalAuth');
const optionalPermission = require('../middlewares/optionalPermission');
const { verificarPermiso } = require('../middlewares/roles');

// Rutas con autenticación opcional (permite acceso público para lectura)
router.get('/', optionalAuth, institucionesController.getAll);
router.get('/:id', optionalAuth, institucionesController.getById);
router.post('/', auth, verificarPermiso('write'), institucionesController.create);
router.put('/:id', auth, verificarPermiso('write'), institucionesController.update);
router.delete('/:id', auth, verificarPermiso('delete'), institucionesController.delete);

module.exports = router;