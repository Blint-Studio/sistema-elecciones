-- Script para verificar y crear usuario de prueba
-- Ejecutar después de actualizar la estructura de la base de datos

-- Verificar si existe la tabla usuarios
SHOW TABLES LIKE 'usuarios';

-- Si no existe la tabla usuarios, crearla
CREATE TABLE IF NOT EXISTS usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre_usuario VARCHAR(100) NOT NULL UNIQUE,
    email VARCHAR(150) UNIQUE,
    password VARCHAR(255) NOT NULL,
    rol ENUM('admin', 'operador', 'lector') NOT NULL DEFAULT 'lector',
    telefono VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insertar usuario admin de prueba (password: admin123)
-- La contraseña está hasheada con bcrypt
INSERT IGNORE INTO usuarios (nombre_usuario, email, password, rol) 
VALUES ('admin', 'admin@test.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin');

-- Insertar usuario operador de prueba (password: operador123)
INSERT IGNORE INTO usuarios (nombre_usuario, email, password, rol) 
VALUES ('operador', 'operador@test.com', '$2a$10$CwTycUXWue0Thq9StjUM0uJ8R8Z9SZp7ZmF6HmH4m7wH9b8zT8gw6', 'operador');

-- Verificar usuarios creados
SELECT id, nombre_usuario, email, rol FROM usuarios;
