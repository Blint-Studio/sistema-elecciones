-- SCRIPT COMPLETO DE MIGRACIÓN DE BASE DE DATOS
-- Ejecutar paso a paso en MySQL/MariaDB

-- PASO 1: Respaldar datos existentes (OPCIONAL)
-- CREATE TABLE resultados_backup AS SELECT * FROM resultados;

-- PASO 2: Verificar estructura actual
DESCRIBE resultados;
DESCRIBE mesas;

-- PASO 3: Desactivar verificación de foreign keys
SET FOREIGN_KEY_CHECKS = 0;

-- PASO 4: Actualizar tabla mesas si es necesario
-- Verificar si existe la columna escuela_id
SELECT COLUMN_NAME 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_NAME = 'mesas' AND COLUMN_NAME IN ('escuela_id', 'id_escuela');

-- Si existe id_escuela pero no escuela_id, renombrar
-- ALTER TABLE mesas CHANGE COLUMN id_escuela escuela_id INT;

-- Si no existe ninguna, agregar escuela_id
-- ALTER TABLE mesas ADD COLUMN escuela_id INT AFTER numero_mesa;
-- ALTER TABLE mesas ADD FOREIGN KEY (escuela_id) REFERENCES escuelas(id);

-- PASO 5: Recrear tabla resultados con nueva estructura
DROP TABLE IF EXISTS resultados_new;

CREATE TABLE resultados_new (
    id INT AUTO_INCREMENT PRIMARY KEY,
    fecha DATE NOT NULL,
    id_tipo_eleccion INT NOT NULL,
    id_escuela INT NOT NULL,
    id_mesa INT NOT NULL,
    total_votantes INT NOT NULL DEFAULT 0,
    frente_civico INT NOT NULL DEFAULT 0,
    peronismo INT NOT NULL DEFAULT 0,
    otro INT NOT NULL DEFAULT 0,
    total_nulos INT NOT NULL DEFAULT 0,
    total_blancos INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_tipo_eleccion) REFERENCES tipos_eleccion(id),
    FOREIGN KEY (id_mesa) REFERENCES mesas(id),
    FOREIGN KEY (id_escuela) REFERENCES escuelas(id),
    UNIQUE KEY unique_mesa_tipo (id_mesa, id_tipo_eleccion)
);

-- PASO 6: Migrar datos existentes si los hay
-- INSERT INTO resultados_new (id, fecha, id_tipo_eleccion, id_mesa, total_votantes, total_nulos, total_blancos)
-- SELECT id, fecha, id_tipo_eleccion, id_mesa, total_votantes, IFNULL(total_nulos, 0), IFNULL(total_blancos, 0)
-- FROM resultados 
-- WHERE fecha IS NOT NULL AND id_tipo_eleccion IS NOT NULL AND id_mesa IS NOT NULL;

-- PASO 7: Reemplazar tabla antigua
DROP TABLE IF EXISTS resultados;
RENAME TABLE resultados_new TO resultados;

-- PASO 8: Crear/actualizar tabla usuarios
CREATE TABLE IF NOT EXISTS usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre_usuario VARCHAR(100),
    email VARCHAR(150) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    rol ENUM('admin', 'operador', 'lector') NOT NULL DEFAULT 'lector',
    telefono VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- PASO 9: Insertar tipos de elección básicos
INSERT IGNORE INTO tipos_eleccion (id, nombre) VALUES 
(1, 'Vecinal'),
(2, 'Municipal'), 
(3, 'Provincial'),
(4, 'Nacional');

-- PASO 10: Reactivar verificación de foreign keys
SET FOREIGN_KEY_CHECKS = 1;

-- PASO 11: Verificar estructura final
DESCRIBE resultados;
DESCRIBE usuarios;
SELECT * FROM tipos_eleccion;

-- PASO 12: Mostrar información
SELECT 'Migración completada exitosamente' AS status;
