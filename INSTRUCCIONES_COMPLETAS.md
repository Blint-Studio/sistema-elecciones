# INSTRUCCIONES COMPLETAS PARA ARREGLAR EL ERROR DE RESULTADOS

## PASOS PARA SOLUCIONAR EL PROBLEMA

### 1. EJECUTAR EL SCRIPT SQL DE ACTUALIZACIÓN

**IMPORTANTE**: Antes de ejecutar cualquier script SQL, haz una COPIA DE SEGURIDAD de tu base de datos.

```sql
-- Ejecutar este script en tu base de datos MySQL/MariaDB
-- Este script actualiza la estructura de la tabla resultados

SET FOREIGN_KEY_CHECKS = 0;

-- Crear tabla temporal con nueva estructura
CREATE TABLE resultados_new (
    id INT AUTO_INCREMENT PRIMARY KEY,
    fecha DATE,
    id_tipo_eleccion INT,
    id_escuela INT,
    id_mesa INT,
    total_votantes INT,
    frente_civico INT DEFAULT 0,
    peronismo INT DEFAULT 0,
    otro INT DEFAULT 0,
    total_nulos INT DEFAULT 0,
    total_blancos INT DEFAULT 0,
    FOREIGN KEY (id_tipo_eleccion) REFERENCES tipos_eleccion(id),
    FOREIGN KEY (id_mesa) REFERENCES mesas(id),
    FOREIGN KEY (id_escuela) REFERENCES escuelas(id)
);

-- Si tienes datos existentes, copia solo los compatibles
-- INSERT INTO resultados_new (id, fecha, id_tipo_eleccion, id_mesa, total_votantes, total_nulos, total_blancos)
-- SELECT id, fecha, id_tipo_eleccion, id_mesa, total_votantes, total_nulos, total_blancos FROM resultados;

-- Eliminar tabla antigua
DROP TABLE IF EXISTS resultados;

-- Renombrar tabla nueva
RENAME TABLE resultados_new TO resultados;

-- Verificar que la tabla mesas usa escuela_id
-- Si no existe, crearla
ALTER TABLE mesas ADD COLUMN escuela_id INT AFTER numero_mesa;
UPDATE mesas SET escuela_id = id_escuela WHERE escuela_id IS NULL;
ALTER TABLE mesas DROP COLUMN id_escuela;

SET FOREIGN_KEY_CHECKS = 1;

-- Insertar tipos de elección básicos si no existen
INSERT IGNORE INTO tipos_eleccion (id, nombre) VALUES 
(1, 'Vecinal'),
(2, 'Municipal'), 
(3, 'Provincial'),
(4, 'Nacional');
```

### 2. VERIFICAR ESTRUCTURA DE LA BASE DE DATOS

Después de ejecutar el script, verifica que las tablas tengan esta estructura:

```sql
-- Verificar estructura de la tabla mesas
DESCRIBE mesas;
-- Debe tener: id, numero_mesa, escuela_id

-- Verificar estructura de la tabla resultados
DESCRIBE resultados;
-- Debe tener: id, fecha, id_tipo_eleccion, id_escuela, id_mesa, total_votantes, frente_civico, peronismo, otro, total_nulos, total_blancos

-- Verificar que existen los tipos de elección
SELECT * FROM tipos_eleccion;
```

### 3. REINICIAR EL SERVIDOR BACKEND

Después de actualizar la base de datos:

```bash
# En el directorio backend
cd backend
npm start
```

### 4. VERIFICAR LAS APIS

Prueba estas URLs en tu navegador o Postman:

- GET http://localhost:5000/api/escuelas (debe devolver lista de escuelas)
- GET http://localhost:5000/api/mesas?escuela=1 (debe devolver mesas de la escuela 1)
- GET http://localhost:5000/api/resultados?escuela=1 (debe devolver resultados de la escuela 1)

### 5. PROBAR EL FRONTEND

1. Abre http://localhost:3000/cargar
2. Selecciona una fecha, tipo de elección, escuela y mesa
3. Introduce el total de votantes
4. Avanza a la segunda etapa
5. Llena los votos (la suma debe coincidir con el total de votantes)
6. Envía el resultado

## COLUMNAS DE LA BASE DE DATOS

### Tabla escuelas:
- id (INT, PRIMARY KEY)
- nombre (VARCHAR)
- id_barrio (INT, FOREIGN KEY)

### Tabla mesas:
- id (INT, PRIMARY KEY)  
- numero_mesa (VARCHAR)
- escuela_id (INT, FOREIGN KEY) ← IMPORTANTE: usa escuela_id, no id_escuela

### Tabla resultados:
- id (INT, PRIMARY KEY)
- fecha (DATE)
- id_tipo_eleccion (INT, FOREIGN KEY)
- id_escuela (INT, FOREIGN KEY)
- id_mesa (INT, FOREIGN KEY)
- total_votantes (INT)
- frente_civico (INT)
- peronismo (INT)
- otro (INT)
- total_nulos (INT)
- total_blancos (INT)

## PROBLEMAS SOLUCIONADOS

1. ✅ **Inconsistencia en nombres de columnas**: Ahora todas usan escuela_id
2. ✅ **Modelo de mesas corregido**: Parámetros correctos en todas las funciones
3. ✅ **Rutas duplicadas eliminadas**: Solo una definición por ruta
4. ✅ **Validación mejorada**: Verifica suma de votos y campos obligatorios
5. ✅ **Manejo de errores**: Mensajes claros y específicos
6. ✅ **Estructura de resultados**: Columnas específicas en lugar de JSON
7. ✅ **Frontend actualizado**: Mejor validación y manejo de errores

## LOGS PARA DEPURACIÓN

Si sigues teniendo problemas, revisa:

1. **Backend**: Los logs en la consola donde ejecutas `npm start`
2. **Frontend**: La consola del navegador (F12)
3. **Base de datos**: Los logs de MySQL/MariaDB
4. **Red**: Las peticiones HTTP en las herramientas de desarrollador

## VERIFICACIÓN FINAL

Para verificar que todo funciona:

1. La suma de votos debe ser igual al total de votantes
2. No debe aparecer "error: true" en la respuesta
3. Los resultados deben guardarse y mostrarse en la lista
4. Las mesas deben cargarse al seleccionar una escuela
