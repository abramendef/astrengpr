/*===== AREAS MANAGEMENT SYSTEM FOR ASTREN =====*/

class AreasManager {
    constructor() {
        this.areas = this.loadAreas();
        this.currentFilter = 'all';
        this.currentView = 'grid';
        this.searchQuery = '';
        this.currentAreaId = null;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.renderAreas();
        this.updateStats();
        this.checkEmptyState();
        this.setupGlobalEvents();
        console.log('🏗️ Areas Manager inicializado con', this.areas.length, 'áreas');
    }

    loadAreas() {
        const savedAreas = localStorage.getItem('astren_areas');
        if (savedAreas) {
            try {
                return JSON.parse(savedAreas);
            } catch (e) {
                console.error('Error parsing areas:', e);
                return this.getDefaultAreas();
            }
        }
        return this.getDefaultAreas();
    }

    getDefaultAreas() {
        return [
            {
                id: 1,
                name: 'Trabajo',
                description: 'Tareas relacionadas con el trabajo y proyectos profesionales',
                color: '#3366FF',
                icon: 'fas fa-briefcase',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                archived: false,
                stats: {
                    totalTasks: 8,
                    completedTasks: 5,
                    pendingTasks: 3,
                    overdueTasks: 1
                }
            },
            {
                id: 2,
                name: 'Estudios',
                description: 'Tareas académicas, cursos y aprendizaje continuo',
                color: '#10B981',
                icon: 'fas fa-graduation-cap',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                archived: false,
                stats: {
                    totalTasks: 6,
                    completedTasks: 4,
                    pendingTasks: 2,
                    overdueTasks: 0
                }
            },
            {
                id: 3,
                name: 'Personal',
                description: 'Tareas personales, salud y bienestar',
                color: '#F59E0B',
                icon: 'fas fa-heart',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                archived: false,
                stats: {
                    totalTasks: 4,
                    completedTasks: 2,
                    pendingTasks: 2,
                    overdueTasks: 0
                }
            },
            {
                id: 4,
                name: 'Proyectos',
                description: 'Proyectos personales y de desarrollo',
                color: '#8B5CF6',
                icon: 'fas fa-code',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                archived: false,
                stats: {
                    totalTasks: 3,
                    completedTasks: 1,
                    pendingTasks: 2,
                    overdueTasks: 1
                }
            }
        ];
    }

    saveAreas() {
        try {
            localStorage.setItem('astren_areas', JSON.stringify(this.areas));
        } catch (e) {
            console.error('Error saving areas:', e);
        }
    }

    setupEventListeners() {
        this.setupMainButtons();
        this.setupModals();
        this.setupFilters();
        this.setupSearch();
        this.setupAreaActions();
    }

    setupMainButtons() {
        const newAreaBtn = document.getElementById('newAreaBtn');
        if (newAreaBtn) {
            newAreaBtn.addEventListener('click', () => this.showNewAreaModal());
        }

        const viewToggleBtn = document.getElementById('viewToggleBtn');
        if (viewToggleBtn) {
            viewToggleBtn.addEventListener('click', () => this.toggleView());
        }
    }

    setupModals() {
        this.setupNewAreaModal();
        this.setupEditAreaModal();
        this.setupDeleteAreaModal();
    }

    setupNewAreaModal() {
        const modal = document.getElementById('newAreaModal');
        const closeBtn = document.getElementById('closeModal');
        const cancelBtn = document.getElementById('cancelArea');
        const form = document.getElementById('newAreaForm');

        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.hideModal('newAreaModal'));
        }

        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => this.hideModal('newAreaModal'));
        }

        if (form) {
            form.addEventListener('submit', (e) => this.handleNewArea(e));
        }

        this.initColorPicker('#newAreaModal');
        this.initIconPicker('#newAreaModal');
    }

    setupEditAreaModal() {
        const modal = document.getElementById('editAreaModal');
        const closeBtn = document.getElementById('closeEditModal');
        const cancelBtn = document.getElementById('cancelEditArea');
        const form = document.getElementById('editAreaForm');

        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.hideModal('editAreaModal'));
        }

        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => this.hideModal('editAreaModal'));
        }

        if (form) {
            form.addEventListener('submit', (e) => this.handleEditArea(e));
        }

        this.initColorPicker('#editAreaModal');
        this.initIconPicker('#editAreaModal');
    }

    setupDeleteAreaModal() {
        const modal = document.getElementById('deleteAreaModal');
        const closeBtn = document.getElementById('closeDeleteModal');
        const cancelBtn = document.getElementById('cancelDeleteArea');
        const confirmBtn = document.getElementById('confirmDeleteArea');

        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.hideModal('deleteAreaModal'));
        }

        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => this.hideModal('deleteAreaModal'));
        }

        if (confirmBtn) {
            confirmBtn.addEventListener('click', () => this.confirmDeleteArea());
        }
    }

    setupFilters() {
        const filterTabs = document.querySelectorAll('.filter-tab');
        filterTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                filterTabs.forEach(t => t.classList.remove('filter-tab--active'));
                tab.classList.add('filter-tab--active');
                this.currentFilter = tab.dataset.filter;
                this.renderAreas();
                this.updateStats();
            });
        });
    }

    setupSearch() {
        const searchInput = document.querySelector('.search__input');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.searchQuery = e.target.value.toLowerCase();
                this.renderAreas();
            });
        }
    }

    setupAreaActions() {
        document.addEventListener('click', (e) => {
            const areaCard = e.target.closest('.area__card');
            if (!areaCard) return;

            const areaId = parseInt(areaCard.dataset.areaId);
            
            if (e.target.closest('.area__action--view')) {
                this.viewArea(areaId);
            } else if (e.target.closest('.area__action--edit')) {
                this.editArea(areaId);
            } else if (e.target.closest('.area__action--delete')) {
                this.deleteArea(areaId);
            } else if (e.target.closest('.area__action--archive')) {
                this.archiveArea(areaId);
            }
        });
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

    initColorPicker(modalSelector) {
        const colorOptions = document.querySelectorAll(`${modalSelector} .color-option`);
        const colorInput = document.querySelector(`${modalSelector} #area-color`);

        if (colorOptions.length > 0 && colorInput) {
            colorOptions.forEach(option => {
                option.addEventListener('click', function() {
                    const color = this.dataset.color;
                    colorInput.value = color;
                    
                    // Update active state
                    colorOptions.forEach(opt => opt.classList.remove('active'));
                    this.classList.add('active');
                });
            });

            // Update color input
            colorInput.addEventListener('change', function() {
                colorOptions.forEach(opt => opt.classList.remove('active'));
                const matchingOption = document.querySelector(`${modalSelector} [data-color="${this.value}"]`);
                if (matchingOption) matchingOption.classList.add('active');
            });
        }
    }

    initIconPicker(modalSelector) {
        const iconSelected = document.querySelector(`${modalSelector} #icon-selected`);
        const iconOptions = document.querySelector(`${modalSelector} .icon-picker__options`);
        const iconInput = document.querySelector(`${modalSelector} #area-icon`);
        const iconButtons = document.querySelectorAll(`${modalSelector} .icon-option`);

        // Toggle icon picker
        if (iconSelected && iconOptions) {
            iconSelected.addEventListener('click', function() {
                iconOptions.classList.toggle('show');
            });
        }

        // Select icon
        if (iconButtons.length > 0 && iconInput && iconSelected && iconOptions) {
            iconButtons.forEach(button => {
                button.addEventListener('click', function() {
                    const iconClass = this.dataset.icon;
                    iconInput.value = iconClass;
                    
                    // Update selected icon
                    iconSelected.innerHTML = `<i class="${iconClass}"></i>`;
                    
                    // Update active state
                    iconButtons.forEach(btn => btn.classList.remove('active'));
                    this.classList.add('active');
                    
                    // Hide options
                    iconOptions.classList.remove('show');
                });
            });

            // Close icon picker when clicking outside
            document.addEventListener('click', function(e) {
                if (!e.target.closest('.icon-picker')) {
                    iconOptions.classList.remove('show');
                }
            });
        }
    }

    showModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('modal--show');
            document.body.style.overflow = 'hidden';
        }
    }

    hideModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('modal--show');
            document.body.style.overflow = '';
        }
    }

    hideAllModals() {
        const modals = document.querySelectorAll('.modal');
        modals.forEach(modal => {
            modal.classList.remove('modal--show');
        });
        document.body.style.overflow = '';
    }

    showNewAreaModal() {
        this.currentAreaId = null;
        this.showModal('newAreaModal');
        
        // Reset form
        const form = document.getElementById('newAreaForm');
        if (form) {
            form.reset();
        }
    }

    showEditAreaModal(areaId) {
        this.currentAreaId = areaId;
        const area = this.areas.find(a => a.id === areaId);
        
        if (!area) {
            this.showToast('Área no encontrada', 'error');
            return;
        }

        this.showModal('editAreaModal');
        this.populateEditForm(area);
    }

    showDeleteAreaModal(areaId) {
        this.currentAreaId = areaId;
        const area = this.areas.find(a => a.id === areaId);
        
        if (!area) {
            this.showToast('Área no encontrada', 'error');
            return;
        }

        const confirmBtn = document.getElementById('confirmDeleteArea');
        if (confirmBtn) {
            confirmBtn.setAttribute('data-area-id', areaId);
        }

        this.showModal('deleteAreaModal');
    }

    populateEditForm(area) {
        const form = document.getElementById('editAreaForm');
        if (!form) return;

        const nameInput = form.querySelector('#edit-area-name');
        const descriptionInput = form.querySelector('#edit-area-description');
        const colorInput = form.querySelector('#edit-area-color');
        const iconInput = form.querySelector('#edit-area-icon');
        const iconSelected = form.querySelector('#edit-icon-selected');

        if (nameInput) nameInput.value = area.name;
        if (descriptionInput) descriptionInput.value = area.description || '';
        if (colorInput) colorInput.value = area.color;
        if (iconInput) iconInput.value = area.icon;
        if (iconSelected) iconSelected.innerHTML = `<i class="${area.icon}"></i>`;

        // Update color picker
        const colorOptions = document.querySelectorAll('#editAreaModal .color-option');
        colorOptions.forEach(opt => opt.classList.remove('active'));
        const matchingColor = document.querySelector(`#editAreaModal [data-color="${area.color}"]`);
        if (matchingColor) matchingColor.classList.add('active');

        // Update icon picker
        const iconOptions = document.querySelectorAll('#editAreaModal .icon-option');
        iconOptions.forEach(opt => opt.classList.remove('active'));
        const matchingIcon = document.querySelector(`#editAreaModal [data-icon="${area.icon}"]`);
        if (matchingIcon) matchingIcon.classList.add('active');
    }

    handleNewArea(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const areaData = {
            name: formData.get('area-name').trim(),
            description: formData.get('area-description').trim(),
            color: formData.get('area-color'),
            icon: formData.get('area-icon')
        };

        if (this.validateAreaData(areaData)) {
            this.addArea(areaData);
            this.hideModal('newAreaModal');
            this.showToast('Área creada exitosamente', 'success');
        }
    }

    handleEditArea(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const areaData = {
            name: formData.get('area-name').trim(),
            description: formData.get('area-description').trim(),
            color: formData.get('area-color'),
            icon: formData.get('area-icon')
        };

        if (this.validateAreaData(areaData)) {
            this.updateArea(this.currentAreaId, areaData);
            this.hideModal('editAreaModal');
            this.showToast('Área actualizada exitosamente', 'success');
        }
    }

    confirmDeleteArea() {
        const areaId = this.currentAreaId;
        const area = this.areas.find(a => a.id === areaId);
        
        if (!area) {
            this.showToast('Área no encontrada', 'error');
            return;
        }

        // Check if area has tasks
        const tasks = this.getAreaTasks(areaId);
        if (tasks.length > 0) {
            this.showToast('No puedes eliminar un área que tiene tareas asignadas', 'error');
            return;
        }

        this.deleteArea(areaId);
        this.hideModal('deleteAreaModal');
        this.showToast('Área eliminada exitosamente', 'success');
    }

    validateAreaData(data) {
        if (!data.name || data.name.length < 2) {
            this.showToast('El nombre del área debe tener al menos 2 caracteres', 'error');
            return false;
        }

        if (!data.color) {
            this.showToast('Debes seleccionar un color para el área', 'error');
            return false;
        }

        if (!data.icon) {
            this.showToast('Debes seleccionar un icono para el área', 'error');
            return false;
        }

        // Check for duplicate names
        const existingArea = this.areas.find(a => 
            a.name.toLowerCase() === data.name.toLowerCase() && 
            a.id !== this.currentAreaId
        );

        if (existingArea) {
            this.showToast('Ya existe un área con ese nombre', 'error');
            return false;
        }

        return true;
    }

    addArea(areaData) {
        const newArea = {
            id: this.generateId(),
            ...areaData,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            archived: false,
            stats: {
                totalTasks: 0,
                completedTasks: 0,
                pendingTasks: 0,
                overdueTasks: 0
            }
        };

        this.areas.push(newArea);
        this.saveAreas();
        this.renderAreas();
        this.updateStats();
    }

    updateArea(areaId, updates) {
        const areaIndex = this.areas.findIndex(a => a.id === areaId);
        if (areaIndex === -1) return;

        this.areas[areaIndex] = {
            ...this.areas[areaIndex],
            ...updates,
            updatedAt: new Date().toISOString()
        };

        this.saveAreas();
        this.renderAreas();
        this.updateStats();
    }

    deleteArea(areaId) {
        this.areas = this.areas.filter(a => a.id !== areaId);
        this.saveAreas();
        this.renderAreas();
        this.updateStats();
    }

    archiveArea(areaId) {
        const area = this.areas.find(a => a.id === areaId);
        if (area) {
            area.archived = true;
            area.updatedAt = new Date().toISOString();
            this.saveAreas();
            this.renderAreas();
            this.updateStats();
            this.showToast('Área archivada exitosamente', 'success');
        }
    }

    getAreaTasks(areaId) {
        try {
            const tasks = JSON.parse(localStorage.getItem('astren_tasks') || '[]');
            return tasks.filter(task => task.area === areaId);
        } catch (e) {
            console.error('Error getting area tasks:', e);
            return [];
        }
    }

    applyFilters() {
        let filteredAreas = [...this.areas];

        // Apply status filter
        switch (this.currentFilter) {
            case 'active':
                filteredAreas = filteredAreas.filter(area => !area.archived);
                break;
            case 'archived':
                filteredAreas = filteredAreas.filter(area => area.archived);
                break;
            case 'all':
            default:
                // Show all areas
                break;
        }

        // Apply search filter
        if (this.searchQuery) {
            filteredAreas = filteredAreas.filter(area =>
                area.name.toLowerCase().includes(this.searchQuery) ||
                area.description.toLowerCase().includes(this.searchQuery)
            );
        }

        return filteredAreas;
    }

    toggleView() {
        this.currentView = this.currentView === 'grid' ? 'list' : 'grid';
        
        const viewToggleBtn = document.getElementById('viewToggleBtn');
        if (viewToggleBtn) {
            const icon = viewToggleBtn.querySelector('i');
            if (icon) {
                icon.className = this.currentView === 'grid' ? 'fas fa-th-large' : 'fas fa-list';
            }
        }

        this.renderAreas();
    }

    renderAreas() {
        const container = document.getElementById('areas-container');
        const emptyState = document.getElementById('empty-state');
        
        if (!container) return;

        const filteredAreas = this.applyFilters();

        if (filteredAreas.length === 0) {
            container.style.display = 'none';
            if (emptyState) emptyState.style.display = 'block';
            return;
        }

        container.style.display = 'grid';
        if (emptyState) emptyState.style.display = 'none';

        container.className = `areas__grid areas__grid--${this.currentView}`;
        container.innerHTML = filteredAreas.map(area => this.createAreaCard(area)).join('');
    }

    createAreaCard(area) {
        const tasks = this.getAreaTasks(area.id);
        const completedTasks = tasks.filter(task => task.status === 'completed').length;
        const totalTasks = tasks.length;
        const progressPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

        return `
            <div class="area__card" data-area-id="${area.id}" style="--area-color: ${area.color}; --area-color-light: ${area.color}20;">
                <div class="area__card-header">
                    <h3 class="area__card-title">
                        <i class="${area.icon}"></i>
                        ${this.escapeHtml(area.name)}
                    </h3>
                    <p class="area__card-description">${this.escapeHtml(area.description || 'Sin descripción')}</p>
                </div>
                
                <div class="area__card-body">
                    <div class="area__stats">
                        <div class="area__stat">
                            <span class="area__stat-number">${totalTasks}</span>
                            <span class="area__stat-label">Tareas</span>
                        </div>
                        <div class="area__stat">
                            <span class="area__stat-number">${completedTasks}</span>
                            <span class="area__stat-label">Completadas</span>
                        </div>
                        <div class="area__stat">
                            <span class="area__stat-number">${progressPercentage}%</span>
                            <span class="area__stat-label">Progreso</span>
                        </div>
                    </div>
                    
                    <div class="area__progress">
                        <div class="area__progress-header">
                            <span class="area__progress-label">Progreso general</span>
                            <span class="area__progress-value">${progressPercentage}%</span>
                        </div>
                        <div class="area__progress-bar">
                            <div class="area__progress-fill" style="width: ${progressPercentage}%;"></div>
                        </div>
                    </div>
                    
                    <div class="area__actions">
                        <button class="area__action area__action--view" title="Ver área">
                            <i class="fas fa-eye"></i>
                            Ver
                        </button>
                        <button class="area__action area__action--edit" title="Editar área">
                            <i class="fas fa-edit"></i>
                            Editar
                        </button>
                        <button class="area__action area__action--archive" title="Archivar área">
                            <i class="fas fa-archive"></i>
                            Archivar
                        </button>
                        <button class="area__action area__action--delete" title="Eliminar área">
                            <i class="fas fa-trash"></i>
                            Eliminar
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    viewArea(areaId) {
        // Navigate to tasks page with area filter
        window.location.href = `tasks.html?area=${areaId}`;
    }

    editArea(areaId) {
        this.showEditAreaModal(areaId);
    }

    deleteArea(areaId) {
        this.showDeleteAreaModal(areaId);
    }

    updateStats() {
        const totalAreas = this.areas.length;
        const activeAreas = this.areas.filter(area => !area.archived).length;
        const archivedAreas = this.areas.filter(area => area.archived).length;
        const totalTasks = this.areas.reduce((sum, area) => {
            const tasks = this.getAreaTasks(area.id);
            return sum + tasks.length;
        }, 0);

        // Update stats display
        const statsElements = {
            'total-areas': totalAreas,
            'active-areas': activeAreas,
            'archived-areas': archivedAreas,
            'total-tasks': totalTasks
        };

        Object.entries(statsElements).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = value;
            }
        });
    }

    checkEmptyState() {
        const container = document.getElementById('areas-container');
        const emptyState = document.getElementById('empty-state');
        
        if (!container || !emptyState) return;

        if (this.areas.length === 0) {
            container.style.display = 'none';
            emptyState.style.display = 'block';
        } else {
            container.style.display = 'grid';
            emptyState.style.display = 'none';
        }
    }

    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast toast--${type}`;
        toast.innerHTML = `
            <div class="toast__icon">
                <i class="${this.getToastIcon(type)}"></i>
            </div>
            <div class="toast__content">
                <p class="toast__message">${message}</p>
            </div>
            <button class="toast__close" aria-label="Cerrar notificación">
                <i class="fas fa-times"></i>
            </button>
        `;

        // Add to page
        document.body.appendChild(toast);

        // Show toast
        setTimeout(() => toast.classList.add('toast--show'), 100);

        // Auto hide
        setTimeout(() => {
            toast.classList.remove('toast--show');
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        }, 5000);

        // Close button
        const closeBtn = toast.querySelector('.toast__close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                toast.classList.remove('toast--show');
                setTimeout(() => {
                    if (toast.parentNode) {
                        toast.parentNode.removeChild(toast);
                    }
                }, 300);
            });
        }
    }

    getToastIcon(type) {
        const icons = {
            success: 'fas fa-check-circle',
            error: 'fas fa-exclamation-circle',
            warning: 'fas fa-exclamation-triangle',
            info: 'fas fa-info-circle'
        };
        return icons[type] || icons.info;
    }
}

/*===== GLOBAL AREAS INSTANCE =====*/
let globalAreasManager = null;

/*===== INITIALIZATION =====*/
document.addEventListener('DOMContentLoaded', () => {
    globalAreasManager = new AreasManager();
    
    // Make globally accessible
    window.areasManager = globalAreasManager;
});

/*===== EXPORT FOR MODULE SYSTEMS =====*/
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AreasManager;
} 