-- Crear tabla de Seccionales
CREATE TABLE seccionales (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL
);

-- Crear tabla de Barrios
CREATE TABLE barrios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    id_seccional INT,
    FOREIGN KEY (id_seccional) REFERENCES seccionales(id)
);

-- Crear tabla de Escuelas
CREATE TABLE escuelas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(150) NOT NULL,
    id_barrio INT,
    FOREIGN KEY (id_barrio) REFERENCES barrios(id)
);

-- Crear tabla de Mesas
CREATE TABLE mesas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    numero_mesa VARCHAR(10) NOT NULL,
    escuela_id INT,
    FOREIGN KEY (escuela_id) REFERENCES escuelas(id)
);

-- Crear tabla de Tipos de Elección
CREATE TABLE tipos_eleccion (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL
);

-- Crear tabla de Listas Electorales
CREATE TABLE listas_electorales (
    id INT AUTO_INCREMENT PRIMARY KEY,
    codigo VARCHAR(20) NOT NULL,
    nombre_lista VARCHAR(100) NOT NULL,
    id_tipo_eleccion INT,
    FOREIGN KEY (id_tipo_eleccion) REFERENCES tipos_eleccion(id)
);

-- Crear tabla de Resultados
CREATE TABLE resultados (
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

-- Crear tabla de Usuarios
CREATE TABLE usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre_usuario VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    tipo_usuario ENUM('ADMINISTRADOR', 'SUPERVISOR', 'CARGADOR', 'LECTOR') NOT NULL,
    email VARCHAR(150),
    telefono VARCHAR(20)
);

-- Crear tabla de Encargados de Seccional
CREATE TABLE encargados_seccional (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    edad INT,
    dni VARCHAR(20),
    direccion VARCHAR(255),
    trabajo VARCHAR(100),
    email VARCHAR(150),
    telefono VARCHAR(20),
    id_seccional INT,
    FOREIGN KEY (id_seccional) REFERENCES seccionales(id)
);

-- Crear tabla de Encargados de Escuelas
CREATE TABLE encargados_escuela (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    edad INT,
    dni VARCHAR(20),
    direccion VARCHAR(255),
    trabajo VARCHAR(100),
    email VARCHAR(150),
    telefono VARCHAR(20),
    id_escuela INT,
    cantidad_mesas INT DEFAULT 0,
    FOREIGN KEY (id_escuela) REFERENCES escuelas(id)
);
