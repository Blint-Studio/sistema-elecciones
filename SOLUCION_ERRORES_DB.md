# 🚨 SOLUCIÓN PARA ERRORES DE BASE DE DATOS

## Problema identificado:
Los errores que ves indican que la tabla `resultados` no tiene las columnas correctas (`frente_civico`, `peronismo`, etc.)

## SOLUCIÓN RÁPIDA - Opción 1: Script automático

### Ejecutar en terminal (directorio backend):
```bash
cd backend
node scripts/migrarDB.js
```

Este script automáticamente:
- ✅ Verifica la estructura de la base de datos
- ✅ Migra las tablas si es necesario
- ✅ Crea el usuario admin
- ✅ Inserta tipos de elección

---

## SOLUCIÓN MANUAL - Opción 2: SQL directo

### 1. Conectar a MySQL/MariaDB:
```bash
mysql -u root -p nombre_de_tu_base_de_datos
```

### 2. Ejecutar estas consultas paso a paso:

```sql
-- Verificar estructura actual
DESCRIBE resultados;

-- Si la tabla tiene estructura antigua, migrar:
SET FOREIGN_KEY_CHECKS = 0;

-- Crear tabla con nueva estructura
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
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Eliminar tabla antigua y renombrar
DROP TABLE resultados;
RENAME TABLE resultados_new TO resultados;

-- Crear usuario admin
CREATE TABLE IF NOT EXISTS usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(150) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    rol ENUM('admin', 'operador', 'lector') NOT NULL DEFAULT 'lector'
);

-- Insertar admin (password: admin123)
INSERT IGNORE INTO usuarios (email, password, rol) 
VALUES ('admin@cordoba.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin');

-- Crear tipos de elección
CREATE TABLE IF NOT EXISTS tipos_eleccion (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL
);

INSERT IGNORE INTO tipos_eleccion (id, nombre) VALUES 
(1, 'Vecinal'),
(2, 'Municipal'), 
(3, 'Provincial'),
(4, 'Nacional');

SET FOREIGN_KEY_CHECKS = 1;
```

---

## 3. Después de la migración:

### Reiniciar servidor backend:
```bash
cd backend
npm start
```

### Iniciar sesión en frontend:
- **Email:** admin@cordoba.com
- **Password:** admin123

---

## 4. Verificar que funciona:

1. ✅ Puedes seleccionar escuela sin errores
2. ✅ Se cargan las mesas de la escuela
3. ✅ Puedes enviar resultados sin "error interno del servidor"

---

## ⚠️ Si sigues teniendo problemas:

### Verificar logs del servidor:
Revisar la consola donde ejecutas `npm start` para ver errores específicos.

### Verificar estructura final:
```sql
DESCRIBE resultados;
DESCRIBE mesas;
SELECT * FROM usuarios;
```

---

## 📞 Estructura final esperada:

### Tabla resultados:
- id, fecha, id_tipo_eleccion, id_escuela, id_mesa
- total_votantes, frente_civico, peronismo, otro
- total_nulos, total_blancos, created_at

### Tabla mesas:
- id, numero_mesa, escuela_id (no id_escuela)

### Tabla usuarios:
- id, email, password, rol
