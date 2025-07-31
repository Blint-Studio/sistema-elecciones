-- Script para actualizar la columna categoria en la tabla militantes
-- Agregar la nueva categoría "dirigente" al ENUM existente

-- IMPORTANTE: Ejecutar este script en la base de datos antes de usar la nueva categoría

-- Verificar la estructura actual de la tabla militantes
DESCRIBE militantes;

-- Actualizar la columna categoria para incluir "dirigente"
ALTER TABLE militantes 
MODIFY COLUMN categoria ENUM('juventud', 'mayores', 'encargado de escuela', 'dirigente');

-- Verificar que el cambio se aplicó correctamente
DESCRIBE militantes;

-- Script completado exitosamente
-- La columna categoria ahora acepta: 'juventud', 'mayores', 'encargado de escuela', 'dirigente'
