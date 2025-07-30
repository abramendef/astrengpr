/*===== HEADER BUTTONS MANAGER FOR ASTREN DASHBOARD =====*/

class HeaderButtonsManager {
    constructor() {
        this.mobileMenuBtn = null;
        this.profileBtn = null;
        this.isInitialized = false;
        this.init();
    }

    init() {
        if (this.isInitialized) return;
        
        this.findButtons();
        this.setupEventListeners();
        
        this.isInitialized = true;
        console.log('Header buttons manager initialized');
    }

    findButtons() {
        this.mobileMenuBtn = document.getElementById('mobileMenuBtn');
        this.profileBtn = document.getElementById('profileBtn');
        
        console.log('Header buttons found:', {
            mobileMenuBtn: !!this.mobileMenuBtn,
            profileBtn: !!this.profileBtn
        });
    }

    setupEventListeners() {
        // Mobile menu button
        if (this.mobileMenuBtn) {
            this.mobileMenuBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.toggleMobileMenu();
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

    toggleProfileMenu() {
        console.log('Profile button clicked');
        const profileDropdown = document.getElementById('profileDropdown');
        if (profileDropdown) {
            const isVisible = profileDropdown.classList.contains('show');
            console.log('Dropdown exists, isVisible:', isVisible);
            
            if (isVisible) {
                this.closeProfileMenu();
            } else {
                this.openProfileMenu();
            }
        } else {
            console.log('Creating profile dropdown');
            this.createProfileDropdown();
        }
    }

    createProfileDropdown() {
        console.log('Creating profile dropdown');
        
        // Get current user data
        const userData = window.AstrenApp && window.AstrenApp.Auth ? 
            window.AstrenApp.Auth.getCurrentSessionUser() : null;
        
        const profileHTML = `
            <div id="profileDropdown" class="header-dropdown profile-dropdown" style="
                position: fixed;
                top: 100px;
                right: 30px;
                background: white;
                border: 1px solid #e5e7eb;
                border-radius: 8px;
                box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
                min-width: 280px;
                z-index: 10000;
                display: none;
                visibility: hidden;
                opacity: 0;
            ">
                <div class="profile-info" style="
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 16px;
                    border-bottom: 1px solid #f3f4f6;
                ">
                    <div class="profile-avatar" style="width: 48px; height: 48px;">
                        <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='%233366FF'%3E%3Cpath fill-rule='evenodd' d='M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z' clip-rule='evenodd' /%3E%3C/svg%3E" alt="Avatar" style="width: 100%; height: 100%; border-radius: 50%;">
                    </div>
                    <div class="profile-details" style="flex: 1;">
                        <div class="profile-name" style="font-weight: 600; color: #111827; margin-bottom: 4px;">${userData ? `${userData.nombre} ${userData.apellido}` : 'Usuario'}</div>
                        <div class="profile-email" style="font-size: 14px; color: #6b7280;">${userData ? userData.correo : 'usuario@example.com'}</div>
                    </div>
                </div>
                <div class="profile-menu" style="padding: 8px;">
                    <a href="profile.html" class="profile-menu-item" style="
                        display: flex;
                        align-items: center;
                        gap: 12px;
                        width: 100%;
                        padding: 12px;
                        background: none;
                        border: none;
                        color: #374151;
                        text-decoration: none;
                        font-size: 14px;
                        border-radius: 6px;
                        cursor: pointer;
                        transition: background-color 0.2s ease;
                    " onmouseover="this.style.backgroundColor='#f3f4f6'" onmouseout="this.style.backgroundColor='transparent'">
                        <i class="fas fa-user" style="color: #6b7280; width: 16px; text-align: center;"></i>
                        Mi Perfil
                    </a>
                    <a href="settings.html" class="profile-menu-item" style="
                        display: flex;
                        align-items: center;
                        gap: 12px;
                        width: 100%;
                        padding: 12px;
                        background: none;
                        border: none;
                        color: #374151;
                        text-decoration: none;
                        font-size: 14px;
                        border-radius: 6px;
                        cursor: pointer;
                        transition: background-color 0.2s ease;
                    " onmouseover="this.style.backgroundColor='#f3f4f6'" onmouseout="this.style.backgroundColor='transparent'">
                        <i class="fas fa-cog" style="color: #6b7280; width: 16px; text-align: center;"></i>
                        Configuración
                    </a>
                    <div class="profile-divider" style="height: 1px; background-color: #f3f4f6; margin: 8px 0;"></div>
                    <button type="button" class="profile-menu-item" id="switchUserBtn" style="
                        display: flex;
                        align-items: center;
                        gap: 12px;
                        width: 100%;
                        padding: 12px;
                        background: none;
                        border: none;
                        color: #374151;
                        text-decoration: none;
                        font-size: 14px;
                        border-radius: 6px;
                        cursor: pointer;
                        transition: background-color 0.2s ease;
                    " onmouseover="this.style.backgroundColor='#f3f4f6'" onmouseout="this.style.backgroundColor='transparent'">
                        <i class="fas fa-exchange-alt" style="color: #6b7280; width: 16px; text-align: center;"></i>
                        Cambiar usuario
                    </button>
                    <button type="button" class="profile-menu-item" id="logoutBtn" style="
                        display: flex;
                        align-items: center;
                        gap: 12px;
                        width: 100%;
                        padding: 12px;
                        background: none;
                        border: none;
                        color: #374151;
                        text-decoration: none;
                        font-size: 14px;
                        border-radius: 6px;
                        cursor: pointer;
                        transition: background-color 0.2s ease;
                    " onmouseover="this.style.backgroundColor='#f3f4f6'" onmouseout="this.style.backgroundColor='transparent'">
                        <i class="fas fa-sign-out-alt" style="color: #6b7280; width: 16px; text-align: center;"></i>
                        Cerrar sesión
                    </button>
                </div>
            </div>
        `;

        // Insert directly in body for better visibility
        document.body.insertAdjacentHTML('beforeend', profileHTML);
        console.log('Profile dropdown created in body');
        
        // Verify the dropdown was created
        const dropdown = document.getElementById('profileDropdown');
        if (dropdown) {
            console.log('Dropdown found in DOM:', dropdown);
            console.log('Dropdown styles:', {
                display: dropdown.style.display,
                visibility: dropdown.style.visibility,
                opacity: dropdown.style.opacity,
                position: dropdown.style.position,
                zIndex: dropdown.style.zIndex
            });
        } else {
            console.log('Dropdown not found in DOM');
        }

        // Setup logout functionality
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                this.handleLogout();
            });
        }
        
        // Setup switch user functionality
        const switchUserBtn = document.getElementById('switchUserBtn');
        if (switchUserBtn) {
            switchUserBtn.addEventListener('click', () => {
                this.handleSwitchUser();
            });
        }

        this.openProfileMenu();
    }

    openProfileMenu() {
        const profileDropdown = document.getElementById('profileDropdown');
        if (profileDropdown) {
            profileDropdown.style.display = 'block';
            profileDropdown.style.visibility = 'visible';
            profileDropdown.style.opacity = '1';
            console.log('Profile menu opened - display:', profileDropdown.style.display);
            console.log('Dropdown element:', profileDropdown);
        } else {
            console.log('Profile dropdown not found when trying to open');
        }
    }

    closeProfileMenu() {
        const profileDropdown = document.getElementById('profileDropdown');
        if (profileDropdown) {
            profileDropdown.style.display = 'none';
            console.log('Profile menu closed');
        }
    }

    handleLogout() {
        if (confirm('¿Estás seguro de que quieres cerrar sesión?')) {
            // Track logout before clearing data
            if (window.AstrenApp && window.AstrenApp.Analytics) {
                window.AstrenApp.Analytics.trackEvent('Authentication', 'Logout', 'Header');
            }
            
            // Use AuthenticationManager for consistent logout
            if (window.AstrenApp && window.AstrenApp.Auth) {
                window.AstrenApp.Auth.logout();
            } else {
                // Fallback logout
                localStorage.removeItem('astren_rememberMe');
                localStorage.removeItem('astren_email');
                localStorage.removeItem('astren_password');
                localStorage.removeItem('astren_autoLogin');
                localStorage.removeItem('astren_usuario_id');
                localStorage.removeItem('astren_nombre');
                localStorage.removeItem('astren_apellido');
                localStorage.removeItem('astren_correo');
                sessionStorage.clear();
                window.location.href = 'login.html';
            }
        }
    }

    handleSwitchUser() {
        if (confirm('¿Quieres cambiar de usuario? Se cerrará tu sesión actual.')) {
            // Track switch user
            if (window.AstrenApp && window.AstrenApp.Analytics) {
                window.AstrenApp.Analytics.trackEvent('Authentication', 'SwitchUser', 'Header');
            }
            
            // Use AuthenticationManager for consistent user switching
            if (window.AstrenApp && window.AstrenApp.Auth) {
                window.AstrenApp.Auth.switchUser();
            } else {
                // Fallback switch user
                sessionStorage.clear();
                window.location.href = 'login.html';
            }
        }
    }

    handleOutsideClick(event) {
        const profileDropdown = document.getElementById('profileDropdown');

        // Close profile dropdown
        if (profileDropdown && !profileDropdown.contains(event.target) && 
            !this.profileBtn.contains(event.target)) {
            this.closeProfileMenu();
        }
    }

    closeAllDropdowns() {
        this.closeProfileMenu();
    }

    // Public methods for external use
    refresh() {
        // No badges to update
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
    console.log('Header buttons script loaded');
    
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

    console.log('Is dashboard page:', isDashboardPage);

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