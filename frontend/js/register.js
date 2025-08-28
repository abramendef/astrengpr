/*===== REGISTER FUNCTIONALITY =====*/

// Get form elements
const registerForm = document.getElementById('registerForm');
const firstNameInput = document.getElementById('firstName');
const lastNameInput = document.getElementById('lastName');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const confirmPasswordInput = document.getElementById('confirmPassword');
const userTypeSelect = document.getElementById('userType');
const agreeTermsCheckbox = document.getElementById('agreeTerms');
const agreeNewsletterCheckbox = document.getElementById('agreeNewsletter');
const submitBtn = document.querySelector('.login__submit');

// Password toggle buttons
const togglePasswordBtn = document.getElementById('togglePassword');
const toggleConfirmPasswordBtn = document.getElementById('toggleConfirmPassword');

// Error elements
const firstNameError = document.getElementById('firstNameError');
const lastNameError = document.getElementById('lastNameError');
const emailError = document.getElementById('emailError');
const passwordError = document.getElementById('passwordError');
const confirmPasswordError = document.getElementById('confirmPasswordError');
const userTypeError = document.getElementById('userTypeError');

// Password strength elements
const passwordStrengthBar = document.querySelector('.password__strength-fill');
const passwordStrengthText = document.querySelector('.password__strength-text');

/*===== VALIDATION FUNCTIONS =====*/
function validateName(name) {
    return name.trim().length >= 2 && /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(name.trim());
}

function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function validatePassword(password) {
    return password.length >= 8;
}

function checkPasswordStrength(password) {
    let strength = 0;
    let strengthText = 'Muy débil';
    let strengthClass = 'weak';
    
    // Length check
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    
    // Character variety checks
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    
    // Determine strength level
    if (strength <= 2) {
        strengthText = 'Muy débil';
        strengthClass = 'weak';
    } else if (strength <= 3) {
        strengthText = 'Débil';
        strengthClass = 'fair';
    } else if (strength <= 4) {
        strengthText = 'Buena';
        strengthClass = 'good';
    } else {
        strengthText = 'Muy fuerte';
        strengthClass = 'strong';
    }
    
    return { strength, strengthText, strengthClass };
}

function showError(errorElement, message) {
    errorElement.textContent = message;
    errorElement.classList.add('show');
    errorElement.previousElementSibling.classList.add('error');
}

function hideError(errorElement) {
    errorElement.classList.remove('show');
    const inputElement = errorElement.previousElementSibling;
    inputElement.classList.remove('error');
}

function showSuccess(inputElement) {
    inputElement.classList.add('valid');
    inputElement.parentElement.classList.add('valid');
}

function hideSuccess(inputElement) {
    inputElement.classList.remove('valid');
    inputElement.parentElement.classList.remove('valid');
}

/*===== PASSWORD TOGGLE FUNCTIONALITY =====*/
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

toggleConfirmPasswordBtn.addEventListener('click', function() {
    const type = confirmPasswordInput.getAttribute('type') === 'password' ? 'text' : 'password';
    confirmPasswordInput.setAttribute('type', type);
    
    const icon = this.querySelector('i');
    if (type === 'text') {
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
    } else {
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
    }
});

/*===== PASSWORD STRENGTH INDICATOR =====*/
passwordInput.addEventListener('input', function() {
    const password = this.value;
    const { strength, strengthText, strengthClass } = checkPasswordStrength(password);
    
    // Update strength bar
    passwordStrengthBar.className = `password__strength-fill ${strengthClass}`;
    passwordStrengthText.textContent = strengthText;
    passwordStrengthText.className = `password__strength-text ${strengthClass}`;
    
    // Validate confirm password if it has a value
    if (confirmPasswordInput.value) {
        validateConfirmPassword();
    }
});

/*===== REAL-TIME VALIDATION =====*/
firstNameInput.addEventListener('blur', function() {
    const name = this.value.trim();
    if (name) {
        if (!validateName(name)) {
            showError(firstNameError, 'Ingresa un nombre válido (solo letras, mínimo 2 caracteres)');
            hideSuccess(this);
        } else {
            hideError(firstNameError);
            showSuccess(this);
        }
    }
});

lastNameInput.addEventListener('blur', function() {
    const name = this.value.trim();
    if (name) {
        if (!validateName(name)) {
            showError(lastNameError, 'Ingresa un apellido válido (solo letras, mínimo 2 caracteres)');
            hideSuccess(this);
        } else {
            hideError(lastNameError);
            showSuccess(this);
        }
    }
});

emailInput.addEventListener('blur', function() {
    const email = this.value.trim();
    if (email) {
        if (!validateEmail(email)) {
            showError(emailError, 'Ingresa un correo electrónico válido');
            hideSuccess(this);
        } else {
            hideError(emailError);
            showSuccess(this);
        }
    }
});

passwordInput.addEventListener('blur', function() {
    const password = this.value;
    if (password) {
        if (!validatePassword(password)) {
            showError(passwordError, 'La contraseña debe tener al menos 8 caracteres');
            hideSuccess(this);
        } else {
            hideError(passwordError);
            showSuccess(this);
        }
    }
});

function validateConfirmPassword() {
    const password = passwordInput.value;
    const confirmPassword = confirmPasswordInput.value;
    
    if (confirmPassword) {
        if (password !== confirmPassword) {
            showError(confirmPasswordError, 'Las contraseñas no coinciden');
            hideSuccess(confirmPasswordInput);
            return false;
        } else {
            hideError(confirmPasswordError);
            showSuccess(confirmPasswordInput);
            return true;
        }
    }
    return true;
}

confirmPasswordInput.addEventListener('blur', validateConfirmPassword);
confirmPasswordInput.addEventListener('input', validateConfirmPassword);

userTypeSelect.addEventListener('change', function() {
    if (this.value) {
        hideError(userTypeError);
        showSuccess(this);
    }
});

/*===== FORM VALIDATION =====*/
function validateForm() {
    let isValid = true;
    
    // Clear previous errors
    hideError(firstNameError);
    hideError(lastNameError);
    hideError(emailError);
    hideError(passwordError);
    hideError(confirmPasswordError);
    hideError(userTypeError);
    
    // Validate first name
    const firstName = firstNameInput.value.trim();
    if (!firstName) {
        showError(firstNameError, 'El nombre es requerido');
        isValid = false;
    } else if (!validateName(firstName)) {
        showError(firstNameError, 'Ingresa un nombre válido (solo letras, mínimo 2 caracteres)');
        isValid = false;
    }
    
    // Validate last name
    const lastName = lastNameInput.value.trim();
    if (!lastName) {
        showError(lastNameError, 'El apellido es requerido');
        isValid = false;
    } else if (!validateName(lastName)) {
        showError(lastNameError, 'Ingresa un apellido válido (solo letras, mínimo 2 caracteres)');
        isValid = false;
    }
    
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
        showError(passwordError, 'La contraseña debe tener al menos 8 caracteres');
        isValid = false;
    }
    
    // Validate confirm password
    const confirmPassword = confirmPasswordInput.value;
    if (!confirmPassword) {
        showError(confirmPasswordError, 'Confirma tu contraseña');
        isValid = false;
    } else if (password !== confirmPassword) {
        showError(confirmPasswordError, 'Las contraseñas no coinciden');
        isValid = false;
    }
    
    // Validate user type
    const userType = userTypeSelect.value;
    if (!userType) {
        showError(userTypeError, 'Selecciona un tipo de usuario');
        isValid = false;
    }
    
    // Validate terms agreement
    if (!agreeTermsCheckbox.checked) {
        alert('Debes aceptar los términos y condiciones para continuar');
        isValid = false;
    }
    
    return isValid;
}

/*===== FORM SUBMISSION =====*/
function registrarUsuario(formData) {
            fetch(buildApiUrl(CONFIG.API_ENDPOINTS.REGISTER), {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            nombre: formData.firstName,
            apellido: formData.lastName,
            correo: formData.email,
            contrasena: formData.password,
            telefono: formData.phone || null
        })
    })
    .then(response => response.json())
    .then(data => {
        setLoadingState(false);
        if (data.mensaje) {
            showSuccessMessage(formData);
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 3000);
        } else if (data.error) {
            showRegistrationError(data.error);
        }
    })
    .catch(error => {
        setLoadingState(false);
        showRegistrationError('Error de conexión con el servidor');
    });
}

registerForm.addEventListener('submit', function(e) {
    e.preventDefault();
    if (!validateForm()) {
        return;
    }
    setLoadingState(true);
    const formData = {
        firstName: firstNameInput.value.trim(),
        lastName: lastNameInput.value.trim(),
        email: emailInput.value.trim(),
        password: passwordInput.value,
        phone: null // Puedes agregar un input para teléfono si lo deseas
    };
    registrarUsuario(formData);
});

function setLoadingState(isLoading) {
    if (isLoading) {
        submitBtn.classList.add('button--loading');
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner"></i> Creando cuenta...';
        
        // Show loading overlay
        showLoadingOverlay();
    } else {
        submitBtn.classList.remove('button--loading');
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fas fa-user-plus"></i> Crear Cuenta';
        
        // Hide loading overlay
        hideLoadingOverlay();
    }
}

function showLoadingOverlay() {
    const overlay = document.createElement('div');
    overlay.className = 'register__loading';
    overlay.id = 'loadingOverlay';
    overlay.innerHTML = `
        <div class="register__loading-content">
            <div class="register__loading-spinner"></div>
            <div class="register__loading-text">Creando tu cuenta...</div>
        </div>
    `;
    document.body.appendChild(overlay);
    
    setTimeout(() => {
        overlay.classList.add('active');
    }, 10);
}

function hideLoadingOverlay() {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) {
        overlay.classList.remove('active');
        setTimeout(() => {
            overlay.remove();
        }, 300);
    }
}

function showSuccessMessage(formData) {
    const successDiv = document.createElement('div');
    successDiv.className = 'register__success';
    successDiv.innerHTML = `
        <div class="register__success-icon">
            <i class="fas fa-check-circle"></i>
        </div>
        <div class="register__success-title">
            ¡Cuenta creada exitosamente!
        </div>
        <div class="register__success-message">
            Bienvenido ${formData.firstName}, tu cuenta ha sido creada correctamente. 
            Te redirigiremos al inicio de sesión en unos segundos.
        </div>
    `;
    
    registerForm.insertBefore(successDiv, registerForm.firstChild);
    
    // Scroll to top to show success message
    successDiv.scrollIntoView({ behavior: 'smooth' });
}

function showRegistrationError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'login__error';
    errorDiv.innerHTML = `
        <i class="fas fa-exclamation-circle"></i>
        <span>${message}</span>
    `;
    
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
    
    registerForm.insertBefore(errorDiv, registerForm.firstChild);
    
    setTimeout(() => {
        errorDiv.remove();
    }, 5000);
    
    // Scroll to top to show error
    errorDiv.scrollIntoView({ behavior: 'smooth' });
}

/*===== FORM ANIMATIONS =====*/
document.addEventListener('DOMContentLoaded', function() {
    // Trigger animations
    const formGroups = document.querySelectorAll('.register__form .form__group, .register__form .form__options, .register__form .login__submit, .register__form .form__register');
    formGroups.forEach((group, index) => {
        setTimeout(() => {
            group.style.opacity = '1';
            group.style.transform = 'translateY(0)';
        }, index * 100);
    });
});

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

/*===== KEYBOARD SHORTCUTS =====*/
document.addEventListener('keydown', function(e) {
    // Enter key to submit form
    if (e.key === 'Enter' && document.activeElement.tagName === 'INPUT') {
        e.preventDefault();
        registerForm.dispatchEvent(new Event('submit'));
    }
    
    // Escape key to clear form
    if (e.key === 'Escape') {
        if (confirm('¿Estás seguro de que quieres limpiar el formulario?')) {
            clearForm();
        }
    }
});

function clearForm() {
    registerForm.reset();
    
    // Clear all errors
    hideError(firstNameError);
    hideError(lastNameError);
    hideError(emailError);
    hideError(passwordError);
    hideError(confirmPasswordError);
    hideError(userTypeError);
    
    // Clear all success states
    const inputs = document.querySelectorAll('.form__input');
    inputs.forEach(input => {
        hideSuccess(input);
    });
    
    // Reset password strength
    passwordStrengthBar.className = 'password__strength-fill';
    passwordStrengthText.textContent = 'Seguridad de contraseña';
    passwordStrengthText.className = 'password__strength-text';
}

/*===== ANALYTICS TRACKING =====*/
function trackRegistrationAttempt() {
            Logger.info('Registration attempt', null, 'API');
    
    if (typeof trackEvent === 'function') {
        trackEvent('Authentication', 'registration_attempt', 'email');
    }
}

// Track form submission
registerForm.addEventListener('submit', () => {
    trackRegistrationAttempt();
});

/*===== ERROR HANDLING =====*/
window.addEventListener('error', function(e) {
    console.error('Register page error:', e.error);
    
    // Solo mostrar notificación para errores críticos del registro
    const isRegisterError = e.error && (
        e.error.message.includes('register') ||
        e.error.message.includes('registration') ||
        e.error.message.includes('form') ||
        e.filename && e.filename.includes('register.js')
    );
    
    if (isRegisterError) {
        const errorDiv = document.createElement('div');
        errorDiv.textContent = 'Ha ocurrido un error en el registro. Por favor, recarga la página.';
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

        Logger.info('Register functionality initialized', null, 'UI');