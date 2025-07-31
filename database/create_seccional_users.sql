-- Crear usuarios por seccional con permisos específicos
-- Agregar columna seccional_asignada a la tabla usuarios si no existe

ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS seccional_asignada INT DEFAULT NULL;

-- Crear usuarios para cada seccional (1 a 14)
INSERT INTO usuarios (email, nombre, password, rol, seccional_asignada) VALUES
('usuario-seccional-1@cordoba.com', 'Usuario Seccional 1', '$2a$10$rQJ8vQ9mZnHNJzI6qZdQo.uXJKjB5vQKjBx1L2mH3nP4oP5qR6sT7', 'seccional', 1),
('usuario-seccional-2@cordoba.com', 'Usuario Seccional 2', '$2a$10$rQJ8vQ9mZnHNJzI6qZdQo.uXJKjB5vQKjBx1L2mH3nP4oP5qR6sT7', 'seccional', 2),
('usuario-seccional-3@cordoba.com', 'Usuario Seccional 3', '$2a$10$rQJ8vQ9mZnHNJzI6qZdQo.uXJKjB5vQKjBx1L2mH3nP4oP5qR6sT7', 'seccional', 3),
('usuario-seccional-4@cordoba.com', 'Usuario Seccional 4', '$2a$10$rQJ8vQ9mZnHNJzI6qZdQo.uXJKjB5vQKjBx1L2mH3nP4oP5qR6sT7', 'seccional', 4),
('usuario-seccional-5@cordoba.com', 'Usuario Seccional 5', '$2a$10$rQJ8vQ9mZnHNJzI6qZdQo.uXJKjB5vQKjBx1L2mH3nP4oP5qR6sT7', 'seccional', 5),
('usuario-seccional-6@cordoba.com', 'Usuario Seccional 6', '$2a$10$rQJ8vQ9mZnHNJzI6qZdQo.uXJKjB5vQKjBx1L2mH3nP4oP5qR6sT7', 'seccional', 6),
('usuario-seccional-7@cordoba.com', 'Usuario Seccional 7', '$2a$10$rQJ8vQ9mZnHNJzI6qZdQo.uXJKjB5vQKjBx1L2mH3nP4oP5qR6sT7', 'seccional', 7),
('usuario-seccional-8@cordoba.com', 'Usuario Seccional 8', '$2a$10$rQJ8vQ9mZnHNJzI6qZdQo.uXJKjB5vQKjBx1L2mH3nP4oP5qR6sT7', 'seccional', 8),
('usuario-seccional-9@cordoba.com', 'Usuario Seccional 9', '$2a$10$rQJ8vQ9mZnHNJzI6qZdQo.uXJKjB5vQKjBx1L2mH3nP4oP5qR6sT7', 'seccional', 9),
('usuario-seccional-10@cordoba.com', 'Usuario Seccional 10', '$2a$10$rQJ8vQ9mZnHNJzI6qZdQo.uXJKjB5vQKjBx1L2mH3nP4oP5qR6sT7', 'seccional', 10),
('usuario-seccional-11@cordoba.com', 'Usuario Seccional 11', '$2a$10$rQJ8vQ9mZnHNJzI6qZdQo.uXJKjB5vQKjBx1L2mH3nP4oP5qR6sT7', 'seccional', 11),
('usuario-seccional-12@cordoba.com', 'Usuario Seccional 12', '$2a$10$rQJ8vQ9mZnHNJzI6qZdQo.uXJKjB5vQKjBx1L2mH3nP4oP5qR6sT7', 'seccional', 12),
('usuario-seccional-13@cordoba.com', 'Usuario Seccional 13', '$2a$10$rQJ8vQ9mZnHNJzI6qZdQo.uXJKjB5vQKjBx1L2mH3nP4oP5qR6sT7', 'seccional', 13),
('usuario-seccional-14@cordoba.com', 'Usuario Seccional 14', '$2a$10$rQJ8vQ9mZnHNJzI6qZdQo.uXJKjB5vQKjBx1L2mH3nP4oP5qR6sT7', 'seccional', 14)
ON DUPLICATE KEY UPDATE 
seccional_asignada = VALUES(seccional_asignada),
rol = VALUES(rol);

-- Nota: La contraseña hasheada corresponde a "seccional123" para todos los usuarios
-- En producción, cada usuario debería tener una contraseña única

-- Verificar usuarios creados
SELECT id, email, nombre, rol, seccional_asignada FROM usuarios WHERE rol = 'seccional' ORDER BY seccional_asignada;
