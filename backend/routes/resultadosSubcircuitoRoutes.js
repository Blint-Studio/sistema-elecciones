const express = require('express');
const router = express.Router();
const verificarToken = require('../middlewares/auth');
const verificarRol = require('../middlewares/roles');
const resultadosSubcircuitoController = require('../controllers/resultadosSubcircuitoController');

/**
 * @swagger
 * /api/resultados-subcircuito:
 *   get:
 *     summary: Obtiene resultados por subcircuito
 *     tags:
 *       - Resultados Subcircuito
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: seccional
 *         schema:
 *           type: integer
 *         description: ID de la seccional para filtrar resultados
 *     responses:
 *       200:
 *         description: Lista de resultados por subcircuito
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   fecha:
 *                     type: string
 *                   id_tipo_eleccion:
 *                     type: integer
 *                   id_seccional:
 *                     type: integer
 *                   id_barrio:
 *                     type: integer
 *                   total_votantes:
 *                     type: integer
 *                   frente_civico:
 *                     type: integer
 *                   peronismo:
 *                     type: integer
 *                   otro:
 *                     type: integer
 *                   total_nulos:
 *                     type: integer
 *                   total_blancos:
 *                     type: integer
 *                   barrio_nombre:
 *                     type: string
 *                   seccional_nombre:
 *                     type: string
 *                   tipo_eleccion_nombre:
 *                     type: string
 */

/**
 * @swagger
 * /api/resultados-subcircuito:
 *   post:
 *     summary: Crea un nuevo resultado para subcircuito
 *     tags:
 *       - Resultados Subcircuito
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - fecha
 *               - id_tipo_eleccion
 *               - id_seccional
 *               - id_barrio
 *               - total_votantes
 *               - frente_civico
 *               - peronismo
 *               - otro
 *               - total_nulos
 *               - total_blancos
 *             properties:
 *               fecha:
 *                 type: string
 *                 format: date
 *               id_tipo_eleccion:
 *                 type: integer
 *               id_seccional:
 *                 type: integer
 *               id_barrio:
 *                 type: integer
 *               total_votantes:
 *                 type: integer
 *               frente_civico:
 *                 type: integer
 *               peronismo:
 *                 type: integer
 *               otro:
 *                 type: integer
 *               total_nulos:
 *                 type: integer
 *               total_blancos:
 *                 type: integer
 */

// Obtener resultados por subcircuito
router.get('/', verificarToken, resultadosSubcircuitoController.obtenerResultadosSubcircuito);

// Crear resultado por subcircuito
router.post('/', verificarToken, verificarRol(['admin', 'administrador', 'usuario', 'operador']), resultadosSubcircuitoController.crearResultadoSubcircuito);

// Actualizar resultado por subcircuito
router.put('/:id', verificarToken, verificarRol(['admin', 'administrador', 'usuario']), resultadosSubcircuitoController.modificarResultadoSubcircuito);

// Eliminar resultado por subcircuito
router.delete('/:id', verificarToken, verificarRol(['admin', 'administrador']), resultadosSubcircuitoController.eliminarResultadoSubcircuito);

module.exports = router;
