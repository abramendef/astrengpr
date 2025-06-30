/*===== LOGIN FUNCTIONALITY =====*/

// Get form elements
const loginForm = document.getElementById('loginForm');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const togglePasswordBtn = document.getElementById('togglePassword');
const rememberMeCheckbox = document.getElementById('rememberMe');
const submitBtn = document.querySelector('.login__submit');

// Error elements
const emailError = document.getElementById('emailError');
const passwordError = document.getElementById('passwordError');

/*===== FORM VALIDATION =====*/
function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function validatePassword(password) {
    return password.length >= 6;
}

function showError(errorElement, message) {
    errorElement.textContent = message;
    errorElement.classList.add('show');
    errorElement.previousElementSibling.classList.add('error');
}

function hideError(errorElement) {
    errorElement.classList.remove('show');
    errorElement.previousElementSibling.classList.remove('error');
}

function validateForm() {
    let isValid = true;
    
    // Clear previous errors
    hideError(emailError);
    hideError(passwordError);
    
    // Validate email
    const email = emailInput.value.trim();
    if (!email) {
        showError(emailError, 'El correo electrónico es requerido');
        isValid = false;
    } else if (!validateEmail(email)) {
        showError(emailError, 'Ingresa un correo electrónico válido');
        isValid = false;
    }
    
    // Validate password
    const password = passwordInput.value;
    if (!password) {
        showError(passwordError, 'La contraseña es requerida');
        isValid = false;
    } else if (!validatePassword(password)) {
        showError(passwordError, 'La contraseña debe tener al menos 6 caracteres');
        isValid = false;
    }
    
    return isValid;
}

/*===== PASSWORD TOGGLE =====*/
togglePasswordBtn.addEventListener('click', function() {
    const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
    passwordInput.setAttribute('type', type);
    
    const icon = this.querySelector('i');
    if (type === 'text') {
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
    } else {
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
    }
});

/*===== REAL-TIME VALIDATION =====*/
emailInput.addEventListener('blur', function() {
    const email = this.value.trim();
    if (email) {
        if (!validateEmail(email)) {
            showError(emailError, 'Ingresa un correo electrónico válido');
        } else {
            hideError(emailError);
        }
    }
});

passwordInput.addEventListener('blur', function() {
    const password = this.value;
    if (password) {
        if (!validatePassword(password)) {
            showError(passwordError, 'La contraseña debe tener al menos 6 caracteres');
        } else {
            hideError(passwordError);
        }
    }
});

/*===== FORM SUBMISSION =====*/
loginForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    if (!validateForm()) {
        return;
    }
    
    // Show loading state
    setLoadingState(true);
    
    // Get form data
    const formData = {
        email: emailInput.value.trim(),
        password: passwordInput.value,
        rememberMe: rememberMeCheckbox.checked
    };
    
    // Simulate login process
    simulateLogin(formData);
});

function setLoadingState(isLoading) {
    if (isLoading) {
        submitBtn.classList.add('button--loading');
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner"></i> Iniciando sesión...';
    } else {
        submitBtn.classList.remove('button--loading');
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fas fa-sign-in-alt"></i> Iniciar Sesión';
    }
}

function simulateLogin(formData) {
    // Simulate API call delay
    setTimeout(() => {
        setLoadingState(false);
        
        // For demo purposes, check for demo credentials
        if (formData.email === 'demo@example.com' && formData.password === 'astren123') {
            showSuccessMessage();
            
            // Save login state if remember me is checked
            if (formData.rememberMe) {
                localStorage.setItem('productivRep_rememberMe', 'true');
                localStorage.setItem('productivRep_email', formData.email);
            }
            
            // Redirect to dashboard (for demo, just show success)
            setTimeout(() => {
                window.location.href = 'dashboard.html'; // Would redirect to dashboard
            }, 2000);
            
        } else {
            showLoginError();
        }
    }, 2000);
}

function showSuccessMessage() {
    const successDiv = document.createElement('div');
    successDiv.className = 'login__success';
    successDiv.innerHTML = `
        <i class="fas fa-check-circle"></i>
        <span>¡Inicio de sesión exitoso! Redirigiendo...</span>
    `;
    
    // Add success styles
    successDiv.style.cssText = `
        background: linear-gradient(135deg, hsl(158 100% 50%), hsl(158 100% 60%));
        color: white;
        padding: 1rem;
        border-radius: 0.5rem;
        margin-bottom: 1rem;
        text-align: center;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
        animation: slideInFromTop 0.5s ease-out;
    `;
    
    loginForm.insertBefore(successDiv, loginForm.firstChild);
    
    setTimeout(() => {
        successDiv.remove();
    }, 3000);
}

function showLoginError() {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'login__error';
    errorDiv.innerHTML = `
        <i class="fas fa-exclamation-circle"></i>
        <span>Credenciales incorrectas. Intenta con: demo@productiv.com / demo123</span>
    `;
    
    // Add error styles
    errorDiv.style.cssText = `
        background: linear-gradient(135deg, hsl(0 84% 60%), hsl(0 84% 70%));
        color: white;
        padding: 1rem;
        border-radius: 0.5rem;
        margin-bottom: 1rem;
        text-align: center;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
        animation: shake 0.5s ease-in-out;
    `;
    
    loginForm.insertBefore(errorDiv, loginForm.firstChild);
    
    setTimeout(() => {
        errorDiv.remove();
    }, 5000);
}

/*===== REMEMBER ME FUNCTIONALITY =====*/
document.addEventListener('DOMContentLoaded', function() {
    // Check if user should be remembered
    const rememberMe = localStorage.getItem('productivRep_rememberMe');
    const savedEmail = localStorage.getItem('productivRep_email');
    
    if (rememberMe === 'true' && savedEmail) {
        emailInput.value = savedEmail;
        rememberMeCheckbox.checked = true;
    }
});

/*===== FORM ANIMATIONS =====*/
// Add focus animations to inputs
const inputs = document.querySelectorAll('.form__input');
inputs.forEach(input => {
    input.addEventListener('focus', function() {
        this.parentElement.classList.add('focused');
    });
    
    input.addEventListener('blur', function() {
        if (!this.value) {
            this.parentElement.classList.remove('focused');
        }
    });
    
    // Check if input has value on load
    if (input.value) {
        input.parentElement.classList.add('focused');
    }
});

/*===== KEYBOARD SHORTCUTS =====*/
document.addEventListener('keydown', function(e) {
    // Enter key to submit form
    if (e.key === 'Enter' && document.activeElement.tagName !== 'BUTTON') {
        e.preventDefault();
        loginForm.dispatchEvent(new Event('submit'));
    }
    
    // Escape key to clear form
    if (e.key === 'Escape') {
        clearForm();
    }
});

function clearForm() {
    loginForm.reset();
    hideError(emailError);
    hideError(passwordError);
    inputs.forEach(input => {
        input.parentElement.classList.remove('focused');
    });
}

/*===== ACCESSIBILITY ENHANCEMENTS =====*/
// Announce errors to screen readers
function announceError(message) {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'assertive');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = message;
    document.body.appendChild(announcement);
    
    setTimeout(() => {
        document.body.removeChild(announcement);
    }, 1000);
}

// Add screen reader only class
const style = document.createElement('style');
style.textContent = `
    .sr-only {
        position: absolute;
        width: 1px;
        height: 1px;
        padding: 0;
        margin: -1px;
        overflow: hidden;
        clip: rect(0, 0, 0, 0);
        white-space: nowrap;
        border: 0;
    }
    
    @keyframes slideInFromTop {
        from {
            transform: translateY(-100%);
            opacity: 0;
        }
        to {
            transform: translateY(0);
            opacity: 1;
        }
    }
    
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-5px); }
        75% { transform: translateX(5px); }
    }
`;
document.head.appendChild(style);

/*===== ANALYTICS TRACKING =====*/
function trackLoginAttempt(method) {
    // Track login attempts (would integrate with analytics service)
    console.log(`Login attempt: ${method}`);
    
    // Call the existing trackEvent function from main scripts
    if (typeof trackEvent === 'function') {
        trackEvent('Authentication', 'login_attempt', method);
    }
}

// Track form submission
loginForm.addEventListener('submit', () => {
    trackLoginAttempt('email');
});

/*===== ERROR HANDLING =====*/
window.addEventListener('error', function(e) {
    console.error('Login page error:', e.error);
    
    // Solo mostrar notificación para errores críticos del login
    const isLoginError = e.error && (
        e.error.message.includes('login') ||
        e.error.message.includes('authentication') ||
        e.error.message.includes('form') ||
        e.filename && e.filename.includes('login.js')
    );
    
    if (isLoginError) {
        // Show user-friendly error message
        const errorDiv = document.createElement('div');
        errorDiv.textContent = 'Ha ocurrido un error en el login. Por favor, recarga la página.';
        errorDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: hsl(0 84% 60%);
            color: white;
            padding: 1rem;
            border-radius: 0.5rem;
            z-index: 1000;
        `;
        document.body.appendChild(errorDiv);
        
        setTimeout(() => {
            errorDiv.remove();
        }, 5000);
    }
});

console.log('Login functionality initialized');

// Sistema de Autenticación Completo y Robusto de Astren
class AuthManager {
    constructor() {
        this.isAuthenticated = false;
        this.currentUser = null;
        this.init();
    }

    init() {
        this.checkAuthStatus();
        this.setupEventListeners();
        this.setupFormValidation();
        this.setupGlobalEvents();
        console.log('🔐 Auth Manager inicializado');
    }

    checkAuthStatus() {
        const rememberMe = localStorage.getItem('astren_remember');
        const userEmail = localStorage.getItem('astren_user_email');
        
        if (rememberMe && userEmail) {
            this.autoLogin();
        }
    }

    setupEventListeners() {
        this.setupLoginForm();
        this.setupPasswordToggle();
        this.setupRealTimeValidation();
    }

    setupLoginForm() {
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        }

        const togglePasswordBtn = document.getElementById('togglePassword');
        if (togglePasswordBtn) {
            togglePasswordBtn.addEventListener('click', () => this.togglePasswordVisibility());
        }
    }

    setupPasswordToggle() {
        const togglePasswordBtn = document.getElementById('togglePassword');
        if (togglePasswordBtn) {
            togglePasswordBtn.addEventListener('click', () => {
                const passwordInput = document.getElementById('password');
                const icon = togglePasswordBtn.querySelector('i');
                
                if (passwordInput.type === 'password') {
                    passwordInput.type = 'text';
                    icon.classList.remove('fa-eye');
                    icon.classList.add('fa-eye-slash');
                } else {
                    passwordInput.type = 'password';
                    icon.classList.remove('fa-eye-slash');
                    icon.classList.add('fa-eye');
                }
            });
        }
    }

    setupRealTimeValidation() {
        const emailInput = document.getElementById('email');
        const passwordInput = document.getElementById('password');

        if (emailInput) {
            emailInput.addEventListener('blur', () => this.validateEmail(emailInput));
            emailInput.addEventListener('input', () => this.clearEmailError());
        }

        if (passwordInput) {
            passwordInput.addEventListener('blur', () => this.validatePassword(passwordInput));
            passwordInput.addEventListener('input', () => this.clearPasswordError());
        }
    }

    setupFormValidation() {
        // Additional validation setup if needed
    }

    setupGlobalEvents() {
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && e.target.closest('#loginForm')) {
                const loginForm = document.getElementById('loginForm');
                if (loginForm) {
                    loginForm.dispatchEvent(new Event('submit'));
                }
            }
        });
    }

    handleLogin(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const email = formData.get('email').trim();
        const password = formData.get('password');
        const rememberMe = formData.get('rememberMe') === 'on';

        if (!this.validateLoginForm(email, password)) {
            return;
        }

        this.performLogin(email, password, rememberMe);
    }

    validateLoginForm(email, password) {
        let isValid = true;

        // Clear previous errors
        this.clearEmailError();
        this.clearPasswordError();

        // Validate email
        if (!email) {
            this.showEmailError('El correo electrónico es requerido');
            isValid = false;
        } else if (!this.validateEmailFormat(email)) {
            this.showEmailError('Ingresa un correo electrónico válido');
            isValid = false;
        }

        // Validate password
        if (!password) {
            this.showPasswordError('La contraseña es requerida');
            isValid = false;
        } else if (password.length < 6) {
            this.showPasswordError('La contraseña debe tener al menos 6 caracteres');
            isValid = false;
        }

        return isValid;
    }

    validateEmailFormat(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    validateEmail(input) {
        const email = input.value.trim();
        if (email && !this.validateEmailFormat(email)) {
            this.showEmailError('Ingresa un correo electrónico válido');
        }
    }

    validatePassword(input) {
        const password = input.value;
        if (password && password.length < 6) {
            this.showPasswordError('La contraseña debe tener al menos 6 caracteres');
        }
    }

    showEmailError(message) {
        const errorElement = document.getElementById('emailError');
        const emailInput = document.getElementById('email');
        
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.classList.add('show');
        }
        
        if (emailInput) {
            emailInput.classList.add('error');
        }
    }

    showPasswordError(message) {
        const errorElement = document.getElementById('passwordError');
        const passwordInput = document.getElementById('password');
        
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.classList.add('show');
        }
        
        if (passwordInput) {
            passwordInput.classList.add('error');
        }
    }

    clearEmailError() {
        const errorElement = document.getElementById('emailError');
        const emailInput = document.getElementById('email');
        
        if (errorElement) {
            errorElement.classList.remove('show');
        }
        
        if (emailInput) {
            emailInput.classList.remove('error');
        }
    }

    clearPasswordError() {
        const errorElement = document.getElementById('passwordError');
        const passwordInput = document.getElementById('password');
        
        if (errorElement) {
            errorElement.classList.remove('show');
        }
        
        if (passwordInput) {
            passwordInput.classList.remove('error');
        }
    }

    togglePasswordVisibility() {
        const passwordInput = document.getElementById('password');
        const toggleBtn = document.getElementById('togglePassword');
        
        if (passwordInput && toggleBtn) {
            const icon = toggleBtn.querySelector('i');
            
            if (passwordInput.type === 'password') {
                passwordInput.type = 'text';
                icon.classList.remove('fa-eye');
                icon.classList.add('fa-eye-slash');
            } else {
                passwordInput.type = 'password';
                icon.classList.remove('fa-eye-slash');
                icon.classList.add('fa-eye');
            }
        }
    }

    performLogin(email, password, rememberMe) {
        this.setLoadingState(true);

        // Simulate API call
        setTimeout(() => {
            this.setLoadingState(false);
            
            if (this.checkCredentials(email, password)) {
                this.loginSuccess(email, rememberMe);
            } else {
                this.loginError('Credenciales incorrectas. Intenta con: demo@astren.com / demo123');
            }
        }, 1500);
    }

    checkCredentials(email, password) {
        // Demo credentials for testing
        const demoCredentials = [
            { email: 'demo@astren.com', password: 'demo123' },
            { email: 'demo@example.com', password: 'astren123' },
            { email: 'test@example.com', password: 'test123' }
        ];

        return demoCredentials.some(cred => 
            cred.email.toLowerCase() === email.toLowerCase() && 
            cred.password === password
        );
    }

    loginSuccess(email, rememberMe) {
        const user = this.createUserSession(email, rememberMe);
        
        this.isAuthenticated = true;
        this.currentUser = user;

        this.showSuccessMessage();
        
        // Redirect to dashboard after a short delay
        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 2000);
    }

    loginError(message) {
        this.showErrorMessage(message);
    }

    createUserSession(email, rememberMe) {
        const user = {
            id: Date.now(),
            email: email,
            firstName: this.getFirstNameFromEmail(email),
            lastName: this.getLastNameFromEmail(email),
            userType: 'individual',
            createdAt: new Date().toISOString()
        };

        // Save to session storage
        sessionStorage.setItem('astren_user', JSON.stringify(user));
        sessionStorage.setItem('astren_authenticated', 'true');

        // Save to localStorage if remember me is checked
        if (rememberMe) {
            localStorage.setItem('astren_remember', 'true');
            localStorage.setItem('astren_user_email', email);
        }

        return user;
    }

    getFirstNameFromEmail(email) {
        const name = email.split('@')[0];
        return name.charAt(0).toUpperCase() + name.slice(1);
    }

    getLastNameFromEmail(email) {
        const name = email.split('@')[0];
        return name.charAt(0).toUpperCase() + name.slice(1);
    }

    autoLogin() {
        const userEmail = localStorage.getItem('astren_user_email');
        if (userEmail) {
            const user = {
                id: Date.now(),
                email: userEmail,
                firstName: this.getFirstNameFromEmail(userEmail),
                lastName: this.getLastNameFromEmail(userEmail),
                userType: 'individual',
                createdAt: new Date().toISOString()
            };

            sessionStorage.setItem('astren_user', JSON.stringify(user));
            sessionStorage.setItem('astren_authenticated', 'true');
            
            this.isAuthenticated = true;
            this.currentUser = user;

            // Redirect to dashboard
            window.location.href = 'dashboard.html';
        }
    }

    logout() {
        this.isAuthenticated = false;
        this.currentUser = null;

        // Clear session storage
        sessionStorage.removeItem('astren_user');
        sessionStorage.removeItem('astren_authenticated');

        // Clear localStorage if not remembering
        if (!localStorage.getItem('astren_remember')) {
            localStorage.removeItem('astren_user_email');
        }

        // Redirect to login
        window.location.href = 'login.html';
    }

    setLoadingState(isLoading) {
        const submitBtn = document.querySelector('.login__submit');
        if (submitBtn) {
            if (isLoading) {
                submitBtn.classList.add('button--loading');
                submitBtn.disabled = true;
                submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Iniciando sesión...';
            } else {
                submitBtn.classList.remove('button--loading');
                submitBtn.disabled = false;
                submitBtn.innerHTML = '<i class="fas fa-sign-in-alt"></i> Iniciar Sesión';
            }
        }
    }

    showSuccessMessage() {
        const successDiv = document.createElement('div');
        successDiv.className = 'login__success';
        successDiv.innerHTML = `
            <i class="fas fa-check-circle"></i>
            <span>¡Inicio de sesión exitoso! Redirigiendo...</span>
        `;

        this.addMessageStyles();
        document.body.appendChild(successDiv);

        setTimeout(() => {
            if (successDiv.parentNode) {
                successDiv.parentNode.removeChild(successDiv);
            }
        }, 3000);
    }

    showErrorMessage(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'login__error';
        errorDiv.innerHTML = `
            <i class="fas fa-exclamation-circle"></i>
            <span>${this.escapeHtml(message)}</span>
        `;

        this.addMessageStyles();
        document.body.appendChild(errorDiv);

        setTimeout(() => {
            if (errorDiv.parentNode) {
                errorDiv.parentNode.removeChild(errorDiv);
            }
        }, 5000);
    }

    addMessageStyles() {
        if (!document.getElementById('login-message-styles')) {
            const style = document.createElement('style');
            style.id = 'login-message-styles';
            style.textContent = `
                .login__success,
                .login__error {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    padding: 1rem 1.5rem;
                    border-radius: 8px;
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    font-weight: 500;
                    z-index: 10000;
                    animation: slideInRight 0.3s ease-out;
                    max-width: 400px;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                }
                
                .login__success {
                    background: linear-gradient(135deg, #10b981, #059669);
                    color: white;
                    border-left: 4px solid #047857;
                }
                
                .login__error {
                    background: linear-gradient(135deg, #ef4444, #dc2626);
                    color: white;
                    border-left: 4px solid #b91c1c;
                }
                
                @keyframes slideInRight {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                
                .button--loading {
                    opacity: 0.7;
                    cursor: not-allowed;
                }
                
                .form__input.error {
                    border-color: #ef4444;
                    box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
                }
                
                .form__error.show {
                    display: block;
                    color: #ef4444;
                    font-size: 0.875rem;
                    margin-top: 0.25rem;
                }
                
                .form__error {
                    display: none;
                }
            `;
            document.head.appendChild(style);
        }
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    isUserAuthenticated() {
        return this.isAuthenticated || sessionStorage.getItem('astren_authenticated') === 'true';
    }

    getCurrentUser() {
        if (this.currentUser) {
            return this.currentUser;
        }

        const userData = sessionStorage.getItem('astren_user');
        if (userData) {
            try {
                return JSON.parse(userData);
            } catch (e) {
                console.error('Error parsing user data:', e);
                return null;
            }
        }

        return null;
    }

    hasPermission(permission) {
        const user = this.getCurrentUser();
        if (!user) return false;

        // Simple permission check - can be expanded
        switch (permission) {
            case 'admin':
                return user.userType === 'admin';
            case 'moderator':
                return ['admin', 'moderator'].includes(user.userType);
            case 'user':
                return true;
            default:
                return false;
        }
    }

    updateUserProfile(updates) {
        const user = this.getCurrentUser();
        if (user) {
            const updatedUser = { ...user, ...updates };
            sessionStorage.setItem('astren_user', JSON.stringify(updatedUser));
            this.currentUser = updatedUser;
        }
    }

    changePassword(currentPassword, newPassword) {
        // This would typically make an API call
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                if (currentPassword === 'demo123') {
                    resolve({ success: true, message: 'Contraseña actualizada exitosamente' });
                } else {
                    reject({ success: false, message: 'Contraseña actual incorrecta' });
                }
            }, 1000);
        });
    }

    resetPassword(email) {
        // This would typically make an API call
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({ success: true, message: 'Se ha enviado un enlace de restablecimiento a tu correo' });
            }, 1000);
        });
    }
}

// Global functions for authentication
function logout() {
    if (window.authManager) {
        window.authManager.logout();
    } else {
        // Fallback logout
        sessionStorage.clear();
        localStorage.removeItem('astren_remember');
        localStorage.removeItem('astren_user_email');
        window.location.href = 'login.html';
    }
}

function isAuthenticated() {
    if (window.authManager) {
        return window.authManager.isUserAuthenticated();
    }
    return sessionStorage.getItem('astren_authenticated') === 'true';
}

function getCurrentUser() {
    if (window.authManager) {
        return window.authManager.getCurrentUser();
    }
    
    const userData = sessionStorage.getItem('astren_user');
    if (userData) {
        try {
            return JSON.parse(userData);
        } catch (e) {
            return null;
        }
    }
    return null;
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    if (document.getElementById('loginForm')) {
        window.authManager = new AuthManager();
    }
});

// Export for global access
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AuthManager;
}