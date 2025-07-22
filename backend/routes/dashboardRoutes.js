const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const auth = require('../middlewares/auth');

router.get('/seccionales', auth, dashboardController.paneoSeccionales);

module.exports = router;