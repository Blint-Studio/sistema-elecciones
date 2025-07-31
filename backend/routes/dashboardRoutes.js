const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const auth = require('../middlewares/auth');
const { validarAccesoSeccional } = require('../middlewares/seccional');

router.get('/seccionales', auth, validarAccesoSeccional, dashboardController.paneoSeccionales);

module.exports = router;