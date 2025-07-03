# 📋 Página de Grupos - Astren

## 🎯 Estado Actual
✅ **FUNCIONANDO CORRECTAMENTE**

La página de grupos está completamente funcional y lista para usar.

## 🚀 Cómo Acceder

1. **Servidor Local:**
   ```bash
   cd frontend
   python3 -m http.server 8001
   ```

2. **Abrir en el navegador:**
   - Página principal: `http://localhost:8001/groups.html`
   - Página de pruebas: `http://localhost:8001/test-groups.html`

## ✨ Funcionalidades Disponibles

### 🔧 Gestión de Grupos
- ✅ **Crear grupos** con formulario completo
- ✅ **Editar grupos** existentes
- ✅ **Eliminar grupos** con confirmación
- ✅ **Archivar/Activar** grupos
- ✅ **Ver miembros** de cada grupo

### 🔍 Filtros y Búsqueda
- ✅ **Filtro por rol** (Propietario, Administrador, Miembro)
- ✅ **Filtro por estado** (Activos, Archivados)
- ✅ **Búsqueda en tiempo real** por nombre y descripción
- ✅ **Cambio de vista** (Cuadrícula/Lista)

### 📊 Estadísticas Dinámicas
- ✅ **Total de grupos**
- ✅ **Grupos activos**
- ✅ **Total de miembros**
- ✅ **Tareas grupales**

### 💾 Persistencia de Datos
- ✅ **LocalStorage** para guardar datos
- ✅ **Datos de ejemplo** precargados
- ✅ **Sincronización automática**

## 🎨 Características de Diseño

### 📱 Responsive Design
- ✅ Adaptable a dispositivos móviles
- ✅ Sidebar responsive
- ✅ Modales optimizados
- ✅ Grid adaptativo

### 🌙 Modo Oscuro
- ✅ Soporte para preferencias del sistema
- ✅ Variables CSS personalizadas
- ✅ Transiciones suaves

### ♿ Accesibilidad
- ✅ Navegación por teclado
- ✅ Atributos ARIA
- ✅ Lectores de pantalla
- ✅ Contraste de colores

## 🧪 Testing

### Página de Pruebas
Visita `http://localhost:8001/test-groups.html` para:

- 🔍 Probar LocalStorage
- 🆕 Crear grupos de prueba
- 🔧 Testear filtros
- 🗑️ Limpiar datos
- 📊 Ver estadísticas en tiempo real

### Datos de Ejemplo
El sistema incluye grupos de ejemplo:

1. **Equipo Desarrollo** (8 miembros, 67% progreso)
2. **Equipo Marketing** (6 miembros, 73% progreso)
3. **Equipo Diseño** (5 miembros, 78% progreso)
4. **Proyecto Alpha** (4 miembros, 71% progreso)

## 🔧 Estructura de Archivos

```
frontend/
├── groups.html          # Página principal de grupos
├── test-groups.html     # Página de pruebas
├── css/
│   └── groups.css       # Estilos específicos
├── js/
│   ├── groups.js        # Lógica principal
│   └── sidebar-new.js   # Sidebar unificado
└── images/
    └── Astren_logo_hor.svg
```

## 📝 Uso Básico

### Crear un Grupo
1. Clic en "Nuevo Grupo"
2. Llenar el formulario:
   - Nombre (requerido)
   - Descripción (opcional)
   - Tipo (Desarrollo, Marketing, etc.)
   - Privacidad (Público, Privado, Secreto)
   - Color del grupo
3. Clic en "Crear Grupo"

### Gestionar Miembros
1. Clic en el icono de usuarios en un grupo
2. Ver lista de miembros actuales
3. Usar "Invitar Miembros" (función en desarrollo)

### Filtrar Grupos
- Usar selects de "Rol" y "Estado"
- Escribir en la barra de búsqueda
- Los resultados se actualizan automáticamente

## 🐛 Resolución de Problemas

### Servidor No Inicia
```bash
# Verificar puerto
lsof -i :8001

# Cambiar puerto si es necesario
python3 -m http.server 8002
```

### Grupos No Se Guardan
1. Verificar que JavaScript esté habilitado
2. Abrir consola del navegador (F12)
3. Buscar errores en la consola
4. Verificar LocalStorage en DevTools

### Estilos No Se Cargan
1. Verificar ruta de archivos CSS
2. Limpiar caché del navegador
3. Verificar permisos de archivos

## 🔮 Funcionalidades Futuras

### En Desarrollo
- 📧 Sistema de invitaciones por email
- 🔔 Notificaciones en tiempo real
- 📈 Gráficos de progreso avanzados
- 🔒 Autenticación de usuarios
- 🌐 Sincronización con backend

### Mejoras Planeadas
- 🎯 Tareas grupales integradas
- 📊 Dashboard de métricas
- 💬 Chat grupal
- 📁 Gestión de archivos
- 🏆 Sistema de logros

## 📞 Soporte

Si encuentras algún problema:

1. **Revisar la consola del navegador** (F12)
2. **Verificar la página de pruebas** (`test-groups.html`)
3. **Limpiar datos** si es necesario
4. **Reiniciar el servidor** local

---

**Última actualización:** 03/07/2025
**Versión:** 1.0.0
**Estado:** ✅ Completamente funcional