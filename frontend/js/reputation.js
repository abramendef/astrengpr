/*===== REPUTATION PAGE FUNCTIONALITY =====*/

document.addEventListener('DOMContentLoaded', function() {
    if (document.querySelector('.reputation__score-value')) {
        initReputation();
        loadReputationData();
        initCharts();
    }
});

/*===== INITIALIZE REPUTATION =====*/
function initReputation() {
    // Share profile button
    const shareProfileBtn = document.getElementById('share-profile-btn');
    if (shareProfileBtn) {
        shareProfileBtn.addEventListener('click', shareProfile);
    }

    // Evidence buttons
    document.addEventListener('click', function(e) {
        if (e.target.closest('.button') && e.target.closest('.button').textContent.includes('Ver evidencia')) {
            showEvidenceModal();
        }
    });
}

/*===== LOAD REPUTATION DATA =====*/
function loadReputationData() {
    const reputationData = getReputationData();
    
    // Update overall score
    updateOverallScore(reputationData.overall);
    
    // Update categories
    updateCategories(reputationData.categories);
    
    // Update recent achievements
    updateRecentAchievements(reputationData.achievements);
    
    // Update badges
    updateBadges(reputationData.badges);
}

/*===== UPDATE OVERALL SCORE =====*/
function updateOverallScore(overallData) {
    const scoreValue = document.querySelector('.reputation__score-value');
    const stars = document.querySelector('.reputation__stars-large');
    const progressBar = document.querySelector('.reputation__progress-bar');
    
    if (scoreValue) scoreValue.textContent = overallData.score.toFixed(1);
    
    if (stars) {
        const fullStars = Math.floor(overallData.score);
        const hasHalfStar = overallData.score % 1 >= 0.5;
        
        stars.innerHTML = '';
        for (let i = 0; i < 5; i++) {
            if (i < fullStars) {
                stars.innerHTML += '<i class="fas fa-star"></i>';
            } else if (i === fullStars && hasHalfStar) {
                stars.innerHTML += '<i class="fas fa-star-half-alt"></i>';
            } else {
                stars.innerHTML += '<i class="far fa-star"></i>';
            }
        }
    }
    
    if (progressBar) {
        progressBar.style.setProperty('--progress-width', `${overallData.nextLevelProgress}%`);
    }
    
    // Update details
    const ranking = document.querySelector('.reputation__detail-value');
    if (ranking) ranking.textContent = `#${overallData.ranking} de ${overallData.totalUsers.toLocaleString()}`;
    
    const totalStars = document.querySelectorAll('.reputation__detail-value')[2];
    if (totalStars) totalStars.textContent = `${overallData.totalTasks} tareas`;
}

/*===== UPDATE CATEGORIES =====*/
function updateCategories(categories) {
    categories.forEach((category, index) => {
        const categoryCard = document.querySelectorAll('.category__card')[index];
        if (!categoryCard) return;
        
        // Update stars
        const starsContainer = categoryCard.querySelector('.category__stars');
        if (starsContainer) {
            const fullStars = Math.floor(category.score);
            const hasHalfStar = category.score % 1 >= 0.5;
            
            starsContainer.innerHTML = '';
            for (let i = 0; i < 5; i++) {
                if (i < fullStars) {
                    starsContainer.innerHTML += '<i class="fas fa-star"></i>';
                } else if (i === fullStars && hasHalfStar) {
                    starsContainer.innerHTML += '<i class="fas fa-star-half-alt"></i>';
                } else {
                    starsContainer.innerHTML += '<i class="far fa-star"></i>';
                }
            }
        }
        
        // Update score
        const scoreElement = categoryCard.querySelector('.category__score');
        if (scoreElement) scoreElement.textContent = category.score.toFixed(1);
        
        // Update stats
        const statValues = categoryCard.querySelectorAll('.category__stat-value');
        if (statValues[0]) statValues[0].textContent = category.projects;
        if (statValues[1]) statValues[1].textContent = category.average;
    });
}

/*===== UPDATE RECENT ACHIEVEMENTS =====*/
function updateRecentAchievements(achievements) {
    const achievementsList = document.querySelector('.achievements__list');
    if (!achievementsList) return;
    
    achievementsList.innerHTML = achievements.map(achievement => `
        <div class="achievement__item">
            <div class="achievement__icon">
                <i class="${achievement.icon}"></i>
            </div>
            <div class="achievement__content">
                <h4 class="achievement__title">${achievement.title}</h4>
                <p class="achievement__description">${achievement.description}</p>
                <span class="achievement__date">${formatAchievementDate(achievement.date)}</span>
            </div>
            <div class="achievement__evidence">
                <button class="button button--small button--ghost" onclick="showEvidenceModal('${achievement.id}')">
                    <i class="fas fa-eye"></i>
                    Ver evidencia
                </button>
            </div>
        </div>
    `).join('');
}

/*===== UPDATE BADGES =====*/
function updateBadges(badges) {
    const badgesGrid = document.querySelector('.badges__grid');
    if (!badgesGrid) return;
    
    badgesGrid.innerHTML = badges.map(badge => `
        <div class="badge ${badge.earned ? 'badge--earned' : ''}">
            <div class="badge__icon">
                <i class="${badge.icon}"></i>
            </div>
            <div class="badge__info">
                <h4 class="badge__title">${badge.title}</h4>
                <p class="badge__description">${badge.description}</p>
            </div>
        </div>
    `).join('');
}

/*===== INITIALIZE CHARTS =====*/
function initCharts() {
    initReputationEvolutionChart();
    initStarsDistributionChart();
}

/*===== REPUTATION EVOLUTION CHART =====*/
function initReputationEvolutionChart() {
    const canvas = document.getElementById('reputation-evolution-chart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
            datasets: [{
                label: 'Reputación',
                data: [3.2, 3.5, 3.8, 4.0, 4.1, 4.2],
                borderColor: 'hsl(var(--primary-color))',
                backgroundColor: 'hsl(var(--primary-color-light))',
                borderWidth: 3,
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: false,
                    min: 0,
                    max: 5,
                    ticks: {
                        stepSize: 1
                    }
                }
            }
        }
    });
}

/*===== STARS DISTRIBUTION CHART =====*/
function initStarsDistributionChart() {
    const canvas = document.getElementById('stars-distribution-chart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Desarrollo', 'Colaboración', 'Puntualidad', 'Calidad'],
            datasets: [{
                data: [4.8, 4.1, 3.9, 4.7],
                backgroundColor: [
                    'hsl(var(--primary-color))',
                    'hsl(var(--success-color))',
                    'hsl(var(--warning-color))',
                    'hsl(var(--info-color))'
                ],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
}

/*===== SHOW EVIDENCE MODAL =====*/
function showEvidenceModal(achievementId = null) {
    const modal = document.getElementById('evidence-modal');
    const evidenceContent = document.getElementById('evidence-content');
    
    if (!modal || !evidenceContent) return;
    
    // Sample evidence data
    const evidenceData = {
        type: 'Optimización de Base de Datos',
        items: [
            {
                type: 'Imagen',
                content: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
                description: 'Captura de pantalla mostrando la mejora del 40% en rendimiento'
            },
            {
                type: 'Texto',
                content: 'Implementé una optimización en las consultas SQL que redujo el tiempo de respuesta promedio de 2.5 segundos a 1.5 segundos. Los cambios incluyeron la creación de índices específicos y la reescritura de consultas complejas utilizando técnicas de optimización avanzadas.',
                description: 'Descripción detallada del trabajo realizado'
            }
        ]
    };
    
    evidenceContent.innerHTML = evidenceData.items.map(item => `
        <div class="evidence__item">
            <div class="evidence__type">${item.type}</div>
            <div class="evidence__content-item">
                ${item.type === 'Imagen' ? 
                    `<img src="${item.content}" alt="Evidencia" class="evidence__image">` :
                    `<p class="evidence__text">${item.content}</p>`
                }
            </div>
        </div>
    `).join('');
    
    modal.style.display = 'flex';
    modal.offsetHeight; // Trigger reflow
    modal.classList.add('modal--show');
}

/*===== CLOSE EVIDENCE MODAL =====*/
function closeEvidenceModal() {
    const modal = document.getElementById('evidence-modal');
    if (!modal) return;
    
    modal.classList.remove('modal--show');
    setTimeout(() => {
        modal.style.display = 'none';
    }, 300);
}

/*===== SHARE PROFILE =====*/
function shareProfile() {
    const profileUrl = `${window.location.origin}/profile/user_demo`;
    
    if (navigator.share) {
        navigator.share({
            title: 'Mi Perfil de Reputación - Astren',
            text: 'Mira mi reputación profesional en Astren',
            url: profileUrl
        });
    } else {
        // Fallback: copy to clipboard
        navigator.clipboard.writeText(profileUrl).then(() => {
            showNotification('Enlace del perfil copiado al portapapeles', 'success');
        }).catch(() => {
            showNotification('No se pudo copiar el enlace', 'error');
        });
    }
}

/*===== GET REPUTATION DATA =====*/
function getReputationData() {
    // Sample reputation data
    return {
        overall: {
            score: 4.2,
            ranking: 127,
            totalUsers: 10234,
            nextLevelProgress: 75,
            totalTasks: 156
        },
        categories: [
            {
                name: 'Desarrollo',
                score: 4.8,
                projects: 45,
                average: 4.2
            },
            {
                name: 'Colaboración',
                score: 4.1,
                projects: 12,
                average: 4.1
            },
            {
                name: 'Puntualidad',
                score: 3.9,
                projects: '95%',
                average: 3.9
            },
            {
                name: 'Calidad',
                score: 4.7,
                projects: 156,
                average: 4.7
            }
        ],
        achievements: [
            {
                id: 'ach_1',
                icon: 'fas fa-star',
                title: '5 estrellas por "Optimización de base de datos"',
                description: 'Tu solución mejoró el rendimiento en un 40%',
                date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
            },
            {
                id: 'ach_2',
                icon: 'fas fa-trophy',
                title: 'Insignia "Top Performer" obtenida',
                description: 'Has completado más de 100 tareas exitosamente',
                date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
            },
            {
                id: 'ach_3',
                icon: 'fas fa-users',
                title: '4 estrellas por liderazgo en grupo',
                description: 'Excelente coordinación en el proyecto "App Mobile"',
                date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString()
            }
        ],
        badges: [
            {
                id: 'badge_1',
                icon: 'fas fa-trophy',
                title: 'Top Performer',
                description: '100+ tareas completadas',
                earned: true
            },
            {
                id: 'badge_2',
                icon: 'fas fa-users',
                title: 'Colaborador',
                description: 'Miembro activo en 5+ grupos',
                earned: true
            },
            {
                id: 'badge_3',
                icon: 'fas fa-clock',
                title: 'Puntual',
                description: '95% entregas a tiempo',
                earned: true
            },
            {
                id: 'badge_4',
                icon: 'fas fa-rocket',
                title: 'Innovador',
                description: 'Proponer 10 mejoras implementadas',
                earned: false
            }
        ]
    };
}

/*===== UTILITY FUNCTIONS =====*/
function formatAchievementDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Ayer';
    if (diffDays === 0) return 'Hoy';
    if (diffDays < 7) return `Hace ${diffDays} días`;
    if (diffDays < 30) return `Hace ${Math.ceil(diffDays / 7)} semanas`;
    return `Hace ${Math.ceil(diffDays / 30)} meses`;
}

        Logger.info('Módulo de reputación de Astren cargado correctamente', null, 'UI');

// Sistema de Reputación Completo y Robusto de Astren
class ReputationManager {
    constructor() {
        this.reputation = this.loadReputation();
        this.history = this.loadHistory();
        this.currentFilter = 'all';
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.renderReputation();
        this.setupCharts();
        this.setupGlobalEvents();
        Logger.info('Reputation Manager inicializado', null, 'UI');
    }

    loadReputation() {
        const savedReputation = localStorage.getItem('astren_reputation');
        if (savedReputation) {
            try {
                return JSON.parse(savedReputation);
            } catch (e) {
                console.error('Error parsing reputation:', e);
                return this.getDefaultReputation();
            }
        }
        return this.getDefaultReputation();
    }

    getDefaultReputation() {
        return {
            overall: {
                score: 4.2,
                ranking: 127,
                totalUsers: 10234,
                nextLevelProgress: 75,
                totalTasks: 156,
                level: 8
            },
            categories: [
                {
                    name: 'Desarrollo',
                    score: 4.8,
                    projects: 45,
                    average: 4.2,
                    icon: 'fas fa-laptop-code'
                },
                {
                    name: 'Colaboración',
                    score: 4.1,
                    projects: 12,
                    average: 4.1,
                    icon: 'fas fa-users'
                },
                {
                    name: 'Liderazgo',
                    score: 3.9,
                    projects: 8,
                    average: 3.9,
                    icon: 'fas fa-crown'
                },
                {
                    name: 'Innovación',
                    score: 4.5,
                    projects: 23,
                    average: 4.5,
                    icon: 'fas fa-lightbulb'
                }
            ],
            badges: [
                {
                    id: 1,
                    title: 'Top Performer',
                    description: '100+ tareas completadas',
                    icon: 'fas fa-trophy',
                    earned: true,
                    earnedDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString()
                },
                {
                    id: 2,
                    title: 'Colaborador',
                    description: 'Miembro activo en 5+ grupos',
                    icon: 'fas fa-users',
                    earned: true,
                    earnedDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 15).toISOString()
                },
                {
                    id: 3,
                    title: 'Puntual',
                    description: '95% entregas a tiempo',
                    icon: 'fas fa-clock',
                    earned: true,
                    earnedDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString()
                },
                {
                    id: 4,
                    title: 'Innovador',
                    description: 'Proponer 10 mejoras implementadas',
                    icon: 'fas fa-rocket',
                    earned: false
                },
                {
                    id: 5,
                    title: 'Mentor',
                    description: 'Ayudar a 20+ usuarios nuevos',
                    icon: 'fas fa-chalkboard-teacher',
                    earned: false
                }
            ],
            achievements: [
                {
                    id: 1,
                    title: 'Primera tarea completada',
                    description: 'Completaste tu primera tarea en Astren',
                    icon: 'fas fa-check-circle',
                    date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 90).toISOString(),
                    stars: 3
                },
                {
                    id: 2,
                    title: 'Reputación 4.0+',
                    description: 'Alcanzaste una reputación de 4.0 estrellas',
                    icon: 'fas fa-star',
                    date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 45).toISOString(),
                    stars: 4
                },
                {
                    id: 3,
                    title: 'Líder de grupo',
                    description: 'Te convertiste en líder de un grupo',
                    icon: 'fas fa-crown',
                    date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 20).toISOString(),
                    stars: 5
                }
            ]
        };
    }

    loadHistory() {
        const savedHistory = localStorage.getItem('astren_reputation_history');
        if (savedHistory) {
            try {
                return JSON.parse(savedHistory);
            } catch (e) {
                console.error('Error parsing reputation history:', e);
                return this.getDefaultHistory();
            }
        }
        return this.getDefaultHistory();
    }

    getDefaultHistory() {
        return [
            {
                id: 1,
                type: 'task_completed',
                title: 'Tarea completada',
                description: 'Presentación proyecto final',
                stars: 4,
                timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
                area: 'school'
            },
            {
                id: 2,
                type: 'evidence_validated',
                title: 'Evidencia validada',
                description: 'Diseño de interfaz',
                stars: 5,
                timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
                area: 'work'
            },
            {
                id: 3,
                type: 'group_activity',
                title: 'Actividad en grupo',
                description: 'Equipo Desarrollo',
                stars: 3,
                timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
                area: 'work'
            },
            {
                id: 4,
                type: 'badge_earned',
                title: 'Insignia obtenida',
                description: 'Top Performer',
                stars: 5,
                timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString(),
                area: 'general'
            }
        ];
    }

    saveReputation() {
        try {
            localStorage.setItem('astren_reputation', JSON.stringify(this.reputation));
        } catch (e) {
            console.error('Error saving reputation:', e);
        }
    }

    saveHistory() {
        try {
            localStorage.setItem('astren_reputation_history', JSON.stringify(this.history));
        } catch (e) {
            console.error('Error saving reputation history:', e);
        }
    }

    setupEventListeners() {
        this.setupFilters();
        this.setupActionButtons();
        this.setupGlobalEvents();
    }

    setupFilters() {
        const filterButtons = document.querySelectorAll('.reputation-filter');
        filterButtons.forEach(button => {
            button.addEventListener('click', () => {
                filterButtons.forEach(btn => btn.classList.remove('reputation-filter--active'));
                button.classList.add('reputation-filter--active');
                this.currentFilter = button.dataset.filter;
                this.renderHistory();
            });
        });
    }

    setupActionButtons() {
        const shareBtn = document.getElementById('share-profile-btn');
        if (shareBtn) {
            shareBtn.addEventListener('click', () => this.shareProfile());
        }

        const exportBtn = document.getElementById('export-reputation-btn');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => this.exportReputation());
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

    renderReputation() {
        this.renderReputationSummary();
        this.renderCategories();
        this.renderBadges();
        this.renderAchievements();
        this.renderHistory();
    }

    renderReputationSummary() {
        const scoreValue = document.querySelector('.reputation__score-value');
        const starsContainer = document.querySelector('.reputation__stars-large');
        const progressBar = document.querySelector('.reputation__progress-bar');
        const rankingElement = document.querySelector('.reputation__detail-value');
        const totalStarsElement = document.querySelectorAll('.reputation__detail-value')[2];

        if (scoreValue) {
            scoreValue.textContent = this.reputation.overall.score.toFixed(1);
        }

        if (starsContainer) {
            starsContainer.innerHTML = this.generateStars(this.reputation.overall.score);
        }

        if (progressBar) {
            progressBar.style.width = `${this.reputation.overall.nextLevelProgress}%`;
        }

        if (rankingElement) {
            rankingElement.textContent = `#${this.reputation.overall.ranking} de ${this.reputation.overall.totalUsers.toLocaleString()}`;
        }

        if (totalStarsElement) {
            totalStarsElement.textContent = `${this.reputation.overall.totalTasks} tareas`;
        }
    }

    renderCategories() {
        const categoriesGrid = document.querySelector('.categories__grid');
        if (!categoriesGrid) return;

        categoriesGrid.innerHTML = this.reputation.categories.map(category => `
            <div class="category__card">
                <div class="category__header">
                    <div class="category__icon">
                        <i class="${category.icon}"></i>
                    </div>
                    <div class="category__info">
                        <h4 class="category__title">${this.escapeHtml(category.name)}</h4>
                        <div class="category__stars">
                            ${this.generateStars(category.score)}
                        </div>
                        <span class="category__score">${category.score.toFixed(1)}</span>
                    </div>
                </div>
                <div class="category__stats">
                    <div class="category__stat">
                        <span class="category__stat-value">${category.projects}</span>
                        <span class="category__stat-label">Proyectos</span>
                    </div>
                    <div class="category__stat">
                        <span class="category__stat-value">${category.average}</span>
                        <span class="category__stat-label">Promedio</span>
                    </div>
                </div>
            </div>
        `).join('');
    }

    renderBadges() {
        const badgesGrid = document.querySelector('.badges__grid');
        if (!badgesGrid) return;

        badgesGrid.innerHTML = this.reputation.badges.map(badge => `
            <div class="badge ${badge.earned ? 'badge--earned' : ''}">
                <div class="badge__icon">
                    <i class="${badge.icon}"></i>
                </div>
                <div class="badge__info">
                    <h4 class="badge__title">${this.escapeHtml(badge.title)}</h4>
                    <p class="badge__description">${this.escapeHtml(badge.description)}</p>
                    ${badge.earned && badge.earnedDate ? `
                        <span class="badge__date">${this.formatDate(badge.earnedDate)}</span>
                    ` : ''}
                </div>
            </div>
        `).join('');
    }

    renderAchievements() {
        const achievementsList = document.querySelector('.achievements__list');
        if (!achievementsList) return;

        achievementsList.innerHTML = this.reputation.achievements.map(achievement => `
            <div class="achievement__item">
                <div class="achievement__icon">
                    <i class="${achievement.icon}"></i>
                </div>
                <div class="achievement__content">
                    <h4 class="achievement__title">${this.escapeHtml(achievement.title)}</h4>
                    <p class="achievement__description">${this.escapeHtml(achievement.description)}</p>
                    <span class="achievement__date">${this.formatDate(achievement.date)}</span>
                </div>
                <div class="achievement__stars">
                    <span class="stars__value">${achievement.stars}</span>
                    <span class="stars__label">⭐</span>
                </div>
            </div>
        `).join('');
    }

    renderHistory() {
        const historyList = document.querySelector('.history__list');
        if (!historyList) return;

        const filteredHistory = this.getFilteredHistory();
        
        if (filteredHistory.length === 0) {
            historyList.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state__icon">
                        <i class="fas fa-history"></i>
                    </div>
                    <h3 class="empty-state__title">No hay actividad</h3>
                    <p class="empty-state__description">
                        ${this.currentFilter === 'all' ? 'Aún no hay actividad registrada.' : 'No hay actividad en esta categoría.'}
                    </p>
                </div>
            `;
            return;
        }

        historyList.innerHTML = filteredHistory.map(item => this.createHistoryItem(item)).join('');
    }

    getFilteredHistory() {
        let filtered = [...this.history];

        switch (this.currentFilter) {
            case 'tasks':
                filtered = filtered.filter(item => item.type.includes('task'));
                break;
            case 'groups':
                filtered = filtered.filter(item => item.type.includes('group'));
                break;
            case 'badges':
                filtered = filtered.filter(item => item.type.includes('badge'));
                break;
            case 'evidence':
                filtered = filtered.filter(item => item.type.includes('evidence'));
                break;
        }

        return filtered.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    }

    createHistoryItem(item) {
        const timeAgo = this.getTimeAgo(item.timestamp);
        const icon = this.getHistoryIcon(item.type);
        
        return `
            <div class="history__item">
                <div class="history__icon">
                    <i class="${icon}"></i>
                </div>
                <div class="history__content">
                    <h4 class="history__title">${this.escapeHtml(item.title)}</h4>
                    <p class="history__description">${this.escapeHtml(item.description)}</p>
                    <span class="history__time">${timeAgo}</span>
                </div>
                <div class="history__stars">
                    <span class="stars__value">${item.stars}</span>
                    <span class="stars__label">⭐</span>
                </div>
            </div>
        `;
    }

    setupCharts() {
        this.initReputationChart();
        this.initProgressChart();
        this.initHistoryChart();
    }

    initReputationChart() {
        const canvas = document.getElementById('reputationChart');
        if (!canvas || typeof Chart === 'undefined') return;

        const ctx = canvas.getContext('2d');
        
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
                datasets: [{
                    label: 'Reputación',
                    data: [3.2, 3.5, 3.8, 4.0, 4.1, 4.2],
                    borderColor: '#3366FF',
                    backgroundColor: 'rgba(51, 102, 255, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: '#3366FF',
                    pointBorderColor: '#FFFFFF',
                    pointBorderWidth: 2,
                    pointRadius: 6,
                    pointHoverRadius: 8
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: false,
                        min: 0,
                        max: 5,
                        ticks: {
                            stepSize: 1
                        }
                    }
                }
            }
        });
    }

    initProgressChart() {
        const canvas = document.getElementById('progressChart');
        if (!canvas || typeof Chart === 'undefined') return;

        const ctx = canvas.getContext('2d');
        
        new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Completado', 'Restante'],
                datasets: [{
                    data: [this.reputation.overall.nextLevelProgress, 100 - this.reputation.overall.nextLevelProgress],
                    backgroundColor: ['#10B981', '#E5E7EB'],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                cutout: '70%'
            }
        });
    }

    initHistoryChart() {
        const canvas = document.getElementById('historyChart');
        if (!canvas || typeof Chart === 'undefined') return;

        const ctx = canvas.getContext('2d');
        
        // Group history by month
        const monthlyData = this.getMonthlyHistoryData();
        
        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: monthlyData.labels,
                datasets: [{
                    label: 'Estrellas promedio',
                    data: monthlyData.data,
                    backgroundColor: '#3366FF',
                    borderRadius: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }

    getMonthlyHistoryData() {
        const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'];
        const data = [3.2, 3.5, 3.8, 4.0, 4.1, 4.2];
        
        return {
            labels: months,
            data: data
        };
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

    getHistoryIcon(type) {
        const icons = {
            task_completed: 'fas fa-check-circle',
            evidence_validated: 'fas fa-camera',
            group_activity: 'fas fa-users',
            badge_earned: 'fas fa-trophy',
            reputation_increase: 'fas fa-star',
            milestone_reached: 'fas fa-flag'
        };
        return icons[type] || 'fas fa-circle';
    }

    getTimeAgo(timestamp) {
        const now = Date.now();
        const diff = now - new Date(timestamp).getTime();
        
        const minutes = Math.floor(diff / (1000 * 60));
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        
        if (minutes < 1) return 'Ahora mismo';
        if (minutes < 60) return `Hace ${minutes} min`;
        if (hours < 24) return `Hace ${hours} h`;
        if (days < 7) return `Hace ${days} días`;
        
        return new Date(timestamp).toLocaleDateString('es-ES');
    }

    formatDate(dateString) {
        return new Date(dateString).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    addReputationStars(stars, type, title, description, area = 'general') {
        const historyItem = {
            id: Date.now(),
            type,
            title,
            description,
            stars,
            timestamp: new Date().toISOString(),
            area
        };

        this.history.unshift(historyItem);
        this.saveHistory();

        // Update overall score
        this.reputation.overall.totalTasks += 1;
        this.reputation.overall.score = Math.min(5, this.reputation.overall.score + (stars / 100));
        this.saveReputation();

        this.renderReputation();
        this.showToast(`+${stars} estrellas ganadas`, 'success');
    }

    shareProfile() {
        const shareData = {
            title: 'Mi Reputación en Astren',
            text: `Mi reputación actual es de ${this.reputation.overall.score.toFixed(1)} estrellas. ¡Mírala aquí!`,
            url: window.location.href
        };

        if (navigator.share) {
            navigator.share(shareData);
        } else {
            // Fallback: copy to clipboard
            navigator.clipboard.writeText(shareData.url).then(() => {
                this.showToast('Enlace copiado al portapapeles', 'success');
            });
        }
    }

    exportReputation() {
        const data = {
            reputation: this.reputation,
            history: this.history,
            exportDate: new Date().toISOString()
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `reputation-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        this.showToast('Reputación exportada exitosamente', 'success');
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

    getCurrentScore() {
        return this.reputation.overall.score;
    }

    getCurrentRanking() {
        return this.reputation.overall.ranking;
    }

    getEarnedBadges() {
        return this.reputation.badges.filter(badge => badge.earned);
    }

    getRecentActivity(limit = 10) {
        return this.history.slice(0, limit);
    }
}

// Global functions for modal interactions
function showEvidenceModal(achievementId = null) {
    const modal = document.getElementById('evidenceModal');
    if (modal) {
        modal.style.display = 'flex';
        
        if (achievementId) {
            // Load specific achievement evidence
            const achievement = window.reputationManager?.reputation.achievements.find(a => a.id == achievementId);
            if (achievement) {
                const content = modal.querySelector('.modal-content');
                if (content) {
                    content.innerHTML = `
                        <div class="evidence__header">
                            <h3>${achievement.title}</h3>
                            <p>${achievement.description}</p>
                        </div>
                        <div class="evidence__content">
                            <p>Evidencia de logro obtenido el ${new Date(achievement.date).toLocaleDateString('es-ES')}</p>
                            <div class="evidence__preview">
                                <i class="fas fa-trophy"></i>
                                <span>Logro verificado</span>
                            </div>
                        </div>
                    `;
                }
            }
        }
    }
}

function closeEvidenceModal() {
    const modal = document.getElementById('evidenceModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

function shareProfile() {
    if (window.reputationManager) {
        window.reputationManager.shareProfile();
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    if (document.querySelector('.reputation__score-value')) {
        window.reputationManager = new ReputationManager();
    }
});

// Export for global access
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ReputationManager;
}