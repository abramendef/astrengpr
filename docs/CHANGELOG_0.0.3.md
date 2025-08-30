# Cambios en la versión 0.0.6

- Corrección global de zona horaria:
  - Backend en UTC (sesión MySQL UTC, comparaciones con UTC_TIMESTAMP/UTC_DATE)
  - Normalización de `fecha_vencimiento` a UTC
  - Serialización ISO UTC en respuestas
  - Frontend envía fechas como ISO UTC (`toISOString()`)
- Impacto: las tareas no se marcan “vencidas” antes de tiempo en distintas zonas.

---
# Cambios en la versión 0.0.3

- Varias mejoras de rendimiento y estabilidad.
- Eliminado Railway; versión del sistema actualizada a 0.0.3.
