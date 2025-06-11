const express = require('express');
const router = express.Router();
const escuelasController = require('../controllers/escuelasController');
const auth = require('../middlewares/auth');

router.get('/', auth, escuelasController.getAllEscuelas);
router.get('/:id', auth, escuelasController.getEscuelaById);
router.post('/', auth, escuelasController.createEscuela);
router.put('/:id', auth, escuelasController.updateEscuela);
router.delete('/:id', auth, escuelasController.deleteEscuela);

module.exports = router;