# Estado actual del proyecto AstrenGPR

Documento de referencia para entender qué incluye este repositorio y cuál es el alcance de la demo.

Actualizado: Febrero 2026

## Resumen

AstrenGPR es una demo de plataforma de productividad con interfaz para tareas, grupos, áreas personales y notificaciones.

En este repositorio se incluye principalmente el frontend. La documentación describe también un backend (Flask) y una base de datos (MySQL) como parte del sistema completo, pero el código del servidor no está presente en esta copia.

## Arquitectura (alto nivel)

### Frontend

- Tecnología: HTML5, CSS3 y JavaScript (vanilla)
- Despliegue (demo): https://gpr.astren.app/
- Estructura: páginas HTML + módulos JS + estilos CSS

### Backend (referencia)

- Tecnología prevista: Python + Flask
- Responsabilidad: autenticación, CRUD de tareas, grupos, áreas, notificaciones y reputación
- Nota: en este repositorio solo están los archivos de soporte (`backend/requirements.txt` y una plantilla de entorno)

### Base de datos (referencia)

- Motor previsto: MySQL
- Entidades típicas: usuarios, tareas, grupos, miembros, áreas, notificaciones y reputación

## Funcionalidad visible en la demo

- Dashboard con contadores y navegación
- Tareas por categorías (hoy, pendientes, completadas, vencidas)
- Grupos con roles (interfaz)
- Áreas personales (interfaz)
- Notificaciones (interfaz)

## Reputación

El sistema de reputación está documentado como diseño (ver `docs/SISTEMA_REPUTACION_ASTREN.md`). La intención es calcular una reputación con decaimiento temporal y mostrarla en una interfaz de estrellas, pero no está integrada de extremo a extremo en este repositorio.