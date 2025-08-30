# 🌟 Astren - Sistema de Gestión de Productividad

**Astren** es una plataforma completa de gestión de productividad que combina gestión de tareas, equipos, áreas personales y un **sistema de reputación basado en estrellas (planificado)**. Diseñado para ser el estándar global de medición de productividad.

## 🚀 Características Principales

### 📊 **Dashboard Inteligente**
- **Vista general** de tareas y estadísticas en tiempo real
- **Navegación inteligente** a secciones específicas
- **Progreso de reputación** visual con estrellas (planificado)
- **Áreas y grupos** con scroll horizontal
- **Contadores interactivos** que enlazan a secciones específicas

### ✅ **Sistema de Tareas Avanzado**
- **4 categorías principales**: Hoy, Pendientes, Completadas, Vencidas
- **Gestión de evidencia** para tareas de trabajo/escuela
- **Estados claros**: Pendiente, En Progreso, Completada, Vencida
- **Filtros inteligentes** y navegación por hash
- **Sistema de reputación** integrado por tarea (planificado)

### 👥 **Gestión de Equipos (Grupos)**
- **Creación y gestión** de grupos con colores e iconos
- **Sistema de roles**: Líder, Administrador, Miembro
- **Invitar y gestionar** miembros
- **Tareas grupales** con asignación
- **Notificaciones** en tiempo real
- **Archivado** de grupos

### 🏆 **Sistema de Reputación por Estrellas (Planificado)**
- **Reputación general** con decaimiento exponencial (promedio ponderado) - *No implementado*
- **Reputación por área** independiente con decaimiento exponencial - *No implementado*
- **Reputación por grupo** (Plan Empresarial) con modelos configurables - *No implementado*
- **Reputación inicial** de 5 estrellas (sin período de prueba) - *No implementado*
- **Nivel de consolidación** basado en antigüedad, racha y tareas cumplidas - *No implementado*
- **Peso personalizado** de tareas en grupos empresariales - *No implementado*
- **Calificación automática** (usuarios normales) y manual (empresariales) - *No implementado*

### 🎯 **Áreas Personales**
- **Organización** por contextos (Personal, Trabajo, Escuela)
- **Colores e iconos** personalizables
- **Reputación independiente** por área (planificado)
- **Gestión visual** intuitiva

### 🔔 **Sistema de Notificaciones**
- **Notificaciones en tiempo real**
- **Invitar a grupos**
- **Cambios de rol**
- **Tareas asignadas**
- **Contador de no leídas**

## 📁 Estructura del Proyecto

```
astren/
├── frontend/                    # Interfaz de usuario
│   ├── css/                    # Estilos CSS (12 archivos)
│   │   ├── dashboard.css       # Dashboard principal
│   │   ├── tasks.css          # Sistema de tareas
│   │   ├── groups.css         # Gestión de grupos
│   │   ├── areas.css          # Áreas personales
│   │   ├── reputation.css     # Sistema de reputación (planificado)
│   │   └── ...                # Otros estilos
│   ├── js/                    # JavaScript (14 archivos)
│   │   ├── dashboard.js       # Lógica del dashboard
│   │   ├── tasks.js          # Gestión de tareas
│   │   ├── groups.js         # Gestión de grupos
│   │   ├── areas.js          # Áreas personales
│   │   ├── reputation.js     # Sistema de reputación (planificado)
│   │   └── ...               # Otros scripts
│   ├── images/               # Assets visuales
│   ├── index.html            # Página principal
│   ├── dashboard.html        # Dashboard inteligente
│   ├── tasks.html           # Gestión de tareas
│   ├── groups.html          # Gestión de equipos
│   ├── areas.html           # Áreas personales
│   ├── reputation.html      # Sistema de reputación (planificado)
│   ├── profile.html         # Perfil de usuario
│   ├── settings.html        # Configuraciones
│   ├── notifications.html   # Notificaciones
│   ├── login.html           # Autenticación
│   └── register.html        # Registro
├── backend/                  # Servidor y API
│   ├── app.py              # API principal (2,467 líneas)
│   ├── requirements.txt    # Dependencias Python
│   └── env.example        # Variables de entorno
├── docs/                   # Documentación
│   ├── SISTEMA_REPUTACION_ASTREN.md  # Sistema de reputación
│   ├── TASK_MANAGEMENT_SYSTEM.md     # Sistema de tareas
│   └── INICIAR_ASTREN.md            # Guía de inicio
├── scripts/                # Scripts de configuración
├── utils/                  # Utilidades
└── README.md              # Este archivo
```

## 🚀 Inicio Rápido

### Opción 1: Inicio Automático (Recomendado)
```bash
# Windows - Doble clic en:
start_astren.bat

# O desde PowerShell:
.\scripts\start_servers.ps1
```

### Opción 2: Inicio Manual
```bash
# 1. Instalar dependencias
cd backend
pip install -r requirements.txt

# 2. Configurar variables de entorno
cp env.example .env
# Editar .env con tus credenciales

# 3. Iniciar backend
python app.py

# 4. Abrir frontend
# Navegar a frontend/index.html
```

### 🌐 URLs de Acceso
- **Aplicación Principal**: http://localhost:5500
- **API Backend**: http://localhost:8000

## 🛠️ Tecnologías Utilizadas

### **Frontend**
- **HTML5** - Estructura semántica
- **CSS3** - Estilos modernos y responsivos
- **JavaScript (Vanilla)** - Lógica del cliente
- **Font Awesome** - Iconografía
- **Sistema de navegación** inteligente con hash

### **Backend**
- **Python 3.13** - Lenguaje principal
- **Flask 2.3.3** - Framework web
- **Flask-CORS 4.0.0** - Cross-origin requests
- **MySQL** - Base de datos
- **bcrypt 4.1.2** - Encriptación de contraseñas
- **python-dotenv 1.0.0** - Variables de entorno

### **Integraciones**
- **Sistema de notificaciones** - Notificaciones en tiempo real

## 📊 Sistema de Reputación (Planificado)

### **Características Principales**
- **Reputación general** con decaimiento exponencial (factor 0.9) - *No implementado*
- **Reputación por área** independiente con decaimiento exponencial - *No implementado*
- **Reputación por grupo** (Plan Empresarial) con modelos configurables - *No implementado*
- **Reputación inicial** de 5 estrellas (sin período de prueba) - *No implementado*
- **Nivel de consolidación** basado en antigüedad, racha y tareas cumplidas - *No implementado*
- **Multiplicadores configurables** de tareas (x2, x3, etc.) en el plan empresarial - *No implementado*
- **Calificación automática** (1.0-5.0 estrellas) y manual (empresariales) - *No implementado*

### **Fórmula de Reputación General (Planificada)**
```
Reputación General = Σ(Reputación_m × decay^(m-1)) / Σ(decay^(m-1))
```

> Esta fórmula dará mayor peso a las tareas más recientes sin eliminar el valor de las anteriores. *No implementado actualmente.*

### **Eliminación del Período de Prueba (Planificado)**
Gracias al nivel de consolidación (basado en antigüedad, racha y tareas cumplidas), la reputación visible desde el inicio será confiable y evaluable. *No implementado actualmente.*

### **Tipos de Usuario (Planificados)**
- **Usuarios Normales**: Calificación automática, sin evidencias - *No implementado*
- **Grupos Empresariales**: Calificación manual, evidencias obligatorias, multiplicadores configurables - *No implementado*

### **Comparativa de Tipos de Reputación (Planificados)**

| Tipo de Reputación    | Basada en...                   | Modelo de cálculo           | Personalizable | Estado |
|------------------------|--------------------------------|------------------------------|----------------|---------|
| General                | Todas las tareas del usuario   | Decaimiento exponencial      | No             | No implementado |
| Por Área               | Tareas en un área específica   | Decaimiento exponencial      | No             | No implementado |
| Por Grupo (Empresarial)| Tareas dentro de un grupo      | Decaimiento o promedio simple| Sí             | No implementado |

### **📊 Reputación en Grupos (Planificada)**
En Astren, cada grupo manejará dos tipos de reputación:

**Reputación individual en el grupo**: Cada miembro del grupo tendrá una reputación específica basada únicamente en las tareas asignadas en ese grupo. Esta reputación podrá calcularse con decaimiento exponencial o promedio simple, según lo defina el administrador del grupo. *No implementado actualmente.*

**Reputación del grupo completo**: Será el promedio de las reputaciones individuales de todos los miembros. Representará el rendimiento global del grupo y podrá usarse para comparar equipos dentro de una empresa o institución. *No implementado actualmente.*

💡 Ambas métricas podrán visualizarse según la configuración del administrador del grupo.

💼 **Ventaja competitiva para empresas (Planificada)**  
El sistema de reputación empresarial permitirá control total: selección del modelo, uso de evidencias, calificación manual y ponderación diferenciada. Una herramienta de evaluación profesional poderosa. *No implementado actualmente.*

## ✅ Sistema de Tareas

### **4 Categorías Principales**
1. **Tareas Hoy** - Vencen hoy, pendientes
2. **Tareas Pendientes** - Futuras, no iniciadas
3. **Tareas Completadas** - Finalizadas con evidencia
4. **Tareas Vencidas** - Fuera de plazo

### **Estados de Tarea**
- **Pendiente** - No iniciada
- **En Progreso** - Iniciada
- **Completada** - Finalizada con evidencia
- **Vencida** - Fuera de plazo

### **Gestión de Evidencia**
- **Requerida** para tareas de trabajo/escuela
- **Tipos**: Imágenes, PDF, documentos
- **Validación** por supervisores
- **Indicadores visuales** de estado

## 👥 Gestión de Grupos

### **Funcionalidades**
- **Creación** con colores e iconos personalizables
- **Sistema de roles**: Líder, Administrador, Miembro
- **Invitar miembros** por email
- **Gestión de permisos** por rol
- **Tareas grupales** con asignación
- **Archivado** de grupos
- **Modelos de reputación** por grupo: las empresas podrán elegir entre cálculo con decaimiento (prioriza meses recientes) o promedio simple (valor igual para todas las tareas históricas) - *No implementado*

### **Roles y Permisos**
- **Líder**: Control total del grupo
- **Administrador**: Gestión de miembros y tareas
- **Miembro**: Participación en tareas

## 🎯 Navegación Inteligente

### **Dashboard**
- **Contadores clickeables** que enlazan a secciones específicas
- **Tareas individuales** enlazan a tareas específicas
- **Áreas y grupos** enlazan a páginas específicas
- **Progreso de reputación** enlaza a página de reputación (planificado)

### **Sistema de Hash**
- **Navegación por hash** (#today, #pending, #completed, #overdue)
- **Scroll automático** a secciones específicas
- **Resaltado visual** de secciones objetivo

## 📚 Documentación

### **Documentos Principales**
- **[Sistema de Reputación](docs/SISTEMA_REPUTACION_ASTREN.md)** - Especificación completa
- **[Sistema de Tareas](docs/TASK_MANAGEMENT_SYSTEM.md)** - Gestión de tareas
- **[Guía de Inicio](docs/INICIAR_ASTREN.md)** - Inicio rápido

### **Características del Sistema**
- **Modular** y fácil de mantener
- **Escalable** para uso empresarial
- **Responsive** en todos los dispositivos
- **Accesible** con navegación intuitiva

## 🔧 Configuración

### **Variables de Entorno**
```bash
# backend/.env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=tu_password
DB_NAME=astren

# Parámetro de reputación (Planificado)
DECAY_FACTOR=0.9  # Podrá ser ajustado dinámicamente para modificar la influencia del historial

> Este valor podrá cambiarse con el tiempo según las necesidades del sistema, tal como los bancos ajustan las tasas de interés. *No implementado actualmente.*
```

### **Base de Datos**
- **MySQL** requerido
- **Scripts SQL** incluidos para configuración
- **Migraciones** automáticas

## 🚀 Roadmap

### **Fase 1 (Actual) ✅**
- Sistema básico de gestión de tareas
- Perfil personal funcional
- Métricas básicas
- Gestión de grupos y áreas

### **Fase 2 (Próxima) 🔄**
- Sistema de reputación básico con estrellas
- Sistema de decaimiento exponencial (factor 0.9)
- Reputación inicial de 5 estrellas
- Nivel de consolidación basado en antigüedad y racha
- Historial mensual de reputaciones
- Peso personalizado de tareas en grupos empresariales

### **Fase 3 (Futuro) 📋**
- Modelos de cálculo configurables por grupo
- Sistema de evidencias para empresas
- Calificación manual por supervisores
- Plan empresarial completo con funcionalidades avanzadas

### **Fase 4 (Largo Plazo) 🌐**
- Perfiles públicos con reputación
- Rankings por área/industria
- IA integrada para análisis predictivo
- Reportes ejecutivos avanzados
- **Evolución hacia modelos predictivos** y reputacionales personalizados usando IA, aprovechando el historial y nivel de consolidación

## 🎯 Objetivo

**Astren** está diseñado para convertirse en el **estándar global de medición de productividad**, proporcionando:

- **Sistema justo** con decaimiento exponencial y protección contra manipulación (planificado)
- **Motivación** para desarrollo personal con reputación inicial de 5 estrellas (planificado)
- **Escalabilidad** para uso empresarial con multiplicadores configurables (planificado)
- **Sostenibilidad** en términos de recursos con consolidación inteligente (planificado)
- **Flexibilidad** para futuras expansiones con modelos configurables (planificado)
- **DECAY_FACTOR configurable**: ajustable como las tasas bancarias, para dar más o menos peso al historial (planificado)

---

**🌟 Este sistema con decaimiento exponencial y consolidación inteligente sentará las bases para convertir Astren en el estándar global de medición de productividad.**

---

📄 **Documento actualizado por última vez**: 27 de Agosto de 2025  
🧩 **Versión del sistema**: v0.0.6 (Demo) - Sistema básico funcional 