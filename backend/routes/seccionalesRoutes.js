const express = require('express');
const router = express.Router();
const SeccionalesController = require('../controllers/seccionalesController');
const auth = require('../middlewares/auth');
const optionalAuth = require('../middlewares/optionalAuth');
const optionalPermission = require('../middlewares/optionalPermission');
const { verificarPermiso } = require('../middlewares/roles');

/**
 * @swagger
 * /api/seccionales:
 *   get:
 *     summary: Obtiene todas las seccionales
 *     tags:
 *       - Seccionales
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de seccionales
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   nombre:
 *                     type: string
 *       401:
 *         description: Token no proporcionado o inválido
 */

/**
 * @swagger
 * /api/seccionales:
 *   post:
 *     summary: Crea una nueva seccional
 *     tags:
 *       - Seccionales
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *                 example: Seccional 1
 *     responses:
 *       201:
 *         description: Seccional creada correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 id:
 *                   type: integer
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: Token no proporcionado o inválido
 *       403:
 *         description: No autorizado
 */

// Definir las rutas
// Rutas con autenticación opcional (permite acceso público para lectura)
router.get('/resumen', optionalAuth, SeccionalesController.obtenerResumenSeccionales);
router.get('/', optionalAuth, SeccionalesController.obtenerSeccionales);
router.get('/barrios', optionalAuth, SeccionalesController.obtenerBarriosPorSeccional);
router.get('/:id', optionalAuth, SeccionalesController.obtenerSeccionalPorId);
router.post('/', auth, verificarPermiso('write'), SeccionalesController.crearSeccional);

module.exports = router;
