-- Script para ejecutar manualmente en MySQL
-- Copia y pega estos comandos uno por uno en tu cliente MySQL

-- 1. Conectar a la base de datos
USE elecciones_cordoba;

-- 2. Agregar columna seccional_asignada
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS seccional_asignada INT DEFAULT NULL;

-- 3. Insertar usuarios de seccional (ejecutar en bloques)
INSERT INTO usuarios (email, nombre, password, rol, seccional_asignada) VALUES
('usuario-seccional-1@cordoba.com', 'Usuario Seccional 1', '$2a$10$rQJ8vQ9mZnHNJzI6qZdQo.uXJKjB5vQKjBx1L2mH3nP4oP5qR6sT7', 'seccional', 1)
ON DUPLICATE KEY UPDATE seccional_asignada = VALUES(seccional_asignada), rol = VALUES(rol);

INSERT INTO usuarios (email, nombre, password, rol, seccional_asignada) VALUES
('usuario-seccional-2@cordoba.com', 'Usuario Seccional 2', '$2a$10$rQJ8vQ9mZnHNJzI6qZdQo.uXJKjB5vQKjBx1L2mH3nP4oP5qR6sT7', 'seccional', 2)
ON DUPLICATE KEY UPDATE seccional_asignada = VALUES(seccional_asignada), rol = VALUES(rol);

INSERT INTO usuarios (email, nombre, password, rol, seccional_asignada) VALUES
('usuario-seccional-3@cordoba.com', 'Usuario Seccional 3', '$2a$10$rQJ8vQ9mZnHNJzI6qZdQo.uXJKjB5vQKjBx1L2mH3nP4oP5qR6sT7', 'seccional', 3)
ON DUPLICATE KEY UPDATE seccional_asignada = VALUES(seccional_asignada), rol = VALUES(rol);

INSERT INTO usuarios (email, nombre, password, rol, seccional_asignada) VALUES
('usuario-seccional-4@cordoba.com', 'Usuario Seccional 4', '$2a$10$rQJ8vQ9mZnHNJzI6qZdQo.uXJKjB5vQKjBx1L2mH3nP4oP5qR6sT7', 'seccional', 4)
ON DUPLICATE KEY UPDATE seccional_asignada = VALUES(seccional_asignada), rol = VALUES(rol);

INSERT INTO usuarios (email, nombre, password, rol, seccional_asignada) VALUES
('usuario-seccional-5@cordoba.com', 'Usuario Seccional 5', '$2a$10$rQJ8vQ9mZnHNJzI6qZdQo.uXJKjB5vQKjBx1L2mH3nP4oP5qR6sT7', 'seccional', 5)
ON DUPLICATE KEY UPDATE seccional_asignada = VALUES(seccional_asignada), rol = VALUES(rol);

INSERT INTO usuarios (email, nombre, password, rol, seccional_asignada) VALUES
('usuario-seccional-6@cordoba.com', 'Usuario Seccional 6', '$2a$10$rQJ8vQ9mZnHNJzI6qZdQo.uXJKjB5vQKjBx1L2mH3nP4oP5qR6sT7', 'seccional', 6)
ON DUPLICATE KEY UPDATE seccional_asignada = VALUES(seccional_asignada), rol = VALUES(rol);

INSERT INTO usuarios (email, nombre, password, rol, seccional_asignada) VALUES
('usuario-seccional-7@cordoba.com', 'Usuario Seccional 7', '$2a$10$rQJ8vQ9mZnHNJzI6qZdQo.uXJKjB5vQKjBx1L2mH3nP4oP5qR6sT7', 'seccional', 7)
ON DUPLICATE KEY UPDATE seccional_asignada = VALUES(seccional_asignada), rol = VALUES(rol);

INSERT INTO usuarios (email, nombre, password, rol, seccional_asignada) VALUES
('usuario-seccional-8@cordoba.com', 'Usuario Seccional 8', '$2a$10$rQJ8vQ9mZnHNJzI6qZdQo.uXJKjB5vQKjBx1L2mH3nP4oP5qR6sT7', 'seccional', 8)
ON DUPLICATE KEY UPDATE seccional_asignada = VALUES(seccional_asignada), rol = VALUES(rol);

INSERT INTO usuarios (email, nombre, password, rol, seccional_asignada) VALUES
('usuario-seccional-9@cordoba.com', 'Usuario Seccional 9', '$2a$10$rQJ8vQ9mZnHNJzI6qZdQo.uXJKjB5vQKjBx1L2mH3nP4oP5qR6sT7', 'seccional', 9)
ON DUPLICATE KEY UPDATE seccional_asignada = VALUES(seccional_asignada), rol = VALUES(rol);

INSERT INTO usuarios (email, nombre, password, rol, seccional_asignada) VALUES
('usuario-seccional-10@cordoba.com', 'Usuario Seccional 10', '$2a$10$rQJ8vQ9mZnHNJzI6qZdQo.uXJKjB5vQKjBx1L2mH3nP4oP5qR6sT7', 'seccional', 10)
ON DUPLICATE KEY UPDATE seccional_asignada = VALUES(seccional_asignada), rol = VALUES(rol);

INSERT INTO usuarios (email, nombre, password, rol, seccional_asignada) VALUES
('usuario-seccional-11@cordoba.com', 'Usuario Seccional 11', '$2a$10$rQJ8vQ9mZnHNJzI6qZdQo.uXJKjB5vQKjBx1L2mH3nP4oP5qR6sT7', 'seccional', 11)
ON DUPLICATE KEY UPDATE seccional_asignada = VALUES(seccional_asignada), rol = VALUES(rol);

INSERT INTO usuarios (email, nombre, password, rol, seccional_asignada) VALUES
('usuario-seccional-12@cordoba.com', 'Usuario Seccional 12', '$2a$10$rQJ8vQ9mZnHNJzI6qZdQo.uXJKjB5vQKjBx1L2mH3nP4oP5qR6sT7', 'seccional', 12)
ON DUPLICATE KEY UPDATE seccional_asignada = VALUES(seccional_asignada), rol = VALUES(rol);

INSERT INTO usuarios (email, nombre, password, rol, seccional_asignada) VALUES
('usuario-seccional-13@cordoba.com', 'Usuario Seccional 13', '$2a$10$rQJ8vQ9mZnHNJzI6qZdQo.uXJKjB5vQKjBx1L2mH3nP4oP5qR6sT7', 'seccional', 13)
ON DUPLICATE KEY UPDATE seccional_asignada = VALUES(seccional_asignada), rol = VALUES(rol);

INSERT INTO usuarios (email, nombre, password, rol, seccional_asignada) VALUES
('usuario-seccional-14@cordoba.com', 'Usuario Seccional 14', '$2a$10$rQJ8vQ9mZnHNJzI6qZdQo.uXJKjB5vQKjBx1L2mH3nP4oP5qR6sT7', 'seccional', 14)
ON DUPLICATE KEY UPDATE seccional_asignada = VALUES(seccional_asignada), rol = VALUES(rol);

-- 4. Verificar que se crearon correctamente
SELECT id, email, nombre, rol, seccional_asignada FROM usuarios WHERE rol = 'seccional' ORDER BY seccional_asignada;

-- 5. Verificar estructura de tabla
DESCRIBE usuarios;
