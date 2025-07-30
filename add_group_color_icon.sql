-- Script para agregar campos color e icono a la tabla grupos
-- Ejecutar este script en la base de datos MySQL

USE astren;

-- Agregar columnas color e icono a la tabla grupos
ALTER TABLE grupos 
ADD COLUMN color VARCHAR(7) DEFAULT '#3b82f6' AFTER descripcion,
ADD COLUMN icono VARCHAR(50) DEFAULT 'fa-users' AFTER color;

-- Actualizar registros existentes con valores por defecto
UPDATE grupos SET 
color = '#3b82f6', 
icono = 'fa-users' 
WHERE color IS NULL OR icono IS NULL;

-- Agregar comentarios para documentar los campos
ALTER TABLE grupos 
MODIFY COLUMN color VARCHAR(7) COMMENT 'Color hexadecimal del grupo (ej: #3b82f6)',
MODIFY COLUMN icono VARCHAR(50) COMMENT 'Clase del icono FontAwesome (ej: fa-users)';

-- Verificar que los campos se agregaron correctamente
DESCRIBE grupos; 