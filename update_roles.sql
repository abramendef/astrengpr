-- Script para agregar el rol "administrador" a la tabla miembros_grupo

-- Opción 1: Si la columna es ENUM, modificar el ENUM
ALTER TABLE miembros_grupo MODIFY COLUMN rol ENUM('lider', 'miembro', 'administrador') NOT NULL DEFAULT 'miembro';

-- Opción 2: Si la columna es VARCHAR, solo necesitamos asegurar que sea lo suficientemente larga
-- ALTER TABLE miembros_grupo MODIFY COLUMN rol VARCHAR(20) NOT NULL DEFAULT 'miembro';

-- Verificar la estructura actual
DESCRIBE miembros_grupo; 