# Astren

Astren es una demo de plataforma de productividad con tareas, grupos y áreas personales.

- Demo: https://gpr.astren.app/
- Estado del proyecto: docs/ESTADO_ACTUAL_ASTREN.md
- Diseño del sistema de reputación: docs/SISTEMA_REPUTACION_ASTREN.md

## Alcance del repositorio

Este repositorio contiene principalmente el frontend (HTML/CSS/JS). Hay scripts y archivos de configuración para un backend en Flask, pero el código del servidor no forma parte de este snapshot.

## Funcionalidad (frontend)

- Dashboard con contadores y navegación por secciones
- Tareas por categorías (hoy, pendientes, completadas, vencidas)
- Grupos con roles y asignación (interfaz)
- Áreas personales (interfaz)
- Notificaciones (interfaz)

## Stack

- Frontend: HTML5, CSS3, JavaScript (vanilla)
- Backend (referencia): Python + Flask
- Base de datos (referencia): MySQL

## Ejecutar en local (solo frontend)

En Windows:

```powershell
cd frontend
python -m http.server 5500
```

Abrir `http://localhost:5500`.

Nota: `start_astren.bat` y sus variantes asumen que existe un backend local (por ejemplo `backend/app.py`).

## Estructura

```
frontend/          Frontend estático
	css/             Estilos
	js/              Lógica
	*.html           Páginas

backend/           Archivos de soporte del backend
	requirements.txt Dependencias
	env.production.example  Plantilla de variables

docs/              Documentación
	ESTADO_ACTUAL_ASTREN.md
	SISTEMA_REPUTACION_ASTREN.md
```

## Reputación (estado)

El sistema de reputación está documentado a nivel de diseño, pero no está integrado en el backend dentro de este repositorio. La intención es medir consistencia y calidad de entrega con un modelo de decaimiento temporal.