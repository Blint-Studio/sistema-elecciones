/* global test, expect, describe, it, afterAll */


const request = require("supertest");
const app = require("../app");
const db = require('../config/db'); // tu conexión MySQL

describe("GET /resultados", () => {
  it("debería devolver un array de resultados", async () => {
    // Paso 1: Iniciar sesión para obtener un token válido
    const loginResponse = await request(app)
      .post("/auth/login")
      .send({
        email: "admin@cordoba.com",    // Usá el email real del usuario admin
        password: "admin123"           // Y la contraseña real
      });

    const token = loginResponse.body.token;

    // Verificar que obtuvimos el token correctamente
    expect(token).toBeDefined();

    // Paso 2: Hacer la solicitud autenticada
    const res = await request(app)
      .get("/resultados")
      .set("Authorization", `Bearer ${token}`);

    // Verificar que la respuesta sea la esperada
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});

afterAll(() => {
  db.end();
});
