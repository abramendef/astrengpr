// Configuración centralizada para Astren
const CONFIG = {
    // URL del backend API - Detecta automáticamente el entorno
    // Considera local si se sirve en localhost, 127.0.0.1 o puerto 5500
    API_BASE_URL: (
        window.location.hostname === 'localhost' ||
        window.location.hostname === '127.0.0.1' ||
        window.location.port === '5500'
    )
        ? 'http://localhost:8000'
        : 'https://astren-backend.onrender.com',
    
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
        VERSION: '0.0.6'
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
    },

    // Flags de características (hotfix: desactivar cache-first)
    FEATURES: {
        CACHE_FIRST: false,
        AUTO_BOOTSTRAP: true,
        AUTO_BOOTSTRAP_INTERVAL_MS: 180000
    }
};

// Función helper para construir URLs completas
function buildApiUrl(endpoint, params = '') {
    return `${CONFIG.API_BASE_URL}${endpoint}${params}`;
}

// Helper unificado para obtener el userId del usuario actual de forma robusta
function getAstrenUserId() {
    try {
        const sessionUser = sessionStorage.getItem('astren_user');
        if (sessionUser) {
            const user = JSON.parse(sessionUser);
            if (user && (user.usuario_id || user.id)) return user.usuario_id || user.id;
        }
    } catch (e) {}

    const localId = localStorage.getItem('astren_usuario_id');
    if (localId) return localId;

    // Fallbacks legacy
    const ssId = sessionStorage.getItem('userId');
    if (ssId) return ssId;
    const lsId = localStorage.getItem('userId');
    if (lsId) return lsId;

    return null;
}

// Bootstrap: descargar todos los datos del usuario y guardarlos en localStorage
let _bootstrapPromise = null;
async function bootstrapUserData(force = false) {
    try {
        if (_bootstrapPromise && !force) return _bootstrapPromise;
        const userId = getAstrenUserId();
        if (!userId) return null;

        const headers = { cache: 'no-store' };
        _bootstrapPromise = Promise.all([
            // Tareas
            fetch(buildApiUrl(CONFIG.API_ENDPOINTS.TASKS, `/${userId}`), headers)
                .then(r => r.ok ? r.json() : [])
                .then(list => list.map(t => ({
                    ...t,
                    status: t.estado === 'pendiente' ? 'pending' :
                            t.estado === 'completada' ? 'completed' :
                            t.estado === 'vencida' ? 'overdue' : t.estado,
                    title: t.titulo || t.title,
                    dueDate: t.fecha_vencimiento || t.dueDate
                })))
                .then(tasks => { try { localStorage.setItem('astren_tasks', JSON.stringify(tasks)); } catch(_) {} }),

            // Áreas (lista simple que usa el dashboard)
            fetch(buildApiUrl(CONFIG.API_ENDPOINTS.AREAS, `/${userId}`), headers)
                .then(r => r.ok ? r.json() : [])
                .then(data => Array.isArray(data) ? data : (data.areas || []))
                .then(areas => { try { localStorage.setItem('astren_areas', JSON.stringify(areas)); } catch(_) {} }),

            // Grupos (lista simple que usa el dashboard)
            fetch(buildApiUrl(CONFIG.API_ENDPOINTS.GROUPS, `/${userId}`), headers)
                .then(r => r.ok ? r.json() : { grupos: [] })
                .then(data => data.grupos || [])
                .then(groups => { try { localStorage.setItem('astren_groups', JSON.stringify(groups)); } catch(_) {} }),

            // Grupos archivados (si existe)
            fetch(buildApiUrl(CONFIG.API_ENDPOINTS.GROUPS, `/${userId}/archivados`), headers)
                .then(r => r.ok ? r.json() : [])
                .then(groupsArchived => { try { localStorage.setItem('astren_groups_archived', JSON.stringify(groupsArchived)); } catch(_) {} })
                .catch(() => null)
        ]).then(() => {
            try { localStorage.setItem('astren_bootstrap_ts', Date.now().toString()); } catch(_) {}
            return true;
        }).finally(() => {
            _bootstrapPromise = null;
        });

        return _bootstrapPromise;
    } catch (e) {
        console.error('❌ Error en bootstrapUserData:', e);
        _bootstrapPromise = null;
        return null;
    }
}

// Exponer helpers globales
window.getAstrenUserId = getAstrenUserId;
window.bootstrapUserData = bootstrapUserData;

// Auto-bootstrap periódico: mantiene sincronizado el cache local con la BD
let _bootstrapIntervalId = null;
function startAutoBootstrap() {
    if (!CONFIG.FEATURES || !CONFIG.FEATURES.AUTO_BOOTSTRAP) return;
    if (_bootstrapIntervalId) return; // ya iniciado

    const tick = async () => {
        const userId = getAstrenUserId();
        if (!userId) return;
        if (typeof document !== 'undefined' && document.hidden) return;
        if (typeof window !== 'undefined') {
            const p = (window.location && window.location.pathname) || '';
            // Evitar refrescos pesados cuando el usuario está en listados grandes
            if (p.includes('tasks.html') || p.includes('groups.html')) return;
        }
        if (typeof navigator !== 'undefined' && navigator.onLine === false) return;
        try { await bootstrapUserData(false); } catch (e) { /* noop */ }
    };

    // Primer intento en segundo plano tras carga
    if (typeof window !== 'undefined') {
        // Ejecutar un primer tick suave
        setTimeout(tick, 1000);
        // Al volver a pestaña visible, refrescar
        window.addEventListener('visibilitychange', () => { if (!document.hidden) tick(); });
        // Al recuperar conexión, refrescar
        window.addEventListener('online', tick);
    }

    const intervalMs = (CONFIG.FEATURES.AUTO_BOOTSTRAP_INTERVAL_MS || 180000);
    _bootstrapIntervalId = setInterval(tick, intervalMs);
}

function stopAutoBootstrap() {
    if (_bootstrapIntervalId) {
        clearInterval(_bootstrapIntervalId);
        _bootstrapIntervalId = null;
    }
}

// Iniciar auto-bootstrap al cargar el script
try { startAutoBootstrap(); } catch (_) {}

// Exponer control global opcional
window.startAutoBootstrap = startAutoBootstrap;
window.stopAutoBootstrap = stopAutoBootstrap;

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