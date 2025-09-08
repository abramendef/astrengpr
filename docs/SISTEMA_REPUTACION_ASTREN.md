# 🏆 Sistema de Reputación Astren

## 📋 Estado Actual del Sistema

### ⚠️ **ESTADO: PLANIFICADO PERO NO IMPLEMENTADO**

El sistema de reputación está **completamente planificado** con una arquitectura sólida, pero **no está implementado** en el backend. Solo existe la estructura frontend.

### **Componentes Existentes:**
- ✅ **Frontend**: HTML/CSS/JS completos (1,237 líneas)
- ✅ **Diseño**: UI/UX completamente diseñada
- ✅ **Lógica**: Algoritmos de cálculo definidos
- ❌ **Backend**: Sin endpoints implementados
- ❌ **Base de Datos**: Tablas de reputación definidas en el diseño; pendientes de migración
- ❌ **Integración**: No conectado con el sistema de tareas

### **Problemas Técnicos Resueltos Relacionados:**
- ✅ **Función duplicada en Flask**: Eliminada función `listar_areas_con_tareas` duplicada
- ✅ **Script de inicio**: Corregidas rutas en PowerShell
- ✅ **Configuración de servidores**: Ambos servidores funcionan correctamente
- ✅ **Optimización N+1**: Implementada en grupos y áreas
- ✅ **Estados del sistema**: Documentados correctamente

---

## 🏗️ Arquitectura Planificada

### **Concepto Fundamental**
Astren implementará un sistema de reputación basado en **estrellas con decaimiento exponencial**, diseñado para ser el **estándar global de medición de productividad**.

### **Características Clave**
- **Decaimiento Exponencial**: Prioriza actividad reciente
- **Sistema de Estrellas**: Cada tarea otorga estrellas (1-5) según su evaluación
- **Protección Anti-Manipulación**: Múltiples capas de validación
- **Escalabilidad Empresarial**: Multiplicadores configurables
- **Sostenibilidad**: Consolidación inteligente de datos
- **Flexibilidad**: Modelos configurables para diferentes contextos

---

## 🧮 Algoritmo de Reputación

### **Fórmula Principal (Ventana móvil de 30 días, granularidad diaria)**
```
Reputación General = Σ(Estrellas_d × decay^(d/30)) / Σ(decay^(d/30))
```

### **Definiciones y Variables**
- **d**: Días transcurridos desde la fecha de la tarea hasta hoy (d=0 hoy).
- **decay**: Factor de decaimiento base (0.9 por defecto, aplicado por cada 30 días).
- **Estrellas_d**: Estrellas de la tarea o promedio del día correspondiente.
- **Ventana**: Se consideran por defecto los últimos 180 días (configurable) para eficiencia.

### **Nota sobre “mes”**
- Para cálculo: se usa ventana móvil de 30 días (no mes calendario) para evitar saltos al corte de mes.
- Para reporting: se pueden generar “bins” por mes calendario (solo visualización/analytics), sin afectar el cálculo base.

### **Cálculo por Categoría (consistente)**
```
Reputación_Categoría = Σ(Estrellas_tarea × decay^(días_transcurridos/30))
```

### **Configuración del Sistema**
```python
# Parámetros configurables
DECAY_FACTOR = 0.9          # Factor de decaimiento mensual
BASE_STARS = 3               # Estrellas base por tarea completada
PUNCTUALITY_BONUS = 1        # Bonus de estrella por puntualidad
QUALITY_MULTIPLIER = 1.2     # Multiplicador por calidad
```

---

## 📊 Niveles de Reputación

### **Sistema de Estrellas**
- **⭐ 1 Estrella**: 0-1.0 promedio
- **⭐⭐ 2 Estrellas**: 1.1-2.0 promedio  
- **⭐⭐⭐ 3 Estrellas**: 2.1-3.0 promedio
- **⭐⭐⭐⭐ 4 Estrellas**: 3.1-4.0 promedio
- **⭐⭐⭐⭐⭐ 5 Estrellas**: 4.1-5.0 promedio

### **Niveles de Progreso**
- **Bronce**: 0-2.0 promedio
- **Plata**: 2.1-3.5 promedio
- **Oro**: 3.6-4.5 promedio
- **Diamante**: 4.6+ promedio

```python
# Constantes compartidas (umbral inferior inclusivo)
NIVEL_BRONCE_MIN = 0.0
NIVEL_PLATA_MIN = 2.1
NIVEL_ORO_MIN = 3.6
NIVEL_DIAMANTE_MIN = 4.6

def calcular_nivel_por_promedio(promedio: float) -> str:
    if promedio >= NIVEL_DIAMANTE_MIN:
        return 'diamante'
    if promedio >= NIVEL_ORO_MIN:
        return 'oro'
    if promedio >= NIVEL_PLATA_MIN:
        return 'plata'
    return 'bronce'
```

---

## 🎯 Sistema de Evaluación de Tareas

### **PLAN ACTUAL - IMPLEMENTACIÓN SIMPLE (Solo Código)**

#### **Criterios de Evaluación Básicos:**
1. **⏰ Tiempo de Entrega** (0-5 estrellas)
   - **⭐ 5 Estrellas**: Entregada a tiempo o antes
   - **⭐ 4 Estrellas**: Entregada dentro de 1 hora después del plazo
   - **⭐ 3 Estrellas**: Entregada dentro de 2 horas después del plazo
   - **⭐ 2 Estrellas**: Entregada dentro de 3 horas después del plazo
   - **⭐ 1 Estrella**: Entregada dentro de 4 horas después del plazo
   - **⭐ 0 Estrellas**: Entregada después de 4 horas del plazo

2. **📝 Calidad de Descripción** (0-1 estrella bonus)
   - **+1 Estrella**: Contiene verbos de acción + al menos 10 tokens únicos
   - **+0.5 Estrellas**: Contiene verbos de acción + al menos 5 tokens únicos
   - **+0 Estrellas**: Descripción básica o vacía
   - **Saturación**: Máximo 1.0 con función de saturación

3. **✅ Evidencia y Validación** (0-1 estrella bonus)
   - **+1 Estrella**: Tarea con evidencia aprobada por líder/profesor
   - **+0.5 Estrellas**: Tarea con dependencias cumplidas
   - **+0 Estrellas**: Sin evidencia o validación

4. **👥 Colaboración Real** (0-0.5 estrellas bonus)
   - **+0.5 Estrellas**: Tarea grupal con ≥2 miembros asignados Y no autocreada/autocerrada
   - **+0 Estrellas**: Tarea individual o grupal sin colaboración real

#### **Fórmula de Cálculo Endurecida:**
```python
def calcular_estrellas_simple(tarea):
    # 1. Estrellas por tiempo (0-5)
    estrellas_tiempo = calcular_estrellas_por_tiempo(tarea.fecha_vencimiento, tarea.fecha_completada)
    
    # 2. Bonus por calidad de descripción (0-1)
    bonus_descripcion = calcular_bonus_descripcion(tarea.descripcion)
    
    # 3. Bonus por evidencia/validación (0-1)
    bonus_evidencia = calcular_bonus_evidencia(tarea)
    
    # 4. Bonus por colaboración real (0-0.5)
    bonus_colaboracion = calcular_bonus_colaboracion(tarea)
    
    total = estrellas_tiempo + bonus_descripcion + bonus_evidencia + bonus_colaboracion
    return min(5, max(0, total))

def calcular_bonus_descripcion(descripcion):
    """Calcula bonus basado en calidad real de la descripción"""
    if not descripcion or len(descripcion.strip()) < 10:
        return 0
    
    # Verificar verbos de acción
    verbos_accion = ['crear', 'desarrollar', 'analizar', 'implementar', 'diseñar', 
                    'investigar', 'producir', 'generar', 'construir', 'optimizar',
                    'mejorar', 'resolver', 'completar', 'finalizar', 'entregar']
    
    desc_lower = descripcion.lower()
    tiene_verbos = any(verbo in desc_lower for verbo in verbos_accion)
    
    if not tiene_verbos:
        return 0
    
    # Contar tokens únicos (palabras significativas)
    tokens = [palabra for palabra in descripcion.split() 
              if len(palabra) > 2 and palabra.isalpha()]
    tokens_unicos = len(set(tokens))
    
    # Función de saturación
    if tokens_unicos >= 10:
        return 1.0
    elif tokens_unicos >= 5:
        return 0.5
    else:
        return 0

def calcular_bonus_evidencia(tarea):
    """Calcula bonus por evidencia y validación"""
    # TODO: Implementar cuando tengamos sistema de evidencia
    # Por ahora, simular con dependencias
    if tarea.dependencias_cumplidas:
        return 0.5
    return 0

def calcular_bonus_colaboracion(tarea):
    """Calcula bonus por colaboración real"""
    if not tarea.grupo_id:
        return 0
    
    # Verificar que tenga al menos 2 miembros asignados
    miembros_asignados = tarea.miembros_asignados or []
    if len(miembros_asignados) < 2:
        return 0
    
    # Verificar que no sea autocreada y autocerrada
    if tarea.usuario_id == tarea.asignado_a_id and tarea.usuario_id == tarea.completado_por_id:
        return 0
    
    return 0.5
```

#### **Ejemplo de Cálculo Endurecido:**
```
Tarea: "Analizar datos de ventas Q4 y crear reporte ejecutivo con gráficos"
- Estrellas base (tiempo): 4 (entregada 1 hora tarde)
- Bonus descripción: +1.0 (contiene verbos "analizar", "crear" + 8 tokens únicos)
- Bonus evidencia: +0.5 (dependencias cumplidas)
- Bonus colaboración: +0.5 (tarea grupal con 3 miembros, no autocerrada)

Total: 4 + 1.0 + 0.5 + 0.5 = 6.0 → 5 estrellas (máximo)

Tarea: "hacer tarea" (ejemplo de manipulación)
- Estrellas base (tiempo): 5 (entregada a tiempo)
- Bonus descripción: +0 (solo 2 tokens únicos, sin verbos de acción específicos)
- Bonus evidencia: +0 (sin evidencia)
- Bonus colaboración: +0 (tarea individual)

Total: 5 + 0 + 0 + 0 = 5 estrellas (solo por tiempo)
```

### **PLAN FUTURO - IMPLEMENTACIÓN CON IA**

#### **Criterios Avanzados (Requieren IA):**
1. **🧠 Calidad Real del Contenido**
   - IA analiza la descripción para determinar si es realmente detallada y útil
   - Evalúa coherencia, especificidad y valor informativo

2. **🎯 Complejidad Inteligente**
   - IA determina la complejidad real de la tarea basada en contexto
   - Considera habilidades requeridas, tiempo estimado, y recursos necesarios

3. **💡 Creatividad e Innovación**
   - IA detecta soluciones creativas o enfoques innovadores
   - Evalúa la originalidad y el valor agregado

4. **📊 Impacto Real**
   - IA analiza el verdadero impacto de la tarea en objetivos
   - Considera dependencias, consecuencias y valor estratégico

5. **🔄 Patrones de Comportamiento**
   - IA analiza patrones históricos del usuario
   - Considera mejoras en el tiempo, consistencia y crecimiento

#### **Integración con IA Propuesta:**
```python
def calcular_estrellas_con_ia(tarea, historial_usuario):
    # Cálculo base (sistema simple)
    estrellas_base = calcular_estrellas_simple(tarea)
    
    # Análisis con IA
    calidad_ia = ia_analizar_calidad(tarea.descripcion)
    complejidad_ia = ia_analizar_complejidad(tarea.titulo, tarea.descripcion)
    impacto_ia = ia_analizar_impacto(tarea, historial_usuario)
    creatividad_ia = ia_detectar_creatividad(tarea.descripcion)
    
    # Combinar resultados
    total = estrellas_base + calidad_ia + complejidad_ia + impacto_ia + creatividad_ia
    return min(5, max(0, total))
```

### **VENTAJAS DEL ENFOQUE ESCALONADO**

#### **Implementación Inicial (Solo Código - CRITERIOS ENDURECIDOS):**
- ✅ **Rápida**: Se puede implementar en días
- ✅ **Justa**: Sistema objetivo y transparente
- ✅ **Anti-manipulación**: Criterios endurecidos contra gaming
- ✅ **Funcional**: Proporciona valor inmediato
- ✅ **Escalable**: Base sólida para futuras mejoras

#### **Mejoras de Seguridad Implementadas:**
- 🛡️ **Descripción**: Requiere verbos de acción + tokens únicos (no solo longitud)
- 🛡️ **Área**: Eliminada bonificación fija, trasladada a evidencia real
- 🛡️ **Grupo**: Solo cuenta si hay colaboración real (≥2 miembros, no autocerrada)
- 🛡️ **Saturación**: Funciones de saturación previenen abuso

#### **Implementación Futura (Con IA):**
- 🚀 **Inteligente**: Evaluación más sofisticada
- 🎯 **Precisa**: Mejor comprensión del valor real
- 🔮 **Adaptativa**: Se mejora con el tiempo
- 💡 **Innovadora**: Diferenciación competitiva

### **ROADMAP DE IMPLEMENTACIÓN**

#### **Fase 1 - Sistema Básico (Actual)**
1. Implementar evaluación por tiempo
2. Agregar bonus por descripción (longitud)
3. Implementar bonus por área
4. Agregar bonus por tipo de tarea
5. Conectar con sistema de reputación

#### **Fase 2 - Mejoras Incrementales**
1. Optimizar algoritmos de cálculo
2. Agregar más criterios simples
3. Mejorar interfaz de usuario
4. Implementar analytics básicos

#### **Fase 3 - Integración con IA**
1. Seleccionar proveedor de IA (OpenAI, Google, etc.)
2. Desarrollar prompts para evaluación
3. Implementar análisis de calidad
4. Agregar análisis de complejidad
5. Desarrollar análisis de impacto

#### **Fase 4 - IA Avanzada**
1. Implementar aprendizaje automático
2. Análisis predictivo de productividad
3. Recomendaciones personalizadas
4. Evaluación de equipos con IA
5. Reportes ejecutivos inteligentes

---

## 🔧 Implementación Técnica

### **Backend - Endpoints Necesarios (Fase 1)**
```python
# PENDIENTE: Implementar en app.py

@app.route('/tareas/<int:tarea_id>/evaluar', methods=['POST'])
def evaluar_tarea_automaticamente(tarea_id):
    """Evaluar tarea automáticamente al completarse"""
    # TODO: Implementar cálculo de estrellas simple

@app.route('/reputacion/<int:usuario_id>', methods=['GET'])
def obtener_reputacion(usuario_id):
    """Obtener reputación completa del usuario"""
    # TODO: Implementar lógica de cálculo con decaimiento exponencial
    
@app.route('/reputacion/<int:usuario_id>/actualizar', methods=['PUT'])
def actualizar_reputacion(usuario_id):
    """Actualizar reputación basada en nueva actividad"""
    # TODO: Implementar actualización automática
    
@app.route('/reputacion/<int:usuario_id>/historial', methods=['GET'])
def obtener_historial_reputacion(usuario_id):
    """Obtener historial de cambios de reputación"""
    # TODO: Implementar historial detallado
```

### **API: Contratos Mínimos y Estables**

#### PUT `/tareas/:id/estado`
```json
// Entrada
{ "estado": "pendiente|completada|vencida" }

// Salida (si estado != completada)
{ "estado": "pendiente|vencida" }

// Salida (si estado == completada)
{
  "estado": "completada",
  "estrellas": 0-5,
  "criterios": {
    "tiempo": 0-5,
    "descripcion": 0-1,
    "grupo": 0-0.5,
    "evidencia": 0-1
  },
  "reputacion": {
    "general": 0-5,
    "por_area": [{ "area_id": number, "estrellas": 0-5 }]
  }
}
```
- Idempotente: si ya estaba completada y evaluada, retorna la misma respuesta previa.
- Política sin `fecha_vencimiento`: se asignan 3 estrellas base por tiempo (no 5).

#### GET `/reputacion/:usuario_id`
```json
{
  "general": 0-5,
  "por_area": [{ "area_id": number, "estrellas": 0-5 }],
  "breakdown": [
    {
      "periodo": "YYYY-MM" | "rolling-30d",
      "estrellas_ponderadas": number,
      "peso": number
    }
  ]
}
```
- Cálculo base con ventana móvil (30 días, granularidad diaria).
- Para reporting, se puede incluir `periodo` por mes calendario adicionalmente.

#### GET `/reputacion/:usuario_id/historial?limit&offset`
```json
{
  "items": [
    {
      "id": number,
      "tarea_id": number,
      "evento": "completada|reapertura|ajuste",
      "estrellas_ganadas": number,
      "criterios": {
        "tiempo": number,
        "descripcion": number,
        "grupo": number,
        "evidencia": number
      },
      "motivo_json": { "raw": any },
      "fecha_cambio": "ISO8601"
    }
  ],
  "limit": number,
  "offset": number,
  "total": number
}
```

#### (Opcional) POST `/tareas/:id/evaluar`
```json
// Solo admin/dev. Recalcular manualmente una tarea.
// Entrada vacía
{}

// Respuesta igual a PUT /tareas/:id/estado (completada)
{
  "estado": "completada",
  "estrellas": number,
  "criterios": { "tiempo": number, "descripcion": number, "grupo": number, "evidencia": number },
  "reputacion": { "general": number, "por_area": [{"area_id": number, "estrellas": number}] }
}
```


### **Reglas Anti-manipulación (Backend)**
```python
# 1) Idempotencia y sello de tiempo inmutable
# - Solo asignar estrellas cuando el estado pase a 'completada'
# - Establecer fecha_completada una única vez y no permitir cambios posteriores

@app.route('/tareas/<int:tarea_id>/estado', methods=['PUT'])
def actualizar_estado_tarea(tarea_id):
    # ... lectura de 'nuevo_estado' ...
    # Anti-replay: rate limit por usuario (X tareas/min)
    if excede_rate_limit(usuario_id):
        return jsonify({'error': 'Rate limit excedido'}), 429

    if nuevo_estado == 'completada':
        # Si ya tiene fecha_completada y estrellas, NO volver a computar
        cursor.execute("SELECT fecha_completada, estrellas FROM tareas WHERE id=%s", (tarea_id,))
        fc, estrellas_existentes = cursor.fetchone()
        if fc and estrellas_existentes is not None:
            # idempotente: no duplicar efectos
            return jsonify({'mensaje': 'Ya evaluada', 'id': tarea_id, 'estrellas': estrellas_existentes})

        # Setear fecha_completada si no existe (inmutable)
        cursor.execute("UPDATE tareas SET fecha_completada = COALESCE(fecha_completada, NOW()) WHERE id=%s", (tarea_id,))

        # Calcular estrellas una sola vez
        estrellas = calcular_estrellas_simple(tarea_compuesta)
        cursor.execute("UPDATE tareas SET estado=%s, estrellas=%s WHERE id=%s", ('completada', estrellas, tarea_id))

        # Registrar en historial (idempotente por tarea_id + evento 'completada')
        insertar_historial_si_no_existe(usuario_id, tarea_id, estrellas, detalles_calculo)

        # Recalcular reputación (usar función que sea idempotente y derivada de origen de verdad)
        recalcular_reputacion_usuario(usuario_id)

    elif nuevo_estado == 'pendiente':
        # Si se reabre: ajustar efectos → borrar/neutralizar evento de historial y recálculo
        eliminar_historial_evento(usuario_id, tarea_id, evento='completada')
        cursor.execute("UPDATE tareas SET estado='pendiente' WHERE id=%s", (tarea_id,))
        recalcular_reputacion_usuario(usuario_id)

    # ... otros estados ...
```

### **Modificación del Endpoint Existente**
```python
# MODIFICAR: Endpoint actual de actualización de estado
@app.route('/tareas/<int:tarea_id>/estado', methods=['PUT'])
def actualizar_estado_tarea(tarea_id):
    data = request.json
    nuevo_estado = data.get('estado')
    
    if nuevo_estado not in ['pendiente', 'completada', 'vencida']:
        return jsonify({'error': 'Estado inválido'}), 400
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # NUEVO (v0): Si se está marcando como completada, calcular estrellas con idempotencia
    if nuevo_estado == 'completada':
        # Obtener datos de la tarea con información de colaboración
        cursor.execute("""
            SELECT t.fecha_vencimiento, t.descripcion, t.area_id, t.grupo_id, 
                   t.usuario_id, t.asignado_a_id, t.completado_por_id,
                   COUNT(DISTINCT ta.usuario_id) as miembros_asignados,
                   COUNT(DISTINCT td.tarea_dependiente_id) as dependencias_cumplidas
            FROM tareas t
            LEFT JOIN tareas_asignadas ta ON t.id = ta.tarea_id
            LEFT JOIN tareas_dependencias td ON t.id = td.tarea_dependiente_id 
                AND td.estado = 'completada'
            WHERE t.id = %s
            GROUP BY t.id
        """, (tarea_id,))
        tarea = cursor.fetchone()
        
        if tarea:
            # Idempotencia: no duplicar
            cursor.execute("SELECT fecha_completada, estrellas FROM tareas WHERE id=%s", (tarea_id,))
            fc, estrellas_previas = cursor.fetchone() or (None, None)
            if fc and estrellas_previas is not None:
                return jsonify({'mensaje': 'Ya evaluada', 'id': tarea_id, 'estado': 'completada', 'estrellas': float(estrellas_previas)})

            # Setear fecha_completada si estaba NULL
            cursor.execute("UPDATE tareas SET fecha_completada = COALESCE(fecha_completada, NOW()) WHERE id=%s", (tarea_id,))

            # Calcular estrellas (v0)
            estrellas, criterios = calcular_estrellas_simple(tarea)
            # Actualizar estado y estrellas
            sql = "UPDATE tareas SET estado = %s, estrellas = %s WHERE id = %s"
            cursor.execute(sql, (nuevo_estado, estrellas, tarea_id))

            # Insertar historial con desglose
            cursor.execute("""
                INSERT INTO historial_reputacion (
                    usuario_id, tarea_id, estrellas_ganadas,
                    criterio_tiempo, criterio_descripcion, criterio_colaboracion, criterio_evidencia,
                    motivo_json, evento
                ) VALUES (%s,%s,%s,%s,%s,%s,%s,%s,'completada')
            """, (
                tarea[4], tarea_id, estrellas,
                criterios['tiempo'], criterios['descripcion'], criterios['grupo'], criterios['evidencia'],
                json.dumps(criterios)
            ))

            # Recalcular reputación del usuario (v0: LIMIT 100)
            recalcular_reputacion_usuario(tarea[4])
        else:
            sql = "UPDATE tareas SET estado = %s WHERE id = %s"
            cursor.execute(sql, (nuevo_estado, tarea_id))
    else:
        sql = "UPDATE tareas SET estado = %s WHERE id = %s"
        cursor.execute(sql, (nuevo_estado, tarea_id))
    
    conn.commit()
    cursor.close()
    conn.close()
    
    return jsonify({
        'mensaje': 'Estado actualizado', 
        'id': tarea_id, 
        'estado': nuevo_estado,
        'estrellas': estrellas if nuevo_estado == 'completada' else None
    })
```

### **Base de Datos - Estructura Actualizada**
```sql
-- Tabla existente (ya implementada)
CREATE TABLE tareas (
    id INT NOT NULL AUTO_INCREMENT,
    usuario_id INT NOT NULL,
    area_id INT DEFAULT NULL,
    grupo_id INT DEFAULT NULL,
    asignado_a_id INT DEFAULT NULL,
    titulo VARCHAR(200) NOT NULL,
    descripcion TEXT,
    estado VARCHAR(20) DEFAULT 'pendiente',
    estrellas TINYINT DEFAULT NULL,  -- VALOR DE 0 A 5 SEGÚN EVALUACIÓN
    fecha_completada DATETIME DEFAULT NULL, -- Se asigna una vez e inmutable (al completar)
    fecha_reapertura DATETIME DEFAULT NULL,  -- SET al reabrir y borrar estrellas
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    fecha_vencimiento DATETIME DEFAULT NULL,
    PRIMARY KEY (id),
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);

-- Tablas de reputación existentes (ya implementadas)
CREATE TABLE reputacion_general (
    id INT NOT NULL AUTO_INCREMENT,
    usuario_id INT NOT NULL,
    estrellas DECIMAL(4,2) NOT NULL DEFAULT 3.00,
    fecha_ultima_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uniq_usuario (usuario_id),
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);

-- Tabla pendiente para historial detallado
CREATE TABLE historial_reputacion (
    id INTEGER PRIMARY KEY AUTO_INCREMENT,
    usuario_id INTEGER NOT NULL,
    tarea_id INTEGER NOT NULL,
    estrellas_ganadas DECIMAL(3,2),
    criterio_tiempo DECIMAL(3,2),
    criterio_descripcion DECIMAL(3,2),
    criterio_evidencia DECIMAL(3,2),
    criterio_colaboracion DECIMAL(3,2),
    motivo_json JSON DEFAULT NULL,
    fecha_cambio TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    evento ENUM('completada','reapertura','ajuste') DEFAULT 'completada',
    UNIQUE KEY uniq_usuario_tarea_evento (usuario_id, tarea_id, evento),
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
    FOREIGN KEY (tarea_id) REFERENCES tareas(id)
);

-- Evidencias (permitir adjuntos aunque IA sea futura)
CREATE TABLE evidencias_tarea (
    id INT PRIMARY KEY AUTO_INCREMENT,
    tarea_id INT NOT NULL,
    usuario_id INT NOT NULL,
    url VARCHAR(500) DEFAULT NULL,
    archivo_path VARCHAR(500) DEFAULT NULL,
    estado_validacion ENUM('pendiente','aprobada','rechazada') DEFAULT 'pendiente',
    fecha_subida TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tarea_id) REFERENCES tareas(id),
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);

-- Rate limiting simple por usuario
CREATE TABLE rate_limit_reputacion (
    id INT PRIMARY KEY AUTO_INCREMENT,
    usuario_id INT NOT NULL,
    ventana_inicio TIMESTAMP NOT NULL,
    eventos INT NOT NULL DEFAULT 0,
    INDEX idx_usuario_ventana (usuario_id, ventana_inicio)
);
```

### **Frontend - Integración Pendiente**
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
  • Actualizar chip de la tarjeta de tarea con ⭐ y tooltip.
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
```sql
CREATE TABLE reputacion_area (
    id INT NOT NULL AUTO_INCREMENT,
    usuario_id INT NOT NULL,
    area_id INT NOT NULL,
    estrellas DECIMAL(4,2) NOT NULL DEFAULT 5.00,
    fecha_ultima_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uniq_usuario_area (usuario_id, area_id),
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
    FOREIGN KEY (area_id) REFERENCES areas(id)
);
```

### **Índices Críticos**
```sql
CREATE INDEX idx_tareas_usuario_estado_creacion 
  ON tareas (usuario_id, estado, fecha_creacion);

CREATE INDEX idx_tareas_usuario_estado_completada 
  ON tareas (usuario_id, estado, fecha_completada);

CREATE INDEX idx_tareas_area_estado_completada 
  ON tareas (area_id, estado, fecha_completada);

CREATE INDEX idx_historial_usuario_fecha 
  ON historial_reputacion (usuario_id, fecha_cambio);

-- Unicidad en reputacion_general(usuario_id) y reputacion_area(usuario_id, area_id)
```

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

#### Ejemplo SQL (determinar vencida al vuelo)
```sql
SELECT 
  t.id,
  t.titulo,
  CASE 
    WHEN t.estado = 'completada' THEN 'completada'
    WHEN t.fecha_vencimiento IS NOT NULL AND NOW() > t.fecha_vencimiento THEN 'vencida'
    ELSE t.estado
  END AS estado_efectivo
FROM tareas t
WHERE t.usuario_id = ?
ORDER BY t.fecha_creacion DESC
LIMIT 50;
```

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
    
    # Obtener todas las tareas completadas con estrellas
    sql = """
        SELECT estrellas, fecha_creacion 
        FROM tareas 
        WHERE usuario_id = %s 
        AND estado = 'completada' 
        AND estrellas IS NOT NULL
        ORDER BY fecha_creacion DESC
        LIMIT 100
    """
    cursor.execute(sql, (usuario_id,))
    tareas = cursor.fetchall()
    
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
    
    # Actualizar tabla de reputación
    cursor.execute("""
        INSERT INTO reputacion_general (usuario_id, estrellas) 
        VALUES (%s, %s) 
        ON DUPLICATE KEY UPDATE 
        estrellas = VALUES(estrellas), 
        fecha_ultima_actualizacion = CURRENT_TIMESTAMP
    """, (usuario_id, reputacion))
    
    conn.commit()
    cursor.close()
    conn.close()
    
    return reputacion
```

---

## 🚀 Plan de Implementación

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

## 🎯 Objetivos del Sistema

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

## 🖥️ UX de Reputación

### 1) Feedback inmediato al completar tarea
```text
Evento: PUT /tareas/:id/estado → estado=completada
UI: Mostrar toast/snackbar 3–4s con breakdown compacto.
Formato: "Ganaste ⭐{total} por esta tarea (tiempo: ⭐{tiempo}{, descripcion: +{descripcion}}{, grupo: +{grupo}}{, evidencia: +{evidencia}})"

Ejemplo: "Ganaste ⭐3.5 por esta tarea (tiempo: ⭐3, grupo: +0.5)"

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
- Si estado = completada y tareas.estrellas no es NULL → mostrar ⭐{estrellas}
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
showToast(`Ganaste ⭐${round1(estrellas)} (tiempo: ⭐${round1(criterios.tiempo)}${criterios.descripcion?`, descripcion: +${round1(criterios.descripcion)}`:''}${criterios.grupo?`, grupo: +${round1(criterios.grupo)}`:''}${criterios.evidencia?`, evidencia: +${round1(criterios.evidencia)}`:''})`);

// 2) Actualizar chip en la tarjeta de la tarea
updateTaskChip(tareaId, estrellas, criterios);

// 3) Refrescar widgets de “Mi reputación” en segundo plano
refreshReputationWidgets();
```

## 🔐 Seguridad y Privacidad

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

## 🔍 Diagnóstico Técnico

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

## 📈 Métricas de Éxito

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

## 🚨 Próximos Pasos Críticos

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
4. **Preparar lanzamiento** público

---

## 🔧 Problemas Técnicos Resueltos (Relacionados)

### **1. Función Duplicada en Flask** ✅
**Problema**: Dos funciones `listar_areas_con_tareas` con el mismo nombre
**Solución**: Eliminada la función duplicada al final del archivo
**Impacto**: Backend ahora inicia sin errores, preparado para implementar reputación

### **2. Script de Inicio Corregido** ✅
**Problema**: Rutas incorrectas en script PowerShell
**Solución**: Corregidas las rutas para funcionar desde directorio raíz
**Impacto**: Ambos servidores inician correctamente, sistema operativo

### **3. Configuración de Servidores** ✅
**Problema**: Servidores iniciándose desde directorios incorrectos
**Solución**: Script corregido para iniciar desde directorios específicos
**Impacto**: Frontend sirve archivos correctos, backend funciona sin errores

### **4. Optimización N+1** ✅
**Problema**: Múltiples requests innecesarios
**Solución**: Endpoints optimizados para grupos y áreas
**Impacto**: Performance mejorada, base sólida para reputación

---

## 📋 **RESUMEN EJECUTIVO**

### **Sistema de Evaluación Propuesto**

**Astren implementará un sistema de reputación basado en estrellas (1-5) que evalúa automáticamente cada tarea completada usando criterios objetivos y transparentes.**

#### **Evaluación Inicial (Solo Código - CRITERIOS ENDURECIDOS):**
- **⏰ Tiempo de entrega**: 0-5 estrellas (base del sistema)
- **📝 Calidad de descripción**: 0-1 estrella (verbos de acción + tokens únicos)
- **✅ Evidencia y validación**: 0-1 estrella (aprobación líder/profesor o dependencias)
- **👥 Colaboración real**: 0-0.5 estrellas (≥2 miembros, no autocerrada)

#### **Evaluación Futura (Con IA):**
- **🧠 Calidad real del contenido**
- **🎯 Complejidad inteligente**
- **💡 Creatividad e innovación**
- **📊 Impacto real**
- **🔄 Patrones de comportamiento**

### **Ventajas del Enfoque Escalonado**

#### **Implementación Rápida:**
- ✅ Sistema funcional en 1-2 semanas
- ✅ Criterios objetivos y transparentes
- ✅ Base sólida para futuras mejoras
- ✅ Integración perfecta con sistema existente

#### **Escalabilidad Futura:**
- 🚀 Preparado para integración con IA
- 🎯 Sistema híbrido (simple + IA)
- 💡 Diferenciación competitiva
- 🔮 Adaptativo y mejorable

### **Impacto Esperado**

#### **Para Usuarios:**
- **Motivación**: Sistema de progreso claro y justo
- **Retroalimentación**: Feedback inmediato sobre productividad
- **Desarrollo**: Identificación de áreas de mejora
- **Reconocimiento**: Estrellas como símbolo de logro

#### **Para Astren:**
- **Diferenciación**: Sistema único de evaluación automática
- **Escalabilidad**: Preparado para crecimiento empresarial
- **Innovación**: Base para futuras funcionalidades con IA
- **Sostenibilidad**: Sistema eficiente y mantenible

---

**🌟 El sistema de reputación de Astren está diseñado para convertirse en el estándar global de medición de productividad, comenzando con un sistema simple pero efectivo que evolucionará hacia una solución inteligente con IA.**

---

📄 **Documento actualizado**: Agosto 2025  
🧩 **Estado**: Planificado - Listo para implementación  
🚨 **Prioridad**: Alta - Sistema base funcional en 1-2 semanas  
🔧 **Sistema Base**: Completamente funcional y preparado para reputación 
🤖 **Roadmap IA**: Planificado para implementación futura 

