/*===== HEADER BUTTONS MANAGER FOR ASTREN DASHBOARD =====*/

class HeaderButtonsManager {
    constructor() {
        this.mobileMenuBtn = null;
        this.searchBtn = null;
        this.notificationsBtn = null;
        this.profileBtn = null;
        this.isInitialized = false;
        this.init();
    }

    init() {
        if (this.isInitialized) return;
        
        this.findButtons();
        this.setupEventListeners();
        this.updateBadges();
        
        this.isInitialized = true;
        console.log('Header buttons manager initialized');
    }

    findButtons() {
        this.mobileMenuBtn = document.getElementById('mobileMenuBtn');
        this.searchBtn = document.getElementById('searchBtn');
        this.notificationsBtn = document.getElementById('notificationsBtn');
        this.profileBtn = document.getElementById('profileBtn');
    }

    setupEventListeners() {
        // Mobile menu button
        if (this.mobileMenuBtn) {
            this.mobileMenuBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.toggleMobileMenu();
            });
        }

        // Search button
        if (this.searchBtn) {
            this.searchBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.toggleSearch();
            });
        }

        // Notifications button
        if (this.notificationsBtn) {
            this.notificationsBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.toggleNotifications();
            });
        }

        // Profile button
        if (this.profileBtn) {
            this.profileBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.toggleProfileMenu();
            });
        }

        // Close dropdowns when clicking outside
        document.addEventListener('click', (e) => {
            this.handleOutsideClick(e);
        });

        // Handle escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeAllDropdowns();
            }
        });
    }

    toggleMobileMenu() {
        if (window.sidebarManager) {
            window.sidebarManager.toggleSidebar();
        } else {
            // Fallback if sidebar manager is not available
            const sidebar = document.getElementById('sidebar');
            if (sidebar) {
                sidebar.classList.toggle('sidebar--open');
            }
        }

        // Track event
        if (window.AstrenApp && window.AstrenApp.Analytics) {
            window.AstrenApp.Analytics.trackEvent('Navigation', 'Mobile Menu Toggle');
        }
    }

    toggleSearch() {
        const searchDropdown = document.getElementById('searchDropdown');
        if (searchDropdown) {
            const isVisible = searchDropdown.classList.contains('show');
            
            if (isVisible) {
                this.closeSearch();
            } else {
                this.openSearch();
            }
        } else {
            this.createSearchDropdown();
        }
    }

    createSearchDropdown() {
        const searchHTML = `
            <div id="searchDropdown" class="header-dropdown search-dropdown">
                <div class="search-container">
                    <div class="search-input-wrapper">
                        <i class="fas fa-search search-icon"></i>
                        <input type="text" id="searchInput" class="search-input" placeholder="Buscar tareas, áreas, grupos..." aria-label="Buscar">
                        <button type="button" class="search-clear" id="searchClear" aria-label="Limpiar búsqueda">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="search-results" id="searchResults">
                        <div class="search-placeholder">
                            <i class="fas fa-search"></i>
                            <p>Escribe para buscar...</p>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Insert after header
        const header = document.querySelector('.header');
        if (header) {
            header.insertAdjacentHTML('afterend', searchHTML);
        }

        // Setup search functionality
        this.setupSearchFunctionality();
        this.openSearch();
    }

    setupSearchFunctionality() {
        const searchInput = document.getElementById('searchInput');
        const searchClear = document.getElementById('searchClear');
        const searchResults = document.getElementById('searchResults');

        if (searchInput) {
            // Debounced search
            let searchTimeout;
            searchInput.addEventListener('input', (e) => {
                clearTimeout(searchTimeout);
                searchTimeout = setTimeout(() => {
                    this.performSearch(e.target.value);
                }, 300);
            });

            // Handle enter key
            searchInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    this.handleSearchEnter(e.target.value);
                }
            });

            // Focus on open
            searchInput.focus();
        }

        if (searchClear) {
            searchClear.addEventListener('click', () => {
                this.clearSearch();
            });
        }
    }

    performSearch(query) {
        if (!query.trim()) {
            this.showSearchPlaceholder();
            return;
        }

        const results = this.searchAllData(query);
        this.displaySearchResults(results);
    }

    searchAllData(query) {
        const results = {
            tasks: [],
            areas: [],
            groups: [],
            notifications: []
        };

        try {
            // Search tasks
            const tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
            results.tasks = tasks.filter(task => 
                task.title.toLowerCase().includes(query.toLowerCase()) ||
                task.description.toLowerCase().includes(query.toLowerCase())
            ).slice(0, 3);

            // Search areas
            const areas = JSON.parse(localStorage.getItem('areas') || '[]');
            results.areas = areas.filter(area => 
                area.name.toLowerCase().includes(query.toLowerCase()) ||
                area.description.toLowerCase().includes(query.toLowerCase())
            ).slice(0, 2);

            // Search groups
            const groups = JSON.parse(localStorage.getItem('groups') || '[]');
            results.groups = groups.filter(group => 
                group.name.toLowerCase().includes(query.toLowerCase()) ||
                group.description.toLowerCase().includes(query.toLowerCase())
            ).slice(0, 2);

            // Search notifications
            const notifications = JSON.parse(localStorage.getItem('notifications') || '[]');
            results.notifications = notifications.filter(notification => 
                notification.title.toLowerCase().includes(query.toLowerCase()) ||
                notification.message.toLowerCase().includes(query.toLowerCase())
            ).slice(0, 2);

        } catch (e) {
            console.error('Error searching data:', e);
        }

        return results;
    }

    displaySearchResults(results) {
        const searchResults = document.getElementById('searchResults');
        if (!searchResults) return;

        const totalResults = results.tasks.length + results.areas.length + results.groups.length + results.notifications.length;

        if (totalResults === 0) {
            searchResults.innerHTML = `
                <div class="search-no-results">
                    <i class="fas fa-search"></i>
                    <p>No se encontraron resultados</p>
                </div>
            `;
            return;
        }

        let html = '';

        // Tasks
        if (results.tasks.length > 0) {
            html += '<div class="search-section"><h4>Tareas</h4>';
            results.tasks.forEach(task => {
                html += `
                    <div class="search-item" data-type="task" data-id="${task.id}">
                        <i class="fas fa-tasks"></i>
                        <div class="search-item-content">
                            <div class="search-item-title">${task.title}</div>
                            <div class="search-item-subtitle">${task.area || 'Sin área'}</div>
                        </div>
                    </div>
                `;
            });
            html += '</div>';
        }

        // Areas
        if (results.areas.length > 0) {
            html += '<div class="search-section"><h4>Áreas</h4>';
            results.areas.forEach(area => {
                html += `
                    <div class="search-item" data-type="area" data-id="${area.id}">
                        <i class="fas fa-layer-group"></i>
                        <div class="search-item-content">
                            <div class="search-item-title">${area.name}</div>
                            <div class="search-item-subtitle">${area.description}</div>
                        </div>
                    </div>
                `;
            });
            html += '</div>';
        }

        // Groups
        if (results.groups.length > 0) {
            html += '<div class="search-section"><h4>Grupos</h4>';
            results.groups.forEach(group => {
                html += `
                    <div class="search-item" data-type="group" data-id="${group.id}">
                        <i class="fas fa-users"></i>
                        <div class="search-item-content">
                            <div class="search-item-title">${group.name}</div>
                            <div class="search-item-subtitle">${group.description}</div>
                        </div>
                    </div>
                `;
            });
            html += '</div>';
        }

        // Notifications
        if (results.notifications.length > 0) {
            html += '<div class="search-section"><h4>Notificaciones</h4>';
            results.notifications.forEach(notification => {
                html += `
                    <div class="search-item" data-type="notification" data-id="${notification.id}">
                        <i class="fas fa-bell"></i>
                        <div class="search-item-content">
                            <div class="search-item-title">${notification.title}</div>
                            <div class="search-item-subtitle">${notification.message}</div>
                        </div>
                    </div>
                `;
            });
            html += '</div>';
        }

        searchResults.innerHTML = html;

        // Add click handlers to search items
        searchResults.querySelectorAll('.search-item').forEach(item => {
            item.addEventListener('click', () => {
                this.handleSearchItemClick(item);
            });
        });
    }

    handleSearchItemClick(item) {
        const type = item.getAttribute('data-type');
        const id = item.getAttribute('data-id');

        // Navigate to appropriate page
        switch (type) {
            case 'task':
                window.location.href = `tasks.html?task=${id}`;
                break;
            case 'area':
                window.location.href = `areas.html?area=${id}`;
                break;
            case 'group':
                window.location.href = `groups.html?group=${id}`;
                break;
            case 'notification':
                window.location.href = `notifications.html?notification=${id}`;
                break;
        }

        this.closeSearch();
    }

    handleSearchEnter(query) {
        // Eliminado trigger secreto para evitar conflicto
        if (query.trim()) {
            // Navigate to search results page or perform action
            console.log('Searching for:', query);
            this.closeSearch();
        }
    }

    showSearchPlaceholder() {
        const searchResults = document.getElementById('searchResults');
        if (searchResults) {
            searchResults.innerHTML = `
                <div class="search-placeholder">
                    <i class="fas fa-search"></i>
                    <p>Escribe para buscar...</p>
                </div>
            `;
        }
    }

    clearSearch() {
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.value = '';
            searchInput.focus();
            this.showSearchPlaceholder();
        }
    }

    openSearch() {
        const searchDropdown = document.getElementById('searchDropdown');
        if (searchDropdown) {
            searchDropdown.classList.add('show');
            const searchInput = document.getElementById('searchInput');
            if (searchInput) {
                searchInput.focus();
            }
        }
    }

    closeSearch() {
        const searchDropdown = document.getElementById('searchDropdown');
        if (searchDropdown) {
            searchDropdown.classList.remove('show');
        }
    }

    toggleNotifications() {
        const notificationsDropdown = document.getElementById('notificationsDropdown');
        if (notificationsDropdown) {
            const isVisible = notificationsDropdown.classList.contains('show');
            
            if (isVisible) {
                this.closeNotifications();
            } else {
                this.openNotifications();
            }
        } else {
            this.createNotificationsDropdown();
        }
    }

    createNotificationsDropdown() {
        const notificationsHTML = `
            <div id="notificationsDropdown" class="header-dropdown notifications-dropdown">
                <div class="notifications-header">
                    <h3>Notificaciones</h3>
                    <button type="button" class="mark-all-read" id="markAllRead">
                        Marcar todas como leídas
                    </button>
                </div>
                <div class="notifications-list" id="notificationsList">
                    <div class="loading-notifications">
                        <i class="fas fa-spinner fa-spin"></i>
                        <p>Cargando notificaciones...</p>
                    </div>
                </div>
                <div class="notifications-footer">
                    <a href="notifications.html" class="view-all-notifications">
                        Ver todas las notificaciones
                    </a>
                </div>
            </div>
        `;

        // Insert after header
        const header = document.querySelector('.header');
        if (header) {
            header.insertAdjacentHTML('afterend', notificationsHTML);
        }

        this.loadNotifications();
        this.openNotifications();
    }

    loadNotifications() {
        const notificationsList = document.getElementById('notificationsList');
        if (!notificationsList) return;

        try {
            const notifications = JSON.parse(localStorage.getItem('notifications') || '[]');
            const recentNotifications = notifications.slice(0, 5);

            if (recentNotifications.length === 0) {
                notificationsList.innerHTML = `
                    <div class="no-notifications">
                        <i class="fas fa-bell-slash"></i>
                        <p>No hay notificaciones</p>
                    </div>
                `;
                return;
            }

            let html = '';
            recentNotifications.forEach(notification => {
                const isRead = notification.read ? 'read' : 'unread';
                html += `
                    <div class="notification-item ${isRead}" data-id="${notification.id}">
                        <div class="notification-icon">
                            <i class="fas ${this.getNotificationIcon(notification.type)}"></i>
                        </div>
                        <div class="notification-content">
                            <div class="notification-title">${notification.title}</div>
                            <div class="notification-message">${notification.message}</div>
                            <div class="notification-time">${this.formatTime(notification.createdAt)}</div>
                        </div>
                        <button type="button" class="notification-close" data-id="${notification.id}">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                `;
            });

            notificationsList.innerHTML = html;

            // Add event listeners
            this.setupNotificationEventListeners();

        } catch (e) {
            console.error('Error loading notifications:', e);
            notificationsList.innerHTML = `
                <div class="error-notifications">
                    <i class="fas fa-exclamation-triangle"></i>
                    <p>Error al cargar notificaciones</p>
                </div>
            `;
        }
    }

    setupNotificationEventListeners() {
        // Mark all as read
        const markAllRead = document.getElementById('markAllRead');
        if (markAllRead) {
            markAllRead.addEventListener('click', () => {
                this.markAllNotificationsAsRead();
            });
        }

        // Individual notification clicks
        document.querySelectorAll('.notification-item').forEach(item => {
            item.addEventListener('click', (e) => {
                if (!e.target.closest('.notification-close')) {
                    this.handleNotificationClick(item);
                }
            });
        });

        // Close notification buttons
        document.querySelectorAll('.notification-close').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.deleteNotification(btn.getAttribute('data-id'));
            });
        });
    }

    handleNotificationClick(notificationItem) {
        const notificationId = notificationItem.getAttribute('data-id');
        
        // Mark as read
        this.markNotificationAsRead(notificationId);
        
        // Navigate to appropriate page based on notification type
        // This would depend on the notification content
        console.log('Notification clicked:', notificationId);
    }

    markNotificationAsRead(notificationId) {
        try {
            const notifications = JSON.parse(localStorage.getItem('notifications') || '[]');
            const notification = notifications.find(n => n.id === notificationId);
            
            if (notification) {
                notification.read = true;
                localStorage.setItem('notifications', JSON.stringify(notifications));
                
                // Update UI
                const notificationItem = document.querySelector(`[data-id="${notificationId}"]`);
                if (notificationItem) {
                    notificationItem.classList.remove('unread');
                    notificationItem.classList.add('read');
                }
                
                // Update badge
                this.updateBadges();
            }
        } catch (e) {
            console.error('Error marking notification as read:', e);
        }
    }

    markAllNotificationsAsRead() {
        try {
            const notifications = JSON.parse(localStorage.getItem('notifications') || '[]');
            notifications.forEach(notification => {
                notification.read = true;
            });
            
            localStorage.setItem('notifications', JSON.stringify(notifications));
            
            // Update UI
            document.querySelectorAll('.notification-item').forEach(item => {
                item.classList.remove('unread');
                item.classList.add('read');
            });
            
            // Update badge
            this.updateBadges();
            
        } catch (e) {
            console.error('Error marking all notifications as read:', e);
        }
    }

    deleteNotification(notificationId) {
        try {
            const notifications = JSON.parse(localStorage.getItem('notifications') || '[]');
            const filteredNotifications = notifications.filter(n => n.id !== notificationId);
            
            localStorage.setItem('notifications', JSON.stringify(filteredNotifications));
            
            // Remove from UI
            const notificationItem = document.querySelector(`[data-id="${notificationId}"]`);
            if (notificationItem) {
                notificationItem.remove();
            }
            
            // Update badge
            this.updateBadges();
            
        } catch (e) {
            console.error('Error deleting notification:', e);
        }
    }

    openNotifications() {
        const notificationsDropdown = document.getElementById('notificationsDropdown');
        if (notificationsDropdown) {
            notificationsDropdown.classList.add('show');
        }
    }

    closeNotifications() {
        const notificationsDropdown = document.getElementById('notificationsDropdown');
        if (notificationsDropdown) {
            notificationsDropdown.classList.remove('show');
        }
    }

    toggleProfileMenu() {
        const profileDropdown = document.getElementById('profileDropdown');
        if (profileDropdown) {
            const isVisible = profileDropdown.classList.contains('show');
            
            if (isVisible) {
                this.closeProfileMenu();
            } else {
                this.openProfileMenu();
            }
        } else {
            this.createProfileDropdown();
        }
    }

    createProfileDropdown() {
        const profileHTML = `
            <div id="profileDropdown" class="header-dropdown profile-dropdown">
                <div class="profile-info">
                    <div class="profile-avatar">
                        <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='%233366FF'%3E%3Cpath fill-rule='evenodd' d='M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z' clip-rule='evenodd' /%3E%3C/svg%3E" alt="Avatar">
                    </div>
                    <div class="profile-details">
                        <div class="profile-name">${userName}</div>
                        <div class="profile-email">abraham@example.com</div>
                    </div>
                </div>
                <div class="profile-menu">
                    <a href="profile.html" class="profile-menu-item">
                        <i class="fas fa-user"></i>
                        Mi Perfil
                    </a>
                    <a href="settings.html" class="profile-menu-item">
                        <i class="fas fa-cog"></i>
                        Configuración
                    </a>
                    <div class="profile-divider"></div>
                    <button type="button" class="profile-menu-item" id="logoutBtn">
                        <i class="fas fa-sign-out-alt"></i>
                        Cerrar sesión
                    </button>
                </div>
            </div>
        `;

        // Insert after header
        const header = document.querySelector('.header');
        if (header) {
            header.insertAdjacentHTML('afterend', profileHTML);
        }

        // Setup logout functionality
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                this.handleLogout();
            });
        }

        this.openProfileMenu();
    }

    openProfileMenu() {
        const profileDropdown = document.getElementById('profileDropdown');
        if (profileDropdown) {
            profileDropdown.classList.add('show');
        }
    }

    closeProfileMenu() {
        const profileDropdown = document.getElementById('profileDropdown');
        if (profileDropdown) {
            profileDropdown.classList.remove('show');
        }
    }

    handleLogout() {
        if (confirm('¿Estás seguro de que quieres cerrar sesión?')) {
            // Limpiar todos los datos de usuario y recordarme
            localStorage.removeItem('astren_rememberMe');
            localStorage.removeItem('astren_email');
            localStorage.removeItem('astren_usuario_id');
            localStorage.removeItem('astren_nombre');
            localStorage.removeItem('astren_apellido');
            localStorage.removeItem('astren_correo');
            sessionStorage.clear();
            // Redirect to home page
            window.location.href = 'login.html';
            // Track logout
            if (window.AstrenApp && window.AstrenApp.Analytics) {
                window.AstrenApp.Analytics.trackEvent('Authentication', 'Logout', 'Header');
            }
        }
    }

    handleOutsideClick(event) {
        const searchDropdown = document.getElementById('searchDropdown');
        const notificationsDropdown = document.getElementById('notificationsDropdown');
        const profileDropdown = document.getElementById('profileDropdown');

        // Close search dropdown
        if (searchDropdown && !searchDropdown.contains(event.target) && 
            !this.searchBtn.contains(event.target)) {
            this.closeSearch();
        }

        // Close notifications dropdown
        if (notificationsDropdown && !notificationsDropdown.contains(event.target) && 
            !this.notificationsBtn.contains(event.target)) {
            this.closeNotifications();
        }

        // Close profile dropdown
        if (profileDropdown && !profileDropdown.contains(event.target) && 
            !this.profileBtn.contains(event.target)) {
            this.closeProfileMenu();
        }
    }

    closeAllDropdowns() {
        this.closeSearch();
        this.closeNotifications();
        this.closeProfileMenu();
    }

    updateBadges() {
        // Update notifications badge
        if (this.notificationsBtn) {
            const badge = this.notificationsBtn.querySelector('.header-badge');
            const count = this.getUnreadNotificationsCount();
            
            if (badge) {
                if (count > 0) {
                    badge.textContent = count > 99 ? '99+' : count;
                    badge.style.display = 'inline';
                } else {
                    badge.style.display = 'none';
                }
            }
        }
    }

    getUnreadNotificationsCount() {
        try {
            const notifications = JSON.parse(localStorage.getItem('notifications') || '[]');
            return notifications.filter(notification => !notification.read).length;
        } catch (e) {
            console.error('Error getting unread notifications count:', e);
            return 0;
        }
    }

    getNotificationIcon(type) {
        const iconMap = {
            'task': 'fa-tasks',
            'area': 'fa-layer-group',
            'group': 'fa-users',
            'reputation': 'fa-star',
            'system': 'fa-cog',
            'default': 'fa-bell'
        };
        return iconMap[type] || iconMap.default;
    }

    formatTime(timestamp) {
        const date = new Date(timestamp);
        const now = new Date();
        const diff = now - date;
        
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);
        
        if (minutes < 1) return 'Ahora';
        if (minutes < 60) return `Hace ${minutes} min`;
        if (hours < 24) return `Hace ${hours} h`;
        if (days < 7) return `Hace ${days} días`;
        
        return date.toLocaleDateString('es-ES');
    }

    // Public methods for external use
    refresh() {
        this.updateBadges();
    }

    destroy() {
        // Remove dropdowns
        const dropdowns = document.querySelectorAll('.header-dropdown');
        dropdowns.forEach(dropdown => {
            if (dropdown.parentNode) {
                dropdown.parentNode.removeChild(dropdown);
            }
        });
        
        this.isInitialized = false;
    }
}

/*===== GLOBAL HEADER BUTTONS INSTANCE =====*/
let globalHeaderButtons = null;

/*===== INITIALIZATION =====*/
document.addEventListener('DOMContentLoaded', () => {
    // Only initialize on dashboard pages
    const isDashboardPage = document.querySelector('.dashboard') || 
                           window.location.pathname.includes('dashboard') ||
                           window.location.pathname.includes('tasks') ||
                           window.location.pathname.includes('areas') ||
                           window.location.pathname.includes('groups') ||
                           window.location.pathname.includes('reputation') ||
                           window.location.pathname.includes('notifications') ||
                           window.location.pathname.includes('profile') ||
                           window.location.pathname.includes('settings');

    if (isDashboardPage) {
        globalHeaderButtons = new HeaderButtonsManager();
        
        // Make globally accessible
        window.headerButtonsManager = globalHeaderButtons;
    }
});

/*===== EXPORT FOR MODULE SYSTEMS =====*/
if (typeof module !== 'undefined' && module.exports) {
    module.exports = HeaderButtonsManager;
}

// === INICIO: Trigger secreto universal para inputs de búsqueda ===
// (Eliminado para evitar conflicto y redirección incorrecta)
// === FIN: Trigger secreto universal === 