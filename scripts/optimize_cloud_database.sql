-- =====================================================
-- SCRIPT DE OPTIMIZACIÓN PARA BASE DE DATOS EN LA NUBE
-- ASTREN - MEJORAR RENDIMIENTO DEL DASHBOARD
-- Compatible con MySQL de Aiven
-- =====================================================

-- IMPORTANTE: Ejecutar este script en tu base de datos de Aiven
-- NO en la base de datos local

-- =====================================================
-- VERIFICAR TABLAS DISPONIBLES
-- =====================================================

-- Mostrar todas las tablas disponibles
SHOW TABLES;

-- =====================================================
-- CREAR ÍNDICES PARA OPTIMIZAR EL RENDIMIENTO
-- =====================================================

-- Índices para la tabla TAREAS (la más crítica para el dashboard)
-- Estos índices mejorarán significativamente las consultas del dashboard

-- Verificar si el índice ya existe antes de crearlo
SET @sql = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS 
     WHERE TABLE_SCHEMA = DATABASE() 
     AND TABLE_NAME = 'tareas' 
     AND INDEX_NAME = 'idx_tareas_usuario_id') = 0,
    'CREATE INDEX idx_tareas_usuario_id ON tareas(usuario_id)',
    'SELECT "Índice idx_tareas_usuario_id ya existe" as mensaje'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Índice para tareas asignadas
SET @sql = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS 
     WHERE TABLE_SCHEMA = DATABASE() 
     AND TABLE_NAME = 'tareas' 
     AND INDEX_NAME = 'idx_tareas_asignado_a_id') = 0,
    'CREATE INDEX idx_tareas_asignado_a_id ON tareas(asignado_a_id)',
    'SELECT "Índice idx_tareas_asignado_a_id ya existe" as mensaje'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Índice para filtrar por estado
SET @sql = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS 
     WHERE TABLE_SCHEMA = DATABASE() 
     AND TABLE_NAME = 'tareas' 
     AND INDEX_NAME = 'idx_tareas_estado') = 0,
    'CREATE INDEX idx_tareas_estado ON tareas(estado)',
    'SELECT "Índice idx_tareas_estado ya existe" as mensaje'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Índice para fechas de vencimiento (importante para contadores)
SET @sql = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS 
     WHERE TABLE_SCHEMA = DATABASE() 
     AND TABLE_NAME = 'tareas' 
     AND INDEX_NAME = 'idx_tareas_fecha_vencimiento') = 0,
    'CREATE INDEX idx_tareas_fecha_vencimiento ON tareas(fecha_vencimiento)',
    'SELECT "Índice idx_tareas_fecha_vencimiento ya existe" as mensaje'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Índice para fechas de creación (ordenamiento)
SET @sql = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS 
     WHERE TABLE_SCHEMA = DATABASE() 
     AND TABLE_NAME = 'tareas' 
     AND INDEX_NAME = 'idx_tareas_fecha_creacion') = 0,
    'CREATE INDEX idx_tareas_fecha_creacion ON tareas(fecha_creacion)',
    'SELECT "Índice idx_tareas_fecha_creacion ya existe" as mensaje'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Índice para área
SET @sql = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS 
     WHERE TABLE_SCHEMA = DATABASE() 
     AND TABLE_NAME = 'tareas' 
     AND INDEX_NAME = 'idx_tareas_area_id') = 0,
    'CREATE INDEX idx_tareas_area_id ON tareas(area_id)',
    'SELECT "Índice idx_tareas_area_id ya existe" as mensaje'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Índice para grupo
SET @sql = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS 
     WHERE TABLE_SCHEMA = DATABASE() 
     AND TABLE_NAME = 'tareas' 
     AND INDEX_NAME = 'idx_tareas_grupo_id') = 0,
    'CREATE INDEX idx_tareas_grupo_id ON tareas(grupo_id)',
    'SELECT "Índice idx_tareas_grupo_id ya existe" as mensaje'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Índice compuesto para consultas del dashboard (muy importante)
SET @sql = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS 
     WHERE TABLE_SCHEMA = DATABASE() 
     AND TABLE_NAME = 'tareas' 
     AND INDEX_NAME = 'idx_tareas_dashboard') = 0,
    'CREATE INDEX idx_tareas_dashboard ON tareas(usuario_id, estado, fecha_creacion)',
    'SELECT "Índice idx_tareas_dashboard ya existe" as mensaje'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- =====================================================
-- ÍNDICES PARA OTRAS TABLAS
-- =====================================================

-- Índices para la tabla AREAS
SET @sql = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS 
     WHERE TABLE_SCHEMA = DATABASE() 
     AND TABLE_NAME = 'areas' 
     AND INDEX_NAME = 'idx_areas_usuario_id') = 0,
    'CREATE INDEX idx_areas_usuario_id ON areas(usuario_id)',
    'SELECT "Índice idx_areas_usuario_id ya existe" as mensaje'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS 
     WHERE TABLE_SCHEMA = DATABASE() 
     AND TABLE_NAME = 'areas' 
     AND INDEX_NAME = 'idx_areas_estado') = 0,
    'CREATE INDEX idx_areas_estado ON areas(estado)',
    'SELECT "Índice idx_areas_estado ya existe" as mensaje'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Índices para la tabla GRUPOS
SET @sql = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS 
     WHERE TABLE_SCHEMA = DATABASE() 
     AND TABLE_NAME = 'grupos' 
     AND INDEX_NAME = 'idx_grupos_estado') = 0,
    'CREATE INDEX idx_grupos_estado ON grupos(estado)',
    'SELECT "Índice idx_grupos_estado ya existe" as mensaje'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Índices para la tabla MIEMBROS_GRUPO
SET @sql = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS 
     WHERE TABLE_SCHEMA = DATABASE() 
     AND TABLE_NAME = 'miembros_grupo' 
     AND INDEX_NAME = 'idx_miembros_grupo_grupo_id') = 0,
    'CREATE INDEX idx_miembros_grupo_grupo_id ON miembros_grupo(grupo_id)',
    'SELECT "Índice idx_miembros_grupo_grupo_id ya existe" as mensaje'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS 
     WHERE TABLE_SCHEMA = DATABASE() 
     AND TABLE_NAME = 'miembros_grupo' 
     AND INDEX_NAME = 'idx_miembros_grupo_usuario_id') = 0,
    'CREATE INDEX idx_miembros_grupo_usuario_id ON miembros_grupo(usuario_id)',
    'SELECT "Índice idx_miembros_grupo_usuario_id ya existe" as mensaje'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS 
     WHERE TABLE_SCHEMA = DATABASE() 
     AND TABLE_NAME = 'miembros_grupo' 
     AND INDEX_NAME = 'idx_miembros_grupo_compuesto') = 0,
    'CREATE INDEX idx_miembros_grupo_compuesto ON miembros_grupo(grupo_id, usuario_id)',
    'SELECT "Índice idx_miembros_grupo_compuesto ya existe" as mensaje'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Índice para la tabla USUARIOS
SET @sql = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS 
     WHERE TABLE_SCHEMA = DATABASE() 
     AND TABLE_NAME = 'usuarios' 
     AND INDEX_NAME = 'idx_usuarios_correo') = 0,
    'CREATE INDEX idx_usuarios_correo ON usuarios(correo)',
    'SELECT "Índice idx_usuarios_correo ya existe" as mensaje'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- =====================================================
-- ANALIZAR TABLAS PARA OPTIMIZAR ESTADÍSTICAS
-- =====================================================

-- Analizar las tablas principales para mejorar el plan de ejecución
ANALYZE TABLE tareas;
ANALYZE TABLE areas;
ANALYZE TABLE grupos;
ANALYZE TABLE miembros_grupo;
ANALYZE TABLE usuarios;

-- =====================================================
-- VERIFICAR QUE LOS ÍNDICES SE CREARON
-- =====================================================

-- Mostrar índices de la tabla tareas (la más importante)
SHOW INDEX FROM tareas;

-- Mostrar índices de otras tablas
SHOW INDEX FROM areas;
SHOW INDEX FROM grupos;
SHOW INDEX FROM miembros_grupo;
SHOW INDEX FROM usuarios;

-- =====================================================
-- CONSULTAS DE VERIFICACIÓN DE RENDIMIENTO
-- =====================================================

-- Verificar que las consultas del dashboard usen índices
EXPLAIN SELECT 
    t.*, a.nombre AS area_nombre, a.color AS area_color, a.icono AS area_icono,
    g.nombre AS grupo_nombre, g.color AS grupo_color, g.icono AS grupo_icono,
    u.nombre AS asignado_nombre, u.apellido AS asignado_apellido
FROM tareas t
LEFT JOIN areas a ON t.area_id = a.id
LEFT JOIN grupos g ON t.grupo_id = g.id
LEFT JOIN usuarios u ON t.asignado_a_id = u.id
WHERE (t.usuario_id = 1 OR t.asignado_a_id = 1) AND t.estado != 'eliminada'
ORDER BY t.fecha_creacion DESC;

-- =====================================================
-- MENSAJE DE ÉXITO
-- =====================================================

-- Si llegaste hasta aquí sin errores, ¡excelente!
-- Los índices se han creado correctamente y el rendimiento debería mejorar significativamente.

-- Próximos pasos:
-- 1. Reinicia tu servidor Flask
-- 2. Prueba el dashboard
-- 3. Verifica la mejora de rendimiento

-- ¡El dashboard debería cargar 10-100x más rápido ahora!
