-- Script para actualizar la tabla resultados con la nueva estructura
-- Ejecutar este script si la tabla ya existe con estructura antigua

-- Verificar si la tabla tiene la estructura antigua y actualizarla
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

-- Copiar datos existentes si los hay (ajustar según datos previos)
-- INSERT INTO resultados_new (id, fecha, id_tipo_eleccion, id_mesa, total_votantes, total_nulos, total_blancos)
-- SELECT id, fecha, id_tipo_eleccion, id_mesa, total_votantes, total_nulos, total_blancos FROM resultados;

-- Eliminar tabla antigua
DROP TABLE IF EXISTS resultados;

-- Renombrar tabla nueva
RENAME TABLE resultados_new TO resultados;

-- Actualizar la tabla mesas para usar escuela_id en lugar de id_escuela
ALTER TABLE mesas CHANGE COLUMN id_escuela escuela_id INT;

SET FOREIGN_KEY_CHECKS = 1;

-- Insertar tipos de elección básicos si no existen
INSERT IGNORE INTO tipos_eleccion (id, nombre) VALUES 
(1, 'Vecinal'),
(2, 'Municipal'), 
(3, 'Provincial'),
(4, 'Nacional');
