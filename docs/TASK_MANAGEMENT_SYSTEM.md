# Sistema de Gestión de Tareas - Astren

## Resumen del Sistema

El sistema de gestión de tareas de Astren ha sido completamente rediseñado para implementar las cuatro categorías de tareas especificadas, con un enfoque en la gestión de evidencia, impacto en reputación y estados de progreso claros. **El sistema de prioridades ha sido eliminado** para simplificar la interfaz y enfocarse en los estados de las tareas.

## Las Cuatro Categorías de Tareas

### 1. Tareas Hoy
**Definición:** Tareas que vencen hoy y están pendientes.

**Características:**
- Vencen en la fecha actual
- Están en estado pendiente
- Se muestran en la sección "Tareas Hoy"
- Requieren atención inmediata

**Criterio:**
- `status = 'pending'` Y `dueDate = hoy`

### 2. Tareas Pendientes
**Definición:** Tareas que todavía no han sido marcadas como completadas y están dentro del plazo.

**Características:**
- Fecha de vencimiento futura
- Aún no se ha entregado evidencia (si aplica)
- Estado: `pending`
- Se pueden iniciar con el botón "Comenzar tarea"

### 3. Tareas Completadas
**Definición:** Tareas que el usuario marcó como hechas y, si requerían evidencia, ya fue validada.

**Características:**
- Se registra la fecha de finalización
- Pueden influir positivamente en la reputación
- Estado: `completed`
- Requieren evidencia para tareas de trabajo/escuela
- Muestran impacto en reputación

### 4. Tareas Vencidas
**Definición:** Tareas que no fueron completadas a tiempo.

**Características:**
- Fecha límite pasada sin haber sido marcadas como completadas
- Afectan negativamente la reputación
- Estado: `overdue`
- Pueden seguir visibles para referencia, pero ya no se pueden "completar" normalmente
- Checkbox deshabilitado

## Nuevas Funcionalidades

### Sistema de Estados
```javascript
const TASK_STATUS = {
    PENDING: 'pending',      // No iniciadas
    IN_PROGRESS: 'in_progress', // En progreso
    COMPLETED: 'completed',   // Completadas con evidencia
    OVERDUE: 'overdue'       // Vencidas
};
```

### Gestión de Evidencia
- **Evidencia requerida:** Tareas de trabajo y escuela
- **Tipos de archivo:** Imágenes, PDF, documentos
- **Validación:** Pendiente de validación por supervisor/profesor
- **Indicadores visuales:** Estado de evidencia en cada tarea

### Sistema de Reputación
- **Completación temprana:** +2 puntos por día (máximo +20)
- **Completación a tiempo:** +10 puntos
- **Completación tardía:** -2 puntos por día (mínimo -20)
- **Tareas vencidas:** -15 puntos automáticos

### Filtros Mejorados
- **Tareas Hoy:** Muestra tareas pendientes que vencen hoy
- **Tareas Pendientes:** Solo tareas no iniciadas
- **Tareas Completadas:** Tareas finalizadas
- **Tareas Vencidas:** Tareas fuera de plazo

## Interfaz de Usuario

### Estadísticas
- **Total:** Todas las tareas
- **Pendientes:** Tareas no iniciadas
- **En Progreso:** Tareas iniciadas
- **Completadas:** Tareas finalizadas
- **Vencidas:** Tareas fuera de plazo

### Secciones de Tareas
1. **Tareas Hoy:** Muestra tareas pendientes que vencen hoy
2. **Tareas Pendientes:** Solo tareas no iniciadas
3. **Tareas Completadas:** Tareas finalizadas
4. **Tareas Vencidas:** Tareas fuera de plazo

### Indicadores Visuales
- **Estados por color:** 
  - Amarillo para "Pendientes"
  - Verde para "Completadas"
  - Rojo para "Vencidas"
- **Evidencia:** Indicadores de estado de validación
- **Reputación:** Puntos ganados/perdidos

## Flujo de Trabajo

### 1. Crear Tarea
1. Usuario crea nueva tarea
2. Se asigna estado `pending`
3. Se establece fecha límite
4. Se define área (sin prioridad)

### 2. Iniciar Tarea
1. Usuario hace clic en "Comenzar tarea"
2. Estado cambia a `in_progress`
3. Se registra `startedAt`
4. Aparece botón para subir evidencia

### 3. Subir Evidencia (si aplica)
1. Usuario sube archivo de evidencia
2. Se marca como `evidenceValidated: false`
3. Pendiente de validación por supervisor

### 4. Completar Tarea
1. Si requiere evidencia, debe estar subida
2. Estado cambia a `completed`
3. Se calcula impacto en reputación
4. Se registra `completedAt`

### 5. Tareas Vencidas
1. Sistema verifica automáticamente fechas
2. Tareas fuera de plazo cambian a `overdue`
3. Se aplica penalización de reputación
4. No se pueden completar normalmente

## Código de Ejemplo

### Estructura de Tarea
```javascript
{
    id: 1,
    title: "Presentación proyecto final",
    description: "Preparar y entregar la presentación...",
    area: "school",
    dueDate: "2024-01-15T23:59:59.000Z",
    status: "pending",
    createdAt: "2024-01-10T10:00:00.000Z",
    completedAt: null,
    evidence: null,
    evidenceValidated: false,
    startedAt: null,
    reputationImpact: 0
}
```

### Funciones Principales
```javascript
// Iniciar tarea
startTask(taskId)

// Subir evidencia
uploadEvidence(taskId)

// Completar tarea
toggleTaskCompletion(taskId, true)

// Filtrar por estado
filterTasks()
```

## Beneficios del Sistema

1. **Claridad:** Estados bien definidos y visualmente diferenciados
2. **Responsabilidad:** Sistema de evidencia para tareas importantes
3. **Motivación:** Sistema de reputación que recompensa el buen trabajo
4. **Organización:** Filtros que permiten ver exactamente lo que necesitas
5. **Seguimiento:** Historial completo de progreso de cada tarea
6. **Simplicidad:** Sin sistema de prioridades que pueda confundir

## Cambios Recientes

### ✅ Eliminación del Sistema de Prioridades
- **Razón:** Simplificar la interfaz y enfocarse en estados
- **Beneficios:** Menos complejidad, más claridad en el progreso
- **Impacto:** Las tareas ahora se organizan únicamente por estado y área

## Próximas Mejoras

- [ ] Validación de evidencia por supervisores
- [ ] Notificaciones automáticas de vencimiento
- [ ] Reportes de productividad
- [ ] Integración con calendario
- [ ] Exportación de datos
- [ ] Métricas de rendimiento por área 