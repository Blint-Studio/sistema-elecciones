const express = require('express');
const router = express.Router();
const militantesController = require('../controllers/militantesController');
const auth = require('../middlewares/auth');
const optionalAuth = require('../middlewares/optionalAuth');
const optionalPermission = require('../middlewares/optionalPermission');
const { verificarPermiso } = require('../middlewares/roles');
const { validarAccesoSeccional } = require('../middlewares/seccional');

// Rutas con autenticación opcional (permite acceso público para lectura)
router.get('/', optionalAuth, validarAccesoSeccional, militantesController.getAll);
router.get('/:id', optionalAuth, validarAccesoSeccional, militantesController.getById);
router.post('/', auth, verificarPermiso('write'), validarAccesoSeccional, militantesController.create);
router.put('/:id', auth, verificarPermiso('write'), validarAccesoSeccional, militantesController.update);
router.delete('/:id', auth, verificarPermiso('delete'), validarAccesoSeccional, militantesController.delete);

module.exports = router;