// Sistema de Notificaciones Completo y Robusto de Astren
class NotificationManager {
    constructor() {
        this.notifications = this.loadNotifications();
        this.currentFilter = 'all';
        this.page = 1;
        this.itemsPerPage = 10;
        this.searchQuery = '';
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.renderNotifications();
        this.updateCounts();
        this.setupGlobalEvents();
        console.log('🔔 Notification Manager inicializado con', this.notifications.length, 'notificaciones');
    }

    loadNotifications() {
        const savedNotifications = localStorage.getItem('astren_notifications');
        if (savedNotifications) {
            try {
                return JSON.parse(savedNotifications);
            } catch (e) {
                console.error('Error parsing notifications:', e);
                return this.getDefaultNotifications();
            }
        }
        return this.getDefaultNotifications();
    }

    getDefaultNotifications() {
        return [
            {
                id: 1,
                type: 'task',
                title: 'Nueva tarea asignada',
                message: 'Se te ha asignado la tarea "Revisar propuesta de cliente"',
                read: false,
                timestamp: new Date(Date.now() - 1000 * 60 * 30).getTime(),
                data: { taskId: 123, area: 'work' }
            },
            {
                id: 2,
                type: 'group',
                title: 'Invitación a grupo',
                message: 'Has sido invitado al grupo "Equipo Desarrollo"',
                read: false,
                timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).getTime(),
                data: { groupId: 456, groupName: 'Equipo Desarrollo' }
            },
            {
                id: 3,
                type: 'reputation',
                title: 'Reputación mejorada',
                message: 'Tu reputación ha aumentado a 4.5 estrellas',
                read: true,
                timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).getTime(),
                data: { oldRating: 4.3, newRating: 4.5 }
            },
            {
                id: 4,
                type: 'task',
                title: 'Tarea completada',
                message: 'La tarea "Presentación proyecto final" ha sido marcada como completada',
                read: true,
                timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).getTime(),
                data: { taskId: 789, completedBy: 'Ana García' }
            },
            {
                id: 5,
                type: 'group',
                title: 'Nuevo miembro en grupo',
                message: 'Carlos López se ha unido al grupo "Equipo Marketing"',
                read: true,
                timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).getTime(),
                data: { groupId: 789, memberName: 'Carlos López' }
            },
            {
                id: 6,
                type: 'task',
                title: 'Recordatorio de fecha límite',
                message: 'La tarea "Revisar código" vence en 2 horas',
                read: false,
                timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4).getTime(),
                data: { taskId: 101, dueIn: '2 horas' }
            },
            {
                id: 7,
                type: 'reputation',
                title: 'Evidencia validada',
                message: 'La evidencia de tu tarea "Diseño de interfaz" ha sido validada',
                read: true,
                timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4).getTime(),
                data: { taskId: 202, validator: 'María Rodríguez' }
            },
            {
                id: 8,
                type: 'group',
                title: 'Actividad en grupo',
                message: 'Se han completado 3 tareas en el grupo "Equipo Diseño"',
                read: true,
                timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).getTime(),
                data: { groupId: 303, completedTasks: 3 }
            }
        ];
    }

    saveNotifications() {
        try {
            localStorage.setItem('astren_notifications', JSON.stringify(this.notifications));
        } catch (e) {
            console.error('Error saving notifications:', e);
        }
    }

    setupEventListeners() {
        this.setupFilters();
        this.setupSearch();
        this.setupActionButtons();
        this.setupNotificationActions();
    }

    setupFilters() {
        const filterTabs = document.querySelectorAll('.filter-tab');
        filterTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                filterTabs.forEach(t => t.classList.remove('filter-tab--active'));
                tab.classList.add('filter-tab--active');
                this.currentFilter = tab.dataset.filter;
                this.page = 1;
                this.renderNotifications();
                this.updateCounts();
            });
        });
    }

    setupSearch() {
        const searchInput = document.querySelector('.search__input');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.searchQuery = e.target.value.toLowerCase();
                this.page = 1;
                this.renderNotifications();
            });
        }
    }

    setupActionButtons() {
        const loadMoreBtn = document.getElementById('load-more-btn');
        if (loadMoreBtn) {
            loadMoreBtn.addEventListener('click', () => this.loadMore());
        }

        // Settings button if exists
        const settingsBtn = document.getElementById('notification-settings-btn');
        if (settingsBtn) {
            settingsBtn.addEventListener('click', () => this.showSettingsModal());
        }
    }

    setupNotificationActions() {
        document.addEventListener('click', (e) => {
            const notificationItem = e.target.closest('.notification-item');
            if (!notificationItem) return;

            const notificationId = parseInt(notificationItem.dataset.notificationId);
            
            if (e.target.closest('.notification__action--read')) {
                this.markAsRead(notificationId);
            } else if (e.target.closest('.notification__action--delete')) {
                this.deleteNotification(notificationId);
            } else if (!notificationItem.classList.contains('notification-item--read')) {
                this.markAsRead(notificationId);
            }
        });
    }

    setupGlobalEvents() {
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.hideAllModals();
            }
        });

        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                this.hideAllModals();
            }
        });
    }

    renderNotifications() {
        const container = document.getElementById('notifications-list');
        const emptyState = document.getElementById('notifications-empty');
        
        if (!container) return;

        let filteredNotifications = this.getFilteredNotifications();
        const startIndex = (this.page - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        const paginatedNotifications = filteredNotifications.slice(startIndex, endIndex);

        if (paginatedNotifications.length === 0) {
            container.innerHTML = '';
            if (emptyState) {
                emptyState.style.display = 'block';
            }
            return;
        }

        if (emptyState) {
            emptyState.style.display = 'none';
        }

        const notificationsHTML = paginatedNotifications.map(notification => 
            this.createNotificationCard(notification)
        ).join('');

        if (this.page === 1) {
            container.innerHTML = notificationsHTML;
        } else {
            container.insertAdjacentHTML('beforeend', notificationsHTML);
        }

        this.updateLoadMoreButton(filteredNotifications.length);
    }

    getFilteredNotifications() {
        let filtered = [...this.notifications];

        // Apply search filter
        if (this.searchQuery) {
            filtered = filtered.filter(n => 
                n.title.toLowerCase().includes(this.searchQuery) ||
                n.message.toLowerCase().includes(this.searchQuery)
            );
        }

        // Apply type filter
        switch (this.currentFilter) {
            case 'unread':
                filtered = filtered.filter(n => !n.read);
                break;
            case 'tasks':
                filtered = filtered.filter(n => n.type === 'task');
                break;
            case 'groups':
                filtered = filtered.filter(n => n.type === 'group');
                break;
            case 'reputation':
                filtered = filtered.filter(n => n.type === 'reputation');
                break;
        }

        return filtered.sort((a, b) => b.timestamp - a.timestamp);
    }

    createNotificationCard(notification) {
        const timeAgo = this.getTimeAgo(notification.timestamp);
        const icon = this.getNotificationIcon(notification.type);
        const readClass = notification.read ? 'notification-item--read' : '';
        
        return `
            <div class="notification-item ${readClass}" data-notification-id="${notification.id}">
                <div class="notification__icon">
                    <i class="${icon}"></i>
                </div>
                <div class="notification__content">
                    <div class="notification__header">
                        <h4 class="notification__title">${this.escapeHtml(notification.title)}</h4>
                        <span class="notification__time">${timeAgo}</span>
                    </div>
                    <p class="notification__message">${this.escapeHtml(notification.message)}</p>
                    <div class="notification__actions">
                        ${!notification.read ? `
                            <button class="notification__action notification__action--read" title="Marcar como leída">
                                <i class="fas fa-check"></i>
                            </button>
                        ` : ''}
                        <button class="notification__action notification__action--delete" title="Eliminar">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    markAsRead(notificationId) {
        const notification = this.notifications.find(n => n.id === notificationId);
        if (notification && !notification.read) {
            notification.read = true;
            this.saveNotifications();
            this.renderNotifications();
            this.updateCounts();
            this.showToast('Notificación marcada como leída', 'success');
        }
    }

    markAllAsRead() {
        let hasChanges = false;
        this.notifications.forEach(notification => {
            if (!notification.read) {
                notification.read = true;
                hasChanges = true;
            }
        });

        if (hasChanges) {
            this.saveNotifications();
            this.renderNotifications();
            this.updateCounts();
            this.showToast('Todas las notificaciones marcadas como leídas', 'success');
        }
    }

    deleteNotification(notificationId) {
        const index = this.notifications.findIndex(n => n.id === notificationId);
        if (index !== -1) {
            this.notifications.splice(index, 1);
            this.saveNotifications();
            this.renderNotifications();
            this.updateCounts();
            this.showToast('Notificación eliminada', 'info');
        }
    }

    loadMore() {
        this.page++;
        this.renderNotifications();
    }

    updateCounts() {
        const counts = {
            all: this.notifications.length,
            unread: this.notifications.filter(n => !n.read).length,
            tasks: this.notifications.filter(n => n.type === 'task').length,
            groups: this.notifications.filter(n => n.type === 'group').length,
            reputation: this.notifications.filter(n => n.type === 'reputation').length
        };

        // Update tab counts
        Object.keys(counts).forEach(filter => {
            const tab = document.querySelector(`[data-filter="${filter}"]`);
            if (tab) {
                const countElement = tab.querySelector('.tab__count');
                if (countElement) {
                    countElement.textContent = counts[filter];
                }
            }
        });

        // Update header notification badge
        const headerBadge = document.querySelector('.notification__badge');
        if (headerBadge) {
            headerBadge.textContent = counts.unread;
            headerBadge.style.display = counts.unread > 0 ? 'block' : 'none';
        }
    }

    updateLoadMoreButton(totalFilteredCount) {
        const loadMoreBtn = document.getElementById('load-more-btn');
        if (loadMoreBtn) {
            const currentShown = this.page * this.itemsPerPage;
            if (currentShown >= totalFilteredCount) {
                loadMoreBtn.style.display = 'none';
            } else {
                loadMoreBtn.style.display = 'block';
                loadMoreBtn.textContent = `Cargar más (${Math.min(this.itemsPerPage, totalFilteredCount - currentShown)} restantes)`;
            }
        }
    }

    getNotificationIcon(type) {
        const icons = {
            task: 'fas fa-tasks',
            group: 'fas fa-users',
            reputation: 'fas fa-star',
            system: 'fas fa-cog',
            warning: 'fas fa-exclamation-triangle',
            success: 'fas fa-check-circle'
        };
        return icons[type] || 'fas fa-bell';
    }

    getTimeAgo(timestamp) {
        const now = Date.now();
        const diff = now - timestamp;
        
        const minutes = Math.floor(diff / (1000 * 60));
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        
        if (minutes < 1) return 'Ahora mismo';
        if (minutes < 60) return `Hace ${minutes} min`;
        if (hours < 24) return `Hace ${hours} h`;
        if (days < 7) return `Hace ${days} días`;
        
        return new Date(timestamp).toLocaleDateString('es-ES');
    }

    showSettingsModal() {
        const modal = document.getElementById('notification-settings-modal');
        if (modal) {
            modal.style.display = 'flex';
        }
    }

    hideAllModals() {
        const modals = document.querySelectorAll('.modal');
        modals.forEach(modal => {
            modal.style.display = 'none';
        });
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast toast--${type}`;
        toast.innerHTML = `
            <i class="${this.getToastIcon(type)}"></i>
            <span>${this.escapeHtml(message)}</span>
        `;

        // Add toast styles if not already present
        if (!document.getElementById('toast-styles')) {
            const style = document.createElement('style');
            style.id = 'toast-styles';
            style.textContent = `
                .toast {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    background: white;
                    border: 1px solid #e1e5e9;
                    border-radius: 8px;
                    padding: 12px 16px;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    z-index: 10000;
                    animation: slideInRight 0.3s ease-out;
                    max-width: 300px;
                }
                .toast--success { border-left: 4px solid #10b981; }
                .toast--error { border-left: 4px solid #ef4444; }
                .toast--warning { border-left: 4px solid #f59e0b; }
                .toast--info { border-left: 4px solid #3b82f6; }
                @keyframes slideInRight {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
            `;
            document.head.appendChild(style);
        }

        document.body.appendChild(toast);

        setTimeout(() => {
            toast.remove();
        }, 3000);
    }

    getToastIcon(type) {
        const icons = {
            success: 'fas fa-check-circle',
            error: 'fas fa-exclamation-circle',
            warning: 'fas fa-exclamation-triangle',
            info: 'fas fa-info-circle'
        };
        return icons[type] || 'fas fa-info-circle';
    }

    addNotification(type, title, message, data = {}) {
        const notification = {
            id: Date.now(),
            type,
            title,
            message,
            read: false,
            timestamp: Date.now(),
            data
        };

        this.notifications.unshift(notification);
        this.saveNotifications();
        this.renderNotifications();
        this.updateCounts();
        
        return notification;
    }

    getUnreadCount() {
        return this.notifications.filter(n => !n.read).length;
    }

    clearAll() {
        this.notifications = [];
        this.saveNotifications();
        this.renderNotifications();
        this.updateCounts();
        this.showToast('Todas las notificaciones eliminadas', 'info');
    }
}

// Global functions for modal interactions
function closeNotificationSettingsModal() {
    const modal = document.getElementById('notification-settings-modal');
    if (modal) {
        modal.style.display = 'none';
    }
}

function saveNotificationSettings() {
    // Get all form values
    const form = document.getElementById('notification-settings-form');
    if (form) {
        const formData = new FormData(form);
        const settings = {};
        
        // Process checkboxes
        const checkboxes = form.querySelectorAll('input[type="checkbox"]');
        checkboxes.forEach(checkbox => {
            settings[checkbox.id] = checkbox.checked;
        });
        
        // Process selects
        const selects = form.querySelectorAll('select');
        selects.forEach(select => {
            settings[select.id] = select.value;
        });
        
        // Save to localStorage
        localStorage.setItem('astren_notification_settings', JSON.stringify(settings));
        
        // Show success message
        if (window.notificationManager) {
            window.notificationManager.showToast('Configuración guardada exitosamente', 'success');
        }
        
        closeNotificationSettingsModal();
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    if (document.querySelector('.notifications__list')) {
        window.notificationManager = new NotificationManager();
    }
});

// Export for global access
if (typeof module !== 'undefined' && module.exports) {
    module.exports = NotificationManager;
} 