/*===== UNIFIED VERTICAL SIDEBAR SYSTEM FOR ASTREN DASHBOARD =====*/

class SidebarManager {
    constructor() {
        console.log('🔧 SidebarManager constructor iniciado');
        this.sidebar = null;
        this.overlay = null;
        this.isInitialized = false;
        this.isOpen = false;
        this.currentPage = this.getCurrentPage();
        console.log('📄 Página actual detectada:', this.currentPage);
        this.init();
    }

    init() {
        console.log('🚀 Iniciando SidebarManager...');
        if (this.isInitialized) {
            console.log('⚠️ Sidebar ya inicializado, saltando...');
            return;
        }
        
        console.log('🔨 Creando sidebar...');
        this.createSidebar();
        console.log('🎯 Configurando event listeners...');
        this.setupEventListeners();
        console.log('📍 Configurando enlace activo...');
        this.setActiveLink();
        console.log('📱 Configurando vista móvil...');
        this.handleMobileView();
        console.log('🏷️ Actualizando badges...');
        this.updateBadges();
        
        this.isInitialized = true;
        console.log('✅ Sidebar unificado inicializado correctamente');
    }

    getCurrentPage() {
        const path = window.location.pathname;
        const filename = path.split('/').pop() || 'index.html';
        console.log('🔍 Detectando página desde:', filename);
        
        const pageMap = {
            'dashboard.html': 'dashboard',
            'tasks.html': 'tasks',
            'areas.html': 'areas',
            'groups.html': 'groups',
            'reputation.html': 'reputation',
            'notifications.html': 'notifications',
            'profile.html': 'profile',
            'settings.html': 'settings'
        };

        const detectedPage = pageMap[filename] || 'dashboard';
        console.log('📋 Página mapeada a:', detectedPage);
        return detectedPage;
    }

    createSidebar() {
        console.log('🏗️ Creando elementos del sidebar...');
        
        // Create overlay
        this.overlay = document.createElement('div');
        this.overlay.className = 'sidebar-overlay';
        this.overlay.setAttribute('aria-hidden', 'true');
        document.body.appendChild(this.overlay);
        console.log('✅ Overlay creado');

        // Create sidebar HTML
        const sidebarHTML = `
            <aside class="sidebar" id="sidebar" role="navigation" aria-label="Navegación principal">
                <div class="sidebar__header">
                    <div class="sidebar__logo">
                        <img src="images/Astren_logo_hor.svg" alt="Astren" class="sidebar__logo-img">
                    </div>
                    <button class="sidebar__toggle" id="sidebarToggle" aria-label="Cerrar menú">
                        <i class="fas fa-times"></i>
                    </button>
                </div>

                <!-- User Profile -->
                <div class="sidebar__profile">
                    <div class="profile__avatar">
                        <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='%233366FF'%3E%3Cpath fill-rule='evenodd' d='M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z' clip-rule='evenodd' /%3E%3C/svg%3E" alt="Avatar del usuario">
                        <div class="profile__status"></div>
                    </div>
                    <div class="profile__info">
                        <h3 class="profile__name">Abraham Méndez</h3>
                        <div class="profile__reputation">
                            <span class="reputation__label">Reputación:</span>
                            <div class="reputation__stars" aria-label="4.5 estrellas de 5">
                                <i class="fas fa-star" aria-hidden="true"></i>
                                <i class="fas fa-star" aria-hidden="true"></i>
                                <i class="fas fa-star" aria-hidden="true"></i>
                                <i class="fas fa-star" aria-hidden="true"></i>
                                <i class="fas fa-star-half-alt" aria-hidden="true"></i>
                                <span class="reputation__score">4.5</span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Navigation Menu -->
                <nav class="sidebar__nav">
                    <ul class="nav__list">
                        <li class="nav__item">
                            <a href="dashboard.html" class="nav__link" data-page="dashboard" aria-current="page">
                                <i class="fas fa-home" aria-hidden="true"></i>
                                <span class="nav__text">Inicio</span>
                            </a>
                        </li>
                        <li class="nav__item">
                            <a href="tasks.html" class="nav__link" data-page="tasks">
                                <i class="fas fa-tasks" aria-hidden="true"></i>
                                <span class="nav__text">Tareas</span>
                                <span class="nav__badge" id="tasksBadge">8</span>
                            </a>
                        </li>
                        <li class="nav__item">
                            <a href="areas.html" class="nav__link" data-page="areas">
                                <i class="fas fa-layer-group" aria-hidden="true"></i>
                                <span class="nav__text">Mis Áreas</span>
                            </a>
                        </li>
                        <li class="nav__item">
                            <a href="groups.html" class="nav__link" data-page="groups">
                                <i class="fas fa-users" aria-hidden="true"></i>
                                <span class="nav__text">Grupos</span>
                            </a>
                        </li>
                        <li class="nav__item">
                            <a href="reputation.html" class="nav__link" data-page="reputation">
                                <i class="fas fa-star" aria-hidden="true"></i>
                                <span class="nav__text">Reputación</span>
                            </a>
                        </li>
                        <li class="nav__item">
                            <a href="notifications.html" class="nav__link" data-page="notifications">
                                <i class="fas fa-bell" aria-hidden="true"></i>
                                <span class="nav__text">Notificaciones</span>
                                <span class="nav__badge" id="notificationsBadge">3</span>
                            </a>
                        </li>
                        <li class="nav__item">
                            <a href="profile.html" class="nav__link" data-page="profile">
                                <i class="fas fa-user" aria-hidden="true"></i>
                                <span class="nav__text">Mi Perfil</span>
                            </a>
                        </li>
                        <li class="nav__item">
                            <a href="settings.html" class="nav__link" data-page="settings">
                                <i class="fas fa-cog" aria-hidden="true"></i>
                                <span class="nav__text">Configuración</span>
                            </a>
                        </li>
                    </ul>

                    <div class="nav__divider"></div>

                    <ul class="nav__list nav__list--bottom">
                        <li class="nav__item">
                            <a href="index.html" class="nav__link" id="logoutBtn">
                                <i class="fas fa-sign-out-alt" aria-hidden="true"></i>
                                <span class="nav__text">Cerrar sesión</span>
                            </a>
                        </li>
                    </ul>
                </nav>
            </aside>
        `;

        // Insert sidebar into dashboard
        const dashboardDiv = document.querySelector('.dashboard');
        if (dashboardDiv) {
            console.log('🎯 Insertando sidebar en .dashboard');
            dashboardDiv.insertAdjacentHTML('afterbegin', sidebarHTML);
        } else {
            console.log('⚠️ No se encontró .dashboard, insertando en body');
            document.body.insertAdjacentHTML('afterbegin', sidebarHTML);
        }

        // Get sidebar reference
        setTimeout(() => {
            this.sidebar = document.getElementById('sidebar');
            if (this.sidebar) {
                console.log('✅ Sidebar encontrado en DOM');
            } else {
                console.error('❌ No se pudo encontrar el sidebar en DOM');
            }
        }, 50);
    }

    setupEventListeners() {
        // Wait for sidebar to be created
        setTimeout(() => {
            // Mobile menu button
            const mobileMenuBtn = document.getElementById('mobileMenuBtn');
            if (mobileMenuBtn) {
                mobileMenuBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.toggleSidebar();
                });
            }

            // Sidebar close button
            const sidebarToggle = document.getElementById('sidebarToggle');
            if (sidebarToggle) {
                sidebarToggle.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.closeSidebar();
                });
            }

            // Overlay click to close
            if (this.overlay) {
                this.overlay.addEventListener('click', () => {
                    this.closeSidebar();
                });
            }

            // Handle window resize
            window.addEventListener('resize', this.debounce(() => {
                this.handleMobileView();
            }, 250));

            // Handle escape key
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && this.isOpen) {
                    this.closeSidebar();
                }
            });

            // Handle logout
            const logoutBtn = document.getElementById('logoutBtn');
            if (logoutBtn) {
                logoutBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.handleLogout();
                });
            }

            // Handle navigation links
            const navLinks = document.querySelectorAll('.nav__link[data-page]');
            navLinks.forEach(link => {
                link.addEventListener('click', (e) => {
                    // Don't prevent default for actual navigation
                    this.handleNavigation(link.getAttribute('data-page'));
                });
            });

        }, 100);
    }

    setActiveLink() {
        const navLinks = document.querySelectorAll('.nav__link[data-page]');
        navLinks.forEach(link => {
            const page = link.getAttribute('data-page');
            if (page === this.currentPage) {
                link.classList.add('active');
                link.setAttribute('aria-current', 'page');
            } else {
                link.classList.remove('active');
                link.removeAttribute('aria-current');
            }
        });
    }

    toggleSidebar() {
        if (this.isOpen) {
            this.closeSidebar();
        } else {
            this.openSidebar();
        }
    }

    openSidebar() {
        if (!this.sidebar) return;
        
        this.sidebar.classList.add('sidebar--open');
        this.overlay.classList.add('sidebar-overlay--visible');
        this.isOpen = true;
        
        // Update ARIA attributes
        this.sidebar.setAttribute('aria-hidden', 'false');
        this.overlay.setAttribute('aria-hidden', 'false');
        
        // Trap focus in sidebar
        this.trapFocus();
        
        // Announce to screen readers
        this.announceToScreenReader('Menú de navegación abierto');
        
        console.log('Sidebar opened');
    }

    closeSidebar() {
        if (!this.sidebar) return;
        
        this.sidebar.classList.remove('sidebar--open');
        this.overlay.classList.remove('sidebar-overlay--visible');
        this.isOpen = false;
        
        // Update ARIA attributes
        this.sidebar.setAttribute('aria-hidden', 'true');
        this.overlay.setAttribute('aria-hidden', 'true');
        
        // Restore focus
        this.restoreFocus();
        
        // Announce to screen readers
        this.announceToScreenReader('Menú de navegación cerrado');
        
        console.log('Sidebar closed');
    }

    handleMobileView() {
        if (window.innerWidth > 768) {
            // Desktop view - always show sidebar
            if (this.sidebar) {
                this.sidebar.classList.add('sidebar--desktop');
                this.sidebar.classList.remove('sidebar--mobile');
            }
        } else {
            // Mobile view - hide sidebar by default
            if (this.sidebar) {
                this.sidebar.classList.add('sidebar--mobile');
                this.sidebar.classList.remove('sidebar--desktop');
            }
        }
    }

    trapFocus() {
        const focusableElements = this.sidebar.querySelectorAll(
            'a[href], button, textarea, input[type="text"], input[type="radio"], input[type="checkbox"], select'
        );
        
        if (focusableElements.length === 0) return;

        const firstFocusableElement = focusableElements[0];
        const lastFocusableElement = focusableElements[focusableElements.length - 1];

        // Store the element that had focus before opening sidebar
        this.previouslyFocusedElement = document.activeElement;

        // Focus first element
        firstFocusableElement.focus();

        // Handle tab navigation
        const handleTabKey = (e) => {
            if (e.key === 'Tab') {
                if (e.shiftKey) {
                    if (document.activeElement === firstFocusableElement) {
                        lastFocusableElement.focus();
                        e.preventDefault();
                    }
                } else {
                    if (document.activeElement === lastFocusableElement) {
                        firstFocusableElement.focus();
                        e.preventDefault();
                    }
                }
            }
        };

        this.sidebar.addEventListener('keydown', handleTabKey);
        this.currentTabHandler = handleTabKey;
    }

    restoreFocus() {
        if (this.currentTabHandler) {
            this.sidebar.removeEventListener('keydown', this.currentTabHandler);
            this.currentTabHandler = null;
        }

        if (this.previouslyFocusedElement) {
            this.previouslyFocusedElement.focus();
            this.previouslyFocusedElement = null;
        }
    }

    handleNavigation(page) {
        // Update current page
        this.currentPage = page;
        
        // Update active link
        this.setActiveLink();
        
        // Close sidebar on mobile after navigation
        if (window.innerWidth <= 768) {
            this.closeSidebar();
        }
        
        // Track navigation
        if (window.AstrenApp && window.AstrenApp.Analytics) {
            window.AstrenApp.Analytics.trackEvent('Navigation', 'Sidebar Click', page);
        }
    }

    handleLogout() {
        // Show confirmation dialog
        if (confirm('¿Estás seguro de que quieres cerrar sesión?')) {
            // Clear any stored data
            localStorage.removeItem('userSession');
            localStorage.removeItem('userData');
            
            // Redirect to home page
            window.location.href = 'index.html';
            
            // Track logout
            if (window.AstrenApp && window.AstrenApp.Analytics) {
                window.AstrenApp.Analytics.trackEvent('Authentication', 'Logout', 'Sidebar');
            }
        }
    }

    updateBadges() {
        // Update task badge
        const tasksBadge = document.getElementById('tasksBadge');
        if (tasksBadge) {
            const tasks = this.getTasksCount();
            if (tasks > 0) {
                tasksBadge.textContent = tasks;
                tasksBadge.style.display = 'inline';
            } else {
                tasksBadge.style.display = 'none';
            }
        }

        // Update notifications badge
        const notificationsBadge = document.getElementById('notificationsBadge');
        if (notificationsBadge) {
            const notifications = this.getNotificationsCount();
            if (notifications > 0) {
                notificationsBadge.textContent = notifications;
                notificationsBadge.style.display = 'inline';
            } else {
                notificationsBadge.style.display = 'none';
            }
        }
    }

    getTasksCount() {
        try {
            const tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
            return tasks.filter(task => !task.completed).length;
        } catch (e) {
            console.error('Error getting tasks count:', e);
            return 0;
        }
    }

    getNotificationsCount() {
        try {
            const notifications = JSON.parse(localStorage.getItem('notifications') || '[]');
            return notifications.filter(notification => !notification.read).length;
        } catch (e) {
            console.error('Error getting notifications count:', e);
            return 0;
        }
    }

    announceToScreenReader(message) {
        const announcement = document.createElement('div');
        announcement.setAttribute('aria-live', 'polite');
        announcement.setAttribute('aria-atomic', 'true');
        announcement.className = 'sr-only';
        announcement.textContent = message;
        
        document.body.appendChild(announcement);
        
        setTimeout(() => {
            if (announcement.parentNode) {
                document.body.removeChild(announcement);
            }
        }, 1000);
    }

    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // Public methods for external use
    refresh() {
        this.updateBadges();
        this.setActiveLink();
    }

    destroy() {
        // Remove event listeners
        if (this.currentTabHandler) {
            this.sidebar.removeEventListener('keydown', this.currentTabHandler);
        }
        
        // Remove elements
        if (this.overlay && this.overlay.parentNode) {
            this.overlay.parentNode.removeChild(this.overlay);
        }
        
        if (this.sidebar && this.sidebar.parentNode) {
            this.sidebar.parentNode.removeChild(this.sidebar);
        }
        
        this.isInitialized = false;
    }
}

/*===== GLOBAL SIDEBAR INSTANCE =====*/
let globalSidebar = null;

/*===== INITIALIZATION =====*/
document.addEventListener('DOMContentLoaded', () => {
    console.log('🌐 DOM cargado, verificando si inicializar sidebar...');
    
    // Only initialize sidebar on dashboard pages
    const isDashboardPage = document.querySelector('.dashboard') || 
                           window.location.pathname.includes('dashboard') ||
                           window.location.pathname.includes('tasks') ||
                           window.location.pathname.includes('areas') ||
                           window.location.pathname.includes('groups') ||
                           window.location.pathname.includes('reputation') ||
                           window.location.pathname.includes('notifications') ||
                           window.location.pathname.includes('profile') ||
                           window.location.pathname.includes('settings');

    console.log('🔍 Verificando si es página de dashboard:', isDashboardPage);
    console.log('📍 URL actual:', window.location.pathname);
    console.log('🎯 Elemento .dashboard encontrado:', !!document.querySelector('.dashboard'));

    if (isDashboardPage) {
        console.log('✅ Inicializando SidebarManager...');
        globalSidebar = new SidebarManager();
        
        // Make sidebar globally accessible
        window.sidebarManager = globalSidebar;
        console.log('🌍 SidebarManager disponible globalmente como window.sidebarManager');
    } else {
        console.log('❌ No es página de dashboard, saltando inicialización del sidebar');
    }
});

/*===== EXPORT FOR MODULE SYSTEMS =====*/
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SidebarManager;
}