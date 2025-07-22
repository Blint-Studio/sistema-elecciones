const Joi = require('joi');

const resultadoSchema = Joi.object({
  fecha: Joi.date().required(),
  id_tipo_eleccion: Joi.number().integer().required(),
  id_escuela: Joi.number().integer().required(),
  id_mesa: Joi.number().integer().required(),
  total_votantes: Joi.number().integer().min(0).required(),
  frente_civico: Joi.number().integer().min(0).required(),
  peronismo: Joi.number().integer().min(0).required(),
  otro: Joi.number().integer().min(0).required(),
  total_nulos: Joi.number().integer().min(0).required(),
  total_blancos: Joi.number().integer().min(0).required()
});

module.exports = resultadoSchema;