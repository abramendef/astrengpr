# Nuevas Páginas - Áreas y Grupos

## 📋 Descripción

Se han creado dos nuevas páginas para el sistema Astren:

1. **Página de Áreas** (`areas.html`) - Gestión de áreas de trabajo personales
2. **Página de Grupos** (`groups.html`) - Gestión de grupos colaborativos

## 🎨 Características Implementadas

### Página de Áreas (`areas.html`)

#### Funcionalidades:
- ✅ Visualización de áreas en formato de tarjetas
- ✅ Estadísticas generales (total, activas, tareas, reputación promedio)
- ✅ Filtros por tipo y estado
- ✅ Búsqueda de áreas
- ✅ Creación de nuevas áreas con modal
- ✅ Acciones por área (editar, archivar)
- ✅ Sistema de reputación con estrellas
- ✅ Barras de progreso por área
- ✅ Diseño responsive

#### Tipos de Áreas:
- **Personal** - Tareas personales y desarrollo individual
- **Trabajo** - Proyectos y tareas laborales
- **Escuela** - Tareas académicas y proyectos escolares
- **Grupo** - Colaboración en proyectos grupales

#### Archivos relacionados:
- `areas.html` - Página principal
- `css/areas.css` - Estilos específicos
- `js/areas.js` - Funcionalidad JavaScript

### Página de Grupos (`groups.html`)

#### Funcionalidades:
- ✅ Visualización de grupos en formato de tarjetas
- ✅ Estadísticas generales (total, activos, miembros, tareas grupales)
- ✅ Filtros por rol y estado
- ✅ Búsqueda de grupos
- ✅ Creación de nuevos grupos con modal
- ✅ Acciones por grupo (ver, editar, configuración)
- ✅ Sistema de roles (Propietario, Administrador, Miembro)
- ✅ Indicadores de estado (Activo, Archivado)
- ✅ Barras de progreso por grupo
- ✅ Diseño responsive

#### Tipos de Grupos:
- **Desarrollo** - Equipos de desarrollo web y móvil
- **Marketing** - Estrategias de marketing digital
- **Diseño** - Diseño de interfaces y branding
- **Proyecto** - Proyectos específicos
- **General** - Grupos de propósito general

#### Archivos relacionados:
- `groups.html` - Página principal
- `css/groups.css` - Estilos específicos
- `js/groups.js` - Funcionalidad JavaScript

## 🔧 Características Técnicas

### Sistema de Navegación
- ✅ Integración completa con el sidebar existente
- ✅ Navegación entre todas las páginas del dashboard
- ✅ Indicadores de página activa
- ✅ Funcionalidad móvil responsive

### Sistema de Notificaciones
- ✅ Notificaciones toast para acciones del usuario
- ✅ Diferentes tipos: success, error, warning, info
- ✅ Auto-cierre después de 5 segundos
- ✅ Posibilidad de cerrar manualmente

### Almacenamiento Local
- ✅ Persistencia de datos en localStorage
- ✅ Datos de ejemplo precargados
- ✅ Sincronización automática de estadísticas

### Diseño Responsive
- ✅ Adaptación a diferentes tamaños de pantalla
- ✅ Grid responsive para tarjetas
- ✅ Menú móvil funcional
- ✅ Optimización para tablets y móviles

## 🎯 Funcionalidades Destacadas

### Gestión de Áreas
- **Creación rápida**: Modal intuitivo para crear nuevas áreas
- **Personalización**: Selección de colores y tipos
- **Seguimiento**: Estadísticas detalladas por área
- **Organización**: Filtros y búsqueda avanzada

### Gestión de Grupos
- **Colaboración**: Sistema de roles y permisos
- **Visualización**: Avatares y estados claros
- **Productividad**: Seguimiento de tareas grupales
- **Flexibilidad**: Diferentes tipos de grupos

## 🚀 Cómo Usar

### Navegación
1. Accede a cualquier página del dashboard
2. Usa el sidebar para navegar entre páginas
3. Las páginas de Áreas y Grupos están disponibles en el menú principal

### Crear Nueva Área
1. Ve a la página "Mis Áreas"
2. Haz clic en "Nueva Área"
3. Completa el formulario
4. Selecciona tipo, color y descripción
5. Haz clic en "Crear Área"

### Crear Nuevo Grupo
1. Ve a la página "Grupos"
2. Haz clic en "Nuevo Grupo"
3. Completa el formulario
4. Selecciona tipo, privacidad y color
5. Haz clic en "Crear Grupo"

### Filtros y Búsqueda
- Usa los filtros desplegables para filtrar por tipo/rol y estado
- Usa la barra de búsqueda para encontrar elementos específicos
- Los filtros se aplican en tiempo real

## 📱 Compatibilidad

### Navegadores Soportados
- ✅ Chrome (recomendado)
- ✅ Firefox
- ✅ Safari
- ✅ Edge

### Dispositivos
- ✅ Desktop (1024px+)
- ✅ Tablet (768px - 1023px)
- ✅ Móvil (320px - 767px)

## 🔗 Integración

### Con Páginas Existentes
- ✅ Sidebar unificado
- ✅ Estilos consistentes
- ✅ Sistema de notificaciones compartido
- ✅ Navegación fluida

### Con Sistema de Tareas
- ✅ Referencias a tareas en estadísticas
- ✅ Integración futura con asignación de tareas
- ✅ Preparado para funcionalidades avanzadas

## 🎨 Paleta de Colores

### Áreas
- **Personal**: Verde (#10B981)
- **Trabajo**: Azul (#3366FF)
- **Escuela**: Púrpura (#8B5CF6)
- **Grupo**: Rojo (#EF4444)

### Grupos
- **Desarrollo**: Azul (#3366FF)
- **Marketing**: Naranja (#F59E0B)
- **Diseño**: Púrpura (#8B5CF6)
- **Proyecto**: Rojo (#EF4444)

## 🔮 Próximas Funcionalidades

### Planificadas
- [ ] Edición de áreas y grupos
- [ ] Integración completa con sistema de tareas
- [ ] Invitaciones a grupos
- [ ] Chat grupal
- [ ] Reportes y analytics
- [ ] Exportación de datos

### Mejoras Técnicas
- [ ] Backend API integration
- [ ] Base de datos persistente
- [ ] Autenticación de usuarios
- [ ] Sincronización en tiempo real

## 📝 Notas de Desarrollo

### Estructura de Archivos
```
frontend/
├── areas.html          # Página de áreas
├── groups.html         # Página de grupos
├── css/
│   ├── areas.css       # Estilos de áreas
│   └── groups.css      # Estilos de grupos
└── js/
    ├── areas.js        # Lógica de áreas
    └── groups.js       # Lógica de grupos
```

### Dependencias
- Font Awesome 6.4.0 (iconos)
- Google Fonts - Poppins (tipografía)
- CSS Variables (sistema de diseño)
- LocalStorage (persistencia de datos)

### Performance
- ✅ Carga lazy de componentes
- ✅ Optimización de CSS
- ✅ JavaScript modular
- ✅ Responsive images

---

**Desarrollado con ❤️ para Astren - Sistema de Gestión de Productividad** 