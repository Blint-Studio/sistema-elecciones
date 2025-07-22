const express = require('express');
const router = express.Router();
const controller = require('../controllers/encargadosSeccionalController');
const auth = require('../middlewares/auth');
const encargadoSeccionalSchema = require('../validators/encargadoSeccionalValidator');
const validate = require('../middlewares/validate');

/**
 * @swagger
 * /api/encargados-seccional:
 *   get:
 *     summary: Obtiene todos los encargados de seccional
 *     tags:
 *       - Encargados Seccional
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de encargados de seccional
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
 *                   email:
 *                     type: string
 *                   id_seccional:
 *                     type: integer
 *       401:
 *         description: Token no proporcionado o inválido
 */

// Obtener todos los encargados de seccional
router.get('/', auth, controller.getAll);

/**
 * @swagger
 * /api/encargados-seccional/{id}:
 *   get:
 *     summary: Obtiene un encargado de seccional por ID
 *     tags:
 *       - Encargados Seccional
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID del encargado de seccional
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Encargado de seccional encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 nombre:
 *                   type: string
 *                 email:
 *                   type: string
 *                 id_seccional:
 *                   type: integer
 *       401:
 *         description: Token no proporcionado o inválido
 *       404:
 *         description: Encargado de seccional no encontrado
 */

// Obtener un encargado de seccional por ID
router.get('/:id', auth, controller.getById);

/**
 * @swagger
 * /api/encargados-seccional:
 *   post:
 *     summary: Crea un nuevo encargado de seccional
 *     tags:
 *       - Encargados Seccional
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
 *                 example: Juan Pérez
 *               email:
 *                 type: string
 *                 example: juan@correo.com
 *               password:
 *                 type: string
 *                 example: clave123
 *               id_seccional:
 *                 type: integer
 *                 example: 1
 *     responses:
 *       201:
 *         description: Encargado creado correctamente
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

// Crear encargado de seccional
router.post('/', auth, validate(encargadoSeccionalSchema), controller.create);

/**
 * @swagger
 * /api/encargados-seccional/{id}:
 *   put:
 *     summary: Actualiza un encargado de seccional por ID
 *     tags:
 *       - Encargados Seccional
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID del encargado de seccional
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *                 example: Juan Pérez
 *               email:
 *                 type: string
 *                 example: juan@correo.com
 *               password:
 *                 type: string
 *                 example: clave123
 *               id_seccional:
 *                 type: integer
 *                 example: 1
 *     responses:
 *       200:
 *         description: Encargado actualizado correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: Token no proporcionado o inválido
 *       403:
 *         description: No autorizado
 *       404:
 *         description: Encargado de seccional no encontrado
 */

// Actualizar encargado de seccional
router.put('/:id', auth, validate(encargadoSeccionalSchema), controller.update);

/**
 * @swagger
 * /api/encargados-seccional/{id}:
 *   delete:
 *     summary: Elimina un encargado de seccional por ID
 *     tags:
 *       - Encargados Seccional
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID del encargado de seccional
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Encargado eliminado correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       401:
 *         description: Token no proporcionado o inválido
 *       404:
 *         description: Encargado de seccional no encontrado
 */

// Eliminar encargado de seccional
router.delete('/:id', auth, controller.delete);

module.exports = router;