## Instrucciones para Actualizar la Base de Datos

Para poder utilizar la nueva funcionalidad de "Total de Electores en Padrón", necesitas ejecutar el siguiente script SQL en tu base de datos:

### Opción 1: Usando MySQL Workbench o phpMyAdmin
1. Abre tu cliente MySQL favorito
2. Selecciona la base de datos `elecciones_cordoba`
3. Ejecuta el siguiente script:

```sql
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
```

### Opción 2: Usando línea de comandos
```bash
mysql -u root -p elecciones_cordoba < database/add_total_electores_padron.sql
```

### Nueva Funcionalidad Implementada:
1. **Campo Total de Electores en Padrón**: Se agrega un nuevo campo obligatorio que representa el número total de electores habilitados para votar en esa mesa o subcircuito.

2. **Validación**: El sistema valida que el total de votantes no sea mayor al total de electores en padrón.

3. **Cálculo de Participación**: Se muestra automáticamente el porcentaje de participación electoral en las tablas de resultados.

4. **Mejorado para Gráficos**: Esta información será útil para generar gráficos más precisos sobre la participación electoral.

### Ejemplo de Uso:
- **Total de Electores en Padrón**: 850 (personas habilitadas para votar)
- **Total de Votantes**: 620 (personas que efectivamente votaron)
- **% Participación**: 72.9%

El archivo SQL ya está creado en: `database/add_total_electores_padron.sql`
