-- Migración del sistema de reputación para Aiven
USE astrengpr;

-- Agregar columnas faltantes a la tabla tareas
ALTER TABLE tareas 
ADD COLUMN IF NOT EXISTS fecha_completada DATETIME DEFAULT NULL,
ADD COLUMN IF NOT EXISTS fecha_reapertura DATETIME DEFAULT NULL;

-- Crear tabla historial_reputacion
CREATE TABLE IF NOT EXISTS historial_reputacion (
    id INT PRIMARY KEY AUTO_INCREMENT,
    usuario_id INT NOT NULL,
    tarea_id INT NOT NULL,
    estrellas_ganadas DECIMAL(3,2),
    criterio_tiempo DECIMAL(3,2),
    criterio_descripcion DECIMAL(3,2),
    criterio_evidencia DECIMAL(3,2),
    criterio_colaboracion DECIMAL(3,2),
    motivo_json JSON DEFAULT NULL,
    fecha_cambio TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    evento ENUM('completada','reapertura','ajuste') DEFAULT 'completada',
    UNIQUE KEY uniq_usuario_tarea_evento (usuario_id, tarea_id, evento),
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (tarea_id) REFERENCES tareas(id)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

-- Crear tabla evidencias_tarea
CREATE TABLE IF NOT EXISTS evidencias_tarea (
    id INT PRIMARY KEY AUTO_INCREMENT,
    tarea_id INT NOT NULL,
    usuario_id INT NOT NULL,
    url VARCHAR(500) DEFAULT NULL,
    archivo_path VARCHAR(500) DEFAULT NULL,
    estado_validacion ENUM('pendiente','aprobada','rechazada') DEFAULT 'pendiente',
    fecha_subida TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tarea_id) REFERENCES tareas(id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

-- Crear tabla rate_limit_reputacion
CREATE TABLE IF NOT EXISTS rate_limit_reputacion (
    id INT PRIMARY KEY AUTO_INCREMENT,
    usuario_id INT NOT NULL,
    ventana_inicio TIMESTAMP NOT NULL,
    eventos INT NOT NULL DEFAULT 0,
    INDEX idx_usuario_ventana (usuario_id, ventana_inicio)
) ENGINE=InnoDB;

-- Crear tabla tareas_asignadas
CREATE TABLE IF NOT EXISTS tareas_asignadas (
    id INT PRIMARY KEY AUTO_INCREMENT,
    tarea_id INT NOT NULL,
    usuario_id INT NOT NULL,
    fecha_asignacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uniq_tarea_usuario (tarea_id, usuario_id),
    FOREIGN KEY (tarea_id) REFERENCES tareas(id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

-- Crear tabla tareas_dependencias
CREATE TABLE IF NOT EXISTS tareas_dependencias (
    id INT PRIMARY KEY AUTO_INCREMENT,
    tarea_id INT NOT NULL,
    tarea_dependiente_id INT NOT NULL,
    estado ENUM('pendiente','completada') NOT NULL DEFAULT 'pendiente',
    UNIQUE KEY uniq_dep (tarea_id, tarea_dependiente_id),
    FOREIGN KEY (tarea_id) REFERENCES tareas(id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (tarea_dependiente_id) REFERENCES tareas(id)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

-- Agregar índices de rendimiento faltantes
CREATE INDEX IF NOT EXISTS idx_tareas_usuario_estado_completada ON tareas (usuario_id, estado, fecha_completada);
CREATE INDEX IF NOT EXISTS idx_tareas_area_estado_completada ON tareas (area_id, estado, fecha_completada);
CREATE INDEX IF NOT EXISTS idx_notif_usuario_leida ON notificaciones (usuario_id, leida);
CREATE INDEX IF NOT EXISTS idx_mg_usuario_grupo ON miembros_grupo (usuario_id, grupo_id);
CREATE INDEX IF NOT EXISTS idx_grupos_estado_nombre ON grupos (estado, nombre);

-- Verificar que todo se creó correctamente
SHOW TABLES;
SELECT 'MIGRACION_AIVEN_COMPLETA' as status;
