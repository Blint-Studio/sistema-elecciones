const express = require('express');
const router = express.Router();
const encargadoEscuelaController = require('../controllers/encargadoEscuelaController');
const auth = require('../middlewares/auth');

/**
 * @swagger
 * /api/encargados-escuela:
 *   get:
 *     summary: Obtiene todos los encargados de escuela
 *     tags:
 *       - Encargados Escuela
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de encargados de escuela
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
 *                   id_escuela:
 *                     type: integer
 *       401:
 *         description: Token no proporcionado o inválido
 */

router.get('/', auth, encargadoEscuelaController.getAllEncargadosEscuela);

module.exports = router;