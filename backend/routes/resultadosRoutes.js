const express = require("express");
const router = express.Router();
const verificarToken = require("../middlewares/auth");
const verificarRol = require("../middlewares/roles");
const { verificarPermiso } = require("../middlewares/roles");
const { validarAccesoSeccional } = require('../middlewares/seccional');
const resultadosController = require('../controllers/resultadosController');

/**
 * @swagger
 * /resultados:
 *   get:
 *     summary: Obtiene todos los resultados electorales
 *     tags:
 *       - Resultados
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: escuela
 *         schema:
 *           type: integer
 *         description: ID de la escuela para filtrar resultados
 *     responses:
 *       200:
 *         description: Lista de resultados
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
 *                   id_escuela:
 *                     type: integer
 *                   id_mesa:
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
 *                   numero_mesa:
 *                     type: string
 *                   escuela_nombre:
 *                     type: string
 *       401:
 *         description: Token no proporcionado o inválido
 */

/**
 * @swagger
 * /resultados:
 *   post:
 *     summary: Cargar un nuevo resultado electoral
 *     tags:
 *       - Resultados
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fecha:
 *                 type: string
 *                 format: date
 *                 example: "2024-03-15"
 *               id_tipo_eleccion:
 *                 type: integer
 *                 example: 1
 *               id_escuela:
 *                 type: integer
 *                 example: 1
 *               id_mesa:
 *                 type: integer
 *                 example: 1
 *               total_votantes:
 *                 type: integer
 *                 example: 200
 *               frente_civico:
 *                 type: integer
 *                 example: 100
 *               peronismo:
 *                 type: integer
 *                 example: 50
 *               otro:
 *                 type: integer
 *                 example: 30
 *               total_nulos:
 *                 type: integer
 *                 example: 10
 *               total_blancos:
 *                 type: integer
 *                 example: 10
 *     responses:
 *       201:
 *         description: Resultado guardado correctamente
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

/**
 * @swagger
 * /resultados/{id}:
 *   delete:
 *     summary: Elimina un resultado electoral por ID (solo admin)
 *     tags:
 *       - Resultados
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del resultado a eliminar
 *     responses:
 *       200:
 *         description: Resultado eliminado correctamente
 *       401:
 *         description: Token no proporcionado o inválido
 *       403:
 *         description: No autorizado
 *       404:
 *         description: Resultado no encontrado
 */

/**
 * @swagger
 * /resultados/{id}:
 *   put:
 *     summary: Actualiza un resultado electoral por ID
 *     tags:
 *       - Resultados
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del resultado a actualizar
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fecha:
 *                 type: string
 *                 format: date
 *               id_tipo_eleccion:
 *                 type: integer
 *               id_escuela:
 *                 type: integer
 *               id_mesa:
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
 *     responses:
 *       200:
 *         description: Resultado actualizado correctamente
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: Token no proporcionado o inválido
 *       403:
 *         description: No autorizado
 *       404:
 *         description: Resultado no encontrado
 */

// Rutas principales
router.get("/", verificarToken, verificarPermiso("read"), validarAccesoSeccional, resultadosController.obtenerResultados);
router.get("/combinados", verificarToken, verificarPermiso("read"), validarAccesoSeccional, resultadosController.obtenerResultadosCombinados);
router.post("/", verificarToken, verificarPermiso("write"), validarAccesoSeccional, resultadosController.crearResultado);
router.delete("/:id", verificarToken, verificarPermiso("delete"), validarAccesoSeccional, resultadosController.eliminarResultado);
router.put("/:id", verificarToken, verificarPermiso("write"), validarAccesoSeccional, resultadosController.modificarResultado);

module.exports = router;
