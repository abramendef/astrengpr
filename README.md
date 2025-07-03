# 🚀 Astren - Sistema de Gestión de Productividad

Astren es una plataforma completa de gestión de productividad que incluye gestión de tareas, equipos, áreas personales y un sistema de reputación integrado.

## 📁 Estructura del Proyecto

```
astren/
├── frontend/              # Interfaz de usuario
│   ├── css/              # Estilos CSS
│   ├── js/               # JavaScript del frontend
│   ├── images/           # Imágenes y assets
│   ├── index.html        # Página principal
│   ├── dashboard.html    # Dashboard principal
│   ├── tasks.html        # Gestión de tareas
│   ├── groups.html       # Gestión de equipos
│   ├── areas.html        # Áreas personales
│   ├── profile.html      # Perfil de usuario
│   ├── settings.html     # Configuraciones
│   ├── reputation.html   # Sistema de reputación
│   ├── notifications.html # Notificaciones
│   ├── sync-settings.html # Configuración de sincronización
│   ├── login.html        # Página de login
│   └── register.html     # Página de registro
├── backend/              # Servidor y lógica de negocio
│   ├── app.py           # Servidor principal
│   ├── google_classroom.py # Integración con Google Classroom
│   ├── requirements.txt  # Dependencias de Python
│   └── env.example      # Variables de entorno de ejemplo
├── secreto_ia/          # Funcionalidad secreta de IA
│   └── docs/            # Documentación de la IA
├── docs/                # Documentación del proyecto
├── scripts/             # Scripts de configuración
├── utils/               # Utilidades y herramientas
├── attached_assets/     # Assets adjuntos
└── README.md           # Este archivo
```

## 🎯 Características Principales

### 📊 Dashboard
- Vista general de tareas y estadísticas
- Progreso de reputación en tiempo real
- Acceso rápido a todas las funciones

### ✅ Gestión de Tareas
- Crear, editar y eliminar tareas
- Categorización por áreas
- Sistema de prioridades
- Fechas de vencimiento

### 👥 Gestión de Equipos
- Crear y gestionar equipos
- Asignar tareas a miembros
- Seguimiento de progreso grupal

### 🏆 Sistema de Reputación
- Puntuación basada en completación de tareas
- Progreso visual con estrellas
- Historial de mejoras

## 🚀 Cómo Iniciar

### Opción 1: Scripts Automáticos
```bash
# Windows (PowerShell)
.\scripts\start_servers.ps1

# Windows (Batch)
.\scripts\start_astren_servers.bat
```

### Opción 2: Manual
```bash
# Backend
cd backend
pip install -r requirements.txt
python app.py

# Frontend
# Abrir frontend/index.html en el navegador
```

## 🔧 Configuración

1. Copia `backend/env.example` a `backend/.env`
2. Configura las variables de entorno necesarias
3. Instala las dependencias: `pip install -r backend/requirements.txt`

## 📚 Documentación

- **Documentación General**: `docs/`
- **IA Avanzada**: `docs/IA_AVANZADA.md` (📖 **NUEVO**)
- **Sistema de Tareas**: `docs/TASK_MANAGEMENT_SYSTEM.md`
- **Configuración iCloud**: `docs/ICLOUD_SETUP.md`

## 🛠️ Tecnologías

- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **Backend**: Python, Flask
- **Integración**: Google Classroom API
- **Sincronización**: iCloud (configurable)

## 📝 Notas

- El proyecto está completamente organizado y modularizado
- Cada funcionalidad tiene su propia documentación
- Fácil de mantener y expandir
- Código limpio y bien estructurado 