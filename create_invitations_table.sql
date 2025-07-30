-- Crear tabla para invitaciones pendientes
CREATE TABLE IF NOT EXISTS invitaciones_grupo (
    id INT AUTO_INCREMENT PRIMARY KEY,
    grupo_id INT NOT NULL,
    usuario_id INT NOT NULL,
    rol VARCHAR(20) NOT NULL DEFAULT 'miembro',
    estado ENUM('pendiente', 'aceptada', 'rechazada') NOT NULL DEFAULT 'pendiente',
    fecha_invitacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_respuesta TIMESTAMP NULL,
    FOREIGN KEY (grupo_id) REFERENCES grupos(id) ON DELETE CASCADE,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    UNIQUE KEY unique_invitacion (grupo_id, usuario_id)
);

-- Agregar índices para mejor rendimiento
CREATE INDEX idx_invitaciones_usuario ON invitaciones_grupo(usuario_id, estado);
CREATE INDEX idx_invitaciones_grupo ON invitaciones_grupo(grupo_id, estado); 