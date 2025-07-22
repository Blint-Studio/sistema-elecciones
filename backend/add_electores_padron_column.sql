-- Script para agregar columna total_electores_padron a resultados_subcircuito
-- y asegurar que existe en resultados

-- Agregar columna a resultados_subcircuito
ALTER TABLE resultados_subcircuito 
ADD COLUMN total_electores_padron INT NOT NULL DEFAULT 0 
AFTER total_votantes;

-- Verificar que existe en resultados (por si no está)
SET @column_exists = (
  SELECT COUNT(*) 
  FROM INFORMATION_SCHEMA.COLUMNS 
  WHERE TABLE_SCHEMA = DATABASE() 
    AND TABLE_NAME = 'resultados' 
    AND COLUMN_NAME = 'total_electores_padron'
);

SET @sql = IF(@column_exists = 0,
  'ALTER TABLE resultados ADD COLUMN total_electores_padron INT NOT NULL DEFAULT 0 AFTER total_votantes',
  'SELECT "Column total_electores_padron already exists in resultados table"'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Mostrar estructura actualizada
SELECT 'Estructura de resultados_subcircuito:' as info;
DESCRIBE resultados_subcircuito;

SELECT 'Estructura de resultados:' as info;
DESCRIBE resultados;
