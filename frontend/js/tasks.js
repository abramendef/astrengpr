// Sistema de Tareas Completo y Robusto de Astren
class TasksManager {
    constructor() {
        this.tasks = this.loadTasks();
        this.currentFilter = 'all';
        this.currentView = 'grid';
        this.searchQuery = '';
        this.currentTaskId = null;
        // NUEVO: Detectar área desde la URL
        const urlParams = new URLSearchParams(window.location.search);
        const areaParam = urlParams.get('area');
        if (areaParam) {
            this.areaFromUrl = areaParam;
        } else {
            this.areaFromUrl = null;
        }
        this.init();
    }

    init() {
        this.setupEventListeners();
        // Si hay área en la URL, seleccionarla en el filtro y filtrar
        if (this.areaFromUrl) {
            const areaFilter = document.getElementById('areaFilter');
            if (areaFilter) {
                areaFilter.value = this.areaFromUrl;
            }
        }
        this.populateAreaSelects();
        this.renderTasks();
        this.updateTaskCounts();
        this.checkEmptyState();
        this.setupGlobalEvents();
        console.log('📋 Tasks Manager inicializado con', this.tasks.length, 'tareas');
    }

    loadTasks() {
        const savedTasks = localStorage.getItem('astren_tasks');
        if (savedTasks) {
            try {
                return JSON.parse(savedTasks);
            } catch (e) {
                console.error('Error parsing tasks:', e);
                return this.getDefaultTasks();
            }
        }
        return this.getDefaultTasks();
    }

    getDefaultTasks() {
        return [];
    }

    saveTasks() {
        try {
            localStorage.setItem('astren_tasks', JSON.stringify(this.tasks));
        } catch (e) {
            console.error('Error saving tasks:', e);
        }
    }

    setupEventListeners() {
        this.setupMainButtons();
        this.setupModals();
        this.setupFilters();
        this.setupSearch();
        this.setupTaskActions();
    }

    setupMainButtons() {
        const newTaskBtn = document.getElementById('newTaskBtn');
        if (newTaskBtn) {
            newTaskBtn.addEventListener('click', () => this.showNewTaskModal());
        }

        const viewToggleBtn = document.getElementById('viewToggleBtn');
        if (viewToggleBtn) {
            viewToggleBtn.addEventListener('click', () => this.toggleView());
        }
    }

    setupModals() {
        this.setupNewTaskModal();
        this.setupEditTaskModal();
        this.setupDeleteTaskModal();
        this.setupEvidenceModal();
    }

    setupNewTaskModal() {
        const modal = document.getElementById('newTaskModal');
        const closeBtn = document.getElementById('closeModal');
        const cancelBtn = document.getElementById('cancelTask');
        const form = document.getElementById('newTaskForm');

        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.hideModal('newTaskModal'));
        }

        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => this.hideModal('newTaskModal'));
        }

        if (form) {
            form.addEventListener('submit', (e) => this.handleNewTask(e));
        }

        this.initDatePicker('#taskDueDate');
    }

    setupEditTaskModal() {
        const modal = document.getElementById('editTaskModal');
        const closeBtn = document.getElementById('closeEditModal');
        const cancelBtn = document.getElementById('cancelEditTask');
        const form = document.getElementById('editTaskForm');

        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.hideModal('editTaskModal'));
        }

        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => this.hideModal('editTaskModal'));
        }

        if (form) {
            form.addEventListener('submit', (e) => this.handleEditTask(e));
        }

        this.initDatePicker('#editTaskDueDate');
    }

    setupDeleteTaskModal() {
        const modal = document.getElementById('deleteTaskModal');
        const closeBtn = document.getElementById('closeDeleteModal');
        const cancelBtn = document.getElementById('cancelDeleteTask');
        const confirmBtn = document.getElementById('confirmDeleteTask');

        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.hideModal('deleteTaskModal'));
        }

        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => this.hideModal('deleteTaskModal'));
        }

        if (confirmBtn) {
            confirmBtn.addEventListener('click', () => this.confirmDeleteTask());
        }
    }

    setupEvidenceModal() {
        const modal = document.getElementById('evidenceModal');
        const closeBtn = document.getElementById('closeEvidenceModal');
        const cancelBtn = document.getElementById('cancelEvidence');
        const form = document.getElementById('evidenceForm');

        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.hideModal('evidenceModal'));
        }

        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => this.hideModal('evidenceModal'));
        }

        if (form) {
            form.addEventListener('submit', (e) => this.handleEvidenceUpload(e));
        }
    }

    setupFilters() {
        const areaFilter = document.getElementById('areaFilter');
        if (areaFilter) {
            areaFilter.addEventListener('change', () => {
                this.currentFilter = areaFilter.value;
                this.applyFilters();
            });
        }

        const statusFilter = document.getElementById('statusFilter');
        if (statusFilter) {
            statusFilter.addEventListener('change', () => {
                this.currentFilter = statusFilter.value;
                this.applyFilters();
            });
        }

        const groupFilter = document.getElementById('groupFilter');
        if (groupFilter) {
            groupFilter.addEventListener('change', () => {
                this.currentFilter = groupFilter.value;
                this.applyFilters();
            });
        }
    }

    setupSearch() {
        const searchInput = document.querySelector('.search__input');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.searchQuery = e.target.value.toLowerCase();
                this.applyFilters();
            });
        }
    }

    setupTaskActions() {
        document.addEventListener('click', (e) => {
            const taskCard = e.target.closest('.task-card');
            if (!taskCard) return;

            const taskId = parseInt(taskCard.dataset.taskId);
            
            if (e.target.closest('.task-checkbox input')) {
                const checkbox = e.target.closest('.task-checkbox input');
                this.toggleTaskCompletion(taskId, checkbox.checked);
            } else if (e.target.closest('.task-action--edit')) {
                this.showEditTaskModal(taskId);
            } else if (e.target.closest('.task-action--evidence')) {
                this.showEvidenceModal(taskId);
            } else if (e.target.closest('.task-action--delete')) {
                this.showDeleteTaskModal(taskId);
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

    initDatePicker(selector) {
        const dateInput = document.querySelector(selector);
        if (dateInput && typeof flatpickr !== 'undefined') {
            flatpickr(dateInput, {
                enableTime: true,
                dateFormat: "Y-m-d H:i",
                locale: "es",
                minDate: "today",
                time_24hr: true
            });
        }
    }

    showModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'flex';
            document.body.style.overflow = 'hidden';
        }
    }

    hideModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'none';
            document.body.style.overflow = '';
        }
    }

    hideAllModals() {
        const modals = document.querySelectorAll('.modal');
        modals.forEach(modal => {
            modal.style.display = 'none';
        });
        document.body.style.overflow = '';
    }

    showNewTaskModal() {
        const form = document.getElementById('newTaskForm');
        if (form) {
            form.reset();
        }
        this.populateAreaSelects();
        this.showModal('newTaskModal');
    }

    showEditTaskModal(taskId) {
        const task = this.tasks.find(t => t.id === taskId);
        if (!task) return;

        const form = document.getElementById('editTaskForm');
        if (form) {
            this.populateAreaSelects();
            form.querySelector('#editTaskTitle').value = task.title;
            form.querySelector('#editTaskDescription').value = task.description;
            form.querySelector('#editTaskArea').value = task.area;
            form.querySelector('#editTaskDueDate').value = this.formatDateForInput(task.dueDate);
        }

        this.currentTaskId = taskId;
        this.showModal('editTaskModal');
    }

    showDeleteTaskModal(taskId) {
        this.currentTaskId = taskId;
        this.showModal('deleteTaskModal');
    }

    showEvidenceModal(taskId) {
        this.currentTaskId = taskId;
        this.showModal('evidenceModal');
    }

    handleNewTask(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const taskData = {
            title: formData.get('title'),
            description: formData.get('description'),
            area: formData.get('area'),
            dueDate: formData.get('dueDate')
        };

        if (this.validateTaskData(taskData)) {
            this.addTask(taskData);
            this.hideModal('newTaskModal');
            this.showToast('Tarea creada exitosamente', 'success');
        }
    }

    handleEditTask(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const updates = {
            title: formData.get('title'),
            description: formData.get('description'),
            area: formData.get('area'),
            dueDate: formData.get('dueDate')
        };

        if (this.validateTaskData(updates)) {
            this.updateTask(this.currentTaskId, updates);
            this.hideModal('editTaskModal');
            this.showToast('Tarea actualizada exitosamente', 'success');
        }
    }

    confirmDeleteTask() {
        if (this.currentTaskId) {
            this.deleteTask(this.currentTaskId);
            this.hideModal('deleteTaskModal');
            this.showToast('Tarea eliminada exitosamente', 'info');
        }
    }

    handleEvidenceUpload(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const evidence = formData.get('evidence');
        
        if (evidence && this.currentTaskId) {
            this.uploadEvidence(this.currentTaskId, evidence);
            this.hideModal('evidenceModal');
            this.showToast('Evidencia subida exitosamente', 'success');
        }
    }

    validateTaskData(data) {
        if (!data.title || data.title.trim().length < 3) {
            this.showToast('El título debe tener al menos 3 caracteres', 'error');
            return false;
        }
        if (!data.description || data.description.trim().length < 10) {
            this.showToast('La descripción debe tener al menos 10 caracteres', 'error');
            return false;
        }
        if (!data.area) {
            this.showToast('Debes seleccionar un área', 'error');
            return false;
        }
        if (!data.dueDate) {
            this.showToast('Debes seleccionar una fecha límite', 'error');
            return false;
        }
        return true;
    }

    addTask(taskData) {
        const newTask = {
            id: Date.now(),
            ...taskData,
            status: 'pending',
            createdAt: new Date().toISOString(),
            completedAt: null,
            evidence: null,
            evidenceValidated: false,
            reputationImpact: 0
        };

        this.tasks.unshift(newTask);
        this.saveTasks();
        this.renderTasks();
        this.updateTaskCounts();
        
        return newTask;
    }

    updateTask(taskId, updates) {
        const taskIndex = this.tasks.findIndex(t => t.id === taskId);
        if (taskIndex !== -1) {
            this.tasks[taskIndex] = { ...this.tasks[taskIndex], ...updates };
            this.saveTasks();
            this.renderTasks();
            this.updateTaskCounts();
        }
    }

    deleteTask(taskId) {
        const taskIndex = this.tasks.findIndex(t => t.id === taskId);
        if (taskIndex !== -1) {
            this.tasks.splice(taskIndex, 1);
            this.saveTasks();
            this.renderTasks();
            this.updateTaskCounts();
            this.checkEmptyState();
        }
    }

    toggleTaskCompletion(taskId, completed) {
        const task = this.tasks.find(t => t.id === taskId);
        if (task) {
            task.status = completed ? 'completed' : 'pending';
            task.completedAt = completed ? new Date().toISOString() : null;
            
            if (completed) {
                task.reputationImpact = this.calculateReputationImpact(task);
            }
            
            this.saveTasks();
            this.renderTasks();
            this.updateTaskCounts();
            
            // Actualizar todas las secciones de tareas (esto aplica tanto al marcar como al desmarcar)
            if (typeof renderUrgentTasksOnlyPendingToday === 'function') {
                renderUrgentTasksOnlyPendingToday();
            }
            if (typeof renderPendingTasks === 'function') {
                renderPendingTasks();
            }
            if (typeof renderCompletedTasks === 'function') {
                renderCompletedTasks();
            }

            this.showToast(
                completed ? 'Tarea marcada como completada' : 'Tarea marcada como pendiente',
                'success'
            );
        }
    }

    uploadEvidence(taskId, evidence) {
        const task = this.tasks.find(t => t.id === taskId);
        if (task) {
            task.evidence = evidence;
            task.evidenceValidated = false;
            this.saveTasks();
            this.renderTasks();
        }
    }

    calculateReputationImpact(task) {
        const basePoints = 10;
        
        return Math.round(basePoints);
    }

    applyFilters() {
        let filteredTasks = [...this.tasks];

        // Apply search filter
        if (this.searchQuery) {
            filteredTasks = filteredTasks.filter(task =>
                task.title.toLowerCase().includes(this.searchQuery) ||
                task.description.toLowerCase().includes(this.searchQuery)
            );
        }

        // Apply area filter
        const areaFilter = document.getElementById('areaFilter');
        let areaValue = '';
        if (areaFilter && areaFilter.value) {
            areaValue = areaFilter.value;
        } else if (this.areaFromUrl) {
            areaValue = this.areaFromUrl;
        }
        if (areaValue) {
            filteredTasks = filteredTasks.filter(task => task.area == areaValue);
        }

        // Apply status filter
        const statusFilter = document.getElementById('statusFilter');
        if (statusFilter && statusFilter.value) {
            switch (statusFilter.value) {
                case 'today':
                    const today = new Date();
                    filteredTasks = filteredTasks.filter(task => {
                        const dueDate = new Date(task.dueDate);
                        return dueDate.toDateString() === today.toDateString() && task.status === 'pending';
                    });
                    break;
                case 'pending':
                    filteredTasks = filteredTasks.filter(task => task.status === 'pending');
                    break;
                case 'completed':
                    filteredTasks = filteredTasks.filter(task => task.status === 'completed');
                    break;
                case 'overdue':
                    const now = new Date();
                    filteredTasks = filteredTasks.filter(task => {
                        const dueDate = new Date(task.dueDate);
                        return dueDate < now && task.status === 'pending';
                    });
                    break;
            }
        }

        this.renderTasks(filteredTasks);
    }

    toggleView() {
        this.currentView = this.currentView === 'grid' ? 'list' : 'grid';
        this.renderTasks();
        
        const viewToggleBtn = document.getElementById('viewToggleBtn');
        if (viewToggleBtn) {
            const icon = viewToggleBtn.querySelector('i');
            if (icon) {
                icon.className = this.currentView === 'grid' ? 'fas fa-list' : 'fas fa-th';
            }
        }
    }

    renderTasks(tasksToRender = this.tasks) {
        const container = document.getElementById('tasks-container') || document.querySelector('.tasks-grid');
        if (!container) return;

        if (tasksToRender.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state__icon">
                        <i class="fas fa-tasks"></i>
                    </div>
                    <h3 class="empty-state__title">No hay tareas</h3>
                    <p class="empty-state__description">
                        ${this.searchQuery ? 'No se encontraron tareas con tu búsqueda.' : 'Crea tu primera tarea para comenzar.'}
                    </p>
                    ${!this.searchQuery ? `
                        <button class="button button--primary" onclick="tasksManager.showNewTaskModal()">
                            <i class="fas fa-plus"></i>
                            Crear Tarea
                        </button>
                    ` : ''}
                </div>
            `;
            return;
        }

        const tasksHTML = tasksToRender.map(task => this.createTaskCard(task)).join('');
        container.innerHTML = tasksHTML;
    }

    createTaskCard(task) {
        const dueTimeText = this.getDueTimeText(task);
        const areaText = this.getAreaText(task.area);
        const areaIcon = this.getAreaIcon(task.area);
        const completedClass = task.status === 'completed' ? 'task-card--completed' : '';
        const overdueClass = this.isOverdue(task) ? 'task-card--overdue' : '';
        const pendingClass = task.status === 'pending' && !this.isOverdue(task) ? 'task-card--pending' : '';
        
        return `
            <div class="task-card ${completedClass} ${overdueClass} ${pendingClass}" data-task-id="${task.id}">
                <div class="task-header">
                    <div class="task-checkbox">
                        <input type="checkbox" id="task-${task.id}" ${task.status === 'completed' ? 'checked' : ''}>
                        <label for="task-${task.id}"></label>
                    </div>
                </div>
                <div class="task-content">
                    <h3 class="task-title">${this.escapeHtml(task.title)}</h3>
                    <p class="task-description">${this.escapeHtml(task.description)}</p>
                    <div class="task-meta">
                        <span class="task-area task-area--${task.area}">
                            <i class="${areaIcon}"></i>
                            ${areaText}
                        </span>
                        <span class="task-due ${this.getDueClass(task)}">
                            <i class="fas fa-calendar"></i>
                            ${dueTimeText}
                        </span>
                    </div>
                    ${task.evidence ? `
                        <div class="task-evidence">
                            <i class="fas fa-check-circle"></i>
                            Evidencia subida
                        </div>
                    ` : ''}
                </div>
                <div class="task-actions">
                    <button class="task-action task-action--edit" title="Editar">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="task-action task-action--evidence" title="Subir evidencia">
                        <i class="fas fa-camera"></i>
                    </button>
                    <button class="task-action task-action--delete" title="Eliminar">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
    }

    isOverdue(task) {
        if (task.status === 'completed') return false;
        const dueDate = new Date(task.dueDate);
        const now = new Date();
        return dueDate < now;
    }

    getDueClass(task) {
        if (task.status === 'completed') return 'task-due--completed';
        if (this.isOverdue(task)) return 'task-due--overdue';
        
        const dueDate = new Date(task.dueDate);
        const now = new Date();
        const diffHours = (dueDate - now) / (1000 * 60 * 60);
        
        if (diffHours < 24) return 'task-due--urgent';
        if (diffHours < 72) return 'task-due--soon';
        return 'task-due--normal';
    }

    updateTaskStatuses() {
        const now = new Date();
        let hasChanges = false;

        this.tasks.forEach(task => {
            if (task.status === 'pending' && new Date(task.dueDate) < now) {
                // Task is overdue but status hasn't been updated
                hasChanges = true;
            }
        });

        if (hasChanges) {
            this.saveTasks();
            this.renderTasks();
            this.updateTaskCounts();
        }
    }

    getDueTimeText(task) {
        if (task.status === 'completed') {
            return 'Completada';
        }

        const dueDate = new Date(task.dueDate);
        const now = new Date();
        const diff = dueDate - now;

        if (diff < 0) {
            const days = Math.floor(Math.abs(diff) / (1000 * 60 * 60 * 24));
            return `Vencida hace ${days} día${days !== 1 ? 's' : ''}`;
        }

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

        if (days === 0) {
            if (hours === 0) {
                return 'Vence hoy';
            }
            return `Vence en ${hours} hora${hours !== 1 ? 's' : ''}`;
        } else if (days === 1) {
            return 'Vence mañana';
        } else {
            return `Vence en ${days} día${days !== 1 ? 's' : ''}`;
        }
    }

    getAreaText(area) {
        const texts = {
            personal: 'Personal',
            work: 'Trabajo',
            school: 'Escuela'
        };
        return texts[area] || 'General';
    }

    getAreaIcon(area) {
        const icons = {
            personal: 'fas fa-user',
            work: 'fas fa-briefcase',
            school: 'fas fa-graduation-cap'
        };
        return icons[area] || 'fas fa-tasks';
    }

    updateTaskCounts() {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        today.setHours(0, 0, 0, 0);

        const counts = {
            today: this.tasks.filter(task => {
                if (task.status !== 'pending') return false;
                const dueDate = new Date(task.dueDate);
                dueDate.setHours(0, 0, 0, 0);
                return dueDate.getTime() === today.getTime();
            }).length,
            pending: this.tasks.filter(task => task.status === 'pending').length,
            completed: this.tasks.filter(task => task.status === 'completed').length,
            overdue: this.tasks.filter(task => 
                task.status === 'pending' && new Date(task.dueDate) < now
            ).length
        };

        // Update stat elements
        const statElements = {
            today: document.getElementById('statToday'),
            pending: document.getElementById('statPending'),
            completed: document.getElementById('statCompleted'),
            overdue: document.getElementById('statOverdue')
        };

        Object.keys(counts).forEach(key => {
            const element = statElements[key];
            if (element) {
                element.textContent = counts[key];
            }
        });
    }

    checkEmptyState() {
        const container = document.getElementById('tasks-container') || document.querySelector('.tasks-grid');
        if (container && this.tasks.length === 0) {
            this.renderTasks();
        }
    }

    formatDateForInput(dateString) {
        const date = new Date(dateString);
        return date.toISOString().slice(0, 16);
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

    getTasksByStatus(status) {
        return this.tasks.filter(task => task.status === status);
    }

    getTasksByArea(area) {
        return this.tasks.filter(task => task.area === area);
    }

    getOverdueTasks() {
        const now = new Date();
        return this.tasks.filter(task => 
            task.status === 'pending' && new Date(task.dueDate) < now
        );
    }

    getTodayTasks() {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        return this.tasks.filter(task => {
            const dueDate = new Date(task.dueDate);
            return dueDate >= today && dueDate < tomorrow && task.status === 'pending';
        });
    }

    populateAreaSelects() {
        // Cargar áreas desde localStorage (igual que AreasManager)
        let areas = [];
        try {
            const savedAreas = localStorage.getItem('astren_areas');
            if (savedAreas) {
                areas = JSON.parse(savedAreas);
            }
        } catch (e) {
            areas = [];
        }
        // Solo áreas no archivadas
        areas = areas.filter(a => !a.archived);
        const areaSelects = [
            document.getElementById('taskArea'),
            document.getElementById('editTaskArea')
        ];
        areaSelects.forEach(select => {
            if (!select) return;
            select.innerHTML = '';
            if (areas.length === 0) {
                select.innerHTML = '<option value="">No hay áreas disponibles</option>';
                select.disabled = true;
            } else {
                select.disabled = false;
                select.innerHTML = '<option value="">Seleccionar área</option>' +
                    areas.map(area => `<option value="${area.id}">${area.name}</option>`).join('');
            }
        });
        // Deshabilitar botón de crear tarea si no hay áreas
        const newTaskBtn = document.querySelector('#newTaskForm button[type="submit"]');
        if (newTaskBtn) {
            newTaskBtn.disabled = areas.length === 0;
        }
        // Mensaje si no hay áreas
        const form = document.getElementById('newTaskForm');
        if (form) {
            let msg = form.querySelector('.no-areas-msg');
            if (areas.length === 0) {
                if (!msg) {
                    msg = document.createElement('div');
                    msg.className = 'no-areas-msg';
                    msg.style.color = 'red';
                    msg.style.marginTop = '10px';
                    msg.textContent = 'Debes crear un área antes de poder crear tareas.';
                    form.appendChild(msg);
                }
            } else if (msg) {
                msg.remove();
            }
        }
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    if (document.querySelector('.tasks-container') || document.querySelector('.tasks-grid')) {
        window.tasksManager = new TasksManager();
    }
});

// Export for global access
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TasksManager;
}

// Renderizar solo tareas pendientes de hoy en la sección urgente
function renderUrgentTasksOnlyPendingToday() {
    const urgentTasks = document.getElementById('urgentTasks');
    if (!urgentTasks) return;
    urgentTasks.innerHTML = '';
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tasks = JSON.parse(localStorage.getItem('astren_tasks')) || [];
    const tasksToday = tasks.filter(task => {
        const dueDate = new Date(task.dueDate);
        return dueDate >= today && dueDate < tomorrow && task.status === 'pending';
    });
    tasksToday.forEach(task => {
        // Usar el método global si existe, si no, crear una tarjeta simple
        if (window.tasksManager && window.tasksManager.createTaskCard) {
            urgentTasks.insertAdjacentHTML('beforeend', window.tasksManager.createTaskCard(task));
        } else {
            urgentTasks.insertAdjacentHTML('beforeend', `<div class="task-card">${task.title}</div>`);
        }
    });
}

// Renderizar tareas pendientes
function renderPendingTasks() {
    const pendingTasks = document.getElementById('pendingTasks');
    if (!pendingTasks) return;
    pendingTasks.innerHTML = '';
    const tasks = JSON.parse(localStorage.getItem('astren_tasks')) || [];
    const pending = tasks.filter(task => task.status === 'pending');
    pending.forEach(task => {
        if (window.tasksManager && window.tasksManager.createTaskCard) {
            pendingTasks.insertAdjacentHTML('beforeend', window.tasksManager.createTaskCard(task));
        } else {
            pendingTasks.insertAdjacentHTML('beforeend', `<div class=\"task-card\">${task.title}</div>`);
        }
    });
}

// Renderizar tareas completadas recientes
function renderCompletedTasks() {
    const completedTasks = document.getElementById('completedTasks');
    if (!completedTasks) return;
    completedTasks.innerHTML = '';
    const tasks = JSON.parse(localStorage.getItem('astren_tasks')) || [];
    // Mostrar solo las 10 más recientes
    const completed = tasks.filter(task => task.status === 'completed')
        .sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt))
        .slice(0, 10);
    completed.forEach(task => {
        if (window.tasksManager && window.tasksManager.createTaskCard) {
            completedTasks.insertAdjacentHTML('beforeend', window.tasksManager.createTaskCard(task));
        } else {
            completedTasks.insertAdjacentHTML('beforeend', `<div class=\"task-card\">${task.title}</div>`);
        }
    });
}

document.addEventListener('DOMContentLoaded', function() {
    renderUrgentTasksOnlyPendingToday();
    renderPendingTasks();
    renderCompletedTasks();
}); 