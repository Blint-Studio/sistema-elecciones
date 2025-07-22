const express = require('express');
const router = express.Router();
const escuelasController = require('../controllers/escuelasController');
const escuelaSchema = require('../validators/escuelaValidator');
const validate = require('../middlewares/validate');
const auth = require('../middlewares/auth');
const { verificarPermiso } = require('../middlewares/roles');

/**
 * @swagger
 * /api/escuelas:
 *   get:
 *     summary: Obtiene todas las escuelas
 *     tags:
 *       - Escuelas
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de escuelas
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
 *                   direccion:
 *                     type: string
 *                   id_barrio:
 *                     type: integer
 *       401:
 *         description: Token no proporcionado o inválido
 */

router.get('/', auth, verificarPermiso('read'), escuelasController.obtenerEscuelas);
router.get('/:id', auth, verificarPermiso('read'), escuelasController.obtenerEscuelaPorId);

/**
 * @swagger
 * /api/escuelas:
 *   post:
 *     summary: Crea una nueva escuela
 *     tags:
 *       - Escuelas
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
 *                 example: Escuela 1
 *               direccion:
 *                 type: string
 *                 example: Calle Falsa 123
 *               id_barrio:
 *                 type: integer
 *                 example: 1
 *     responses:
 *       201:
 *         description: Escuela creada correctamente
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

router.post('/', auth, verificarPermiso('write'), validate(escuelaSchema), escuelasController.crearEscuela);
router.put('/:id', auth, verificarPermiso('write'), validate(escuelaSchema), escuelasController.actualizarEscuela);
router.delete('/:id', auth, verificarPermiso('delete'), escuelasController.eliminarEscuela);

// Rutas para manejo de encargados
router.get('/encargados/disponibles', auth, verificarPermiso('read'), escuelasController.obtenerEncargadosDisponibles);
router.put('/:id/encargado', auth, verificarPermiso('write'), escuelasController.asignarEncargado);
router.delete('/:id/encargado', auth, verificarPermiso('write'), escuelasController.removerEncargado);

module.exports = router;