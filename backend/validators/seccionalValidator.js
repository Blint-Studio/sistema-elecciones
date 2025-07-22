const Joi = require('joi');

const seccionalSchema = Joi.object({
  nombre: Joi.string().min(2).max(100).required()
});

module.exports = seccionalSchema;