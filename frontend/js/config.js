// Configuración centralizada para Astren
const CONFIG = {
    // URL del backend API - Detecta automáticamente el entorno
    API_BASE_URL: window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
        ? 'http://localhost:8000' 
        : 'https://astren-backend.onrender.com', // Cambiar por tu URL real
    
    // URLs específicas de la API
    API_ENDPOINTS: {
        // Usuarios
        USERS: '/usuarios',
        LOGIN: '/login',
        REGISTER: '/usuarios',
        
        // Tareas
        TASKS: '/tareas',
        TASK_NOTES: '/task-notes',
        TASK_EVIDENCE: '/task-evidence',
        
        // Áreas
        AREAS: '/areas',
        
        // Grupos
        GROUPS: '/grupos',
        
        // Notificaciones
        NOTIFICATIONS: '/notificaciones',
        
        // Invitaciones
        INVITATIONS: '/invitaciones'
    },
    
    // Configuración de la aplicación
    APP: {
        NAME: 'Astren',
        VERSION: '2.4.0'
    },
    
    // Configuración de logging
    LOGGING: {
        // Niveles de log: 'debug', 'info', 'warn', 'error', 'none'
        LEVEL: 'info', // Cambiar a 'none' para desactivar logs en producción
        
        // Categorías de log que se pueden activar/desactivar
        CATEGORIES: {
            API: true,        // Logs de peticiones API
            NAVIGATION: true, // Logs de navegación
            UI: true,         // Logs de interfaz
            DEBUG: false,     // Logs de debug detallados
            PERFORMANCE: true // Logs de rendimiento
        }
    }
};

// Función helper para construir URLs completas
function buildApiUrl(endpoint, params = '') {
    return `${CONFIG.API_BASE_URL}${endpoint}${params}`;
}

// Función helper para hacer peticiones a la API
async function apiRequest(url, options = {}) {
    const defaultOptions = {
        headers: {
            'Content-Type': 'application/json',
        },
        ...options
    };
    
    try {
        const response = await fetch(url, defaultOptions);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error('Error en petición API:', error);
        throw error;
    }
}

// Sistema de logging centralizado
const Logger = {
    levels: {
        debug: 0,
        info: 1,
        warn: 2,
        error: 3,
        none: 4
    },
    
    currentLevel: CONFIG.LOGGING.LEVEL,
    
    shouldLog(level, category = 'DEBUG') {
        if (this.levels[this.currentLevel] > this.levels[level]) {
            return false;
        }
        
        if (category !== 'DEBUG' && !CONFIG.LOGGING.CATEGORIES[category]) {
            return false;
        }
        
        return true;
    },
    
    log(level, message, data = null, category = 'DEBUG') {
        if (!this.shouldLog(level, category)) return;
        
        const timestamp = new Date().toLocaleTimeString();
        const prefix = `[${timestamp}] [${level.toUpperCase()}]`;
        
        if (data) {
            console.log(`${prefix} ${message}`, data);
        } else {
            console.log(`${prefix} ${message}`);
        }
    },
    
    debug(message, data = null, category = 'DEBUG') {
        this.log('debug', message, data, category);
    },
    
    info(message, data = null, category = 'DEBUG') {
        this.log('info', message, data, category);
    },
    
    warn(message, data = null, category = 'DEBUG') {
        this.log('warn', message, data, category);
    },
    
    error(message, data = null, category = 'DEBUG') {
        this.log('error', message, data, category);
    }
}; 