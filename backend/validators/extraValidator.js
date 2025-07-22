const Joi = require('joi');

module.exports = Joi.object({
  campo: Joi.string().required()
});