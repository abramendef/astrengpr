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
        correo: emailInput.value.trim(),
        contrasena: passwordInput.value
    };
    
    // Nuevo flujo: usar endpoint real de login
    fetch(buildApiUrl(CONFIG.API_ENDPOINTS.LOGIN), {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
    })
    .then(response => response.json().then(data => ({ status: response.status, body: data })))
    .then(({ status, body }) => {
        setLoadingState(false);
        if (status === 200 && body.mensaje === 'Login exitoso') {
            // Verificar si es el mismo usuario que ya está logueado
            const currentUser = sessionStorage.getItem('astren_user');
            const isSameUser = currentUser && JSON.parse(currentUser).correo === formData.correo;
            
            // Guardar datos de usuario en sessionStorage (sesión activa)
            sessionStorage.setItem('astren_user', JSON.stringify({
                usuario_id: body.usuario_id,
                nombre: body.nombre,
                apellido: body.apellido,
                correo: body.correo,
                userType: body.userType // si existe
            }));
            
            // Solo guardar en localStorage si "recordarme" está marcado
            if (rememberMeCheckbox.checked) {
                localStorage.setItem('astren_usuario_id', body.usuario_id);
                localStorage.setItem('astren_nombre', body.nombre);
                localStorage.setItem('astren_apellido', body.apellido);
                localStorage.setItem('astren_correo', body.correo);
                localStorage.setItem('astren_rememberMe', 'true');
                localStorage.setItem('astren_email', formData.correo);
                localStorage.setItem('astren_password', formData.contrasena);
                localStorage.setItem('astren_autoLogin', 'true');
            }
            
            showSuccessMessage();
            
            // Si es el mismo usuario, mostrar mensaje diferente
            const message = isSameUser ? 
                '¡Sesión renovada exitosamente! Redirigiendo...' : 
                '¡Inicio de sesión exitoso! Redirigiendo...';
            
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 2000);
        } else {
            showLoginError(body.error || 'Credenciales incorrectas.');
        }
    })
    .catch(error => {
        setLoadingState(false);
        showLoginError('Error de conexión con el servidor');
    });
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

function showLoginError(msg) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'login__error';
    errorDiv.innerHTML = `
        <i class="fas fa-exclamation-circle"></i>
        <span>${msg}</span>
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
    // Check if user should be remembered and auto-login
    const rememberMe = localStorage.getItem('astren_rememberMe');
    const savedEmail = localStorage.getItem('astren_email');
    const savedPassword = localStorage.getItem('astren_password');
    const autoLogin = localStorage.getItem('astren_autoLogin');
    
    // Check if there's already an active session
    const currentUser = sessionStorage.getItem('astren_user');
    
    if (rememberMe === 'true' && savedEmail && savedPassword && autoLogin === 'true') {
        // Auto-fill form
        emailInput.value = savedEmail;
        passwordInput.value = savedPassword;
        rememberMeCheckbox.checked = true;
        
        // If there's already a session, ask user what to do
        if (currentUser) {
            const currentUserData = JSON.parse(currentUser);
            showSessionConflictModal(currentUserData, savedEmail);
        } else {
            // Auto-login after a short delay
            setTimeout(() => {
                Logger.info('Auto-login iniciado', null, 'UI');
                loginForm.dispatchEvent(new Event('submit'));
            }, 1000);
        }
    } else if (rememberMe === 'true' && savedEmail) {
        // Just fill email if only email was saved
        emailInput.value = savedEmail;
        rememberMeCheckbox.checked = true;
    }
    
    // Clear auto-login flag after first use
    if (autoLogin === 'true') {
        localStorage.removeItem('astren_autoLogin');
    }
});

// Function to show session conflict modal
function showSessionConflictModal(currentUser, newEmail) {
    const modalHTML = `
        <div id="sessionConflictModal" class="modal-overlay" style="
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
        ">
            <div class="modal-content" style="
                background: white;
                padding: 2rem;
                border-radius: 0.5rem;
                max-width: 400px;
                text-align: center;
                box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
            ">
                <h3 style="margin-bottom: 1rem; color: #333;">Sesión Activa Detectada</h3>
                <p style="margin-bottom: 1.5rem; color: #666;">
                    Ya tienes una sesión activa con <strong>${currentUser.correo}</strong>.
                    ¿Qué quieres hacer?
                </p>
                <div style="display: flex; gap: 1rem; justify-content: center;">
                    <button id="continueCurrentSession" style="
                        padding: 0.75rem 1.5rem;
                        background: #3366FF;
                        color: white;
                        border: none;
                        border-radius: 0.25rem;
                        cursor: pointer;
                    ">
                        Continuar sesión actual
                    </button>
                    <button id="switchToNewUser" style="
                        padding: 0.75rem 1.5rem;
                        background: #28a745;
                        color: white;
                        border: none;
                        border-radius: 0.25rem;
                        cursor: pointer;
                    ">
                        Cambiar a ${newEmail}
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // Add event listeners
    document.getElementById('continueCurrentSession').addEventListener('click', () => {
        document.getElementById('sessionConflictModal').remove();
        // Clear form and redirect to dashboard
        loginForm.reset();
        window.location.href = 'dashboard.html';
    });
    
    document.getElementById('switchToNewUser').addEventListener('click', () => {
        document.getElementById('sessionConflictModal').remove();
        // Clear current session and proceed with auto-login
        sessionStorage.clear();
        setTimeout(() => {
                            Logger.info('Auto-login con nuevo usuario iniciado', null, 'UI');
            loginForm.dispatchEvent(new Event('submit'));
        }, 500);
    });
}

// Add function to handle remember me checkbox changes
rememberMeCheckbox.addEventListener('change', function() {
    if (!this.checked) {
        // Clear saved credentials when unchecked
        localStorage.removeItem('astren_email');
        localStorage.removeItem('astren_password');
        localStorage.removeItem('astren_rememberMe');
        localStorage.removeItem('astren_autoLogin');
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
            Logger.info(`Login attempt: ${method}`, null, 'API');
    
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

        Logger.info('Login functionality initialized', null, 'UI');