/* global test, expect, describe, it, afterAll */

const resultadoSchema = require('../validators/resultadoValidator');

describe('Resultado Validator', () => {
  it('valida un resultado válido', () => {
    const data = {
      id_mesa: 1,
      id_tipo_eleccion: 2,
      votos_por_lista: { "1": 100, "2": 50 },
      total_validos: 150,
      total_nulos: 0,
      total_blancos: 0,
      total_votantes: 150
    };
    const { error } = resultadoSchema.validate(data);
    expect(error).toBeUndefined();
  });

  // Aquí puedes agregar más pruebas según sea necesario
});