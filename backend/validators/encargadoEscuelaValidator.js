const Joi = require('joi');

const encargadoEscuelaSchema = Joi.object({
  nombre: Joi.string().min(3).max(100).required(),
  telefono: Joi.string().min(6).max(20).required(),
  id_escuela: Joi.number().integer().required()
});

module.exports = encargadoEscuelaSchema;