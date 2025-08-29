-- Script para crear la base de datos en Aiven
-- Versión: 0.0.4

create database astrengpr;
USE astrengpr;

CREATE TABLE usuarios (
    id INT NOT NULL AUTO_INCREMENT,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    correo VARCHAR(100) NOT NULL UNIQUE,
    contrasena VARCHAR(255) NOT NULL,
    telefono VARCHAR(20) DEFAULT NULL,
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id)
) ENGINE=InnoDB;

CREATE TABLE areas (
    id INT NOT NULL AUTO_INCREMENT,
    usuario_id INT NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    estado VARCHAR(20) NOT NULL DEFAULT 'activa',
    fecha_creacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    color VARCHAR(20) DEFAULT NULL,
    icono VARCHAR(100) DEFAULT NULL,
    PRIMARY KEY (id),
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE grupos (
    id INT NOT NULL AUTO_INCREMENT,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    color VARCHAR(7) DEFAULT NULL COMMENT 'Color hexadecimal del grupo (ej: #3b82f6)',
    icono VARCHAR(50) DEFAULT NULL COMMENT 'Clase del icono FontAwesome (ej: fa-users)',
    creador_id INT NOT NULL,
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    estado VARCHAR(20) NOT NULL DEFAULT 'activo',
    PRIMARY KEY (id),
    FOREIGN KEY (creador_id) REFERENCES usuarios(id)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE grupo_areas_usuario (
    id INT NOT NULL AUTO_INCREMENT,
    grupo_id INT NOT NULL,
    usuario_id INT NOT NULL,
    area_id INT DEFAULT NULL,
    fecha_asignacion TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE (grupo_id, usuario_id),
    FOREIGN KEY (grupo_id) REFERENCES grupos(id)
        ON DELETE CASCADE,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
        ON DELETE CASCADE,
    FOREIGN KEY (area_id) REFERENCES areas(id)
        ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE invitaciones_grupo (
    id INT NOT NULL AUTO_INCREMENT,
    grupo_id INT NOT NULL,
    usuario_id INT NOT NULL,
    rol VARCHAR(20) NOT NULL DEFAULT 'miembro',
    estado ENUM('pendiente','aceptada','rechazada','archivada') NOT NULL DEFAULT 'pendiente',
    fecha_invitacion TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_respuesta TIMESTAMP NULL DEFAULT NULL,
    PRIMARY KEY (id),
    UNIQUE (grupo_id, usuario_id),
    FOREIGN KEY (grupo_id) REFERENCES grupos(id)
        ON DELETE CASCADE,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
        ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE miembros_grupo (
    grupo_id INT NOT NULL,
    usuario_id INT NOT NULL,
    rol ENUM('lider','miembro','administrador') NOT NULL DEFAULT 'miembro',
    PRIMARY KEY (grupo_id, usuario_id),
    FOREIGN KEY (grupo_id) REFERENCES grupos(id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE notificaciones (
    id INT NOT NULL AUTO_INCREMENT,
    usuario_id INT NOT NULL,
    tipo VARCHAR(50) NOT NULL,
    titulo VARCHAR(200) NOT NULL,
    mensaje TEXT NOT NULL,
    datos_adicionales JSON DEFAULT NULL,
    leida TINYINT(1) DEFAULT '0',
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE tareas (
    id INT NOT NULL AUTO_INCREMENT,
    usuario_id INT NOT NULL,
    area_id INT DEFAULT NULL,
    grupo_id INT DEFAULT NULL,
    asignado_a_id INT DEFAULT NULL,
    titulo VARCHAR(200) NOT NULL,
    descripcion TEXT,
    estado VARCHAR(20) DEFAULT 'pendiente',
    estrellas TINYINT DEFAULT NULL,  -- Valor de 1 a 5 según evaluación de la tarea
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    fecha_vencimiento DATETIME DEFAULT NULL,
    PRIMARY KEY (id),
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (area_id) REFERENCES areas(id)
        ON DELETE SET NULL ON UPDATE CASCADE,
    FOREIGN KEY (grupo_id) REFERENCES grupos(id)
        ON DELETE SET NULL ON UPDATE CASCADE,
    FOREIGN KEY (asignado_a_id) REFERENCES usuarios(id)
        ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE reputacion_general (
    id INT NOT NULL AUTO_INCREMENT,
    usuario_id INT NOT NULL,
    estrellas DECIMAL(4,2) NOT NULL DEFAULT 5.00,
    fecha_ultima_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
        ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE reputacion_mensual (
    id INT NOT NULL AUTO_INCREMENT,
    usuario_id INT NOT NULL,
    anio INT NOT NULL,
    mes INT NOT NULL,
    estrellas_promedio DECIMAL(3,2) NOT NULL DEFAULT 5.00,
    PRIMARY KEY (id),
    UNIQUE KEY usuario_mes_unico (usuario_id, anio, mes),
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
        ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE reputacion_area (
    id INT NOT NULL AUTO_INCREMENT,
    usuario_id INT NOT NULL,
    area_id INT NOT NULL,
    estrellas_promedio DECIMAL(3,2) NOT NULL DEFAULT 5.00,
    PRIMARY KEY (id),
    UNIQUE KEY usuario_area_unico (usuario_id, area_id),
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (area_id) REFERENCES areas(id)
        ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE reputacion_grupo (
    id INT NOT NULL AUTO_INCREMENT,
    usuario_id INT NOT NULL,
    grupo_id INT NOT NULL,
    estrellas_promedio DECIMAL(3,2) NOT NULL DEFAULT 5.00,
    PRIMARY KEY (id),
    UNIQUE KEY usuario_grupo_unico (usuario_id, grupo_id),
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (grupo_id) REFERENCES grupos(id)
        ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE reputacion_grupo_general (
    id INT NOT NULL AUTO_INCREMENT,
    grupo_id INT NOT NULL,
    estrellas_promedio DECIMAL(3,2) NOT NULL DEFAULT 5.00,
    fecha_ultima_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY grupo_unico (grupo_id),
    FOREIGN KEY (grupo_id) REFERENCES grupos(id)
        ON DELETE CASCADE ON UPDATE CASCADE
);


-- =====================
-- ÍNDICES DE RENDIMIENTO
-- =====================

-- Tareas: acelerar consultas por usuario/asignado/grupo/área con orden por fecha/estado
CREATE INDEX idx_tareas_usuario_estado_fecha ON tareas (usuario_id, estado, fecha_creacion);
CREATE INDEX idx_tareas_asignado_estado_fecha ON tareas (asignado_a_id, estado, fecha_creacion);
CREATE INDEX idx_tareas_grupo_estado_fecha ON tareas (grupo_id, estado, fecha_creacion);
CREATE INDEX idx_tareas_area_estado ON tareas (area_id, estado);

-- Notificaciones: lecturas por usuario/estado de lectura
CREATE INDEX idx_notif_usuario_leida ON notificaciones (usuario_id, leida);

-- Miembros de grupo: ya existe PK (grupo_id, usuario_id), añadimos el inverso para búsquedas por usuario
CREATE INDEX idx_mg_usuario_grupo ON miembros_grupo (usuario_id, grupo_id);

-- Grupos: listas por estado y orden por nombre
CREATE INDEX idx_grupos_estado_nombre ON grupos (estado, nombre);

