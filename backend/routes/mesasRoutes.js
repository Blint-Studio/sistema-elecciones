const express = require('express');
const router = express.Router();
const mesasController = require('../controllers/mesasController');
const auth = require('../middlewares/auth');
const { validarAccesoSeccional } = require('../middlewares/seccional');

/**
 * @swagger
 * /api/mesas:
 *   get:
 *     summary: Obtiene todas las mesas
 *     tags:
 *       - Mesas
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de mesas
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   numero_mesa:
 *                     type: integer
 *                   escuela_id:
 *                     type: integer
 *       401:
 *         description: Token no proporcionado o inválido
 */

router.get('/', auth, validarAccesoSeccional, mesasController.obtenerMesasPorEscuela);

module.exports = router;