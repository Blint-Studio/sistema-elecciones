# API Elecciones Córdoba

API REST para la gestión de resultados electorales, mesas, escuelas, barrios, seccionales y encargados.

---

## 🚀 Instalación

1. Cloná el repositorio.
2. Instalá dependencias:
   ```bash
   npm install
   ```
3. Configurá tu archivo `.env` con los datos de tu base de datos y JWT_SECRET.
4. Iniciá el servidor:
   ```bash
   npm start
   ```

---

## 🔐 Autenticación

Todos los endpoints (excepto `/auth/login`) requieren autenticación JWT.

- **Login:**  
  `POST /auth/login`
  ```json
  {
    "email": "admin@cordoba.com",
    "password": "admin123"
  }
  ```
  **Respuesta:**
  ```json
  {
    "token": "JWT...",
    "usuario": {
      "email": "admin@cordoba.com",
      "rol": "admin"
    }
  }
  ```

- **Usá el token en el header:**
  ```
  Authorization: Bearer <token>
  ```

---

## 📚 Documentación interactiva (Swagger)

Accedé a la documentación y probá los endpoints desde tu navegador en:  
[http://localhost:3000/api-docs](http://localhost:3000/api-docs)

---

## 📦 Endpoints principales

### Resultados

- `GET /resultados` — Lista todos los resultados
- `POST /resultados` — Crea un resultado
- `GET /resultados/{id}` — Obtiene un resultado por ID
- `PUT /resultados/{id}` — Actualiza un resultado
- `DELETE /resultados/{id}` — Elimina un resultado

### Mesas

- `GET /api/mesas` — Lista todas las mesas
- `POST /api/mesas` — Crea una mesa

### Escuelas

- `GET /api/escuelas` — Lista todas las escuelas
- `POST /api/escuelas` — Crea una escuela

### Barrios

- `GET /api/barrios` — Lista todos los barrios
- `POST /api/barrios` — Crea un barrio

### Seccionales

- `GET /api/seccionales` — Lista todas las seccionales
- `POST /api/seccionales` — Crea una seccional

### Encargados

- `GET /api/encargados-seccional` — Lista encargados de seccional
- `POST /api/encargados-seccional` — Crea encargado de seccional
- `GET /api/encargados-escuela` — Lista encargados de escuela
- `POST /api/encargados-escuela` — Crea encargado de escuela

---

## 📝 Ejemplo de uso con Swagger

1. Iniciá el servidor.
2. Accedé a [http://localhost:3000/api-docs](http://localhost:3000/api-docs).
3. Probá el login (`POST /auth/login`) y copiá el token.
4. Hacé clic en cualquier endpoint protegido, presioná "Authorize" y pegá el token con el formato:
   ```
   Bearer <tu_token>
   ```
5. Probá los endpoints directamente desde la interfaz Swagger.

---

## 🛠️ Tests

Ejecutá los tests con:
```bash
npm test
```

---

## 📄 Licencia

MIT

---
