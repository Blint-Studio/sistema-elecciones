const Joi = require('joi');

const escuelaSchema = Joi.object({
  nombre: Joi.string().min(2).max(100).required(),
  id_barrio: Joi.number().integer().required()
});

module.exports = escuelaSchema;