-- Agregar campo total_electores_padron a la tabla resultados
ALTER TABLE resultados 
ADD COLUMN total_electores_padron INT DEFAULT 0 AFTER total_votantes;

-- Agregar campo total_electores_padron a la tabla resultados_subcircuito
ALTER TABLE resultados_subcircuito 
ADD COLUMN total_electores_padron INT DEFAULT 0 AFTER total_votantes;

-- Actualizar registros existentes con un valor por defecto (igual al total de votantes)
UPDATE resultados 
SET total_electores_padron = total_votantes 
WHERE total_electores_padron = 0;

UPDATE resultados_subcircuito 
SET total_electores_padron = total_votantes 
WHERE total_electores_padron = 0;
