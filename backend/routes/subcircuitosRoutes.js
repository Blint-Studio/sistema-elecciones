const express = require('express');
const router = express.Router();
const subcircuitosController = require('../controllers/subcircuitosController');
const auth = require('../middlewares/auth');
const { verificarPermiso } = require('../middlewares/roles');

/**
 * @swagger
 * /api/subcircuitos/seccionales:
 *   get:
 *     summary: Obtiene las 14 seccionales principales
 *     tags:
 *       - Subcircuitos
 *     responses:
 *       200:
 *         description: Lista de seccionales (01-14)
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   numero:
 *                     type: string
 *                   nombre:
 *                     type: string
 */

/**
 * @swagger
 * /api/subcircuitos:
 *   get:
 *     summary: Obtiene subcircuitos de una seccional específica
 *     tags:
 *       - Subcircuitos
 *     parameters:
 *       - in: query
 *         name: seccional
 *         schema:
 *           type: string
 *         description: Número de seccional (1-14)
 *     responses:
 *       200:
 *         description: Lista de subcircuitos para la seccional
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   subcircuito:
 *                     type: string
 *                   nombre:
 *                     type: string
 *                   numero_seccional:
 *                     type: integer
 */

// Obtener seccionales principales
router.get('/seccionales', auth, verificarPermiso('read'), subcircuitosController.obtenerSeccionales);

// Obtener subcircuitos por seccional
router.get('/', auth, verificarPermiso('read'), subcircuitosController.obtenerSubcircuitosPorSeccional);

module.exports = router;
