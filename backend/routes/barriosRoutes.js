const express = require('express');
const router = express.Router();
const barriosController = require('../controllers/barriosController');
const barrioSchema = require('../validators/barrioValidator');
const validate = require('../middlewares/validate');
const auth = require('../middlewares/auth');
const optionalAuth = require('../middlewares/optionalAuth');
const optionalPermission = require('../middlewares/optionalPermission');
const { verificarPermiso } = require('../middlewares/roles');

/**
 * @swagger
 * /api/barrios:
 *   get:
 *     summary: Obtiene todos los barrios
 *     tags:
 *       - Barrios
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de barrios
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

// Rutas con autenticación opcional (permite acceso público para lectura)
router.get('/', optionalAuth, barriosController.obtenerBarrios);
router.get('/:id', optionalAuth, barriosController.obtenerBarrioPorId);
router.get('/:id/militantes', optionalAuth, barriosController.obtenerMilitantesPorBarrio);
router.get('/:id', auth, verificarPermiso('read'), barriosController.obtenerBarrioPorId);
router.get('/:id/militantes', auth, verificarPermiso('read'), barriosController.obtenerMilitantesPorBarrio);

/**
 * @swagger
 * /api/barrios:
 *   post:
 *     summary: Crea un nuevo barrio
 *     tags:
 *       - Barrios
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
 *                 example: Centro
 *     responses:
 *       201:
 *         description: Barrio creado correctamente
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

router.post('/', auth, verificarPermiso('write'), validate(barrioSchema), barriosController.crearBarrio);
router.put('/:id', auth, verificarPermiso('write'), validate(barrioSchema), barriosController.actualizarBarrio);
router.delete('/:id', auth, verificarPermiso('delete'), barriosController.eliminarBarrio);

module.exports = router;