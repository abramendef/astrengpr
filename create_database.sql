-- Crear base de datos Astren desde cero
-- Versión: 0.0.1

-- Crear base de datos
CREATE DATABASE IF NOT EXISTS astren;
USE astren;

-- Tabla de usuarios
CREATE TABLE usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    correo VARCHAR(100) NOT NULL UNIQUE,
    contraseña VARCHAR(255) NOT NULL,
    telefono VARCHAR(20) NULL,
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de áreas
CREATE TABLE areas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT NULL,
    color VARCHAR(20) NULL,
    icono VARCHAR(100) NULL,
    usuario_id INT NOT NULL,
    estado VARCHAR(20) NOT NULL DEFAULT 'activa',
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

-- Tabla de grupos
CREATE TABLE grupos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT NULL,
    color VARCHAR(7) NULL,
    icono VARCHAR(50) NULL,
    creador_id INT NOT NULL,
    estado VARCHAR(20) NOT NULL DEFAULT 'activo',
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (creador_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

-- Tabla de miembros de grupo
CREATE TABLE miembros_grupo (
    grupo_id INT NOT NULL,
    usuario_id INT NOT NULL,
    rol ENUM('lider', 'miembro', 'administrador') NOT NULL DEFAULT 'miembro',
    PRIMARY KEY (grupo_id, usuario_id),
    FOREIGN KEY (grupo_id) REFERENCES grupos(id) ON DELETE CASCADE,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

-- Tabla de áreas de grupo por usuario
CREATE TABLE grupo_areas_usuario (
    id INT AUTO_INCREMENT PRIMARY KEY,
    grupo_id INT NOT NULL,
    area_id INT NOT NULL,
    usuario_id INT NOT NULL,
    fecha_asignacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (grupo_id) REFERENCES grupos(id) ON DELETE CASCADE,
    FOREIGN KEY (area_id) REFERENCES areas(id) ON DELETE CASCADE,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    UNIQUE KEY unique_grupo_area_usuario (grupo_id, area_id, usuario_id)
);

-- Tabla de invitaciones a grupos
CREATE TABLE invitaciones_grupo (
    id INT AUTO_INCREMENT PRIMARY KEY,
    grupo_id INT NOT NULL,
    usuario_id INT NOT NULL,
    rol VARCHAR(20) NOT NULL,
    estado ENUM('pendiente', 'aceptada', 'rechazada', 'archivada') NOT NULL DEFAULT 'pendiente',
    fecha_invitacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_respuesta TIMESTAMP NULL,
    FOREIGN KEY (grupo_id) REFERENCES grupos(id) ON DELETE CASCADE,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

-- Tabla de tareas
CREATE TABLE tareas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    titulo VARCHAR(200) NOT NULL,
    descripcion TEXT NULL,
    estado VARCHAR(20) NULL,
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    fecha_vencimiento DATETIME NULL,
    usuario_id INT NOT NULL,
    area_id INT NULL,
    grupo_id INT NULL,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (area_id) REFERENCES areas(id) ON DELETE SET NULL,
    FOREIGN KEY (grupo_id) REFERENCES grupos(id) ON DELETE SET NULL
);

-- Tabla de notificaciones
CREATE TABLE notificaciones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    tipo VARCHAR(50) NOT NULL,
    titulo VARCHAR(200) NOT NULL,
    mensaje TEXT NOT NULL,
    leida TINYINT(1) NULL,
    datos_adicionales JSON NULL,
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

-- Insertar usuario de prueba
INSERT INTO usuarios (nombre, apellido, correo, contraseña) VALUES 
('Usuario', 'Demo', 'demo@astren.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj3ZxQQxqKre');

-- Insertar áreas de ejemplo
INSERT INTO areas (nombre, descripcion, color, icono, usuario_id) VALUES 
('Trabajo', 'Tareas relacionadas con el trabajo', '#3b82f6', 'fas fa-briefcase', 1),
('Personal', 'Tareas personales y domésticas', '#10b981', 'fas fa-home', 1),
('Estudio', 'Tareas de estudio y aprendizaje', '#f59e0b', 'fas fa-graduation-cap', 1);

-- Insertar grupo de ejemplo
INSERT INTO grupos (nombre, descripcion, creador_id) VALUES 
('Equipo Desarrollo', 'Equipo de desarrollo de software', 1);

-- Insertar miembro al grupo
INSERT INTO miembros_grupo (grupo_id, usuario_id, rol) VALUES 
(1, 1, 'lider');

-- Insertar tareas de ejemplo
INSERT INTO tareas (titulo, descripcion, estado, usuario_id, area_id) VALUES 
('Revisar documentación', 'Revisar la documentación del proyecto', 'pendiente', 1, 1),
('Comprar víveres', 'Comprar víveres para la semana', 'pendiente', 1, 2),
('Estudiar Python', 'Repasar conceptos de Python', 'pendiente', 1, 3); 