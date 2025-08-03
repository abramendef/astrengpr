/*===== SETTINGS PAGE FUNCTIONALITY =====*/

// Sistema de Configuración Completo y Robusto de Astren
class SettingsManager {
    constructor() {
        this.settings = this.loadSettings();
        this.currentTab = 'general';
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.renderSettings();
        this.applySettings();
        this.setupGlobalEvents();
        Logger.info('Settings Manager inicializado', null, 'UI');
    }

    loadSettings() {
        const savedSettings = localStorage.getItem('astren_settings');
        if (savedSettings) {
            try {
                return JSON.parse(savedSettings);
            } catch (e) {
                console.error('Error parsing settings:', e);
                return this.getDefaultSettings();
            }
        }
        return this.getDefaultSettings();
    }

    getDefaultSettings() {
        return {
            general: {
                language: 'es',
                theme: 'light',
                timezone: 'America/Mexico_City',
                dateFormat: 'DD/MM/YYYY',
                timeFormat: '24h'
            },
            notifications: {
                push: true,
                email: true,
                taskAssignments: true,
                taskDeadlines: true,
                taskCompletions: true,
                groupInvitations: true,
                groupActivities: true,
                reputationUpdates: true,
                sound: true,
                vibration: true,
                emailFrequency: 'weekly'
            },
            privacy: {
                profileVisibility: 'public',
                showReputation: true,
                showActivity: true,
                allowMessages: true,
                dataSharing: false
            },
            appearance: {
                compactMode: false,
                showAnimations: true,
                colorScheme: 'auto',
                fontSize: 'medium',
                sidebarCollapsed: false
            },
            security: {
                twoFactorAuth: false,
                sessionTimeout: 30,
                loginNotifications: true,
                passwordChangeReminder: true
            }
        };
    }

    saveSettings() {
        try {
            localStorage.setItem('astren_settings', JSON.stringify(this.settings));
        } catch (e) {
            console.error('Error saving settings:', e);
        }
    }

    setupEventListeners() {
        this.setupTabs();
        this.setupFormSubmissions();
        this.setupRealTimeChanges();
    }

    setupTabs() {
        const tabButtons = document.querySelectorAll('.settings-tab');
        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                const tabName = button.dataset.tab;
                this.switchTab(tabName);
            });
        });
    }

    setupFormSubmissions() {
        // General settings
        const generalForm = document.getElementById('general-settings-form');
        if (generalForm) {
            generalForm.addEventListener('submit', (e) => this.handleGeneralSettings(e));
        }

        // Notification settings
        const notificationForm = document.getElementById('notification-settings-form');
        if (notificationForm) {
            notificationForm.addEventListener('submit', (e) => this.handleNotificationSettings(e));
        }

        // Privacy settings
        const privacyForm = document.getElementById('privacy-settings-form');
        if (privacyForm) {
            privacyForm.addEventListener('submit', (e) => this.handlePrivacySettings(e));
        }

        // Appearance settings
        const appearanceForm = document.getElementById('appearance-settings-form');
        if (appearanceForm) {
            appearanceForm.addEventListener('submit', (e) => this.handleAppearanceSettings(e));
        }

        // Security settings
        const securityForm = document.getElementById('security-settings-form');
        if (securityForm) {
            securityForm.addEventListener('submit', (e) => this.handleSecuritySettings(e));
        }
    }

    setupRealTimeChanges() {
        // Theme changes
        const themeSelect = document.getElementById('theme-select');
        if (themeSelect) {
            themeSelect.addEventListener('change', (e) => {
                this.settings.general.theme = e.target.value;
                this.applyTheme(e.target.value);
                this.saveSettings();
            });
        }

        // Language changes
        const languageSelect = document.getElementById('language-select');
        if (languageSelect) {
            languageSelect.addEventListener('change', (e) => {
                this.settings.general.language = e.target.value;
                this.applyLanguage(e.target.value);
                this.saveSettings();
            });
        }

        // Compact mode toggle
        const compactModeToggle = document.getElementById('compact-mode-toggle');
        if (compactModeToggle) {
            compactModeToggle.addEventListener('change', (e) => {
                this.settings.appearance.compactMode = e.target.checked;
                this.applyCompactMode(e.target.checked);
                this.saveSettings();
            });
        }

        // Animation toggle
        const animationsToggle = document.getElementById('animations-toggle');
        if (animationsToggle) {
            animationsToggle.addEventListener('change', (e) => {
                this.settings.appearance.showAnimations = e.target.checked;
                this.applyAnimations(e.target.checked);
                this.saveSettings();
            });
        }

        // Font size changes
        const fontSizeSelect = document.getElementById('font-size-select');
        if (fontSizeSelect) {
            fontSizeSelect.addEventListener('change', (e) => {
                this.settings.appearance.fontSize = e.target.value;
                this.applyFontSize(e.target.value);
                this.saveSettings();
            });
        }
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

    switchTab(tabName) {
        // Update tab buttons
        const tabButtons = document.querySelectorAll('.settings-tab');
        tabButtons.forEach(button => {
            button.classList.remove('settings-tab--active');
            if (button.dataset.tab === tabName) {
                button.classList.add('settings-tab--active');
            }
        });

        // Show tab content
        const tabContents = document.querySelectorAll('.settings-content');
        tabContents.forEach(content => {
            content.style.display = 'none';
            if (content.dataset.tab === tabName) {
                content.style.display = 'block';
            }
        });

        this.currentTab = tabName;
    }

    renderSettings() {
        this.renderGeneralSettings();
        this.renderNotificationSettings();
        this.renderPrivacySettings();
        this.renderAppearanceSettings();
        this.renderSecuritySettings();
    }

    renderGeneralSettings() {
        const container = document.getElementById('general-settings');
        if (!container) return;

        container.innerHTML = `
            <form id="general-settings-form" class="settings-form">
                <div class="form-group">
                    <label for="language-select">Idioma</label>
                    <select id="language-select" name="language" class="form-select">
                        <option value="es" ${this.settings.general.language === 'es' ? 'selected' : ''}>Español</option>
                        <option value="en" ${this.settings.general.language === 'en' ? 'selected' : ''}>English</option>
                        <option value="fr" ${this.settings.general.language === 'fr' ? 'selected' : ''}>Français</option>
                        <option value="de" ${this.settings.general.language === 'de' ? 'selected' : ''}>Deutsch</option>
                    </select>
                </div>

                <div class="form-group">
                    <label for="theme-select">Tema</label>
                    <select id="theme-select" name="theme" class="form-select">
                        <option value="light" ${this.settings.general.theme === 'light' ? 'selected' : ''}>Claro</option>
                        <option value="dark" ${this.settings.general.theme === 'dark' ? 'selected' : ''}>Oscuro</option>
                        <option value="auto" ${this.settings.general.theme === 'auto' ? 'selected' : ''}>Automático</option>
                    </select>
                </div>

                <div class="form-group">
                    <label for="timezone-select">Zona Horaria</label>
                    <select id="timezone-select" name="timezone" class="form-select">
                        <option value="America/Mexico_City" ${this.settings.general.timezone === 'America/Mexico_City' ? 'selected' : ''}>México (GMT-6)</option>
                        <option value="America/New_York" ${this.settings.general.timezone === 'America/New_York' ? 'selected' : ''}>Nueva York (GMT-5)</option>
                        <option value="Europe/Madrid" ${this.settings.general.timezone === 'Europe/Madrid' ? 'selected' : ''}>Madrid (GMT+1)</option>
                        <option value="Asia/Tokyo" ${this.settings.general.timezone === 'Asia/Tokyo' ? 'selected' : ''}>Tokio (GMT+9)</option>
                    </select>
                </div>

                <div class="form-group">
                    <label for="date-format-select">Formato de Fecha</label>
                    <select id="date-format-select" name="dateFormat" class="form-select">
                        <option value="DD/MM/YYYY" ${this.settings.general.dateFormat === 'DD/MM/YYYY' ? 'selected' : ''}>DD/MM/YYYY</option>
                        <option value="MM/DD/YYYY" ${this.settings.general.dateFormat === 'MM/DD/YYYY' ? 'selected' : ''}>MM/DD/YYYY</option>
                        <option value="YYYY-MM-DD" ${this.settings.general.dateFormat === 'YYYY-MM-DD' ? 'selected' : ''}>YYYY-MM-DD</option>
                    </select>
                </div>

                <div class="form-group">
                    <label for="time-format-select">Formato de Hora</label>
                    <select id="time-format-select" name="timeFormat" class="form-select">
                        <option value="24h" ${this.settings.general.timeFormat === '24h' ? 'selected' : ''}>24 horas</option>
                        <option value="12h" ${this.settings.general.timeFormat === '12h' ? 'selected' : ''}>12 horas</option>
                    </select>
                </div>

                <div class="form-actions">
                    <button type="submit" class="button button--primary">
                        <i class="fas fa-save"></i>
                        Guardar Cambios
                    </button>
                </div>
            </form>
        `;
    }

    renderNotificationSettings() {
        const container = document.getElementById('notification-settings');
        if (!container) return;

        container.innerHTML = `
            <form id="notification-settings-form" class="settings-form">
                <div class="settings-section">
                    <h3 class="section-title">Notificaciones Push</h3>
                    
                    <div class="form-group">
                        <label class="toggle">
                            <input type="checkbox" id="push-notifications" name="push" ${this.settings.notifications.push ? 'checked' : ''}>
                            <span class="toggle-slider"></span>
                            <span class="toggle-label">Activar notificaciones push</span>
                        </label>
                    </div>

                    <div class="form-group">
                        <label class="toggle">
                            <input type="checkbox" id="sound-notifications" name="sound" ${this.settings.notifications.sound ? 'checked' : ''}>
                            <span class="toggle-slider"></span>
                            <span class="toggle-label">Sonidos de notificación</span>
                        </label>
                    </div>

                    <div class="form-group">
                        <label class="toggle">
                            <input type="checkbox" id="vibration-notifications" name="vibration" ${this.settings.notifications.vibration ? 'checked' : ''}>
                            <span class="toggle-slider"></span>
                            <span class="toggle-label">Vibración</span>
                        </label>
                    </div>
                </div>

                <div class="settings-section">
                    <h3 class="section-title">Notificaciones por Email</h3>
                    
                    <div class="form-group">
                        <label class="toggle">
                            <input type="checkbox" id="email-notifications" name="email" ${this.settings.notifications.email ? 'checked' : ''}>
                            <span class="toggle-slider"></span>
                            <span class="toggle-label">Activar notificaciones por email</span>
                        </label>
                    </div>

                    <div class="form-group">
                        <label for="email-frequency-select">Frecuencia de resúmenes</label>
                        <select id="email-frequency-select" name="emailFrequency" class="form-select">
                            <option value="none" ${this.settings.notifications.emailFrequency === 'none' ? 'selected' : ''}>Nunca</option>
                            <option value="daily" ${this.settings.notifications.emailFrequency === 'daily' ? 'selected' : ''}>Diario</option>
                            <option value="weekly" ${this.settings.notifications.emailFrequency === 'weekly' ? 'selected' : ''}>Semanal</option>
                            <option value="monthly" ${this.settings.notifications.emailFrequency === 'monthly' ? 'selected' : ''}>Mensual</option>
                        </select>
                    </div>
                </div>

                <div class="settings-section">
                    <h3 class="section-title">Tipos de Notificación</h3>
                    
                    <div class="form-group">
                        <label class="toggle">
                            <input type="checkbox" id="task-assignments" name="taskAssignments" ${this.settings.notifications.taskAssignments ? 'checked' : ''}>
                            <span class="toggle-slider"></span>
                            <span class="toggle-label">Nuevas asignaciones de tareas</span>
                        </label>
                    </div>

                    <div class="form-group">
                        <label class="toggle">
                            <input type="checkbox" id="task-deadlines" name="taskDeadlines" ${this.settings.notifications.taskDeadlines ? 'checked' : ''}>
                            <span class="toggle-slider"></span>
                            <span class="toggle-label">Recordatorios de fechas límite</span>
                        </label>
                    </div>

                    <div class="form-group">
                        <label class="toggle">
                            <input type="checkbox" id="task-completions" name="taskCompletions" ${this.settings.notifications.taskCompletions ? 'checked' : ''}>
                            <span class="toggle-slider"></span>
                            <span class="toggle-label">Tareas completadas por otros</span>
                        </label>
                    </div>

                    <div class="form-group">
                        <label class="toggle">
                            <input type="checkbox" id="group-invitations" name="groupInvitations" ${this.settings.notifications.groupInvitations ? 'checked' : ''}>
                            <span class="toggle-slider"></span>
                            <span class="toggle-label">Invitaciones a grupos</span>
                        </label>
                    </div>

                    <div class="form-group">
                        <label class="toggle">
                            <input type="checkbox" id="group-activities" name="groupActivities" ${this.settings.notifications.groupActivities ? 'checked' : ''}>
                            <span class="toggle-slider"></span>
                            <span class="toggle-label">Actividades en mis grupos</span>
                        </label>
                    </div>

                    <div class="form-group">
                        <label class="toggle">
                            <input type="checkbox" id="reputation-updates" name="reputationUpdates" ${this.settings.notifications.reputationUpdates ? 'checked' : ''}>
                            <span class="toggle-slider"></span>
                            <span class="toggle-label">Actualizaciones de reputación</span>
                        </label>
                    </div>
                </div>

                <div class="form-actions">
                    <button type="submit" class="button button--primary">
                        <i class="fas fa-save"></i>
                        Guardar Configuración
                    </button>
                </div>
            </form>
        `;
    }

    renderPrivacySettings() {
        const container = document.getElementById('privacy-settings');
        if (!container) return;

        container.innerHTML = `
            <form id="privacy-settings-form" class="settings-form">
                <div class="settings-section">
                    <h3 class="section-title">Visibilidad del Perfil</h3>
                    
                    <div class="form-group">
                        <label for="profile-visibility-select">Visibilidad del perfil</label>
                        <select id="profile-visibility-select" name="profileVisibility" class="form-select">
                            <option value="public" ${this.settings.privacy.profileVisibility === 'public' ? 'selected' : ''}>Público</option>
                            <option value="friends" ${this.settings.privacy.profileVisibility === 'friends' ? 'selected' : ''}>Solo amigos</option>
                            <option value="private" ${this.settings.privacy.profileVisibility === 'private' ? 'selected' : ''}>Privado</option>
                        </select>
                    </div>

                    <div class="form-group">
                        <label class="toggle">
                            <input type="checkbox" id="show-reputation" name="showReputation" ${this.settings.privacy.showReputation ? 'checked' : ''}>
                            <span class="toggle-slider"></span>
                            <span class="toggle-label">Mostrar mi reputación</span>
                        </label>
                    </div>

                    <div class="form-group">
                        <label class="toggle">
                            <input type="checkbox" id="show-activity" name="showActivity" ${this.settings.privacy.showActivity ? 'checked' : ''}>
                            <span class="toggle-slider"></span>
                            <span class="toggle-label">Mostrar mi actividad</span>
                        </label>
                    </div>
                </div>

                <div class="settings-section">
                    <h3 class="section-title">Comunicación</h3>
                    
                    <div class="form-group">
                        <label class="toggle">
                            <input type="checkbox" id="allow-messages" name="allowMessages" ${this.settings.privacy.allowMessages ? 'checked' : ''}>
                            <span class="toggle-slider"></span>
                            <span class="toggle-label">Permitir mensajes de otros usuarios</span>
                        </label>
                    </div>

                    <div class="form-group">
                        <label class="toggle">
                            <input type="checkbox" id="data-sharing" name="dataSharing" ${this.settings.privacy.dataSharing ? 'checked' : ''}>
                            <span class="toggle-slider"></span>
                            <span class="toggle-label">Compartir datos para mejorar el servicio</span>
                        </label>
                    </div>
                </div>

                <div class="form-actions">
                    <button type="submit" class="button button--primary">
                        <i class="fas fa-save"></i>
                        Guardar Configuración
                    </button>
                </div>
            </form>
        `;
    }

    renderAppearanceSettings() {
        const container = document.getElementById('appearance-settings');
        if (!container) return;

        container.innerHTML = `
            <form id="appearance-settings-form" class="settings-form">
                <div class="settings-section">
                    <h3 class="section-title">Interfaz</h3>
                    
                    <div class="form-group">
                        <label class="toggle">
                            <input type="checkbox" id="compact-mode-toggle" name="compactMode" ${this.settings.appearance.compactMode ? 'checked' : ''}>
                            <span class="toggle-slider"></span>
                            <span class="toggle-label">Modo compacto</span>
                        </label>
                    </div>

                    <div class="form-group">
                        <label class="toggle">
                            <input type="checkbox" id="animations-toggle" name="showAnimations" ${this.settings.appearance.showAnimations ? 'checked' : ''}>
                            <span class="toggle-slider"></span>
                            <span class="toggle-label">Mostrar animaciones</span>
                        </label>
                    </div>

                    <div class="form-group">
                        <label for="font-size-select">Tamaño de fuente</label>
                        <select id="font-size-select" name="fontSize" class="form-select">
                            <option value="small" ${this.settings.appearance.fontSize === 'small' ? 'selected' : ''}>Pequeño</option>
                            <option value="medium" ${this.settings.appearance.fontSize === 'medium' ? 'selected' : ''}>Mediano</option>
                            <option value="large" ${this.settings.appearance.fontSize === 'large' ? 'selected' : ''}>Grande</option>
                        </select>
                    </div>

                    <div class="form-group">
                        <label for="color-scheme-select">Esquema de colores</label>
                        <select id="color-scheme-select" name="colorScheme" class="form-select">
                            <option value="auto" ${this.settings.appearance.colorScheme === 'auto' ? 'selected' : ''}>Automático</option>
                            <option value="light" ${this.settings.appearance.colorScheme === 'light' ? 'selected' : ''}>Claro</option>
                            <option value="dark" ${this.settings.appearance.colorScheme === 'dark' ? 'selected' : ''}>Oscuro</option>
                        </select>
                    </div>
                </div>

                <div class="form-actions">
                    <button type="submit" class="button button--primary">
                        <i class="fas fa-save"></i>
                        Guardar Configuración
                    </button>
                </div>
            </form>
        `;
    }

    renderSecuritySettings() {
        const container = document.getElementById('security-settings');
        if (!container) return;

        container.innerHTML = `
            <form id="security-settings-form" class="settings-form">
                <div class="settings-section">
                    <h3 class="section-title">Autenticación</h3>
                    
                    <div class="form-group">
                        <label class="toggle">
                            <input type="checkbox" id="two-factor-auth" name="twoFactorAuth" ${this.settings.security.twoFactorAuth ? 'checked' : ''}>
                            <span class="toggle-slider"></span>
                            <span class="toggle-label">Autenticación de dos factores</span>
                        </label>
                    </div>

                    <div class="form-group">
                        <label for="session-timeout-select">Tiempo de sesión (minutos)</label>
                        <select id="session-timeout-select" name="sessionTimeout" class="form-select">
                            <option value="15" ${this.settings.security.sessionTimeout === 15 ? 'selected' : ''}>15 minutos</option>
                            <option value="30" ${this.settings.security.sessionTimeout === 30 ? 'selected' : ''}>30 minutos</option>
                            <option value="60" ${this.settings.security.sessionTimeout === 60 ? 'selected' : ''}>1 hora</option>
                            <option value="120" ${this.settings.security.sessionTimeout === 120 ? 'selected' : ''}>2 horas</option>
                        </select>
                    </div>
                </div>

                <div class="settings-section">
                    <h3 class="section-title">Notificaciones de Seguridad</h3>
                    
                    <div class="form-group">
                        <label class="toggle">
                            <input type="checkbox" id="login-notifications" name="loginNotifications" ${this.settings.security.loginNotifications ? 'checked' : ''}>
                            <span class="toggle-slider"></span>
                            <span class="toggle-label">Notificar nuevos inicios de sesión</span>
                        </label>
                    </div>

                    <div class="form-group">
                        <label class="toggle">
                            <input type="checkbox" id="password-change-reminder" name="passwordChangeReminder" ${this.settings.security.passwordChangeReminder ? 'checked' : ''}>
                            <span class="toggle-slider"></span>
                            <span class="toggle-label">Recordar cambio de contraseña</span>
                        </label>
                    </div>
                </div>

                <div class="form-actions">
                    <button type="submit" class="button button--primary">
                        <i class="fas fa-save"></i>
                        Guardar Configuración
                    </button>
                </div>
            </form>
        `;
    }

    handleGeneralSettings(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        
        this.settings.general = {
            language: formData.get('language'),
            theme: formData.get('theme'),
            timezone: formData.get('timezone'),
            dateFormat: formData.get('dateFormat'),
            timeFormat: formData.get('timeFormat')
        };

        this.saveSettings();
        this.applySettings();
        this.showToast('Configuración general guardada', 'success');
    }

    handleNotificationSettings(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        
        this.settings.notifications = {
            push: formData.get('push') === 'on',
            email: formData.get('email') === 'on',
            sound: formData.get('sound') === 'on',
            vibration: formData.get('vibration') === 'on',
            taskAssignments: formData.get('taskAssignments') === 'on',
            taskDeadlines: formData.get('taskDeadlines') === 'on',
            taskCompletions: formData.get('taskCompletions') === 'on',
            groupInvitations: formData.get('groupInvitations') === 'on',
            groupActivities: formData.get('groupActivities') === 'on',
            reputationUpdates: formData.get('reputationUpdates') === 'on',
            emailFrequency: formData.get('emailFrequency')
        };

        this.saveSettings();
        this.showToast('Configuración de notificaciones guardada', 'success');
    }

    handlePrivacySettings(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        
        this.settings.privacy = {
            profileVisibility: formData.get('profileVisibility'),
            showReputation: formData.get('showReputation') === 'on',
            showActivity: formData.get('showActivity') === 'on',
            allowMessages: formData.get('allowMessages') === 'on',
            dataSharing: formData.get('dataSharing') === 'on'
        };

        this.saveSettings();
        this.showToast('Configuración de privacidad guardada', 'success');
    }

    handleAppearanceSettings(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        
        this.settings.appearance = {
            compactMode: formData.get('compactMode') === 'on',
            showAnimations: formData.get('showAnimations') === 'on',
            fontSize: formData.get('fontSize'),
            colorScheme: formData.get('colorScheme'),
            sidebarCollapsed: this.settings.appearance.sidebarCollapsed
        };

        this.saveSettings();
        this.applyAppearanceSettings();
        this.showToast('Configuración de apariencia guardada', 'success');
    }

    handleSecuritySettings(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        
        this.settings.security = {
            twoFactorAuth: formData.get('twoFactorAuth') === 'on',
            sessionTimeout: parseInt(formData.get('sessionTimeout')),
            loginNotifications: formData.get('loginNotifications') === 'on',
            passwordChangeReminder: formData.get('passwordChangeReminder') === 'on'
        };

        this.saveSettings();
        this.showToast('Configuración de seguridad guardada', 'success');
    }

    applySettings() {
        this.applyTheme(this.settings.general.theme);
        this.applyLanguage(this.settings.general.language);
        this.applyAppearanceSettings();
    }

    applyTheme(theme) {
        document.body.className = document.body.className.replace(/theme--\w+/, '');
        document.body.classList.add(`theme--${theme}`);
        
        if (theme === 'auto') {
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            document.body.classList.add(`theme--${prefersDark ? 'dark' : 'light'}`);
        }
    }

    applyLanguage(language) {
        document.documentElement.lang = language;
        // Additional language-specific changes can be added here
    }

    applyCompactMode(compact) {
        document.body.classList.toggle('compact-mode', compact);
    }

    applyAnimations(show) {
        document.body.classList.toggle('no-animations', !show);
    }

    applyFontSize(size) {
        document.body.className = document.body.className.replace(/font-size--\w+/, '');
        document.body.classList.add(`font-size--${size}`);
    }

    applyAppearanceSettings() {
        this.applyCompactMode(this.settings.appearance.compactMode);
        this.applyAnimations(this.settings.appearance.showAnimations);
        this.applyFontSize(this.settings.appearance.fontSize);
    }

    exportSettings() {
        const data = {
            settings: this.settings,
            exportDate: new Date().toISOString()
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `astren-settings-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        this.showToast('Configuración exportada exitosamente', 'success');
    }

    resetSettings() {
        if (confirm('¿Estás seguro de que quieres restablecer todas las configuraciones? Esta acción no se puede deshacer.')) {
            this.settings = this.getDefaultSettings();
            this.saveSettings();
            this.applySettings();
            this.renderSettings();
            this.showToast('Configuración restablecida', 'info');
        }
    }

    hideAllModals() {
        const modals = document.querySelectorAll('.modal');
        modals.forEach(modal => {
            modal.style.display = 'none';
        });
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

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    getSetting(path) {
        return path.split('.').reduce((obj, key) => obj?.[key], this.settings);
    }

    setSetting(path, value) {
        const keys = path.split('.');
        const lastKey = keys.pop();
        const obj = keys.reduce((obj, key) => obj[key] = obj[key] || {}, this.settings);
        obj[lastKey] = value;
        this.saveSettings();
    }
}

// Global functions for settings interactions
function exportSettings() {
    if (window.settingsManager) {
        window.settingsManager.exportSettings();
    }
}

function resetSettings() {
    if (window.settingsManager) {
        window.settingsManager.resetSettings();
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    if (document.querySelector('.settings-grid') || document.querySelector('.settings-card')) {
        window.settingsManager = new SettingsManager();
    }
});

// Export for global access
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SettingsManager;
}