-- Reputation v0 migration (idempotent-ish) for existing DBs
-- Applies to local and cloud (Aiven)

USE astrengpr;

-- ========= tareas =========
ALTER TABLE tareas
  ADD COLUMN IF NOT EXISTS fecha_completada DATETIME NULL,
  ADD COLUMN IF NOT EXISTS fecha_reapertura DATETIME NULL,
  MODIFY COLUMN estrellas TINYINT NULL;

-- CHECK (if supported)
-- ALTER TABLE tareas ADD CONSTRAINT chk_tareas_estrellas CHECK (estrellas BETWEEN 0 AND 5);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_tareas_usuario_estado_completada
  ON tareas (usuario_id, estado, fecha_completada);
CREATE INDEX IF NOT EXISTS idx_tareas_area_estado_completada
  ON tareas (area_id, estado, fecha_completada);

-- ========= reputacion_general =========
ALTER TABLE reputacion_general
  MODIFY COLUMN estrellas DECIMAL(4,2) NOT NULL DEFAULT 3.00;
CREATE UNIQUE INDEX IF NOT EXISTS usuario_unico ON reputacion_general (usuario_id);

-- ========= reputacion_area =========
-- Ensure target column exists
ALTER TABLE reputacion_area
  ADD COLUMN IF NOT EXISTS estrellas DECIMAL(4,2) NOT NULL DEFAULT 3.00;
-- If legacy column exists, migrate values and drop it
SET @col_exists := (
  SELECT COUNT(*) FROM information_schema.columns
  WHERE table_schema = DATABASE() AND table_name = 'reputacion_area' AND column_name = 'estrellas_promedio'
);
SET @sql := IF(@col_exists > 0, 'UPDATE reputacion_area SET estrellas = estrellas_promedio', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;
SET @sql := IF(@col_exists > 0, 'ALTER TABLE reputacion_area DROP COLUMN estrellas_promedio', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;
CREATE UNIQUE INDEX IF NOT EXISTS usuario_area_unico ON reputacion_area (usuario_id, area_id);

-- ========= historial_reputacion =========
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

CREATE INDEX IF NOT EXISTS idx_historial_usuario_fecha
  ON historial_reputacion (usuario_id, fecha_cambio);

-- ========= evidencias_tarea =========
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

-- ========= rate_limit_reputacion =========
CREATE TABLE IF NOT EXISTS rate_limit_reputacion (
  id INT PRIMARY KEY AUTO_INCREMENT,
  usuario_id INT NOT NULL,
  ventana_inicio TIMESTAMP NOT NULL,
  eventos INT NOT NULL DEFAULT 0,
  INDEX idx_usuario_ventana (usuario_id, ventana_inicio)
) ENGINE=InnoDB;

-- ========= colaboración y dependencias =========
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



