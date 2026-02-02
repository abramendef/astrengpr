# 📚 Documentación Completa del Sistema Astren

## 🏗️ Arquitectura General

**Astren** es una aplicación web de gestión de tareas y proyectos con sistema de reputación, desarrollada con:

- **Frontend**: HTML5, CSS3, JavaScript (vanilla)
- **Backend**: Python Flask con MySQL
- **Estructura**: Aplicación monolítica con separación clara entre frontend y backend
- **Sistema de Reputación**: Basado en estrellas con decaimiento exponencial (planificado pero no implementado)
- **Base de Datos**: MySQL con 8 tablas principales
- **Puerto del Servidor**: 8000 (backend) y 5500 (frontend)
- **Configuración**: Ambos servidores deben iniciarse desde directorios específicos

## 🚀 **DESPLIEGUE PRODUCCIÓN**

### **URLs del Sistema:**
- **Frontend (Vercel):** https://astren.vercel.app/
- **Backend (Render):** https://astren-backend.onrender.com
- **Base de Datos (Aiven):** MySQL en Aiven

### **Credenciales de Acceso:**
> ⚠️ **Demo Solo - No usar en Producción**
> Usar credenciales propias. Contacta al administrador para acceso real.

### **Estado del Sistema:**
- ✅ **Completamente Desplegado**
- ✅ **Funcionando en Producción**
- ✅ **Listo para Pruebas de Equipo**

## 📁 Estructura del Proyecto

```
astren/
├── frontend/                    # Interfaz de usuario
│   ├── css/                    # Estilos CSS (12 archivos)
│   │   ├── styles.css         # Estilos base (1,349 líneas)
│   │   ├── dashboard.css      # Dashboard principal (3,122 líneas)
│   │   ├── tasks.css         # Sistema de tareas (1,459 líneas)
│   │   ├── groups.css        # Gestión de grupos (1,650 líneas)
│   │   ├── areas.css         # Áreas personales (2,693 líneas)
│   │   ├── reputation.css    # Sistema de reputación (planificado - 481 líneas)
│   │   ├── sidebar.css       # Navegación lateral (389 líneas)
│   │   ├── notifications.css # Sistema de notificaciones
│   │   ├── profile.css       # Perfil de usuario
│   │   ├── register.css      # Registro
│   │   ├── login.css         # Autenticación (496 líneas)
│   │   └── settings.css      # Configuraciones
│   ├── js/                   # JavaScript (14 archivos)
│   │   ├── config.js        # Configuración global (133 líneas)
│   │   ├── dashboard.js     # Lógica del dashboard (2,071 líneas)
│   │   ├── tasks.js        # Gestión de tareas (2,420 líneas)
│   │   ├── groups.js       # Gestión de grupos (2,752 líneas)
│   │   ├── areas.js        # Áreas personales (1,307 líneas)
│   │   ├── reputation.js   # Sistema de reputación (planificado - 1,237 líneas)
│   │   ├── scripts.js      # Utilidades generales
│   │   ├── sidebar-new.js  # Navegación lateral
│   │   ├── header-buttons.js # Botones del header
│   │   ├── login.js        # Autenticación (515 líneas)
│   │   ├── register.js     # Registro
│   │   ├── profile.js      # Perfil de usuario
│   │   ├── settings.js     # Configuraciones
│   │   └── notifications.js # Sistema de notificaciones
│   ├── images/              # Assets visuales
│   │   └── Astren_logo_hor.svg
│   ├── index.html           # Página principal (21,091 líneas)
│   ├── dashboard.html       # Dashboard inteligente (330 líneas)
│   ├── tasks.html          # Gestión de tareas (403 líneas)
│   ├── groups.html         # Gestión de equipos (687 líneas)
│   ├── areas.html          # Áreas personales (405 líneas)
│   ├── reputation.html     # Sistema de reputación (planificado)
│   ├── profile.html        # Perfil de usuario
│   ├── settings.html       # Configuraciones
│   ├── notifications.html  # Notificaciones
│   ├── login.html          # Autenticación (164 líneas)
│   └── register.html       # Registro
├── backend/                 # Servidor y API
│   ├── app.py             # API principal (3,181 líneas)
│   ├── requirements.txt   # Dependencias Python (7 líneas)
│   ├── env.example       # Variables de entorno (3 líneas)
│   ├── astren.db         # Base de datos SQLite (36KB)
│   ├── test_insert_member.py # Test de inserción de miembros
│   └── test_accept_invitation.py # Test de aceptación de invitaciones
├── docs/                  # Documentación
│   ├── SISTEMA_REPUTACION_ASTREN.md  # Sistema de reputación
│   ├── TASK_MANAGEMENT_SYSTEM.md     # Sistema de tareas
│   ├── INICIAR_ASTREN.md            # Guía de inicio
│   └── DOCUMENTACION_COMPLETA_ASTREN.md # Esta documentación
├── scripts/               # Scripts de configuración
│   └── start_servers.ps1  # Script PowerShell (137 líneas)
├── start_astren.bat       # Script de inicio (50 líneas)
└── README.md             # Documentación principal
```

## 🚀 Configuración y Inicio del Sistema

### **Requisitos Previos**
- Python 3.13.5
- MySQL Server
- PowerShell (para scripts de Windows)

### **Inicio Automático (Recomendado)**
```bash
# Desde el directorio raíz de Astren
powershell -ExecutionPolicy Bypass -File scripts/start_servers.ps1
```

### **Inicio Manual**
```bash
# Terminal 1: Backend
cd backend
python app.py

# Terminal 2: Frontend  
cd frontend
python -m http.server 5500
```

## 🔐 Sistema de Autenticación

### **Flujo de Login**
1. Usuario ingresa credenciales en `login.html`
2. `login.js` envía POST a `/login` con email/password
3. Backend valida en tabla `usuarios`
4. Si es válido, retorna `usuario_id` y datos del usuario
5. Frontend almacena en `localStorage` y `sessionStorage`
6. Redirección a `dashboard.html`

### **Persistencia de Sesión**
- **localStorage**: `astren_usuario_id`, `astren_user_data`
- **sessionStorage**: `astren_user` (datos completos)
- Verificación automática en cada página
- Redirección a login si no hay sesión activa

## 🗄️ Base de Datos (MySQL)

### **Tablas Principales**
1. **usuarios** - Información de usuarios
2. **areas** - Áreas personales de organización
3. **grupos** - Grupos de trabajo
4. **miembros_grupo** - Relación usuarios-grupos
5. **grupo_areas_usuario** - Áreas asignadas a usuarios en grupos
6. **invitaciones_grupo** - Invitaciones pendientes
7. **tareas** - Tareas del sistema
8. **reputacion_usuario** - Sistema de reputación

### **Tablas Secundarias**
1. **notificaciones** - Sistema de notificaciones
2. **tarea_asignaciones** - Asignaciones de tareas
3. **evidencias_tareas** - Evidencias de tareas
4. **notas_tareas** - Notas de tareas

### **Estados del Sistema**
- **tareas**: `pendiente`, `completada`, `vencida`, `eliminada`
- **areas**: `activa`, `archivada`, `eliminada`
- **grupos**: `activo`, `archivado`, `eliminado`
- **invitaciones_grupo**: `pendiente`, `aceptada`, `rechazada`, `archivada`

## 🎨 Sistema de Colores

### **Paleta de Colores Unificada**
- **Primario**: `#6366f1` (Indigo)
- **Secundario**: `#3b82f6` (Azul)
- **Éxito**: `#10b981` (Verde)
- **Advertencia**: `#f59e0b` (Amarillo)
- **Error**: `#ef4444` (Rojo)
- **Neutral**: `#6b7280` (Gris)

### **Intensificación de Colores**
Para iconos pequeños en tarjetas, se aplica una intensificación del 10%:
- **Primario intensificado**: `#5855eb`
- **Secundario intensificado**: `#2563eb`

## 📱 Frontend - Páginas Principales

### **1. Dashboard (dashboard.html)**
- **Propósito**: Vista general del sistema
- **Contadores**: Total tareas, completadas, pendientes, grupos, áreas
- **Navegación**: Click en contadores → secciones específicas
- **JavaScript**: `dashboard.js` - Gestión de estadísticas y navegación

### **2. Tareas (tasks.html)**
- **Propósito**: Gestión completa de tareas
- **Secciones**: Pendientes, Completadas, Archivadas
- **Funcionalidades**: Crear/editar/eliminar tareas, asignar a usuarios y grupos
- **Filtros**: Por estado, prioridad, área, grupo
- **Búsqueda**: En tiempo real
- **Evidencias y notas**: Sistema completo
- **JavaScript**: `tasks.js` - Lógica completa de tareas

### **3. Grupos (groups.html)**
- **Propósito**: Gestión de grupos y colaboración
- **Secciones**: Activos, Invitaciones Pendientes, Archivados
- **Funcionalidades**: Crear/editar/eliminar grupos, sistema de invitaciones
- **Gestión de roles**: Líder, Administrador, Miembro
- **Crear tareas de grupo**: Funcionalidad integrada
- **Abandonar grupo**: (no creador)
- **JavaScript**: `groups.js` - Gestión completa de grupos

### **4. Áreas (areas.html)**
- **Propósito**: Organización personal de tareas
- **Secciones**: Activas, Archivadas
- **Funcionalidades**: Crear/editar/eliminar áreas
- **Selector de colores e iconos**: Previsualización en tiempo real
- **JavaScript**: `areas.js` - Gestión de áreas

## 🔧 JavaScript - Clases Principales

### **TasksManager (tasks.js)**
- Gestión completa de tareas
- CRUD operations
- Filtros y búsqueda
- Asignaciones y evidencias

### **GroupsManager (groups.js)**
- Gestión de grupos
- Sistema de invitaciones
- Roles y permisos
- Estadísticas de grupo

### **AreasManager (areas.js)**
- Gestión de áreas personales
- Organización de tareas
- Colores e iconos

## 🌐 Backend - Endpoints Principales

### **Autenticación**
- `POST /login` - Login de usuario
- `POST /usuarios` - Registro de usuario
- `GET /usuarios` - Listar usuarios

### **Tareas**
- `POST /tareas` - Crear tarea
- `GET /tareas/<usuario_id>` - Listar tareas
- `PUT /tareas/<tarea_id>` - Actualizar tarea
- `DELETE /tareas/<tarea_id>` - Eliminar tarea

### **Grupos**
- `POST /grupos` - Crear grupo
- `GET /grupos/<usuario_id>` - Listar grupos
- `PUT /grupos/<grupo_id>` - Actualizar grupo
- `DELETE /grupos/<grupo_id>` - Eliminar grupo

### **Áreas**
- `POST /areas` - Crear área
- `GET /areas/<usuario_id>` - Listar áreas
- `PUT /areas/<area_id>` - Actualizar área
- `DELETE /areas/<area_id>` - Eliminar área

### **Reputación**
- `GET /reputacion/<usuario_id>` - Obtener reputación
- `PUT /reputacion/<usuario_id>` - Actualizar reputación

## 🎯 Sistema de Navegación por Contadores

### **Implementación Consistente**
Todas las páginas principales tienen navegación por contadores:

**Tareas:**
- Total Tareas → Sección "Pendientes"
- Completadas → Sección "Completadas"
- Pendientes → Sección "Pendientes"
- Archivadas → Sección "Archivadas"

**Grupos:**
- Total Grupos → Sección "Activos"
- Grupos Activos → Sección "Activos"
- Invitaciones Pendientes → Sección "Invitaciones"
- Grupos Archivados → Sección "Archivados"

**Áreas:**
- Total Áreas → Sección "Activas"
- Áreas Activas → Sección "Activas"
- Tareas Pendientes → Página de tareas
- Áreas Archivadas → Sección "Archivadas"

### **Funciones de Navegación**
```javascript
// Ejemplo de navegación
function navigateToSection(section) {
    // Lógica de navegación
}
```

## 🎨 Sistema de Estilos CSS

### **Variables (Custom Properties)**
```css
:root {
    --primary-color: #6366f1;
    --secondary-color: #3b82f6;
    --success-color: #10b981;
    --warning-color: #f59e0b;
    --error-color: #ef4444;
}
```

### **Componentes Reutilizables**
- **Modales**: `.modal`, `.modal-content`, `.modal-header`
- **Tarjetas**: `.task-card`, `.group-card`, `.area-card`
- **Botones**: `.btn`, `.btn-primary`, `.btn-secondary`
- **Contadores**: `.stat-item`, `.stat-value`, `.stat-label`

## 🔔 Sistema de Notificaciones

### **Toast Notifications**
Tipos de notificación:
- **success**: Verde, check circle
- **error**: Rojo, exclamation triangle
- **warning**: Amarillo, exclamation circle
- **info**: Azul, info circle

## 🎯 Sistema de Reputación

### **Cálculo de Puntos**
- Basado en completación de tareas
- Evidencias verificadas
- Calidad del trabajo

### **Niveles de Reputación**
- **Bronce**: 0-50 puntos
- **Plata**: 51-100 puntos
- **Oro**: 101-150 puntos
- **Diamante**: 151+ puntos

## 🔄 Flujos de Datos Principales

### **Creación de Tarea**
1. Usuario llena formulario en frontend
2. `handleCreateTask()` valida datos
3. POST a `/tareas` con datos
4. Backend inserta en tabla `tareas`
5. Si hay asignaciones, inserta en `tarea_asignaciones`
6. Frontend actualiza lista y contadores
7. Muestra notificación de éxito

### **Sistema de Invitaciones**
1. Creador invita miembro desde grupo
2. POST a `/invitaciones` con datos
3. Backend inserta en `invitaciones_grupo`
4. Invitado ve invitación en su página de grupos
5. Al aceptar, PUT a `/invitaciones/<id>`
6. Backend actualiza estado y crea `grupo_miembros`
7. Frontend actualiza listas

### **Gestión de Áreas**
1. Usuario crea área personal
2. POST a `/areas` con nombre, color, icono
3. Backend inserta en `areas`
4. Frontend actualiza lista y contadores
5. Área disponible para tareas personales y de grupo

## 🔧 Configuración y Despliegue

### **Variables de Entorno**
```env
# Base de datos local (para desarrollo)
# IMPORTANTE: NO SUBIR CREDENCIALES REALES
MYSQL_HOST=localhost
MYSQL_USER=root
MYSQL_PASSWORD=YOUR_PASSWORD_HERE
MYSQL_DATABASE=astren
MYSQL_PORT=3306
```

### **Dependencias Python**
```
Flask==2.3.3
Flask-CORS==4.0.0
python-dotenv==1.0.0
Werkzeug==2.3.7
requests==2.31.0
bcrypt==4.1.2
mysql-connector-python==8.2.0
```

### **Scripts de Inicio**
- `start_astren.bat`: Inicia backend y frontend en Windows
- `scripts/start_servers.ps1`: Script PowerShell alternativo

## 🎨 Características de UX/UI

### **Diseño Responsivo**
- Mobile-first approach
- Breakpoints: 768px, 1024px, 1440px
- Flexbox y Grid para layouts

### **Paleta de Colores Pastel**
- Colores suaves y profesionales
- Consistencia en toda la aplicación
- Intensificación para iconos pequeños

### **Interacciones Suaves**
- Transiciones CSS de 0.3s
- Scroll suave en navegación
- Efectos hover en elementos interactivos

### **Estados de Carga**
- Skeleton loaders
- Spinners en botones
- Mensajes de "cargando..."

## 🔍 Debugging y Logging

### **Console Logging**
```javascript
// Sistema de logging centralizado
const Logger = {
    debug(message, data) { /* ... */ },
    info(message, data) { /* ... */ },
    warn(message, data) { /* ... */ },
    error(message, data) { /* ... */ }
};
```

### **Backend Logging**
```python
import logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)
```

## 📊 Estadísticas y Métricas

### **Contadores Dinámicos**
- Actualización en tiempo real
- Animaciones de conteo
- Cálculos automáticos

### **Filtros Avanzados**
- Por estado, prioridad, área, grupo
- Búsqueda en tiempo real
- Combinación de filtros

## 🔐 Seguridad

### **Validación Frontend**
- Validación de formularios en tiempo real
- Sanitización de HTML
- Escape de caracteres especiales

### **Validación Backend**
- Verificación de sesión en cada endpoint
- Validación de datos de entrada
- Prevención de SQL injection

## 🚀 **OPTIMIZACIONES IMPLEMENTADAS**

### **1. Resolución del Problema N+1**
**Problema**: Frontend hacía múltiples requests para obtener datos relacionados.
**Solución**: Endpoints optimizados con JOINs SQL.

**Endpoints Optimizados:**
- `GET /areas/<usuario_id>/con-tareas` - Áreas con estadísticas de tareas
- `GET /grupos/<usuario_id>/con-estadisticas` - Grupos con estadísticas completas

### **2. Corrección de Nombres de Tablas**
**Problema**: SQL queries usaban nombres incorrectos de tablas.
**Solución**: Corregido `grupo_miembros` → `miembros_grupo`

### **3. Configuración de Producción**
**Problema**: Modo debug activado en producción.
**Solución**: Desactivado debug mode y agregado logging profesional.

### **4. Gestión de Variables de Entorno**
**Problema**: Variables de entorno no configuradas correctamente.
**Solución**: Configuración completa para Aiven MySQL.

## 📋 **PROBLEMAS RESUELTOS**

### **1. Error de Conexión a Base de Datos**
- **Problema**: `ModuleNotFoundError: No module named 'mysql'`
- **Solución**: Agregado `mysql-connector-python==8.2.0` a requirements.txt

### **2. Error de Variables de Entorno**
- **Problema**: Variables no configuradas en Render
- **Solución**: Configuración completa con Aiven MySQL

### **3. Error de Usuario Demo**
- **Problema**: Usuario demo no existía en base de datos
- **Solución**: Creación manual de usuario con credenciales correctas

### **4. Error de CORS**
- **Problema**: Frontend no podía conectar con backend
- **Solución**: Configuración correcta de CORS en Flask

## 🎯 **DIAGNÓSTICO HONESTO DEL SISTEMA**

### **✅ MÓDULOS COMPLETAMENTE FUNCIONALES:**

#### **1. Sistema de Autenticación** ✅
- **Estado**: 100% funcional
- **Funcionalidades**: Login, registro, sesiones, logout
- **Archivos**: `login.html`, `login.js`, `register.html`, `register.js`
- **Backend**: Endpoints `/login`, `/usuarios`
- **Seguridad**: bcrypt para hashing, validación completa

#### **2. Gestión de Tareas** ✅
- **Estado**: 100% funcional
- **Funcionalidades**: CRUD completo, asignaciones, filtros, búsqueda
- **Archivos**: `tasks.html`, `tasks.js`
- **Backend**: Endpoints `/tareas`, `/tarea_asignaciones`
- **Características**: Estados, prioridades, fechas límite, evidencias

#### **3. Gestión de Grupos** ✅
- **Estado**: 100% funcional
- **Funcionalidades**: CRUD, invitaciones, roles, miembros
- **Archivos**: `groups.html`, `groups.js`
- **Backend**: Endpoints `/grupos`, `/invitaciones`, `/miembros_grupo`
- **Características**: Sistema de invitaciones, roles (líder, admin, miembro)

#### **4. Gestión de Áreas** ✅
- **Estado**: 100% funcional
- **Funcionalidades**: CRUD, colores, iconos, organización
- **Archivos**: `areas.html`, `areas.js`
- **Backend**: Endpoints `/areas`
- **Características**: Personalización completa, estados

#### **5. Dashboard Principal** ✅
- **Estado**: 100% funcional
- **Funcionalidades**: Estadísticas, navegación, contadores
- **Archivos**: `dashboard.html`, `dashboard.js`
- **Características**: Navegación por contadores, estadísticas en tiempo real

#### **6. Sistema de Notificaciones** ✅
- **Estado**: 100% funcional
- **Funcionalidades**: Crear, leer, marcar como leída
- **Archivos**: `notifications.html`, `notifications.js`
- **Backend**: Endpoints `/notificaciones`
- **Características**: Notificaciones en tiempo real

### **⚠️ MÓDULOS EN DESARROLLO:**

#### **1. Sistema de Reputación** 🔄
- **Estado**: Frontend 90% completo, Backend 0%
- **Funcionalidades**: Estructura HTML/CSS/JS completa (planificado)
- **Archivos**: `reputation.html`, `reputation.js`, `reputation.css`
- **Backend**: Endpoints no implementados
- **Características**: Diseño completo, lógica frontend lista (planificado)
- **Próximos pasos**: Implementar endpoints backend, algoritmos de cálculo

#### **2. Perfil de Usuario** 🔄
- **Estado**: Frontend 70% completo, Backend 50%
- **Funcionalidades**: Vista básica, edición limitada
- **Archivos**: `profile.html`, `profile.js`, `profile.css`
- **Backend**: Endpoints básicos implementados
- **Características**: Información básica, avatar, bio
- **Próximos pasos**: Completar funcionalidades de edición

#### **3. Configuraciones** 🔄
- **Estado**: Frontend 60% completo, Backend 30%
- **Funcionalidades**: Estructura básica
- **Archivos**: `settings.html`, `settings.js`, `settings.css`
- **Backend**: Endpoints limitados
- **Características**: Configuración de notificaciones, tema
- **Próximos pasos**: Implementar funcionalidades completas

### **❌ MÓDULOS NO IMPLEMENTADOS:**

#### **1. Sistema de Evidencias Avanzado**
- **Estado**: 0% implementado
- **Funcionalidades**: Subida de archivos, capturas de pantalla
- **Archivos**: Estructura básica en `tasks.js`
- **Backend**: Endpoints básicos para notas
- **Características**: Sistema de archivos, validación de tipos

#### **2. Reportes y Analytics**
- **Estado**: 0% implementado
- **Funcionalidades**: Reportes de productividad, gráficos
- **Archivos**: No implementado
- **Backend**: No implementado
- **Características**: Dashboard avanzado, métricas detalladas

## 🚀 **INFORMACIÓN DE DESPLIEGUE**

### **URLs de Producción:**
- **Frontend**: https://astren.vercel.app/
- **Backend**: https://astren-backend.onrender.com
- **Base de Datos**: Aiven MySQL

### **Credenciales de Acceso:**
> ⚠️ **Demo Solo - No usar en Producción**
> Usar credenciales propias. Contacta al administrador para acceso real.

### **Estado del Sistema:**
- ✅ **Completamente Desplegado**
- ✅ **Funcionando en Producción**
- ✅ **Listo para Pruebas de Equipo**
- ✅ **Optimizado para Rendimiento**

### **Versión Actual:**
- **Versión**: 0.0.6 (Demo)
- **Fecha de Despliegue**: Agosto 2025
- **Estado**: Sistema Operativo - Demo - Sin sistema de reputación implementado

---

**Documentación actualizada el 27 de Agosto de 2025**
**Sistema completamente funcional y desplegado en producción** 