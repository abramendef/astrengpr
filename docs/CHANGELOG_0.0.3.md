# Cambios en la versión 0.0.3

- Backend
  - Eliminado UPDATE masivo; estado "vencida" calculado en SELECT.
  - Paginación `limit/offset` en tareas por usuario y por grupo.
  - UNION ALL en lugar de OR para usar índices.
  - Consulta de grupos con JOIN + GROUP BY (sin subconsultas repetidas).
  - Contadores del dashboard sin OR (dos consultas y suma en Python).
  - Pool MySQL por defecto: 15. Compresión HTTP activa. orjson opcional.
  - Detección de entorno (ENV o MYSQL_HOST) para nivel de logs.
- Frontend
  - Bootstrap de datos y sincronización periódica controlada.
  - Estabilizaciones en Dashboard/Áreas/Grupos/Tareas.
- Base de datos
  - Índices compuestos aplicados (tareas, notificaciones, miembros_grupo, grupos).
  - `create_database.sql` actualizado con los índices.
- Limpieza
  - Eliminado Railway; versión del sistema actualizada a 0.0.3.
