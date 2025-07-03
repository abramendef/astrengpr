# Sistema de reputación (diseño)

Este documento describe el diseño del sistema de reputación. La idea es dar una señal simple (estrellas) que refleje consistencia y calidad de entrega, dando más peso a la actividad reciente.

Estado: planificado. No está implementado de extremo a extremo en este repositorio.

## Objetivos

- Resumir el rendimiento de una persona en una escala comprensible
- Priorizar el comportamiento reciente sin borrar el historial
- Evitar incentivos obvios a la manipulación (por ejemplo, “tareas triviales”)
- Mantener el cálculo lo bastante simple como para explicarlo y auditarlo

## Modelo de cálculo (propuesta)

La reputación se calcula como un promedio ponderado con decaimiento temporal.

$$\text{Rep} = \frac{\sum_{i=1}^{n} (s_i \cdot w_i)}{\sum_{i=1}^{n} w_i}$$

Donde:

- $s_i$ son las estrellas de una tarea (0 a 5)
- $w_i$ es el peso temporal de esa tarea, por ejemplo con decaimiento exponencial según los días transcurridos

La ventana temporal (por ejemplo 180 días) y el factor de decaimiento deberían ser configurables.

En el diseño actual se usa un decaimiento exponencial con factor base 0.9 y un cálculo que privilegia las tareas más recientes.

## Cómo asignar estrellas a una tarea

Una propuesta razonable para el MVP es separar el score en componentes:

- Puntualidad: penaliza entregas tarde y premia entregas a tiempo
- Calidad mínima de la entrega: evidencia adjunta, descripción completa, criterios de aceptación
- Colaboración (si aplica): tareas grupales con asignación real

La regla importante es que el resultado final quede acotado en 0–5.

## Reputación por contexto

Además de la reputación global, el sistema podría calcular reputación por:

- Área (trabajo, escuela, personal)
- Grupo

El cálculo sería el mismo, solo cambiando el conjunto de tareas incluidas.

## Datos necesarios (referencia)

Para implementarlo en backend se necesita, como mínimo:

- Identificador de tarea, usuario y fecha de completado
- Estrellas calculadas (o componentes para recalcular)
- Metadatos para auditoría: vencimiento, evidencia, asignaciones

## Pendientes de implementación

- Persistencia (tablas/migraciones)
- Endpoint para consultar reputación global y por contexto
- Job o proceso de recálculo (batch/incremental)
- Integración con el flujo de completar tareas

## Esquema de datos (referencia)

Nota: por seguridad y para evitar que se copie/ejecute por accidente, este documento no incluye SQL ejecutable.
El esquema se describe a nivel conceptual.

Entidades (propuesta):

- `tareas`
  - Campos relevantes: `usuario_id`, `area_id` (opcional), `grupo_id` (opcional), `asignado_a_id` (opcional),
    `titulo`, `descripcion`, `estado`, `estrellas` (0 a 5), `fecha_completada` (inmutable), `fecha_reapertura`,
    `fecha_creacion`, `fecha_vencimiento`.

- `reputacion_general`
  - 1 fila por usuario con la reputación agregada y la última actualización.

- `historial_reputacion`
  - Historial de eventos de reputación por tarea: estrellas ganadas, criterios (tiempo/descripcion/grupo/evidencia),
    motivo en formato JSON (auditoría), timestamp y tipo de evento (completada/reapertura/ajuste).

- `evidencias_tarea`
  - Evidencias asociadas a tareas (URL/archivo) con estado de validación (pendiente/aprobada/rechazada).

- `rate_limit_reputacion`
  - Ventanas por usuario para limitar eventos de calificación por minuto (anti-spam).

### Frontend - Integración pendiente
```javascript
// PENDIENTE: Conectar con backend real
class ReputationManager {
    async loadReputation() {
        // TODO: Reemplazar datos hardcoded con API real
        const response = await fetch(`/reputacion/${this.userId}`);
        this.reputation = await response.json();
    }
    
    async updateReputation(stars, reason) {
        // TODO: Implementar actualización real
        const response = await fetch(`/reputacion/${this.userId}/actualizar`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ stars, reason })
        });
    }
}
```

### **Frontend v0 (integración mínima)**
```text
- Reemplazar datos hardcoded en reputación por GET /reputacion/:id.
- Mostrar banner "Feature en beta" en la página de reputación.
- Tras completar tarea (PUT /tareas/:id/estado → completada):
  • Mostrar toast con breakdown.
    • Actualizar chip de la tarjeta de tarea con estrellas y tooltip.
  • Refrescar widgets (línea 30d y barras por área) sin recargar.
```

### **Pruebas v0**
```text
Unit (backend):
- calcular_estrellas_por_tiempo: en plazo; +59min; +60min; sin fecha (3 estrellas base).

E2E:
- Completar tarea → respuesta con estrellas → reputación general sube → historial contiene evento con criterios.

Carga:
- Script para completar 100 tareas (usuario sintético) y medir p95 < 150ms en PUT.
```

### **Reputación por Área (opcional recomendada)**

Entidad recomendada: `reputacion_area`

- Clave natural: (`usuario_id`, `area_id`)
- Campos: `estrellas` (0 a 5, con decimales), `fecha_ultima_actualizacion`

### **Índices Críticos**

Índices recomendados (a nivel de diseño):

- `tareas`: por (`usuario_id`, `estado`, `fecha_creacion`) para listados principales.
- `tareas`: por (`usuario_id`, `estado`, `fecha_completada`) para reputación/recientes.
- `tareas`: por (`area_id`, `estado`, `fecha_completada`) para reputación por área.
- `historial_reputacion`: por (`usuario_id`, `fecha_cambio`) para timeline/auditoría.

Restricciones de unicidad (diseño):

- `reputacion_general`: 1 fila por `usuario_id`.
- `reputacion_area`: 1 fila por (`usuario_id`, `area_id`).

### **Flujo de Evidencias y Validación**
```text
1) Usuario adjunta evidencia (URL/archivo) → estado 'pendiente'
2) Líder/Profesor valida → cambia a 'aprobada' (o 'rechazada')
3) Al aprobar: aplicar bonus evidencia (+1) de forma idempotente
   - Registrar evento en historial (evento='ajuste') con criterio_evidencia
   - Recalcular reputación del usuario
4) Si se rechaza: no aplicar bonus
```

### **Rate Limit por Usuario (anti-spam)**
```python
MAX_TAREAS_CALIFICADAS_POR_MIN = 10  # configurable

def excede_rate_limit(usuario_id):
    # Ventana rodante por minuto
    ventana = now_trunc_minute()
    fila = obtener_o_crear_ventana(usuario_id, ventana)
    if fila.eventos >= MAX_TAREAS_CALIFICADAS_POR_MIN:
        return True
    incrementar_evento(usuario_id, ventana)
    return False
```

### **Rendimiento (Performance)**
```text
1) Cálculo en línea (estrella por tarea):
   - Evaluar y asignar estrellas en el request que marca la tarea como 'completada'.
   - Persistir en 'tareas.estrellas' y un registro en 'historial_reputacion'.

2) Reputación general incremental (opción A - mantenida):
   - Mantener 'reputacion_general.estrellas' y un 'peso_total' lógico en memoria o derivable.
   - Al entrar una nueva tarea con estrellas 's_nueva' y peso 'w_nuevo':
       new = (old * w_total + s_nueva * w_nuevo) / (w_total + w_nuevo)
     donde 'w_nuevo = decay^(días/30)'. Persistir el resultado final en 'reputacion_general'.

3) Reputación general simplificada (opción B - v0):
   - Recalcular usando solo las 100 tareas completadas más recientes: LIMIT 100.
   - Suficiente para la primera versión y estable bajo carga.

4) Evitar UPDATE masivo de vencidas en requests calientes:
   - No cambiar estado a 'vencida' en lote.
   - Determinar 'vencida' al vuelo en listados con CASE.
```

#### Determinar estado “vencida” al vuelo (sin UPDATE masivo)

Regla sugerida para listados:

- Si `estado` es `completada`, mantener `completada`.
- Si hay `fecha_vencimiento` y “ahora” > `fecha_vencimiento`, tratar como `vencida`.
- En caso contrario, usar el `estado` persistido.

### **Algoritmos de Cálculo**

#### **Cálculo de Estrellas por Tiempo (suavizado)**
```python
def calcular_estrellas_por_tiempo(fecha_vencimiento, fecha_completada):
    """Estrellas por puntualidad con castigo suave por demoras.
    atraso_horas = max(0, horas); estrellas = max(0, 5 - 1.2 * log2(1 + atraso_horas))
    """
    if not fecha_vencimiento or not fecha_completada:
        return 3  # Política v0 sin due date (nota: calificador v0 vuelve a 3 explícitamente)

    vencimiento = datetime.fromisoformat(fecha_vencimiento.replace('Z', '+00:00'))
    completada = datetime.fromisoformat(fecha_completada.replace('Z', '+00:00'))
    horas = (completada - vencimiento).total_seconds() / 3600.0
    atraso_horas = max(0.0, horas)
    try:
        from math import log2
        estrellas = 5.0 - 1.2 * log2(1.0 + atraso_horas)
    except Exception:
        estrellas = 5.0  # fallback improbable
    return max(0.0, min(5.0, estrellas))
```

#### **Calificador v0 (simple y explicable)**
```python
def calcular_estrellas_simple(tarea):
    # 1) Tiempo (0-5)
    estrellas_tiempo = calcular_estrellas_por_tiempo(tarea.fecha_vencimiento, tarea.fecha_completada)
    if tarea.fecha_vencimiento is None:
        estrellas_tiempo = 3  # Política v0 sin due date

    # 2) Descripción: mini-heurística saturada
    tokens = [p for p in (tarea.descripcion or '').split() if len(p) > 2 and p.isalpha()]
    tokens_unicos = len(set(tokens))
    bonus_descripcion = min(1.0, tokens_unicos / 20.0)

    # 3) Grupo: +0.5 si ≥2 asignados
    miembros_asignados = tarea.miembros_asignados or []
    bonus_grupo = 0.5 if len(miembros_asignados) >= 2 else 0.0

    # 4) Evidencia validada: +1 (si existe; en v0 se puede omitir si no hay sistema)
    bonus_evidencia = 1.0 if getattr(tarea, 'evidencia_validada', False) else 0.0

    total = estrellas_tiempo + bonus_descripcion + bonus_grupo + bonus_evidencia
    return max(0.0, min(5.0, total)), {
        'tiempo': float(estrellas_tiempo),
        'descripcion': float(bonus_descripcion),
        'grupo': float(bonus_grupo),
        'evidencia': float(bonus_evidencia),
    }
```

#### **Cálculo de Reputación General**
```python
def calcular_reputacion_general(usuario_id):
    """
    Calcula reputación general basada en estrellas de tareas completadas
    con decaimiento exponencial
    """
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Obtener tareas completadas recientes con estrellas (pseudocódigo)
    # tareas = fetch_recent_completed_tasks(usuario_id, limit=100, only_with_stars=True)
    tareas = cursor.fetchall()  # placeholder
    
    if not tareas:
        return 5.0  # Reputación inicial
    
    # Calcular promedio con decaimiento exponencial
    total_ponderado = 0
    peso_total = 0
    decay_factor = 0.9
    
    for i, (estrellas, fecha_creacion) in enumerate(tareas):
        peso = decay_factor ** i
        total_ponderado += estrellas * peso
        peso_total += peso
    
    reputacion = total_ponderado / peso_total if peso_total > 0 else 5.0
    # Clip para mantener semántica de estrellas [1.0, 5.0]
    reputacion = max(1.0, min(5.0, reputacion))
    
    # Persistir reputación general (pseudocódigo)
    # upsert_reputacion_general(usuario_id, reputacion)
    
    conn.commit()
    cursor.close()
    conn.close()
    
    return reputacion
```

---

## Plan de Implementación

### **Fase 1: Sistema Básico (1-2 semanas)**
1. **Implementar evaluación automática de tareas**
   - Modificar endpoint `/tareas/<id>/estado`
   - Implementar función `calcular_estrellas_simple()`
   - Agregar cálculo de estrellas al completar tarea

2. **Crear endpoints de reputación básicos**
   - `GET /reputacion/<usuario_id>` - Obtener reputación
   - `PUT /reputacion/<usuario_id>/actualizar` - Actualizar reputación
   - `GET /reputacion/<usuario_id>/historial` - Historial básico

3. **Implementar algoritmo de decaimiento exponencial**
   - Función `calcular_reputacion_general()`
   - Actualización automática de reputación
   - Integración con tablas existentes

4. **Conectar frontend con backend**
   - Reemplazar datos hardcoded con API real
   - Mostrar estrellas ganadas en tareas completadas
   - Actualizar dashboard con reputación real

### **Fase 2: Mejoras Incrementales (1 semana)**
1. **Optimizar algoritmos de cálculo**
   - Mejorar performance de consultas SQL
   - Implementar caché de reputación
   - Optimizar cálculo de decaimiento

2. **Mejorar interfaz de usuario**
   - Mostrar desglose de estrellas ganadas
   - Agregar animaciones de feedback
   - Implementar notificaciones de reputación

3. **Implementar analytics básicos**
   - Estadísticas de tendencia
   - Comparativas con otros usuarios
   - Reportes de productividad

### **Fase 3: Integración con IA (2-3 semanas)**
1. **Seleccionar proveedor de IA**
   - Evaluar OpenAI, Google AI, Azure AI
   - Implementar API de evaluación
   - Desarrollar prompts para análisis

2. **Implementar análisis inteligente**
   - Análisis de calidad de descripción
   - Evaluación de complejidad real
   - Detección de creatividad e innovación

3. **Desarrollar sistema híbrido**
   - Combinar evaluación simple + IA
   - Sistema de fallback si IA no disponible
   - Configuración por usuario/grupo

### **Fase 4: IA Avanzada (3-4 semanas)**
1. **Implementar aprendizaje automático**
   - Modelos personalizados por usuario
   - Análisis predictivo de productividad
   - Recomendaciones inteligentes

2. **Desarrollar funcionalidades empresariales**
   - Evaluación de equipos con IA
   - Reportes ejecutivos inteligentes
   - Análisis de patrones organizacionales

3. **Sistema de reputación global**
   - Rankings por industria/área
   - Comparativas entre empresas
   - Métricas de mercado

---

## Objetivos del sistema

### **Para Usuarios Individuales**
- **Motivación**: Sistema de progreso claro
- **Retroalimentación**: Feedback inmediato sobre productividad
- **Desarrollo**: Identificación de áreas de mejora
- **Reconocimiento**: Estrellas como símbolo de logro

### **Para Empresas**
- **Medición**: Métricas objetivas de productividad
- **Comparación**: Rankings internos y externos
- **Incentivos**: Sistema de recompensas basado en reputación
- **Análisis**: Insights sobre patrones de productividad

### **Para la Plataforma**
- **Escalabilidad**: Sistema que crece con la base de usuarios
- **Sostenibilidad**: Consolidación inteligente de datos
- **Flexibilidad**: Configuración para diferentes contextos
- **Innovación**: Base para futuras funcionalidades

---

## UX de reputación

### 1) Feedback inmediato al completar tarea
```text
Evento: PUT /tareas/:id/estado → estado=completada
UI: Mostrar toast/snackbar 3–4s con breakdown compacto.
Formato: "Ganaste {total} estrellas por esta tarea (tiempo: {tiempo}{, descripcion: +{descripcion}}{, grupo: +{grupo}}{, evidencia: +{evidencia}})"

Ejemplo: "Ganaste 3.5 estrellas por esta tarea (tiempo: 3, grupo: +0.5)"

Reglas:
- Redondeo visual a 0.1 para 'total' y criterios.
- Si un criterio es 0, se omite del texto.
- Accesible (role=alert) y cerrable.
```

### 2) Página “Mi reputación”
```text
Secciones:
- Gráfico lineal últimos 30 días (promedio ponderado diario)
  • Eje X: fechas (D-29 … hoy)
  • Eje Y: estrellas promedio (0–5)
  • Fuente: breakdown rolling-30d (agrupado por día)

- Barras por área (promedio por área)
  • Etiquetas: nombre de área
  • Valor: estrellas de reputacion_area
  • Orden: descendente

- Resumen
  • Reputación general actual (promedio ponderado)
  • Total de tareas evaluadas (últimos 30/90 días)
```

### 3) Listado de tareas: “chip” de estrellas ganadas
```text
Componente: Chip compacto al lado del título/estado
Contenido:
- Si estado = completada y tareas.estrellas no es NULL → mostrar {estrellas}
- Tooltip/Hover: breakdown corto (tiempo, descripcion, grupo, evidencia)

Estados:
- Pendiente/Vencida → no se muestra chip
- Completada sin evaluación (raro) → mostrar "—"

Accesibilidad:
- aria-label con el valor y criterios si hay hover deshabilitado
```

### 4) Integración de datos (frontend)
```javascript
// Respuesta de PUT /tareas/:id/estado (completada)
// { estado, estrellas, criterios: {tiempo, descripcion, grupo, evidencia}, reputacion: {general, por_area} }

// 1) Toast
showToast(`Ganaste ${round1(estrellas)} estrellas (tiempo: ${round1(criterios.tiempo)}${criterios.descripcion?`, descripcion: +${round1(criterios.descripcion)}`:''}${criterios.grupo?`, grupo: +${round1(criterios.grupo)}`:''}${criterios.evidencia?`, evidencia: +${round1(criterios.evidencia)}`:''})`);

// 2) Actualizar chip en la tarjeta de la tarea
updateTaskChip(tareaId, estrellas, criterios);

// 3) Refrescar widgets de “Mi reputación” en segundo plano
refreshReputationWidgets();
```

## Seguridad y privacidad

### 1) Explicabilidad (no señales “mágicas” en Fase Código)
```text
- Todos los criterios y bonuses deben ser visibles, auditables y explicables en UI.
- El breakdown devuelto por la API (tiempo, descripción, grupo, evidencia) es la única fuente para UI.
- No se usan señales ocultas ni heurísticas no documentadas hasta la Fase IA.
- En Fase IA, las explicaciones de modelo (rationale) se exponen opcionalmente y se etiquetan como asistidas por IA.
```

### 2) Comparativas y ranking (opt-in y anonimización)
```text
- Si se muestran comparativas o rankings:
  • Opt-in por usuario (desactivado por defecto) y por organización.
  • Anonimización por defecto: mostrar percentiles/medianas sin identificar usuarios.
  • En modo identificado: mostrar solo a usuarios que dieron consentimiento y con controles de visibilidad.
  • Evitar presión social indeseada: límites de frecuencia y copy cuidadoso.
```

### 3) Privacidad de datos y acceso
```text
- Evidencias: URL/archivos se consideran datos sensibles; solo visibles a dueño, validador y admins.
- Historial de reputación: accesible solo al usuario dueño y a roles autorizados.
- Logs y motivo_json: no exponen contenido sensible en clientes; se filtran campos confidenciales.
- Retención: políticas de borrado/retención configurables por organización (p.ej. 12-24 meses).
```

## Diagnóstico técnico

### **Problemas Identificados**
1. **Sin Backend**: No hay endpoints implementados
2. **Datos Hardcoded**: Frontend usa datos estáticos
3. **Sin Integración**: No conectado con sistema de tareas
4. **Sin Persistencia**: Cambios no se guardan
5. **Sin Validación**: No hay validación de datos

### **Soluciones Propuestas**
1. **Implementar endpoints** en `app.py`
2. **Crear lógica de cálculo** en módulo separado
3. **Integrar con tareas** para actualización automática
4. **Implementar base de datos** para persistencia
5. **Agregar validaciones** robustas

---

## Métricas de éxito

### **Técnicas**
- **Performance**: Cálculo de reputación < 100ms; p95 latencia PUT /tareas/:id/estado < 150ms
- **Escalabilidad**: Soporte para 10,000+ usuarios
- **Precisión**: Cálculos con precisión de 2 decimales
- **Disponibilidad**: 99.9% uptime
- **Calidad**: < 1 error por 1,000 requests en endpoints de reputación

### **De Usuario**
- **Adopción**: 80% de usuarios activos usan reputación
- **Engagement**: 70% revisan reputación semanalmente
- **Satisfacción**: 4.5+ estrellas en feedback
- **Retención**: 90% de usuarios regresan mensualmente

### **De Negocio**
- **Crecimiento**: 20% aumento en usuarios mensual
- **Monetización**: 15% conversión a plan premium
- **Expansión**: 5 nuevos mercados en 12 meses
- **Sostenibilidad**: ROI positivo en 6 meses

---

## Próximos pasos críticos

### **Inmediato (Esta Semana)**
1. **Implementar endpoints básicos** de reputación
2. **Conectar con sistema de tareas** existente
3. **Crear lógica de cálculo** inicial
4. **Testear con datos reales**

### **Corto Plazo (1-2 Meses)**
1. **Completar funcionalidades** avanzadas
2. **Implementar rankings** y comparaciones
3. **Agregar configuraciones** empresariales
4. **Optimizar performance** y escalabilidad

### **Mediano Plazo (3-6 Meses)**
1. **Lanzar beta** con usuarios selectos
2. **Recopilar feedback** y métricas
3. **Iterar y mejorar** basado en datos
4. Preparar lanzamiento público


---
