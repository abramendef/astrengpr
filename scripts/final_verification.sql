-- Verificación final de la estructura de la base de datos
SHOW TABLES;

-- Verificar estructura de tareas
DESCRIBE tareas;

-- Verificar índices de tareas
SHOW INDEX FROM tareas;

-- Verificar tablas de reputación
DESCRIBE reputacion_general;
DESCRIBE historial_reputacion;
DESCRIBE evidencias_tarea;
DESCRIBE rate_limit_reputacion;
DESCRIBE tareas_asignadas;
DESCRIBE tareas_dependencias;

-- Verificar foreign keys
SELECT 
    TABLE_NAME, 
    COLUMN_NAME, 
    CONSTRAINT_NAME, 
    REFERENCED_TABLE_NAME, 
    REFERENCED_COLUMN_NAME
FROM information_schema.KEY_COLUMN_USAGE 
WHERE TABLE_SCHEMA = DATABASE() 
    AND REFERENCED_TABLE_NAME IS NOT NULL
ORDER BY TABLE_NAME, COLUMN_NAME;

SELECT 'VERIFICACION_FINAL_COMPLETA' as status;
