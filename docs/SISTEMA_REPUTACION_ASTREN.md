# 🌟 Sistema de Reputación Astren

## 📋 **VERSIÓN ACTUALIZADA**

---

## ⭐ **1. REPUTACIÓN POR ÁREA**

### **Concepto:**
- ✅ **Cada tarea** debe pertenecer obligatoriamente a un área
- ✅ **Áreas comunes:** Personal, Escuela, Trabajo, Salud, Gym
- ✅ **Reputación independiente** por área para cada usuario
- ✅ **Visualización del rendimiento** según contexto personal o profesional

### **Cálculo:**
```
Reputación por área = Promedio de calificaciones de tareas en esa área
Estrellas por área = 1.0 a 5.0 estrellas
```

### **Ejemplo:**
- **Usuario Juan:**
  - **Personal:** 3.2 estrellas (rendimiento en tareas personales)
  - **Trabajo:** 4.1 estrellas (rendimiento en tareas laborales)
  - **Escuela:** 2.8 estrellas (rendimiento en tareas académicas)

---

## 🏢 **2. REPUTACIÓN POR GRUPO (PLAN EMPRESARIAL)**

### **Funcionalidades:**
- ✅ **Área asociada** al grupo (ej: grupo empresarial → área "Trabajo")
- ✅ **Reputación específica** del usuario dentro del grupo
- ✅ **Solo tareas completadas** en ese contexto y área
- ✅ **Funciones avanzadas** exclusivas para grupos empresariales

### **Funciones Avanzadas (Solo Empresarial):**
- ✅ **Calificar tareas** (automática o manualmente)
- ✅ **Establecer importancia** (peso) de cada tarea
- ✅ **Solicitar evidencia** de cumplimiento (archivos o imágenes)

### **Ejemplo:**
- **Grupo "Proyecto Alpha"** → Área "Trabajo"
- **Usuario María** en el grupo:
  - **Reputación en grupo:** 4.2 estrellas
  - **Tareas críticas:** Mayor peso en calificación
  - **Evidencias requeridas:** Obligatorias según configuración

---

## 🌟 **3. REPUTACIÓN GENERAL DEL USUARIO**

### **Cálculo:**
```
Reputación general = Promedio de todas las áreas activas
```

### **Protección contra Manipulación:**
- ✅ **Cada área tiene el mismo peso**
- ✅ **Evita manipulación** mejorando solo áreas fáciles
- ✅ **Fomenta desarrollo equilibrado** en todas las áreas

### **Ejemplo:**
- **Usuario Ana:**
  - **Personal:** 3.0 estrellas
  - **Trabajo:** 4.5 estrellas
  - **Escuela:** 2.8 estrellas
  - **General:** Promedio de 3.4 estrellas

---

## 📊 **4. CALIFICACIÓN DE TAREAS**

### **Usuarios Normales (Gratuito):**
- ✅ **No pueden establecer** pesos personalizados
- ✅ **No reciben** calificaciones externas
- ✅ **Calificación automática** según estado final y entrega a tiempo
- ✅ **Escala:** 1.0 a 5.0 estrellas

### **Grupos Empresariales (Plan Pago):**
- ✅ **Calificación manual** por administradores o líderes
- ✅ **Peso personalizado** para cada tarea
- ✅ **Tareas críticas** valen más
- ✅ **Mayor impacto** en reputación del usuario
- ✅ **Evidencia obligatoria** si lo define el grupo
- ✅ **Evidencia influye** en la calificación

---

## 🗓️ **5. REPUTACIÓN MENSUAL PROTEGIDA**

### **Sistema de Congelación:**
- ✅ **Reputación guardada** al final de cada mes por área
- ✅ **Tareas nuevas** afectan únicamente el mes en curso
- ✅ **Mayor valor** a meses recientes (opcional)

### **Beneficios:**
- ✅ **Mantiene historial** sin borrar logros anteriores
- ✅ **Da relevancia** a la actividad reciente
- ✅ **Estabilidad** en la reputación a largo plazo

### **Ejemplo:**
- **Área "Trabajo" del usuario Carlos:**
  - **Enero:** 3.2 estrellas (congelada)
  - **Febrero:** 3.5 estrellas (congelada)
  - **Marzo:** 3.8 estrellas (congelada)
  - **Abril actual:** 4.1 estrellas (en progreso)
  - **Sistema considera** todos los meses con peso a lo reciente

---

## 💾 **6. EVIDENCIAS DE CUMPLIMIENTO**

### **Política de Almacenamiento:**
- ✅ **Solo grupos empresariales** pueden solicitar evidencias
- ✅ **Evita abusos** del sistema
- ✅ **Reduce uso innecesario** del almacenamiento
- ✅ **Futuro:** Almacenamiento externo (Amazon S3, Firebase Storage)

### **Características Futuras:**
- ✅ **Límites configurables** por grupo o empresa
- ✅ **Integración** con servicios externos
- ✅ **Control de espacio** y costos

### **Tipos de Evidencias:**
- ✅ **Imágenes** (fotos de trabajo)
- ✅ **Documentos** (reportes, presentaciones)
- ✅ **Archivos** (código, diseños)
- ✅ **Timestamps** automáticos

---

## 🎯 **7. VENTAJAS DEL SISTEMA**

### **Para Usuarios:**
- ✅ **Desarrollo equilibrado** en todas las áreas
- ✅ **Motivación** por mejorar áreas débiles
- ✅ **Reputación justa** y protegida
- ✅ **Contexto claro** (personal vs profesional)

### **Para Empresas:**
- ✅ **Control total** sobre evaluación de empleados
- ✅ **Métricas precisas** de productividad
- ✅ **Evidencias verificables** de trabajo
- ✅ **Reputación específica** por proyecto/grupo

### **Para Astren:**
- ✅ **Sistema escalable** y sostenible
- ✅ **Monetización** clara (plan empresarial)
- ✅ **Protección** contra manipulación
- ✅ **Retención** de usuarios a largo plazo

---

## 🏗️ **8. ARQUITECTURA TÉCNICA**

### **Base de Datos:**

#### **Tabla `reputacion_areas`:**
```sql
- usuario_id
- area_id
- calificacion_promedio
- estrellas_actuales
- reputacion_mensual (JSON con historial)
- fecha_ultima_actualizacion
```

#### **Tabla `reputacion_grupos`:**
```sql
- usuario_id
- grupo_id
- area_id
- calificacion_promedio
- estrellas_actuales
- calificaciones_recibidas
- fecha_ultima_actualizacion
```

#### **Tabla `evidencias`:**
```sql
- evidencia_id
- usuario_id
- tarea_id
- grupo_id (NULL para usuarios normales)
- tipo_evidencia (imagen, documento, archivo)
- estado_verificacion (pendiente, verificada, rechazada)
- verificada_por (usuario_id o NULL)
- fecha_verificacion
- contenido_evidencia
```

#### **Tabla `calificaciones`:**
```sql
- calificacion_id
- usuario_id
- evaluador_id
- grupo_id (NULL para calificaciones personales)
- tipo_calificacion (personal, empresarial)
- puntuacion (1-5)
- peso_tarea (1.0 para normales, variable para empresariales)
- comentarios
- fecha_evaluacion
- categoria (productividad, colaboración, innovación)
```

### **Backend (Flask):**

#### **Endpoints Necesarios:**
- `GET /reputacion/{usuario_id}` → Datos completos de reputación
- `GET /reputacion/area/{usuario_id}/{area_id}` → Reputación por área
- `GET /reputacion/grupo/{usuario_id}/{grupo_id}` → Reputación en grupo
- `POST /reputacion/actualizar` → Actualizar calificación
- `GET /reputacion/historial/{usuario_id}` → Historial de 6 meses
- `POST /reputacion/calcular` → Recalcular reputación
- `POST /evidencias/subir` → Subir evidencia
- `POST /evidencias/verificar` → Verificar evidencia
- `POST /calificaciones/crear` → Crear calificación

---

## 🚀 **9. ROADMAP DE IMPLEMENTACIÓN**

### **FASE 1 (Actual):**
- ✅ **Sistema básico** de estrellas
- ✅ **Perfil personal** funcional
- ✅ **Métricas** básicas

### **FASE 2 (Próxima):**
- 🔄 **Reputación por área** obligatoria
- 🔄 **Calificación automática** de tareas
- 🔄 **Reputación general** por promedio
- 🔄 **Sistema de estrellas** (1.0-5.0)

### **FASE 3 (Futuro):**
- 📋 **Grupos empresariales** con calificación manual
- 📋 **Sistema de evidencias** para empresas
- 📋 **Reputación mensual** protegida
- 📋 **Plan empresarial** completo

### **FASE 4 (Largo Plazo):**
- 🌐 **Perfiles públicos** con reputación
- 📊 **Rankings** por área/industria
- 🤖 **IA integrada** para análisis predictivo
- 📈 **Reportes** ejecutivos avanzados

---

## 📝 **10. CONSIDERACIONES FUTURAS**

### **Escalabilidad:**
- ✅ **Sistema de estrellas** directo para simplicidad
- ✅ **Estrellas visuales** para motivación
- ✅ **Almacenamiento externo** para evidencias
- ✅ **CDN** para archivos multimedia

### **Monetización:**
- ✅ **Plan gratuito** con limitaciones
- ✅ **Plan premium** para usuarios avanzados
- ✅ **Plan empresarial** con funcionalidades completas
- ✅ **API** para integraciones empresariales

### **Gamificación:**
- ✅ **Badges** por logros específicos
- ✅ **Streaks** de días consecutivos
- ✅ **Challenges** mensuales
- ✅ **Rankings** competitivos

---

## 🎯 **11. CONCLUSIÓN**

El Sistema de Reputación Astren está diseñado para ser:
- **Justo** y protegido contra manipulación
- **Motivador** para desarrollo personal
- **Escalable** para uso empresarial
- **Sostenible** en términos de recursos
- **Flexible** para futuras expansiones

**Este sistema sentará las bases para convertir Astren en el estándar global de medición de productividad.** 🌟 