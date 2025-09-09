-- Verificación final de la estructura de la base de datos en Aiven
USE astrengpr;
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

SELECT 'VERIFICACION_AIVEN_COMPLETA' as status;
