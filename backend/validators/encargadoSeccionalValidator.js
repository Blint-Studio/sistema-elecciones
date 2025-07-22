const Joi = require('joi');

const encargadoSeccionalSchema = Joi.object({
  nombre: Joi.string().min(3).max(100).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  id_seccional: Joi.number().integer().required()
});

module.exports = encargadoSeccionalSchema;