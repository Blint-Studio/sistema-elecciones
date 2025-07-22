const Joi = require('joi');

const barrioSchema = Joi.object({
  nombre: Joi.string().required(),
  seccional_nombre: Joi.string().allow('').optional(),
  subcircuito: Joi.string().allow('').optional()
});

module.exports = barrioSchema;