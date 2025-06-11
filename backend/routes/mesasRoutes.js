const express = require('express');
const router = express.Router();
const mesasController = require('../controllers/mesasController');
const auth = require('../middlewares/auth');

router.get('/', auth, mesasController.getAllMesas);
router.get('/:id', auth, mesasController.getMesaById);
router.post('/', auth, mesasController.createMesa);
router.put('/:id', auth, mesasController.updateMesa);
router.delete('/:id', auth, mesasController.deleteMesa);

module.exports = router;