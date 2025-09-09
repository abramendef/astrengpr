/*===== REPUTATION PAGE FUNCTIONALITY =====*/

// Global variables
let reputationManager;
let charts = {};
let currentFilters = {
    categories: 'all',
    activity: 'all',
    chartPeriod: '30'
};

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    if (document.querySelector('.reputation__score-value')) {
        initReputationPage();
    }
});

/*===== INITIALIZE REPUTATION PAGE =====*/
function initReputationPage() {
    try {
        reputationManager = new ReputationManager();
        reputationManager.init();
        
        setupEventListeners();
        loadReputationData();
        initCharts();
        
        Logger.info('Página de reputación inicializada correctamente', null, 'UI');
    } catch (error) {
        console.error('Error inicializando página de reputación:', error);
        showNotification('Error al cargar la página de reputación', 'error');
    }
}

/*===== REPUTATION MANAGER CLASS =====*/
class ReputationManager {
    constructor() {
        this.reputation = this.getDefaultReputation();
        this.history = this.getDefaultHistory();
        this.badges = this.getDefaultBadges();
        this.achievements = this.getDefaultAchievements();
        this.milestones = this.getDefaultMilestones();
        this.categories = this.getDefaultCategories();
    }

    init() {
        this.renderReputationOverview();
        this.renderCategories();
        this.renderBadges();
        this.renderAchievements();
        this.renderMilestones();
        this.renderActivity();
        this.setupTabs();
        this.setupFilters();
    }

    /*===== DEFAULT DATA =====*/
    getDefaultReputation() {
        return {
            overall: {
                score: 4.2,
                level: 'plata',
                ranking: 127,
                totalUsers: 10234,
                nextLevelProgress: 75,
                totalTasks: 156,
                totalStars: 1247,
                weeklyAverage: 4.3,
                streakDays: 12,
                groupsActive: 5
            }
        };
    }

    getDefaultHistory() {
        return [
            {
                id: 1,
                type: 'task_completed',
                title: 'Tarea completada',
                description: 'Optimización de base de datos - Mejora del 40% en rendimiento',
                stars: 5,
                timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
                area: 'work'
            },
            {
                id: 2,
                type: 'evidence_validated',
                title: 'Evidencia validada',
                description: 'Diseño de interfaz de usuario - Prototipo aprobado',
                stars: 4,
                timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
                area: 'work'
            },
            {
                id: 3,
                type: 'group_activity',
                title: 'Actividad en grupo',
                description: 'Liderazgo en equipo de desarrollo',
                stars: 4,
                timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
                area: 'work'
            },
            {
                id: 4,
                type: 'badge_earned',
                title: 'Insignia obtenida',
                description: 'Top Performer - 100+ tareas completadas',
                stars: 5,
                timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
                area: 'general'
            },
            {
                id: 5,
                type: 'milestone_reached',
                title: 'Hito alcanzado',
                description: 'Reputación 4.0+ - Nivel Plata',
                stars: 4,
                timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
                area: 'general'
            }
        ];
    }

    getDefaultBadges() {
        return [
                {
                    id: 1,
                    title: 'Top Performer',
                description: 'Completar 100+ tareas exitosamente',
                    icon: 'fas fa-trophy',
                    earned: true,
                earnedDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
                criteria: [
                    'Completar 100 tareas',
                    'Mantener promedio 4.0+',
                    'Actividad consistente'
                ]
                },
                {
                    id: 2,
                    title: 'Colaborador',
                description: 'Ser miembro activo en 5+ grupos',
                    icon: 'fas fa-users',
                    earned: true,
                earnedDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
                criteria: [
                    'Unirse a 5 grupos',
                    'Participar activamente',
                    'Contribuir regularmente'
                ]
                },
                {
                    id: 3,
                    title: 'Puntual',
                description: 'Entregar 95% de tareas a tiempo',
                    icon: 'fas fa-clock',
                    earned: true,
                earnedDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
                criteria: [
                    '95% entregas a tiempo',
                    'Mantener consistencia',
                    'Planificación efectiva'
                ]
                },
                {
                    id: 4,
                    title: 'Innovador',
                    description: 'Proponer 10 mejoras implementadas',
                    icon: 'fas fa-rocket',
                earned: false,
                criteria: [
                    'Proponer 10 mejoras',
                    'Que sean implementadas',
                    'Impacto medible'
                ]
                },
                {
                    id: 5,
                    title: 'Mentor',
                    description: 'Ayudar a 20+ usuarios nuevos',
                    icon: 'fas fa-chalkboard-teacher',
                earned: false,
                criteria: [
                    'Ayudar 20 usuarios',
                    'Proporcionar guía',
                    'Feedback constructivo'
                ]
            },
            {
                id: 6,
                title: 'Líder',
                description: 'Liderar 3+ proyectos exitosos',
                icon: 'fas fa-crown',
                earned: false,
                criteria: [
                    'Liderar 3 proyectos',
                    'Resultados exitosos',
                    'Equipo satisfecho'
                ]
            }
        ];
    }

    getDefaultAchievements() {
        return [
                {
                    id: 1,
                    title: 'Primera tarea completada',
                    description: 'Completaste tu primera tarea en Astren',
                    icon: 'fas fa-check-circle',
                date: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
                stars: 3,
                type: 'milestone'
                },
                {
                    id: 2,
                    title: 'Reputación 4.0+',
                    description: 'Alcanzaste una reputación de 4.0 estrellas',
                    icon: 'fas fa-star',
                date: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
                stars: 4,
                type: 'milestone'
                },
                {
                    id: 3,
                    title: 'Líder de grupo',
                    description: 'Te convertiste en líder de un grupo',
                    icon: 'fas fa-crown',
                date: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
                stars: 5,
                type: 'leadership'
            },
            {
                id: 4,
                title: 'Racha de 10 días',
                description: 'Completaste tareas por 10 días consecutivos',
                icon: 'fas fa-fire',
                date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
                stars: 4,
                type: 'consistency'
            }
        ];
    }

    getDefaultMilestones() {
        return [
            {
                id: 1,
                title: 'Nivel Oro',
                description: 'Alcanza una reputación de 3.6+ estrellas',
                icon: 'fas fa-medal',
                progress: 75,
                target: 100,
                current: 4.2,
                required: 3.6,
                type: 'level'
            },
            {
                id: 2,
                title: '1000 Estrellas',
                description: 'Acumula 1000 estrellas en total',
                icon: 'fas fa-star',
                progress: 85,
                target: 100,
                current: 1247,
                required: 1000,
                type: 'stars'
            },
            {
                id: 3,
                title: '50 Tareas Este Mes',
                description: 'Completa 50 tareas en el mes actual',
                icon: 'fas fa-tasks',
                progress: 60,
                target: 100,
                current: 30,
                required: 50,
                type: 'tasks'
            },
            {
                id: 4,
                title: 'Líder de 5 Grupos',
                description: 'Conviértete en líder de 5 grupos',
                icon: 'fas fa-users-cog',
                progress: 40,
                target: 100,
                current: 2,
                required: 5,
                type: 'leadership'
            }
        ];
    }

    getDefaultCategories() {
        return [
            {
                id: 1,
                name: 'Desarrollo',
                score: 4.8,
                projects: 45,
                average: 4.2,
                icon: 'fas fa-laptop-code',
                area: 'work'
            },
            {
                id: 2,
                name: 'Colaboración',
                score: 4.1,
                projects: 12,
                average: 4.1,
                icon: 'fas fa-users',
                area: 'work'
            },
            {
                id: 3,
                name: 'Liderazgo',
                score: 3.9,
                projects: 8,
                average: 3.9,
                icon: 'fas fa-crown',
                area: 'work'
            },
            {
                id: 4,
                name: 'Innovación',
                score: 4.5,
                projects: 23,
                average: 4.5,
                icon: 'fas fa-lightbulb',
                area: 'work'
            },
            {
                id: 5,
                name: 'Estudios',
                score: 4.2,
                projects: 18,
                average: 4.2,
                icon: 'fas fa-graduation-cap',
                area: 'school'
            },
            {
                id: 6,
                name: 'Personal',
                score: 3.8,
                projects: 15,
                average: 3.8,
                icon: 'fas fa-user',
                area: 'personal'
            }
        ];
    }

    /*===== RENDER METHODS =====*/
    renderReputationOverview() {
        this.updateOverallScore();
        this.updateQuickStats();
    }

    updateOverallScore() {
        const data = this.reputation.overall;
        
        // Update score value
        const scoreElement = document.getElementById('overallScore');
        if (scoreElement) {
            scoreElement.textContent = data.score.toFixed(1);
        }

        // Update stars
        const starsElement = document.getElementById('overallStars');
        if (starsElement) {
            starsElement.innerHTML = this.generateStars(data.score);
        }

        // Update level badge
        const levelBadge = document.getElementById('levelBadge');
        if (levelBadge) {
            const levelText = levelBadge.querySelector('span');
            if (levelText) {
                levelText.textContent = this.getLevelName(data.level);
            }
        }

        // Update ranking
        const rankingElement = document.getElementById('rankingValue');
        if (rankingElement) {
            rankingElement.textContent = `#${data.ranking}`;
        }

        // Update tasks evaluated
        const tasksElement = document.getElementById('tasksEvaluated');
        if (tasksElement) {
            tasksElement.textContent = data.totalTasks;
        }

        // Update progress
        const progressElement = document.getElementById('nextLevelProgress');
        const progressFill = document.getElementById('progressFill');
        const progressText = document.getElementById('progressText');
        
        if (progressElement) {
            progressElement.textContent = `${data.nextLevelProgress}%`;
        }
        
        if (progressFill) {
            progressFill.style.width = `${data.nextLevelProgress}%`;
        }
        
        if (progressText) {
            progressText.textContent = `${data.nextLevelProgress}% hacia ${this.getNextLevel(data.level)}`;
        }
    }

    updateQuickStats() {
        const data = this.reputation.overall;
        
        const elements = {
            totalStars: data.totalStars,
            weeklyAverage: data.weeklyAverage.toFixed(1),
            streakDays: data.streakDays,
            groupsActive: data.groupsActive
        };

        Object.entries(elements).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = value;
            }
        });
    }

    renderCategories() {
        const grid = document.getElementById('categoriesGrid');
        if (!grid) return;

        const filteredCategories = this.getFilteredCategories();
        
        grid.innerHTML = filteredCategories.map(category => `
            <div class="category__card" data-category-id="${category.id}">
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
                        <span class="category__stat-value">${category.average.toFixed(1)}</span>
                        <span class="category__stat-label">Promedio</span>
                    </div>
                </div>
            </div>
        `).join('');
    }

    renderBadges() {
        const grid = document.getElementById('badgesGrid');
        if (!grid) return;

        grid.innerHTML = this.badges.map(badge => `
            <div class="badge__card ${badge.earned ? 'badge__card--earned' : ''}" 
                 data-badge-id="${badge.id}" 
                 onclick="showBadgeDetail(${badge.id})">
                <div class="badge__icon">
                    <i class="${badge.icon}"></i>
                </div>
                <div class="badge__content">
                    <h4 class="badge__title">${this.escapeHtml(badge.title)}</h4>
                    <p class="badge__description">${this.escapeHtml(badge.description)}</p>
                    ${badge.earned && badge.earnedDate ? `
                        <span class="badge__date">Obtenida el ${this.formatDate(badge.earnedDate)}</span>
                    ` : ''}
                </div>
            </div>
        `).join('');
    }

    renderAchievements() {
        const list = document.getElementById('achievementsList');
        if (!list) return;

        list.innerHTML = this.achievements.map(achievement => `
            <div class="achievement__item" data-achievement-id="${achievement.id}">
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

    renderMilestones() {
        const list = document.getElementById('milestonesList');
        if (!list) return;

        list.innerHTML = this.milestones.map(milestone => `
            <div class="milestone__card" data-milestone-id="${milestone.id}">
                <div class="milestone__icon">
                    <i class="${milestone.icon}"></i>
                </div>
                <h4 class="milestone__title">${this.escapeHtml(milestone.title)}</h4>
                <p class="milestone__description">${this.escapeHtml(milestone.description)}</p>
                <div class="milestone__progress">
                    <div class="milestone__progress-bar">
                        <div class="milestone__progress-fill" style="width: ${milestone.progress}%"></div>
                    </div>
                    <div class="milestone__progress-text">
                        ${milestone.current}/${milestone.required} (${milestone.progress}%)
                    </div>
                </div>
            </div>
        `).join('');
    }

    renderActivity() {
        const list = document.getElementById('activityList');
        if (!list) return;

        const filteredActivity = this.getFilteredActivity();
        
        if (filteredActivity.length === 0) {
            list.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state__icon">
                        <i class="fas fa-history"></i>
                    </div>
                    <h3 class="empty-state__title">No hay actividad</h3>
                    <p class="empty-state__description">
                        ${currentFilters.activity === 'all' ? 'Aún no hay actividad registrada.' : 'No hay actividad en esta categoría.'}
                    </p>
                </div>
            `;
            return;
        }

        list.innerHTML = filteredActivity.map(item => `
            <div class="activity__item" data-activity-id="${item.id}">
                <div class="activity__icon">
                    <i class="${this.getActivityIcon(item.type)}"></i>
                </div>
                <div class="activity__content">
                    <h4 class="activity__title">${this.escapeHtml(item.title)}</h4>
                    <p class="activity__description">${this.escapeHtml(item.description)}</p>
                    <span class="activity__time">${this.getTimeAgo(item.timestamp)}</span>
                </div>
                <div class="activity__stars">
                    <span class="stars__value">+${item.stars}</span>
                    <span class="stars__label">⭐</span>
                </div>
            </div>
        `).join('');
    }

    /*===== FILTER METHODS =====*/
    getFilteredCategories() {
        if (currentFilters.categories === 'all') {
            return this.categories;
        }
        return this.categories.filter(category => category.area === currentFilters.categories);
    }

    getFilteredActivity() {
        if (currentFilters.activity === 'all') {
            return this.history;
        }
        return this.history.filter(item => item.type.includes(currentFilters.activity));
    }

    /*===== UTILITY METHODS =====*/
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

    getLevelName(level) {
        const levels = {
            'bronce': 'Bronce',
            'plata': 'Plata',
            'oro': 'Oro',
            'diamante': 'Diamante'
        };
        return levels[level] || 'Bronce';
    }

    getNextLevel(currentLevel) {
        const levels = ['bronce', 'plata', 'oro', 'diamante'];
        const currentIndex = levels.indexOf(currentLevel);
        return currentIndex < levels.length - 1 ? levels[currentIndex + 1] : 'Máximo';
    }

    getActivityIcon(type) {
        const icons = {
            'task_completed': 'fas fa-check-circle',
            'evidence_validated': 'fas fa-camera',
            'group_activity': 'fas fa-users',
            'badge_earned': 'fas fa-trophy',
            'milestone_reached': 'fas fa-flag',
            'reputation_increase': 'fas fa-star'
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

    /*===== SETUP METHODS =====*/
    setupTabs() {
        const tabButtons = document.querySelectorAll('.tab-btn');
        const tabContents = document.querySelectorAll('.tab-content');

        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                const targetTab = button.dataset.tab;

                // Remove active class from all buttons and contents
                tabButtons.forEach(btn => btn.classList.remove('tab-btn--active'));
                tabContents.forEach(content => content.classList.remove('tab-content--active'));

                // Add active class to clicked button and corresponding content
                button.classList.add('tab-btn--active');
                const targetContent = document.getElementById(`${targetTab}Tab`);
                if (targetContent) {
                    targetContent.classList.add('tab-content--active');
                }
            });
        });
    }

    setupFilters() {
        // Category filters
        const categoryFilters = document.querySelectorAll('.categories__filters .filter-btn');
        categoryFilters.forEach(button => {
            button.addEventListener('click', () => {
                categoryFilters.forEach(btn => btn.classList.remove('filter-btn--active'));
                button.classList.add('filter-btn--active');
                currentFilters.categories = button.dataset.filter;
                this.renderCategories();
            });
        });

        // Activity filters
        const activityFilters = document.querySelectorAll('.activity__filters .filter-btn');
        activityFilters.forEach(button => {
            button.addEventListener('click', () => {
                activityFilters.forEach(btn => btn.classList.remove('filter-btn--active'));
                button.classList.add('filter-btn--active');
                currentFilters.activity = button.dataset.filter;
                this.renderActivity();
            });
        });

        // Chart period filter
        const chartPeriod = document.getElementById('chartPeriod');
        if (chartPeriod) {
            chartPeriod.addEventListener('change', (e) => {
                currentFilters.chartPeriod = e.target.value;
                updateCharts();
            });
        }
    }
}

/*===== CHART FUNCTIONS =====*/
function initCharts() {
    initReputationEvolutionChart();
    initStarsDistributionChart();
}

function initReputationEvolutionChart() {
    const canvas = document.getElementById('reputationEvolutionChart');
    if (!canvas || typeof Chart === 'undefined') return;

    const ctx = canvas.getContext('2d');
    
    // Generate sample data based on current period
    const data = generateChartData(currentFilters.chartPeriod);
    
    charts.evolution = new Chart(ctx, {
        type: 'line',
        data: {
            labels: data.labels,
            datasets: [{
                label: 'Reputación',
                data: data.values,
                borderColor: 'hsl(var(--primary-color))',
                backgroundColor: 'hsla(var(--primary-color), 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointBackgroundColor: 'hsl(var(--primary-color))',
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

function initStarsDistributionChart() {
    const canvas = document.getElementById('starsDistributionChart');
    if (!canvas || typeof Chart === 'undefined') return;

    const ctx = canvas.getContext('2d');
    
    charts.distribution = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Desarrollo', 'Colaboración', 'Liderazgo', 'Innovación'],
            datasets: [{
                data: [4.8, 4.1, 3.9, 4.5],
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

function generateChartData(period) {
    const days = parseInt(period);
    const labels = [];
    const values = [];
    
    // Generate labels based on period
    if (days <= 30) {
        for (let i = days - 1; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            labels.push(date.toLocaleDateString('es-ES', { month: 'short', day: 'numeric' }));
        }
    } else {
        const weeks = Math.ceil(days / 7);
        for (let i = weeks - 1; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - (i * 7));
            labels.push(`Sem ${weeks - i}`);
        }
    }
    
    // Generate sample values with some variation
    let baseValue = 4.2;
    for (let i = 0; i < labels.length; i++) {
        const variation = (Math.random() - 0.5) * 0.4;
        values.push(Math.max(0, Math.min(5, baseValue + variation)));
        baseValue += (Math.random() - 0.5) * 0.1;
    }
    
    return { labels, values };
}

function updateCharts() {
    if (charts.evolution) {
        const data = generateChartData(currentFilters.chartPeriod);
        charts.evolution.data.labels = data.labels;
        charts.evolution.data.datasets[0].data = data.values;
        charts.evolution.update();
    }
}

/*===== MODAL FUNCTIONS =====*/
function showBadgeDetail(badgeId) {
    const badge = reputationManager.badges.find(b => b.id === badgeId);
    if (!badge) return;

    const modal = document.getElementById('badgeModal');
    const title = document.getElementById('badgeModalTitle');
    const content = document.getElementById('badgeDetailContent');

    if (title) {
        title.textContent = badge.title;
    }

    if (content) {
        content.innerHTML = `
            <div class="badge-detail__icon">
                <i class="${badge.icon}"></i>
            </div>
            <h3 class="badge-detail__title">${badge.title}</h3>
            <p class="badge-detail__description">${badge.description}</p>
            <div class="badge-detail__criteria">
                <h4>Criterios:</h4>
                <ul>
                    ${badge.criteria.map(criterion => `<li>${criterion}</li>`).join('')}
                </ul>
            </div>
            ${badge.earned ? `
                <div class="badge-detail__earned">
                    <p><strong>¡Insignia obtenida!</strong></p>
                    <p>Fecha: ${reputationManager.formatDate(badge.earnedDate)}</p>
                </div>
            ` : `
                <div class="badge-detail__progress">
                    <p><strong>Progreso:</strong> En desarrollo</p>
                </div>
            `}
        `;
    }

    if (modal) {
        modal.style.display = 'flex';
        modal.classList.add('modal--show');
    }
}

function closeBadgeModal() {
    const modal = document.getElementById('badgeModal');
    if (modal) {
        modal.classList.remove('modal--show');
        setTimeout(() => {
            modal.style.display = 'none';
        }, 300);
    }
}

function showEvidenceModal(achievementId = null) {
    const modal = document.getElementById('evidenceModal');
    const title = document.getElementById('evidenceModalTitle');
    const content = document.getElementById('evidenceContent');

    if (title) {
        title.textContent = 'Evidencia de Logro';
    }

    if (content) {
        content.innerHTML = `
            <div class="evidence__item">
                <div class="evidence__type">Imagen</div>
                <div class="evidence__content-item">
                    <img src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
                         alt="Evidencia" class="evidence__image">
                </div>
            </div>
            <div class="evidence__item">
                <div class="evidence__type">Descripción</div>
                <div class="evidence__content-item">
                    <p class="evidence__text">
                        Esta evidencia muestra el trabajo realizado para completar la tarea. 
                        Se puede ver el resultado final y los pasos seguidos para alcanzar el objetivo.
                    </p>
                </div>
            </div>
        `;
    }

    if (modal) {
        modal.style.display = 'flex';
        modal.classList.add('modal--show');
    }
}

function closeEvidenceModal() {
    const modal = document.getElementById('evidenceModal');
    if (modal) {
        modal.classList.remove('modal--show');
        setTimeout(() => {
            modal.style.display = 'none';
        }, 300);
    }
}

/*===== EVENT LISTENERS =====*/
function setupEventListeners() {
    // Refresh stats button
    const refreshBtn = document.getElementById('refreshStats');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', () => {
            refreshBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Actualizando...';
            setTimeout(() => {
                reputationManager.renderReputationOverview();
                refreshBtn.innerHTML = '<i class="fas fa-sync-alt"></i> Actualizar';
                showNotification('Estadísticas actualizadas', 'success');
            }, 1000);
        });
    }

    // Load more activity button
    const loadMoreBtn = document.getElementById('loadMoreActivity');
    if (loadMoreBtn) {
        loadMoreBtn.addEventListener('click', () => {
            loadMoreBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Cargando...';
            setTimeout(() => {
                // Simulate loading more activity
                loadMoreBtn.innerHTML = '<i class="fas fa-plus"></i> Cargar más actividad';
                showNotification('Más actividad cargada', 'success');
            }, 1000);
        });
    }

    // Share evidence button
    const shareEvidenceBtn = document.getElementById('shareEvidence');
    if (shareEvidenceBtn) {
        shareEvidenceBtn.addEventListener('click', () => {
            shareEvidence();
        });
    }

    // Modal close events
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            closeAllModals();
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeAllModals();
        }
    });
}

/*===== UTILITY FUNCTIONS =====*/
function closeAllModals() {
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        modal.classList.remove('modal--show');
        setTimeout(() => {
            modal.style.display = 'none';
        }, 300);
    });
}

function shareEvidence() {
    const shareData = {
        title: 'Mi Evidencia de Logro - Astren',
        text: 'Mira esta evidencia de mi trabajo en Astren',
        url: window.location.href
    };

    if (navigator.share) {
        navigator.share(shareData);
    } else {
        navigator.clipboard.writeText(shareData.url).then(() => {
            showNotification('Enlace copiado al portapapeles', 'success');
        }).catch(() => {
            showNotification('No se pudo copiar el enlace', 'error');
        });
    }
}

function loadReputationData() {
    // This would normally load data from the backend
    // For now, we use the default data
    showNotification('Datos de reputación cargados', 'success');
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification--${type}`;
    notification.innerHTML = `
        <i class="${getNotificationIcon(type)}"></i>
        <span>${message}</span>
    `;

    // Add notification styles if not already present
    if (!document.getElementById('notification-styles')) {
        const style = document.createElement('style');
        style.id = 'notification-styles';
        style.textContent = `
            .notification {
                position: fixed;
                top: 20px;
                right: 20px;
                background: hsl(var(--surface));
                border: 1px solid hsl(var(--border));
                border-radius: var(--radius-lg);
                padding: var(--space-3) var(--space-4);
                box-shadow: var(--shadow-large);
                display: flex;
                align-items: center;
                gap: var(--space-2);
                z-index: 10001;
                animation: slideInRight 0.3s ease-out;
                max-width: 300px;
            }
            .notification--success { border-left: 4px solid hsl(var(--success-color)); }
            .notification--error { border-left: 4px solid hsl(var(--error-color)); }
            .notification--warning { border-left: 4px solid hsl(var(--warning-color)); }
            .notification--info { border-left: 4px solid hsl(var(--primary-color)); }
            @keyframes slideInRight {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
        `;
        document.head.appendChild(style);
    }

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.remove();
    }, 3000);
}

function getNotificationIcon(type) {
    const icons = {
        success: 'fas fa-check-circle',
        error: 'fas fa-exclamation-circle',
        warning: 'fas fa-exclamation-triangle',
        info: 'fas fa-info-circle'
    };
    return icons[type] || 'fas fa-info-circle';
}

// Export for global access
if (typeof window !== 'undefined') {
    window.ReputationManager = ReputationManager;
    window.showBadgeDetail = showBadgeDetail;
    window.closeBadgeModal = closeBadgeModal;
    window.showEvidenceModal = showEvidenceModal;
    window.closeEvidenceModal = closeEvidenceModal;
}
