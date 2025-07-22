const Joi = require('joi');

const listaSchema = Joi.object({
  codigo: Joi.string().min(1).max(10).required(),
  nombre_lista: Joi.string().min(2).max(100).required(),
  id_tipo_eleccion: Joi.number().integer().required()
});

module.exports = listaSchema;