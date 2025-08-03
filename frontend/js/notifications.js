// Sistema de Notificaciones - Astren
class NotificationManager {
    constructor() {
        this.userId = this.getUserId();
        this.notifications = [];
        this.unreadCount = 0;
        this.pollingInterval = null;
        this.init();
    }

    getUserId() {
        // Obtener el ID del usuario desde sessionStorage o localStorage
        const sessionUser = sessionStorage.getItem('currentUser');
        if (sessionUser) {
            const userData = JSON.parse(sessionUser);
            return userData.id;
        }
        
        const localUser = localStorage.getItem('astren_usuario_id');
        if (localUser) {
            return parseInt(localUser);
        }
        
        return null;
    }

    async init() {
        if (!this.userId) {
            console.error('❌ No se pudo obtener el ID del usuario para notificaciones');
            return;
        }

        this.setupNotificationButton();
        await this.loadNotifications();
        this.startPolling();
        console.log('🔔 Notification Manager inicializado para usuario:', this.userId);
    }

    setupNotificationButton() {
        // Buscar el botón de notificaciones en el header
        const notificationBtn = document.querySelector('.header__notification');
        if (notificationBtn) {
            notificationBtn.addEventListener('click', () => this.toggleNotificationPanel());
            this.updateNotificationBadge();
        }
    }

    async loadNotifications() {
        try {
            Logger.info('Cargando notificaciones', null, 'API');
            const response = await fetch(buildApiUrl(CONFIG.API_ENDPOINTS.NOTIFICATIONS, `/${this.userId}`));
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            this.notifications = await response.json();
            Logger.info(`Notificaciones cargadas: ${this.notifications.length}`, null, 'API');
            
            // Contar no leídas
            this.unreadCount = this.notifications.filter(n => !n.leida).length;
            this.updateNotificationBadge();
            
        } catch (error) {
            Logger.error('Error al cargar notificaciones', error, 'API');
        }
    }

    async loadUnreadCount() {
        try {
            const response = await fetch(buildApiUrl(CONFIG.API_ENDPOINTS.NOTIFICATIONS, `/${this.userId}/contar-no-leidas`));
            if (response.ok) {
                const data = await response.json();
                this.unreadCount = data.count;
                this.updateNotificationBadge();
            }
        } catch (error) {
            Logger.error('Error al cargar contador de notificaciones', error, 'API');
        }
    }

    updateNotificationBadge() {
        const notificationBtn = document.querySelector('.header__notification');
        if (!notificationBtn) return;

        let badge = notificationBtn.querySelector('.notification__badge');
        
        if (this.unreadCount > 0) {
            if (!badge) {
                badge = document.createElement('span');
                badge.className = 'notification__badge';
                notificationBtn.appendChild(badge);
            }
            badge.textContent = this.unreadCount > 99 ? '99+' : this.unreadCount;
            badge.style.display = 'block';
        } else {
            if (badge) {
                badge.style.display = 'none';
            }
        }
    }

    toggleNotificationPanel() {
        const panel = document.getElementById('notificationPanel');
        if (panel) {
            if (panel.style.display === 'none' || !panel.style.display) {
                this.showNotificationPanel();
            } else {
                this.hideNotificationPanel();
            }
        } else {
            this.createNotificationPanel();
        }
    }

    createNotificationPanel() {
        // Crear el panel de notificaciones
        const panel = document.createElement('div');
        panel.id = 'notificationPanel';
        panel.className = 'notification-panel';
        panel.innerHTML = `
            <div class="notification-panel__header">
                <h3>Notificaciones</h3>
                <div class="notification-panel__actions">
                    <button class="notification-action" id="markAllReadBtn" title="Marcar todas como leídas">
                        <i class="fas fa-check-double"></i>
                    </button>
                    <button class="notification-action" id="closeNotificationPanel" title="Cerrar">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            </div>
            <div class="notification-panel__content" id="notificationList">
                <!-- Las notificaciones se cargarán aquí -->
            </div>
            <div class="notification-panel__empty" id="notificationEmpty" style="display: none;">
                <i class="fas fa-bell-slash"></i>
                <p>No hay notificaciones</p>
            </div>
        `;

        document.body.appendChild(panel);

        // Event listeners
        const closeBtn = panel.querySelector('#closeNotificationPanel');
        const markAllReadBtn = panel.querySelector('#markAllReadBtn');

        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.hideNotificationPanel());
        }

        if (markAllReadBtn) {
            markAllReadBtn.addEventListener('click', () => this.markAllAsRead());
        }

        // Click fuera para cerrar
        document.addEventListener('click', (e) => {
            if (!panel.contains(e.target) && !e.target.closest('.header__notification')) {
                this.hideNotificationPanel();
            }
        });

        this.showNotificationPanel();
    }

    showNotificationPanel() {
        const panel = document.getElementById('notificationPanel');
        if (panel) {
            panel.style.display = 'block';
            this.renderNotifications();
        }
    }

    hideNotificationPanel() {
        const panel = document.getElementById('notificationPanel');
        if (panel) {
            panel.style.display = 'none';
        }
    }

    renderNotifications() {
        const notificationList = document.getElementById('notificationList');
        const notificationEmpty = document.getElementById('notificationEmpty');
        
        if (!notificationList) return;

        if (this.notifications.length === 0) {
            notificationList.innerHTML = '';
            if (notificationEmpty) {
                notificationEmpty.style.display = 'block';
            }
        } else {
            notificationList.innerHTML = this.notifications.map(notification => 
                this.createNotificationItem(notification)
            ).join('');
            
            if (notificationEmpty) {
                notificationEmpty.style.display = 'none';
            }

            // Add event listeners
            this.setupNotificationEventListeners();
        }
    }

    createNotificationItem(notification) {
        const isUnread = !notification.leida;
        const timeAgo = this.getTimeAgo(notification.fecha_creacion);
        const icon = this.getNotificationIcon(notification.tipo);
        
        return `
            <div class="notification-item ${isUnread ? 'notification-item--unread' : ''}" data-notification-id="${notification.id}">
                <div class="notification-item__icon">
                    <i class="fas ${icon}"></i>
                </div>
                <div class="notification-item__content">
                    <h4 class="notification-item__title">${this.escapeHtml(notification.titulo)}</h4>
                    <p class="notification-item__message">${this.escapeHtml(notification.mensaje)}</p>
                    <span class="notification-item__time">${timeAgo}</span>
                    </div>
                <div class="notification-item__actions">
                    ${isUnread ? `
                        <button class="notification-action" title="Marcar como leída" data-action="mark-read">
                                <i class="fas fa-check"></i>
                            </button>
                        ` : ''}
                    <button class="notification-action notification-action--danger" title="Eliminar" data-action="delete">
                            <i class="fas fa-trash"></i>
                        </button>
                </div>
            </div>
        `;
    }

    setupNotificationEventListeners() {
        const notificationItems = document.querySelectorAll('.notification-item');
        notificationItems.forEach(item => {
            const actions = item.querySelectorAll('.notification-action');
            actions.forEach(action => {
                action.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const notificationId = parseInt(item.dataset.notificationId);
                    const actionType = action.dataset.action;
                    
                    this.handleNotificationAction(notificationId, actionType);
                });
            });

            // Click en la notificación para marcarla como leída
            item.addEventListener('click', () => {
                const notificationId = parseInt(item.dataset.notificationId);
                if (!item.classList.contains('notification-item--unread')) {
                    this.handleNotificationClick(notificationId);
                } else {
                    this.markAsRead(notificationId);
                }
            });
        });
    }

    handleNotificationAction(notificationId, actionType) {
        switch (actionType) {
            case 'mark-read':
                this.markAsRead(notificationId);
                break;
            case 'delete':
                this.deleteNotification(notificationId);
                break;
        }
    }

    handleNotificationClick(notificationId) {
        const notification = this.notifications.find(n => n.id === notificationId);
        if (!notification) return;

        // Manejar diferentes tipos de notificación
        switch (notification.tipo) {
            case 'grupo_invitacion':
            case 'grupo_rol_cambio':
                if (notification.datos_adicionales && notification.datos_adicionales.grupo_id) {
                    // Redirigir a la página de grupos
                    window.location.href = 'groups.html';
                }
                break;
            default:
                // Comportamiento por defecto
                break;
        }
    }

    async markAsRead(notificationId) {
        try {
            const response = await fetch(buildApiUrl(CONFIG.API_ENDPOINTS.NOTIFICATIONS, `/${notificationId}/leer`), {
                method: 'PUT'
            });

            if (response.ok) {
                // Actualizar estado local
                const notification = this.notifications.find(n => n.id === notificationId);
                if (notification) {
                    notification.leida = true;
                }
                
                this.unreadCount = Math.max(0, this.unreadCount - 1);
                this.updateNotificationBadge();
                this.renderNotifications();
            }
        } catch (error) {
            console.error('❌ Error al marcar notificación como leída:', error);
        }
    }

    async markAllAsRead() {
        try {
            const response = await fetch(buildApiUrl(CONFIG.API_ENDPOINTS.NOTIFICATIONS, `/${this.userId}/leer-todas`), {
                method: 'PUT'
            });

            if (response.ok) {
                // Actualizar estado local
                this.notifications.forEach(n => n.leida = true);
                this.unreadCount = 0;
                this.updateNotificationBadge();
            this.renderNotifications();
            }
        } catch (error) {
            console.error('❌ Error al marcar todas las notificaciones como leídas:', error);
        }
    }

    async deleteNotification(notificationId) {
        if (!confirm('¿Estás seguro de que quieres eliminar esta notificación?')) {
            return;
        }

        try {
            const response = await fetch(buildApiUrl(CONFIG.API_ENDPOINTS.NOTIFICATIONS, `/${notificationId}`), {
                method: 'DELETE'
            });

            if (response.ok) {
                // Remover de la lista local
                const notification = this.notifications.find(n => n.id === notificationId);
                if (notification && !notification.leida) {
                    this.unreadCount = Math.max(0, this.unreadCount - 1);
                }
                
                this.notifications = this.notifications.filter(n => n.id !== notificationId);
                this.updateNotificationBadge();
                this.renderNotifications();
            }
        } catch (error) {
            console.error('❌ Error al eliminar notificación:', error);
        }
    }

    getNotificationIcon(tipo) {
        const icons = {
            'grupo_invitacion': 'fa-user-plus',
            'grupo_rol_cambio': 'fa-user-edit',
            'grupo_removido': 'fa-user-minus',
            'tarea_asignada': 'fa-tasks'
        };
        return icons[tipo] || 'fa-bell';
    }

    getTimeAgo(fechaString) {
        const fecha = new Date(fechaString);
        const ahora = new Date();
        const diffMs = ahora - fecha;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Ahora mismo';
        if (diffMins < 60) return `Hace ${diffMins} min`;
        if (diffHours < 24) return `Hace ${diffHours} h`;
        if (diffDays < 7) return `Hace ${diffDays} días`;
        
        return fecha.toLocaleDateString();
    }

    startPolling() {
        // Actualizar notificaciones cada 30 segundos
        this.pollingInterval = setInterval(() => {
            this.loadUnreadCount();
        }, 30000);
    }

    stopPolling() {
        if (this.pollingInterval) {
            clearInterval(this.pollingInterval);
            this.pollingInterval = null;
        }
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Método para mostrar notificación toast
    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast toast--${type}`;
        toast.innerHTML = `
            <div class="toast__content">
            <span>${this.escapeHtml(message)}</span>
                <button class="toast__close">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;

        document.body.appendChild(toast);

        // Mostrar toast
        setTimeout(() => {
            toast.classList.add('toast--show');
        }, 100);

        // Event listener para cerrar
        const closeBtn = toast.querySelector('.toast__close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                toast.classList.remove('toast--show');
                setTimeout(() => {
                    if (document.body.contains(toast)) {
                        document.body.removeChild(toast);
                    }
                }, 300);
            });
        }

        // Auto cerrar después de 5 segundos
        setTimeout(() => {
            if (document.body.contains(toast)) {
                toast.classList.remove('toast--show');
                setTimeout(() => {
                    if (document.body.contains(toast)) {
                        document.body.removeChild(toast);
                    }
                }, 300);
            }
        }, 5000);
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    // Inicializar notification manager
    const notificationManager = new NotificationManager();
    
    // Hacer disponible globalmente
    window.notificationManager = notificationManager;
}); 