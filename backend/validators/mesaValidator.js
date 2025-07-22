const Joi = require('joi');

const mesaSchema = Joi.object({
  numero_mesa: Joi.number().integer().min(1).required(),
  id_escuela: Joi.number().integer().required()
});

module.exports = mesaSchema;