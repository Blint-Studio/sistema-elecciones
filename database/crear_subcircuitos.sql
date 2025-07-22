-- Agregar tabla para resultados por subcircuito (barrios)
-- Esta tabla almacenará resultados agregados por barrio/subcircuito

CREATE TABLE IF NOT EXISTS resultados_subcircuito (
    id INT AUTO_INCREMENT PRIMARY KEY,
    fecha DATE NOT NULL,
    id_tipo_eleccion INT NOT NULL,
    id_seccional INT NOT NULL,
    id_barrio INT NOT NULL,
    total_votantes INT NOT NULL DEFAULT 0,
    frente_civico INT NOT NULL DEFAULT 0,
    peronismo INT NOT NULL DEFAULT 0,
    otro INT NOT NULL DEFAULT 0,
    total_nulos INT NOT NULL DEFAULT 0,
    total_blancos INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_tipo_eleccion) REFERENCES tipos_eleccion(id),
    FOREIGN KEY (id_seccional) REFERENCES seccionales(id),
    FOREIGN KEY (id_barrio) REFERENCES barrios(id),
    UNIQUE KEY unique_barrio_tipo (id_barrio, id_tipo_eleccion, fecha)
);

-- Insertar algunas seccionales de ejemplo si no existen
INSERT IGNORE INTO seccionales (id, nombre) VALUES 
(1, 'Primera Seccional'),
(2, 'Segunda Seccional'),
(3, 'Tercera Seccional'),
(4, 'Cuarta Seccional'),
(5, 'Quinta Seccional');

-- Insertar algunos barrios de ejemplo si no existen
INSERT IGNORE INTO barrios (id, nombre, id_seccional) VALUES 
(1, 'Centro', 1),
(2, 'Nueva Córdoba', 1),
(3, 'Alberdi', 2),
(4, 'San Vicente', 2),
(5, 'Barrio Jardín', 3),
(6, 'Cerro de las Rosas', 3),
(7, 'Villa Carlos Paz', 4),
(8, 'La Calera', 4),
(9, 'Río Cuarto', 5),
(10, 'Villa María', 5);

-- Verificar estructura
SELECT 'Estructura de subcircuitos creada exitosamente' AS status;
