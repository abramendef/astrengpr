/*===== CORE SCRIPTS FOR ASTREN PRODUCTIVITY SYSTEM =====*/

// Global error handler
window.addEventListener('error', (e) => {
    console.error('JavaScript error occurred:', e.error);
    // In production, this would be sent to an error tracking service
});

// Global unhandled promise rejection handler
window.addEventListener('unhandledrejection', (e) => {
    console.error('Unhandled promise rejection:', e.reason);
    e.preventDefault();
});

/*===== MOBILE MENU =====*/
class MobileMenuManager {
    constructor() {
        this.navMenu = document.getElementById('nav-menu');
        this.navToggle = document.getElementById('nav-toggle');
        this.navClose = document.getElementById('nav-close');
        this.navLinks = document.querySelectorAll('.nav__link');
        this.init();
    }

    init() {
        if (!this.navMenu) return;

        // Show menu
        if (this.navToggle) {
            this.navToggle.addEventListener('click', () => {
                this.navMenu.classList.add('show-menu');
                this.trapFocus();
            });
        }

        // Hide menu
        if (this.navClose) {
            this.navClose.addEventListener('click', () => {
                this.hideMenu();
            });
        }

        // Remove menu mobile when clicking nav links
        this.navLinks.forEach(link => {
            link.addEventListener('click', () => {
                this.hideMenu();
            });
        });

        // Close menu on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.navMenu.classList.contains('show-menu')) {
                this.hideMenu();
            }
        });

        // Close menu on outside click
        document.addEventListener('click', (e) => {
            if (this.navMenu.classList.contains('show-menu') && 
                !this.navMenu.contains(e.target) && 
                !this.navToggle.contains(e.target)) {
                this.hideMenu();
            }
        });
    }

    hideMenu() {
        this.navMenu.classList.remove('show-menu');
        this.restoreFocus();
    }

    trapFocus() {
        const focusableElements = this.navMenu.querySelectorAll(
            'a[href], button, textarea, input[type="text"], input[type="radio"], input[type="checkbox"], select'
        );
        const firstFocusableElement = focusableElements[0];
        const lastFocusableElement = focusableElements[focusableElements.length - 1];

        this.navMenu.addEventListener('keydown', (e) => {
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
        });

        if (firstFocusableElement) {
            firstFocusableElement.focus();
        }
    }

    restoreFocus() {
        if (this.navToggle) {
            this.navToggle.focus();
        }
    }
}

/*===== ACTIVE NAVIGATION LINK =====*/
class NavigationManager {
    constructor() {
        this.sections = document.querySelectorAll('section[id]');
        this.navLinks = document.querySelectorAll('.nav__menu a[href^="#"]');
        this.init();
    }

    init() {
        if (this.sections.length === 0) return;

        // Throttled scroll handler for better performance
        let ticking = false;
        const scrollHandler = () => {
            if (!ticking) {
                requestAnimationFrame(() => {
                    this.updateActiveLink();
                    ticking = false;
                });
                ticking = true;
            }
        };

        window.addEventListener('scroll', scrollHandler, { passive: true });
        
        // Initial call
        this.updateActiveLink();
    }

    updateActiveLink() {
        const scrollY = window.pageYOffset;
        const windowHeight = window.innerHeight;

        this.sections.forEach(current => {
            const sectionHeight = current.offsetHeight;
            const sectionTop = current.offsetTop - 100;
            const sectionId = current.getAttribute('id');
            const sectionLink = document.querySelector(`.nav__menu a[href="#${sectionId}"]`);

            if (sectionLink) {
                const isInView = scrollY > sectionTop && scrollY <= sectionTop + sectionHeight;
                const isNearTop = scrollY < 100;

                if (isInView || (isNearTop && sectionId === 'inicio')) {
                    this.setActiveLink(sectionLink);
                }
            }
        });
    }

    setActiveLink(activeLink) {
        this.navLinks.forEach(link => link.classList.remove('active-link'));
        activeLink.classList.add('active-link');
    }
}

/*===== HEADER BACKGROUND ON SCROLL =====*/
class HeaderManager {
    constructor() {
        this.header = document.getElementById('header');
        this.init();
    }

    init() {
        if (!this.header) return;

        let ticking = false;
        const scrollHandler = () => {
            if (!ticking) {
                requestAnimationFrame(() => {
                    this.updateHeader();
                    ticking = false;
                });
                ticking = true;
            }
        };

        window.addEventListener('scroll', scrollHandler, { passive: true });
        
        // Initial call
        this.updateHeader();
    }

    updateHeader() {
        if (this.scrollY >= 80) {
            this.header.classList.add('scroll-header');
        } else {
            this.header.classList.remove('scroll-header');
        }
    }
}

/*===== SMOOTH SCROLLING FOR ANCHOR LINKS =====*/
class SmoothScrollManager {
    constructor() {
        this.anchorLinks = document.querySelectorAll('a[href^="#"]');
        this.init();
    }

    init() {
        this.anchorLinks.forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                const href = anchor.getAttribute('href');
                
                // Skip if href is just "#" or if it's a different page
                if (href === '#' || href.includes('html')) {
                    return;
                }
                
                e.preventDefault();
                this.scrollToTarget(href);
            });
        });
    }

    scrollToTarget(targetId) {
        const target = document.querySelector(targetId);
        
        if (target) {
            const headerOffset = 70;
            const elementPosition = target.offsetTop;
            const offsetPosition = elementPosition - headerOffset;

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });

            // Update URL without page reload
            history.pushState(null, null, targetId);
        }
    }
}

/*===== SCROLL REVEAL ANIMATION =====*/
class ScrollRevealManager {
    constructor() {
        this.reveals = document.querySelectorAll('.feature__card, .step, .audience__card, .hero__stat');
        this.init();
    }

    init() {
        if (this.reveals.length === 0) return;

        // Add scroll animation class to elements
        this.reveals.forEach(el => {
            el.classList.add('scroll-animation');
        });

        let ticking = false;
        const scrollHandler = () => {
            if (!ticking) {
                requestAnimationFrame(() => {
                    this.checkReveals();
                    ticking = false;
                });
                ticking = true;
            }
        };

        window.addEventListener('scroll', scrollHandler, { passive: true });
        
        // Initial call
        this.checkReveals();
    }

    checkReveals() {
        const windowHeight = window.innerHeight;
        const elementVisible = 150;
        
        this.reveals.forEach(reveal => {
            const elementTop = reveal.getBoundingClientRect().top;
            
            if (elementTop < windowHeight - elementVisible) {
                reveal.classList.add('animate');
            }
        });
    }
}

/*===== BUTTON CLICK ANIMATIONS =====*/
class ButtonAnimationManager {
    constructor() {
        this.buttons = document.querySelectorAll('.button');
        this.init();
    }

    init() {
        this.buttons.forEach(button => {
            button.addEventListener('click', (e) => {
                this.createRippleEffect(button, e);
            });
        });
    }

    createRippleEffect(button, event) {
        const ripple = document.createElement('span');
        const rect = button.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = event.clientX - rect.left - size / 2;
        const y = event.clientY - rect.top - size / 2;
        
        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = x + 'px';
        ripple.style.top = y + 'px';
        ripple.classList.add('ripple');
        
        button.appendChild(ripple);
        
        setTimeout(() => {
            ripple.remove();
        }, 600);
    }
}

/*===== FEATURE CARDS HOVER EFFECT =====*/
class FeatureCardManager {
    constructor() {
        this.cards = document.querySelectorAll('.feature__card');
        this.init();
    }

    init() {
        this.cards.forEach(card => {
            card.addEventListener('mouseenter', () => {
                card.style.transform = 'translateY(-4px)';
            });
            
            card.addEventListener('mouseleave', () => {
                card.style.transform = 'translateY(0)';
            });
        });
    }
}

/*===== HERO ILLUSTRATION ANIMATION =====*/
class HeroAnimationManager {
    constructor() {
        this.icons = document.querySelectorAll('.hero__icon');
        this.animationIntervals = [];
        this.init();
    }

    init() {
        if (this.icons.length === 0) return;

        this.icons.forEach((icon, index) => {
            const interval = setInterval(() => {
                const randomX = (Math.random() - 0.5) * 10;
                const randomY = (Math.random() - 0.5) * 10;
                const randomRotate = (Math.random() - 0.5) * 5;
                
                icon.style.transform = `translate(${randomX}px, ${randomY}px) rotate(${randomRotate}deg)`;
            }, 5000 + index * 1000);
            
            this.animationIntervals.push(interval);
        });
    }

    destroy() {
        this.animationIntervals.forEach(interval => clearInterval(interval));
        this.animationIntervals = [];
    }
}

/*===== COUNTER ANIMATION FOR HERO STATS =====*/
class CounterAnimationManager {
    constructor() {
        this.counters = document.querySelectorAll('.hero__stat-number');
        this.init();
    }

    init() {
        if (this.counters.length === 0) return;

        this.counters.forEach(counter => {
            this.animateCounter(counter);
        });
    }

    animateCounter(counter) {
        const target = counter.textContent;
        const isPercentage = target.includes('%');
        const numericValue = parseInt(target.replace(/[^\d]/g, ''));
        
        if (isNaN(numericValue)) return;

        let count = 0;
        const increment = numericValue / 50;
        const duration = 2000; // 2 seconds
        const stepTime = duration / 50;
        
        const timer = setInterval(() => {
            count += increment;
            
            if (count >= numericValue) {
                counter.textContent = target;
                clearInterval(timer);
            } else {
                if (isPercentage) {
                    counter.textContent = Math.floor(count) + '%';
                } else {
                    counter.textContent = Math.floor(count) + '+';
                }
            }
        }, stepTime);
    }
}

/*===== FORM VALIDATION UTILITIES =====*/
class FormValidationManager {
    static validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    static validatePassword(password) {
        return password.length >= 6;
    }

    static validateName(name) {
        return name.length >= 2 && /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(name);
    }

    static validateRequired(value) {
        return value && value.trim().length > 0;
    }

    static showError(element, message) {
        const errorElement = element.nextElementSibling;
        if (errorElement && errorElement.classList.contains('error-message')) {
            errorElement.textContent = message;
            errorElement.classList.add('show');
            element.classList.add('error');
        }
    }

    static hideError(element) {
        const errorElement = element.nextElementSibling;
        if (errorElement && errorElement.classList.contains('error-message')) {
            errorElement.classList.remove('show');
            element.classList.remove('error');
        }
    }
}

/*===== UTILITY FUNCTIONS =====*/
class UtilityManager {
    static debounce(func, wait, immediate) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                timeout = null;
                if (!immediate) func(...args);
            };
            const callNow = immediate && !timeout;
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
            if (callNow) func(...args);
        };
    }

    static throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    static formatDate(date) {
        return new Intl.DateTimeFormat('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        }).format(new Date(date));
    }

    static formatDateTime(date) {
        return new Intl.DateTimeFormat('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(new Date(date));
    }

    static generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    static copyToClipboard(text) {
        if (navigator.clipboard) {
            return navigator.clipboard.writeText(text);
        } else {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = text;
            document.body.appendChild(textArea);
            textArea.select();
            try {
                document.execCommand('copy');
                return Promise.resolve();
            } catch (err) {
                return Promise.reject(err);
            } finally {
                document.body.removeChild(textArea);
            }
        }
    }
}

/*===== ANALYTICS AND TRACKING =====*/
class AnalyticsManager {
    static trackEvent(category, action, label = null, value = null) {
        // In a real application, this would send data to Google Analytics or similar
        Logger.debug('Analytics Event', { category, action, label, value }, 'PERFORMANCE');
        
        // Simulate analytics tracking
        if (typeof gtag !== 'undefined') {
            gtag('event', action, {
                event_category: category,
                event_label: label,
                value: value
            });
        }
    }

    static trackPageView(pageName) {
        this.trackEvent('Navigation', 'Page View', pageName);
    }

    static trackButtonClick(buttonName) {
        this.trackEvent('Interaction', 'Button Click', buttonName);
    }

    static trackFormSubmission(formName) {
        this.trackEvent('Form', 'Submission', formName);
    }
}

/*===== PERFORMANCE MONITORING =====*/
class PerformanceManager {
    static measurePageLoad() {
        window.addEventListener('load', () => {
            const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
            Logger.info(`Page load time: ${loadTime}ms`, null, 'PERFORMANCE');
            
            if (loadTime > 3000) {
                console.warn('Page load time is slow. Consider optimizing assets.');
            }
        });
    }

    static measureInteraction(name, callback) {
        const start = performance.now();
        callback();
        const end = performance.now();
                    Logger.debug(`${name} took ${end - start}ms`, null, 'PERFORMANCE');
    }
}

/*===== ACCESSIBILITY UTILITIES =====*/
class AccessibilityManager {
    static announceToScreenReader(message) {
        const announcement = document.createElement('div');
        announcement.setAttribute('aria-live', 'polite');
        announcement.setAttribute('aria-atomic', 'true');
        announcement.className = 'sr-only';
        announcement.textContent = message;
        
        document.body.appendChild(announcement);
        
        setTimeout(() => {
            document.body.removeChild(announcement);
        }, 1000);
    }

    static setupKeyboardNavigation() {
        document.addEventListener('keydown', (e) => {
            // Skip to main content
            if (e.key === 'Tab' && e.altKey) {
                const mainContent = document.querySelector('main');
                if (mainContent) {
                    mainContent.focus();
                    e.preventDefault();
                }
            }
        });
    }

    static enhanceFocusIndicators() {
        const style = document.createElement('style');
        style.textContent = `
            *:focus {
                outline: 2px solid #3366FF !important;
                outline-offset: 2px !important;
            }
        `;
        document.head.appendChild(style);
    }
}

/*===== AUTHENTICATION MANAGER =====*/
class AuthenticationManager {
    static checkAuth() {
        const sessionUser = sessionStorage.getItem('astren_user');
        
        // Solo verificar sessionStorage para sesiones activas
        // localStorage se usa solo para "recordarme"
        return !!sessionUser;
    }
    
    static requireAuth() {
        if (!this.checkAuth()) {
            // Redirigir a login si no está autenticado
            window.location.href = 'login.html';
            return false;
        }
        return true;
    }
    
    static getUserData() {
        const sessionUser = sessionStorage.getItem('astren_user');
        if (sessionUser) {
            return JSON.parse(sessionUser);
        }
        
        // Fallback a localStorage
        const usuarioId = localStorage.getItem('astren_usuario_id');
        if (usuarioId) {
            return {
                usuario_id: usuarioId,
                nombre: localStorage.getItem('astren_nombre'),
                apellido: localStorage.getItem('astren_apellido'),
                correo: localStorage.getItem('astren_correo')
            };
        }
        
        return null;
    }
    
    static logout() {
        // Limpiar todos los datos de sesión
        localStorage.removeItem('astren_rememberMe');
        localStorage.removeItem('astren_email');
        localStorage.removeItem('astren_password');
        localStorage.removeItem('astren_autoLogin');
        localStorage.removeItem('astren_usuario_id');
        localStorage.removeItem('astren_nombre');
        localStorage.removeItem('astren_apellido');
        localStorage.removeItem('astren_correo');
        sessionStorage.clear();
        
        // Redirigir a login
        window.location.href = 'login.html';
    }
    
    static switchUser() {
        // Solo limpiar sessionStorage, mantener localStorage para "recordarme"
        sessionStorage.clear();
        
        // Redirigir a login para iniciar nueva sesión
        window.location.href = 'login.html';
    }
    
    static getCurrentSessionUser() {
        const sessionUser = sessionStorage.getItem('astren_user');
        return sessionUser ? JSON.parse(sessionUser) : null;
    }
    
    static isSameUser(email) {
        const currentUser = this.getCurrentSessionUser();
        return currentUser && currentUser.correo === email;
    }
}

/*===== INITIALIZATION =====*/
class AppInitializer {
    constructor() {
        this.managers = {};
        this.init();
    }

    init() {
        // Check authentication for dashboard pages
        const isDashboardPage = window.location.pathname.includes('dashboard') ||
                               window.location.pathname.includes('tasks') ||
                               window.location.pathname.includes('areas') ||
                               window.location.pathname.includes('groups') ||
                               window.location.pathname.includes('reputation') ||
                               window.location.pathname.includes('notifications') ||
                               window.location.pathname.includes('profile') ||
                               window.location.pathname.includes('settings');
        
        if (isDashboardPage && !AuthenticationManager.requireAuth()) {
            return; // Stop initialization if not authenticated
        }
        
        // Initialize all managers
        this.managers.mobileMenu = new MobileMenuManager();
        this.managers.navigation = new NavigationManager();
        this.managers.header = new HeaderManager();
        this.managers.smoothScroll = new SmoothScrollManager();
        this.managers.scrollReveal = new ScrollRevealManager();
        this.managers.buttonAnimation = new ButtonAnimationManager();
        this.managers.featureCards = new FeatureCardManager();
        this.managers.heroAnimation = new HeroAnimationManager();
        this.managers.counterAnimation = new CounterAnimationManager();

        // Initialize utilities
        PerformanceManager.measurePageLoad();
        AccessibilityManager.setupKeyboardNavigation();
        AccessibilityManager.enhanceFocusIndicators();

        // Track page view
        const pageName = this.getCurrentPageName();
        AnalyticsManager.trackPageView(pageName);

        Logger.info('Astren app initialized successfully', null, 'UI');
    }

    getCurrentPageName() {
        const path = window.location.pathname;
        const filename = path.split('/').pop() || 'index.html';
        return filename.replace('.html', '');
    }

    destroy() {
        // Clean up managers that need cleanup
        if (this.managers.heroAnimation) {
            this.managers.heroAnimation.destroy();
        }
    }
}

/*===== GLOBAL EXPORTS =====*/
window.AstrenApp = {
    FormValidation: FormValidationManager,
    Utility: UtilityManager,
    Analytics: AnalyticsManager,
    Performance: PerformanceManager,
    Accessibility: AccessibilityManager,
    Auth: AuthenticationManager
};

/*===== DOM CONTENT LOADED =====*/
document.addEventListener('DOMContentLoaded', () => {
    window.astrenApp = new AppInitializer();
});

/*===== BEFORE UNLOAD =====*/
window.addEventListener('beforeunload', () => {
    if (window.astrenApp) {
        window.astrenApp.destroy();
    }
});

/*===== MODULE EXPORTS FOR NODE.JS =====*/
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        MobileMenuManager,
        NavigationManager,
        HeaderManager,
        SmoothScrollManager,
        ScrollRevealManager,
        ButtonAnimationManager,
        FeatureCardManager,
        HeroAnimationManager,
        CounterAnimationManager,
        FormValidationManager,
        UtilityManager,
        AnalyticsManager,
        PerformanceManager,
        AccessibilityManager,
        AppInitializer
    };
}

// Secuencia secreta: escribir 'astren' rápido
// (Eliminado para evitar conflicto y redirección incorrecta)
