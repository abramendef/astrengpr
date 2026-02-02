# AstrenGPR

AstrenGPR es una plataforma de productividad personal y colaborativa diseñada para ayudarte a gestionar tareas, organizarlas en áreas de trabajo y colaborar en grupos. Incluye un sistema de reputación que mide consistencia y calidad basándose en evidencia real.

**Demo:** https://gpr.astren.app/

## Acerca de este repositorio

Este snapshot contiene principalmente el **frontend** (interfaz de usuario HTML/CSS/JavaScript). Los archivos de configuración y referencias del backend (Flask + MySQL) se incluyen por completitud, pero el código del servidor no está presente en esta copia. Los scripts SQL están disponibles localmente pero no se publican por seguridad.

### Documentación

- [Estado actual del proyecto](docs/ESTADO_ACTUAL_ASTREN.md): arquitectura, alcance y funcionalidades
- [Diseño del sistema de reputación](docs/SISTEMA_REPUTACION_ASTREN.md): modelo de cálculo, UX y próximos pasos

## Características principales

### Frontend
- **Dashboard:** resumen de tareas, contadores y navegación rápida
- **Gestión de tareas:** crear, editar, categorizar (hoy, pendientes, completadas, vencidas)
- **Áreas personales:** organizar trabajo por contexto (laboral, académico, personal)
- **Grupos colaborativos:** asignar tareas, roles y visibilidad compartida
- **Notificaciones:** alertas (interfaz lista, no integrada aún)
- **Perfil y configuración:** personalización de cuenta (interfaz lista, no integrada aún)

### Sistema de reputación
El sistema de reputación mide consistencia y calidad de entrega mediante:
- **Puntualidad:** recompensa cumplimiento de plazos
- **Calidad:** valida descripción y evidencia en tareas
- **Colaboración:** bonifica trabajo en grupo
- **Decaimiento temporal:** da más peso a logros recientes (factor 0.9)

Estado: documentado y diseñado, no está implementado de punta a punta en este repositorio.

## Stack tecnológico

- **Frontend:** HTML5, CSS3, JavaScript (vanilla, sin frameworks)
- **Backend (referencia):** Python + Flask
- **Base de datos (referencia):** MySQL

## Ejecutar en local

### Solo frontend

Requisitos: Python 3.7+ (incluido en Windows 10+)

```powershell
cd frontend
python -m http.server 5500
```

Abre el navegador en `http://localhost:5500/` y elige una página (index.html, login.html, dashboard.html, etc.).

**Nota:** Los scripts `start_astren.bat`, `start_astren_local.bat` y `start_astren_nube.bat` asumen un backend local funcional. Sin él, solo funcionarán las interfaces estáticas del frontend.

## Estructura del proyecto

```
frontend/
  ├── css/                Estilos (areas, dashboard, login, etc.)
  ├── js/                 Lógica en JavaScript (vanilla)
  ├── images/            Recursos gráficos
  └── *.html             Páginas (index, login, register, dashboard, etc.)

backend/
  ├── requirements.txt   Dependencias Python
  ├── env.production.example  Plantilla de configuración
  └── [código no incluido en este snapshot]

docs/
  ├── ESTADO_ACTUAL_ASTREN.md           Visión general y alcance
  ├── SISTEMA_REPUTACION_ASTREN.md      Diseño del sistema de reputación
  └── [otros documentos de referencia]

scripts/
  ├── *.sql               Migraciones y esquemas (ignorados en git, solo locales)
  ├── *.py                Utilidades de configuración y migración
  └── migrations/         Versionado de migraciones de BD

create_database.sql      Script de creación de BD de referencia
start_astren*.bat        Scripts para iniciar backend + frontend (Windows)
```

## Estado del proyecto

**Frontend:** funcional y con interfaz completa. Listo para usar como referencia o punto de partida.

**Backend:** no incluido en este snapshot. Los ejemplos y referencias apuntan a Python + Flask + MySQL.

**Sistema de reputación:** diseño exhaustivo documentado (ver `docs/SISTEMA_REPUTACION_ASTREN.md`), pero sin implementación de punta a punta en este repositorio.

**Próximos pasos:** ver [documentación de reputación](docs/SISTEMA_REPUTACION_ASTREN.md) para roadmap de implementación.

## Seguridad

- Credenciales y variables sensibles están ignoradas en git (ver `.gitignore`)
- Scripts SQL locales no se publican por defecto
- El archivo `backend/env.production.example` es una plantilla; nunca subas credenciales reales
- No hay tokens, llaves API ni secretos en el código fuente

## Licencia

AstrenGPR es un proyecto privado. Consulta con el equipo para detalles de distribución o contribución.