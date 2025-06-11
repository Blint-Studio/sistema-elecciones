const express = require('express');
const router = express.Router();
const barriosController = require('../controllers/barriosController');
const auth = require('../middlewares/auth');

router.get('/', auth, barriosController.getAllBarrios);
router.get('/:id', auth, barriosController.getBarrioById);
router.post('/', auth, barriosController.createBarrio);
router.put('/:id', auth, barriosController.updateBarrio);
router.delete('/:id', auth, barriosController.deleteBarrio);

module.exports = router;