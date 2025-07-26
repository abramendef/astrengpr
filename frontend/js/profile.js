/*===== PROFILE PAGE FUNCTIONALITY =====*/

// Sistema de Perfil Completo y Robusto de Astren
class ProfileManager {
    constructor() {
        this.profile = this.loadProfile();
        this.currentTab = 'overview';
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.renderProfile();
        this.loadUserData();
        this.setupGlobalEvents();
        console.log('👤 Profile Manager inicializado');
    }

    loadProfile() {
        const savedProfile = localStorage.getItem('astren_profile');
        if (savedProfile) {
            try {
                return JSON.parse(savedProfile);
            } catch (e) {
                console.error('Error parsing profile:', e);
                return this.getDefaultProfile();
            }
        }
        return this.getDefaultProfile();
    }

    getDefaultProfile() {
        return {
            personal: {
                firstName: 'Juan',
                lastName: 'Pérez',
                email: 'juan.perez@email.com',
                phone: '+52 55 1234 5678',
                bio: 'Desarrollador web apasionado por crear experiencias digitales excepcionales.',
                location: 'Ciudad de México, México',
                website: 'https://juanperez.dev',
                birthday: '1995-03-15'
            },
            professional: {
                title: 'Desarrollador Full Stack',
                company: 'TechCorp',
                experience: '5 años',
                skills: ['JavaScript', 'React', 'Node.js', 'Python', 'SQL'],
                education: 'Ingeniería en Sistemas Computacionales',
                certifications: ['AWS Certified Developer', 'Google Cloud Professional']
            },
            social: {
                linkedin: 'https://linkedin.com/in/juanperez',
                github: 'https://github.com/juanperez',
                twitter: 'https://twitter.com/juanperez',
                portfolio: 'https://juanperez.dev'
            },
            preferences: {
                timezone: 'America/Mexico_City',
                language: 'es',
                notifications: true,
                privacy: 'public'
            }
        };
    }

    saveProfile() {
        try {
            localStorage.setItem('astren_profile', JSON.stringify(this.profile));
        } catch (e) {
            console.error('Error saving profile:', e);
        }
    }

    setupEventListeners() {
        this.setupTabs();
        this.setupForms();
        this.setupAvatarUpload();
        this.setupActionButtons();
    }

    setupTabs() {
        const tabButtons = document.querySelectorAll('.profile-tab');
        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                const tabName = button.dataset.tab;
                this.switchTab(tabName);
            });
        });
    }

    setupForms() {
        this.setupPersonalForm();
        this.setupProfessionalForm();
        this.setupSocialForm();
        this.setupPreferencesForm();
    }

    setupPersonalForm() {
        const form = document.getElementById('personal-form');
        if (form) {
            form.addEventListener('submit', (e) => this.handlePersonalForm(e));
        }

        // Setup edit buttons
        const editPersonalBtn = document.getElementById('editPersonalInfo');
        if (editPersonalBtn) {
            editPersonalBtn.addEventListener('click', () => this.enablePersonalEditing());
        }

        const cancelPersonalBtn = document.getElementById('cancelPersonalEdit');
        if (cancelPersonalBtn) {
            cancelPersonalBtn.addEventListener('click', () => this.disablePersonalEditing());
        }
    }

    setupProfessionalForm() {
        const form = document.getElementById('professional-form');
        if (form) {
            form.addEventListener('submit', (e) => this.handleProfessionalForm(e));
        }

        const editProfessionalBtn = document.getElementById('editProfessionalInfo');
        if (editProfessionalBtn) {
            editProfessionalBtn.addEventListener('click', () => this.enableProfessionalEditing());
        }

        const cancelProfessionalBtn = document.getElementById('cancelProfessionalEdit');
        if (cancelProfessionalBtn) {
            cancelProfessionalBtn.addEventListener('click', () => this.disableProfessionalEditing());
        }
    }

    setupSocialForm() {
        const form = document.getElementById('social-form');
        if (form) {
            form.addEventListener('submit', (e) => this.handleSocialForm(e));
        }

        const editSocialBtn = document.getElementById('editSocialInfo');
        if (editSocialBtn) {
            editSocialBtn.addEventListener('click', () => this.enableSocialEditing());
        }

        const cancelSocialBtn = document.getElementById('cancelSocialEdit');
        if (cancelSocialBtn) {
            cancelSocialBtn.addEventListener('click', () => this.disableSocialEditing());
        }
    }

    setupPreferencesForm() {
        const form = document.getElementById('preferences-form');
        if (form) {
            form.addEventListener('submit', (e) => this.handlePreferencesForm(e));
        }
    }

    setupAvatarUpload() {
        const avatarUpload = document.getElementById('avatarUpload');
        if (avatarUpload) {
            avatarUpload.addEventListener('click', () => this.triggerAvatarUpload());
        }

        const avatarInput = document.getElementById('avatarInput');
        if (avatarInput) {
            avatarInput.addEventListener('change', (e) => this.handleAvatarUpload(e));
        }
    }

    setupActionButtons() {
        const shareBtn = document.getElementById('share-profile-btn');
        if (shareBtn) {
            shareBtn.addEventListener('click', () => this.shareProfile());
        }

        const exportBtn = document.getElementById('export-profile-btn');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => this.exportProfile());
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
        const tabButtons = document.querySelectorAll('.profile-tab');
        tabButtons.forEach(button => {
            button.classList.remove('profile-tab--active');
            if (button.dataset.tab === tabName) {
                button.classList.add('profile-tab--active');
            }
        });

        // Show tab content
        const tabContents = document.querySelectorAll('.profile-content');
        tabContents.forEach(content => {
            content.style.display = 'none';
            if (content.dataset.tab === tabName) {
                content.style.display = 'block';
            }
        });

        this.currentTab = tabName;
    }

    renderProfile() {
        this.renderOverview();
        this.renderPersonalInfo();
        this.renderProfessionalInfo();
        this.renderSocialInfo();
        this.renderPreferences();
    }

    renderOverview() {
        const container = document.getElementById('profile-overview');
        if (!container) return;

        const fullName = `${this.profile.personal.firstName} ${this.profile.personal.lastName}`;
        const reputation = this.getReputationData();
        
        container.innerHTML = `
            <div class="profile-header">
                <div class="profile-avatar">
                    <img src="${this.getAvatarUrl()}" alt="${fullName}" class="avatar-image">
                    <button class="avatar-edit" onclick="profileManager.triggerAvatarUpload()">
                        <i class="fas fa-camera"></i>
                    </button>
                </div>
                <div class="profile-info">
                    <h1 class="profile-name">${this.escapeHtml(fullName)}</h1>
                    <p class="profile-title">${this.escapeHtml(this.profile.professional.title)}</p>
                    <p class="profile-location">
                        <i class="fas fa-map-marker-alt"></i>
                        ${this.escapeHtml(this.profile.personal.location)}
                    </p>
                </div>
                <div class="profile-actions">
                    <button class="button button--primary" onclick="profileManager.editProfile()">
                        <i class="fas fa-edit"></i>
                        Editar Perfil
                    </button>
                    <button class="button button--secondary" onclick="profileManager.shareProfile()">
                        <i class="fas fa-share"></i>
                        Compartir
                    </button>
                </div>
            </div>

            <div class="profile-stats">
                <div class="stat-item">
                    <div class="stat-value">${reputation.current}</div>
                    <div class="stat-label">Reputación</div>
                    <div class="stat-stars">
                        ${this.generateStars(reputation.current)}
                    </div>
                </div>
                <div class="stat-item">
                    <div class="stat-value">${this.getCompletedTasks()}</div>
                    <div class="stat-label">Tareas Completadas</div>
                </div>
                <div class="stat-item">
                    <div class="stat-value">${this.getActiveGroups()}</div>
                    <div class="stat-label">Grupos Activos</div>
                </div>
                <div class="stat-item">
                    <div class="stat-value">${this.getStreakDays()}</div>
                    <div class="stat-label">Días Consecutivos</div>
                </div>
            </div>

            <div class="profile-bio">
                <p>${this.escapeHtml(this.profile.personal.bio)}</p>
            </div>
        `;
    }

    renderPersonalInfo() {
        const container = document.getElementById('personal-info');
        if (!container) return;

        container.innerHTML = `
            <div class="info-card">
                <div class="card-header">
                    <h3 class="card-title">
                        <i class="fas fa-user"></i>
                        Información Personal
                    </h3>
                    <button class="edit-btn" id="editPersonalInfo">
                        <i class="fas fa-edit"></i>
                        Editar
                    </button>
                </div>
                <div class="card-content">
                    <form class="info-form" id="personal-form">
                        <div class="form-group">
                            <label for="firstName">Nombre</label>
                            <input type="text" id="firstName" name="firstName" value="${this.escapeHtml(this.profile.personal.firstName)}" readonly>
                        </div>
                        <div class="form-group">
                            <label for="lastName">Apellido</label>
                            <input type="text" id="lastName" name="lastName" value="${this.escapeHtml(this.profile.personal.lastName)}" readonly>
                        </div>
                        <div class="form-group">
                            <label for="email">Email</label>
                            <input type="email" id="email" name="email" value="${this.escapeHtml(this.profile.personal.email)}" readonly>
                        </div>
                        <div class="form-group">
                            <label for="phone">Teléfono</label>
                            <input type="tel" id="phone" name="phone" value="${this.escapeHtml(this.profile.personal.phone)}" readonly>
                        </div>
                        <div class="form-group">
                            <label for="birthday">Fecha de Nacimiento</label>
                            <input type="date" id="birthday" name="birthday" value="${this.profile.personal.birthday}" readonly>
                        </div>
                        <div class="form-group">
                            <label for="location">Ubicación</label>
                            <input type="text" id="location" name="location" value="${this.escapeHtml(this.profile.personal.location)}" readonly>
                        </div>
                        <div class="form-group">
                            <label for="website">Sitio Web</label>
                            <input type="url" id="website" name="website" value="${this.escapeHtml(this.profile.personal.website)}" readonly>
                        </div>
                        <div class="form-group">
                            <label for="bio">Biografía</label>
                            <textarea id="bio" name="bio" rows="4" readonly>${this.escapeHtml(this.profile.personal.bio)}</textarea>
                        </div>
                        <div class="form-actions" id="personalInfoActions" style="display: none;">
                            <button type="submit" class="button button--primary">Guardar Cambios</button>
                            <button type="button" class="button button--secondary" id="cancelPersonalEdit">Cancelar</button>
                        </div>
                    </form>
                </div>
            </div>
        `;
    }

    renderProfessionalInfo() {
        const container = document.getElementById('professional-info');
        if (!container) return;

        container.innerHTML = `
            <div class="info-card">
                <div class="card-header">
                    <h3 class="card-title">
                        <i class="fas fa-briefcase"></i>
                        Información Profesional
                    </h3>
                    <button class="edit-btn" id="editProfessionalInfo">
                        <i class="fas fa-edit"></i>
                        Editar
                    </button>
                </div>
                <div class="card-content">
                    <form class="info-form" id="professional-form">
                        <div class="form-group">
                            <label for="title">Título Profesional</label>
                            <input type="text" id="title" name="title" value="${this.escapeHtml(this.profile.professional.title)}" readonly>
                        </div>
                        <div class="form-group">
                            <label for="company">Empresa</label>
                            <input type="text" id="company" name="company" value="${this.escapeHtml(this.profile.professional.company)}" readonly>
                        </div>
                        <div class="form-group">
                            <label for="experience">Experiencia</label>
                            <input type="text" id="experience" name="experience" value="${this.escapeHtml(this.profile.professional.experience)}" readonly>
                        </div>
                        <div class="form-group">
                            <label for="education">Educación</label>
                            <input type="text" id="education" name="education" value="${this.escapeHtml(this.profile.professional.education)}" readonly>
                        </div>
                        <div class="form-group">
                            <label for="skills">Habilidades</label>
                            <input type="text" id="skills" name="skills" value="${this.profile.professional.skills.join(', ')}" readonly>
                        </div>
                        <div class="form-group">
                            <label for="certifications">Certificaciones</label>
                            <input type="text" id="certifications" name="certifications" value="${this.profile.professional.certifications.join(', ')}" readonly>
                        </div>
                        <div class="form-actions" id="professionalInfoActions" style="display: none;">
                            <button type="submit" class="button button--primary">Guardar Cambios</button>
                            <button type="button" class="button button--secondary" id="cancelProfessionalEdit">Cancelar</button>
                        </div>
                    </form>
                </div>
            </div>
        `;
    }

    renderSocialInfo() {
        const container = document.getElementById('social-info');
        if (!container) return;

        container.innerHTML = `
            <div class="info-card">
                <div class="card-header">
                    <h3 class="card-title">
                        <i class="fas fa-share-alt"></i>
                        Redes Sociales
                    </h3>
                    <button class="edit-btn" id="editSocialInfo">
                        <i class="fas fa-edit"></i>
                        Editar
                    </button>
                </div>
                <div class="card-content">
                    <form class="info-form" id="social-form">
                        <div class="form-group">
                            <label for="linkedin">LinkedIn</label>
                            <input type="url" id="linkedin" name="linkedin" value="${this.escapeHtml(this.profile.social.linkedin)}" readonly>
                        </div>
                        <div class="form-group">
                            <label for="github">GitHub</label>
                            <input type="url" id="github" name="github" value="${this.escapeHtml(this.profile.social.github)}" readonly>
                        </div>
                        <div class="form-group">
                            <label for="twitter">Twitter</label>
                            <input type="url" id="twitter" name="twitter" value="${this.escapeHtml(this.profile.social.twitter)}" readonly>
                        </div>
                        <div class="form-group">
                            <label for="portfolio">Portfolio</label>
                            <input type="url" id="portfolio" name="portfolio" value="${this.escapeHtml(this.profile.social.portfolio)}" readonly>
                        </div>
                        <div class="form-actions" id="socialInfoActions" style="display: none;">
                            <button type="submit" class="button button--primary">Guardar Cambios</button>
                            <button type="button" class="button button--secondary" id="cancelSocialEdit">Cancelar</button>
                        </div>
                    </form>
                </div>
            </div>
        `;
    }

    renderPreferences() {
        const container = document.getElementById('preferences-info');
        if (!container) return;

        container.innerHTML = `
            <div class="info-card">
                <div class="card-header">
                    <h3 class="card-title">
                        <i class="fas fa-cog"></i>
                        Preferencias
                    </h3>
                </div>
                <div class="card-content">
                    <form class="info-form" id="preferences-form">
                        <div class="form-group">
                            <label for="timezone">Zona Horaria</label>
                            <select id="timezone" name="timezone" class="form-select">
                                <option value="America/Mexico_City" ${this.profile.preferences.timezone === 'America/Mexico_City' ? 'selected' : ''}>México (GMT-6)</option>
                                <option value="America/New_York" ${this.profile.preferences.timezone === 'America/New_York' ? 'selected' : ''}>Nueva York (GMT-5)</option>
                                <option value="Europe/Madrid" ${this.profile.preferences.timezone === 'Europe/Madrid' ? 'selected' : ''}>Madrid (GMT+1)</option>
                                <option value="Asia/Tokyo" ${this.profile.preferences.timezone === 'Asia/Tokyo' ? 'selected' : ''}>Tokio (GMT+9)</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="language">Idioma</label>
                            <select id="language" name="language" class="form-select">
                                <option value="es" ${this.profile.preferences.language === 'es' ? 'selected' : ''}>Español</option>
                                <option value="en" ${this.profile.preferences.language === 'en' ? 'selected' : ''}>English</option>
                                <option value="fr" ${this.profile.preferences.language === 'fr' ? 'selected' : ''}>Français</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="privacy">Privacidad</label>
                            <select id="privacy" name="privacy" class="form-select">
                                <option value="public" ${this.profile.preferences.privacy === 'public' ? 'selected' : ''}>Público</option>
                                <option value="friends" ${this.profile.preferences.privacy === 'friends' ? 'selected' : ''}>Solo amigos</option>
                                <option value="private" ${this.profile.preferences.privacy === 'private' ? 'selected' : ''}>Privado</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label class="toggle">
                                <input type="checkbox" id="notifications" name="notifications" ${this.profile.preferences.notifications ? 'checked' : ''}>
                                <span class="toggle-slider"></span>
                                <span class="toggle-label">Recibir notificaciones</span>
                            </label>
                        </div>
                        <div class="form-actions">
                            <button type="submit" class="button button--primary">Guardar Preferencias</button>
                        </div>
                    </form>
                </div>
            </div>
        `;
    }

    enablePersonalEditing() {
        const inputs = document.querySelectorAll('#personal-form input, #personal-form textarea');
        inputs.forEach(input => {
            input.readOnly = false;
        });
        
        const actions = document.getElementById('personalInfoActions');
        if (actions) {
            actions.style.display = 'flex';
        }
    }

    disablePersonalEditing() {
        const inputs = document.querySelectorAll('#personal-form input, #personal-form textarea');
        inputs.forEach(input => {
            input.readOnly = true;
        });
        
        const actions = document.getElementById('personalInfoActions');
        if (actions) {
            actions.style.display = 'none';
        }
    }

    enableProfessionalEditing() {
        const inputs = document.querySelectorAll('#professional-form input');
        inputs.forEach(input => {
            input.readOnly = false;
        });
        
        const actions = document.getElementById('professionalInfoActions');
        if (actions) {
            actions.style.display = 'flex';
        }
    }

    disableProfessionalEditing() {
        const inputs = document.querySelectorAll('#professional-form input');
        inputs.forEach(input => {
            input.readOnly = true;
        });
        
        const actions = document.getElementById('professionalInfoActions');
        if (actions) {
            actions.style.display = 'none';
        }
    }

    enableSocialEditing() {
        const inputs = document.querySelectorAll('#social-form input');
        inputs.forEach(input => {
            input.readOnly = false;
        });
        
        const actions = document.getElementById('socialInfoActions');
        if (actions) {
            actions.style.display = 'flex';
        }
    }

    disableSocialEditing() {
        const inputs = document.querySelectorAll('#social-form input');
        inputs.forEach(input => {
            input.readOnly = true;
        });
        
        const actions = document.getElementById('socialInfoActions');
        if (actions) {
            actions.style.display = 'none';
        }
    }

    handlePersonalForm(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        
        this.profile.personal = {
            firstName: formData.get('firstName'),
            lastName: formData.get('lastName'),
            email: formData.get('email'),
            phone: formData.get('phone'),
            birthday: formData.get('birthday'),
            location: formData.get('location'),
            website: formData.get('website'),
            bio: formData.get('bio')
        };

        this.saveProfile();
        this.disablePersonalEditing();
        this.renderProfile();
        this.showToast('Información personal actualizada', 'success');
    }

    handleProfessionalForm(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        
        this.profile.professional = {
            title: formData.get('title'),
            company: formData.get('company'),
            experience: formData.get('experience'),
            education: formData.get('education'),
            skills: formData.get('skills').split(',').map(skill => skill.trim()),
            certifications: formData.get('certifications').split(',').map(cert => cert.trim())
        };

        this.saveProfile();
        this.disableProfessionalEditing();
        this.renderProfile();
        this.showToast('Información profesional actualizada', 'success');
    }

    handleSocialForm(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        
        this.profile.social = {
            linkedin: formData.get('linkedin'),
            github: formData.get('github'),
            twitter: formData.get('twitter'),
            portfolio: formData.get('portfolio')
        };

        this.saveProfile();
        this.disableSocialEditing();
        this.renderProfile();
        this.showToast('Redes sociales actualizadas', 'success');
    }

    handlePreferencesForm(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        
        this.profile.preferences = {
            timezone: formData.get('timezone'),
            language: formData.get('language'),
            privacy: formData.get('privacy'),
            notifications: formData.get('notifications') === 'on'
        };

        this.saveProfile();
        this.showToast('Preferencias actualizadas', 'success');
    }

    triggerAvatarUpload() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.addEventListener('change', (e) => this.handleAvatarUpload(e));
        input.click();
    }

    handleAvatarUpload(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const avatarImg = document.querySelector('.avatar-image');
                if (avatarImg) {
                    avatarImg.src = e.target.result;
                }
                this.showToast('Avatar actualizado exitosamente', 'success');
            };
            reader.readAsDataURL(file);
        }
    }

    editProfile() {
        this.enablePersonalEditing();
    }

    shareProfile() {
        const shareData = {
            title: 'Mi Perfil en Astren',
            text: `Mira mi perfil profesional en Astren: ${this.profile.personal.firstName} ${this.profile.personal.lastName}`,
            url: window.location.href
        };

        if (navigator.share) {
            navigator.share(shareData);
        } else {
            navigator.clipboard.writeText(shareData.url).then(() => {
                this.showToast('Enlace del perfil copiado al portapapeles', 'success');
            });
        }
    }

    exportProfile() {
        const data = {
            profile: this.profile,
            exportDate: new Date().toISOString()
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `profile-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        this.showToast('Perfil exportado exitosamente', 'success');
    }

    getAvatarUrl() {
        const savedAvatar = localStorage.getItem('astren_avatar');
        if (savedAvatar) {
            return savedAvatar;
        }
        return 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="%233366FF"%3E%3Cpath fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd" /%3E%3C/svg%3E';
    }

    getReputationData() {
        // Get reputation from reputation manager if available
        if (window.reputationManager) {
            return {
                current: window.reputationManager.getCurrentScore(),
                ranking: window.reputationManager.getCurrentRanking()
            };
        }
        return { current: 4.2, ranking: 127 };
    }

    getCompletedTasks() {
        // Get tasks from tasks manager if available
        if (window.tasksManager) {
            return window.tasksManager.getTasksByStatus('completed').length;
        }
        return 24;
    }

    getActiveGroups() {
        // This would come from groups manager
        return 5;
    }

    getStreakDays() {
        // This would be calculated from task completion history
        return 7;
    }

    generateStars(rating) {
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;
        let starsHTML = '';

        for (let i = 0; i < 5; i++) {
            if (i < fullStars) {
                starsHTML += '<i class="fas fa-star"></i>';
            } else if (i === fullStars && hasHalfStar) {
                starsHTML += '<i class="fas fa-star-half-alt"></i>';
            } else {
                starsHTML += '<i class="far fa-star"></i>';
            }
        }

        return starsHTML;
    }

    loadUserData() {
        // Al cargar el perfil, obtener el usuario real de sessionStorage
        const userData = sessionStorage.getItem('astren_user');
        let nombre = '';
        let apellido = '';
        if (userData) {
            try {
                const user = JSON.parse(userData);
                nombre = user.nombre || '';
                apellido = user.apellido || '';
            } catch (e) {}
        }
        // Usar nombre y apellido en vez de firstName/lastName en todo el archivo
        this.profile.personal.firstName = nombre;
        this.profile.personal.lastName = apellido;
        this.saveProfile();
        this.renderProfile();
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
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

    getFullName() {
        return `${this.profile.personal.firstName} ${this.profile.personal.lastName}`;
    }

    getEmail() {
        return this.profile.personal.email;
    }

    getProfessionalTitle() {
        return this.profile.professional.title;
    }

    getSkills() {
        return this.profile.professional.skills;
    }
}

// Global functions for profile interactions
function shareProfile() {
    if (window.profileManager) {
        window.profileManager.shareProfile();
    }
}

function exportProfile() {
    if (window.profileManager) {
        window.profileManager.exportProfile();
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    if (document.querySelector('.profile-grid') || document.querySelector('.profile-card')) {
        window.profileManager = new ProfileManager();
    }
});

// Export for global access
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ProfileManager;
}