const express = require('express');
const router = express.Router();
const institucionesController = require('../controllers/institucionesController');
const auth = require('../middlewares/auth');
const optionalAuth = require('../middlewares/optionalAuth');
const optionalPermission = require('../middlewares/optionalPermission');
const { verificarPermiso } = require('../middlewares/roles');
const { validarAccesoSeccional } = require('../middlewares/seccional');

// Rutas con autenticación opcional (permite acceso público para lectura)
router.get('/', optionalAuth, validarAccesoSeccional, institucionesController.getAll);
router.get('/:id', optionalAuth, validarAccesoSeccional, institucionesController.getById);
router.post('/', auth, verificarPermiso('write'), validarAccesoSeccional, institucionesController.create);
router.put('/:id', auth, verificarPermiso('write'), validarAccesoSeccional, institucionesController.update);
router.delete('/:id', auth, verificarPermiso('delete'), validarAccesoSeccional, institucionesController.delete);

module.exports = router;