// Sistema de Tareas Completo y Robusto de Astren
class TasksManager {
    constructor() {
        this.tasks = [];
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
        this.isSubmitting = false; // Añadir esta línea al constructor
        this.lastSubmittedTask = null; // Añadir esta línea al constructor
        this.lastSubmissionTime = 0;
        this.lastTaskCreationAttempt = null;
        this.taskCreationLock = false;
        this.taskDeletionLock = false;
        this.lastLoadTasksTime = 0;
        this.lastNotificationTime = 0;
        this._loadTasksPromise = null; // Añadir esta línea
        this.init();
        // Añadir una propiedad para rastrear la última tarea eliminada
        this.lastDeletedTaskId = null;
        this.lastDeleteTime = 0;
        this.boundConfirmDeleteHandler = null; // Añadir esta propiedad
    }

    init() {
        // Añadir un manejador de eventos global para prevenir múltiples eliminaciones
        this.taskDeletionLock = false;
        this.boundConfirmDeleteHandler = null;

        this.setupEventListeners();
        // Si hay área en la URL, seleccionarla en el filtro y filtrar
        if (this.areaFromUrl) {
            const areaFilter = document.getElementById('areaFilter');
            if (areaFilter) {
                areaFilter.value = this.areaFromUrl;
            }
        }
        this.populateTaskAreaSelect();
        // Render inmediato desde cache si la feature está activa
        if (typeof CONFIG !== 'undefined' && CONFIG.FEATURES && CONFIG.FEATURES.CACHE_FIRST) {
            try {
                const cached = JSON.parse(localStorage.getItem('astren_tasks') || '[]');
                if (Array.isArray(cached) && cached.length) {
                    this.tasks = cached;
                    this.renderTasks();
                    this.updateTaskCounts();
                    this.checkEmptyState();
                }
            } catch (e) {}
        }
        // Cargar tareas desde el backend y renderizar
        this.loadTasks().then(tasks => {
            this.tasks = tasks;
            this.renderTasks();
            this.updateTaskCounts();
            this.checkEmptyState();
            
            // Navegación automática a secciones específicas DESPUÉS de renderizar
            this.handleSectionNavigation();
            
            // Si hay navegación pendiente desde el dashboard, ejecutarla
            if (this.pendingNavigation) {
                console.log('🎯 Ejecutando navegación pendiente:', this.pendingNavigation);
                setTimeout(() => {
                    this.navigateToSection(this.pendingNavigation);
                    this.pendingNavigation = null;
                }, 1000); // Esperar un poco más para asegurar que todo esté renderizado
            }
        });
        
        // Listener para cambios en el hash de la URL (navegación desde dashboard)
        window.addEventListener('hashchange', () => {
            console.log('🔄 Hash cambiado, navegando a nueva sección');
            // Esperar a que las tareas se carguen antes de navegar
            this.waitForTasksAndNavigate();
        });
        
        // También verificar hash al cargar la página (para navegación desde dashboard)
        if (window.location.hash) {
            console.log('🎯 Hash detectado al cargar página:', window.location.hash);
            // Marcar que necesitamos navegar después de cargar las tareas
            this.pendingNavigation = window.location.hash.substring(1);
        }
        this.setupGlobalEvents();
        this.setupDeleteTaskEvents(); // Mantener esta línea
        console.log('📋 Tasks Manager inicializado con', this.tasks.length, 'tareas');
        setInterval(() => {
            if (typeof window.tasksManager !== 'undefined') {
                window.tasksManager.updateTaskCounts();
            }
        }, 60000);
    }

    loadTasks() {
        // Si ya hay una carga de tareas en progreso, devolver la promesa existente
        if (this._loadTasksPromise) {
            console.warn('🚫 [WARNING] Carga de tareas ya en progreso. Utilizando promesa existente.');
            return this._loadTasksPromise;
        }

        // Crear una nueva promesa para la carga de tareas
        const userId = this.getUserId();
        const url = buildApiUrl(CONFIG.API_ENDPOINTS.TASKS, `/${userId}?limit=100&offset=0`);
        this._loadTasksPromise = fetch(url, { cache: 'no-store' })
            .then(response => {
                // Verificar si la respuesta es válida
                if (!response.ok) {
                    throw new Error('Error al cargar tareas');
                }
                return response.json();
            })
            .then(tareas => {
                Logger.debug('Tareas recibidas del backend', tareas, 'API');
                
                // Mapear tareas con estado correcto
                const mappedTareas = tareas.map(t => ({
                    ...t,
                    status: t.estado === 'pendiente' ? 'pending' :
                            t.estado === 'completada' ? 'completed' :
                            t.estado === 'vencida' ? 'overdue' : t.estado,
                    title: t.titulo || t.title,
                    dueDate: t.fecha_vencimiento || t.dueDate
                }));

                // Guardar en cache para render inmediato posterior
                try { localStorage.setItem('astren_tasks', JSON.stringify(mappedTareas)); } catch (e) {}

                // Limpiar la promesa en progreso
                this._loadTasksPromise = null;

                return mappedTareas;
            })
            .catch((error) => {
                console.error('❌ [ERROR] Error al cargar tareas:', error);
                
                // Limpiar la promesa en progreso en caso de error
                this._loadTasksPromise = null;
                
                return [];
            });

        return this._loadTasksPromise;
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
        const confirmBtn = document.getElementById('confirmDeleteTaskBtn');

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
                Logger.debug('Botón de eliminar pulsado', { taskId }, 'UI');
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
        this.hideAllModals();
        this.showModal('newTaskModal');
        console.log('Llamando a populateTaskAreaSelect');
        populateTaskAreaSelect(); // Refrescar áreas activas desde backend cada vez
    }

    showEditTaskModal(taskId) {
        const task = this.tasks.find(t => t.id === taskId);
        if (!task) return;

        const form = document.getElementById('editTaskForm');
        if (form) {
            this.populateTaskAreaSelect();
            form.querySelector('#editTaskTitle').value = task.title;
            form.querySelector('#editTaskDescription').value = task.description;
            form.querySelector('#editTaskArea').value = task.area;
            form.querySelector('#editTaskDueDate').value = this.formatDateForInput(task.dueDate);
        }

        this.currentTaskId = taskId;
        this.showModal('editTaskModal');
    }

    showDeleteTaskModal(taskId) {
        Logger.debug('Mostrando modal de eliminación para tarea', { taskId }, 'UI');
        
        // Guardar el ID de la tarea actual
        this.currentTaskId = taskId;
        
        // Mostrar modal de confirmación
        const modal = document.getElementById('deleteConfirmModal');
        if (modal) {
            // Usar requestAnimationFrame para mostrar el modal
            requestAnimationFrame(() => {
                // Intentar múltiples métodos para mostrar el modal
            modal.style.display = 'flex';
                modal.style.visibility = 'visible';
            modal.classList.add('active');
                
                // Forzar estilos para asegurar visibilidad
                modal.setAttribute('style', `
                    display: flex !important;
                    visibility: visible !important;
                    opacity: 1 !important;
                    position: fixed !important;
                    top: 0 !important;
                    left: 0 !important;
                    width: 100% !important;
                    height: 100% !important;
                    background: rgba(0,0,0,0.5) !important;
                    z-index: 1000 !important;
                    justify-content: center !important;
                    align-items: center !important;
                `);

                // Asegurar que el contenido del modal también sea visible
                const modalContent = modal.querySelector('.modal-content');
                if (modalContent) {
                    modalContent.setAttribute('style', `
                        display: block !important;
                        visibility: visible !important;
                        opacity: 1 !important;
                        transform: scale(1) !important;
                    `);
                }

                // Manejar el overflow del body de manera más segura
                document.body.style.overflow = 'hidden';
                document.documentElement.style.overflow = 'hidden';
                
                // Añadir padding para compensar la barra de desplazamiento
                const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
                document.body.style.paddingRight = `${scrollbarWidth}px`;

                console.log('🗑️ [DEBUG] Modal de eliminación mostrado con estilos forzados');
            });
        } else {
            console.error('❌ [ERROR] Modal de eliminación no encontrado');
        }
    }

    showEvidenceModal(taskId) {
        this.currentTaskId = taskId;
        this.showModal('evidenceModal');
    }

    handleNewTask(e) {
        e.preventDefault();
        Logger.debug('handleNewTask called - preventing default', null, 'UI');
        
        // Añadir un flag para evitar múltiples envíos
        if (this.isSubmitting) {
            console.warn('🚫 [WARNING] Intento de envío de tarea mientras otra está en proceso');
            return;
        }
        
        this.isSubmitting = true;
        
        const formData = new FormData(e.target);
        const taskData = {
            title: formData.get('title'),
            description: formData.get('description'),
            area: formData.get('area') || null,
            dueDate: formData.get('dueDate')
        };
        
        Logger.debug('Task data', taskData, 'UI');
        
        if (this.validateTaskData(taskData)) {
            this.addTask(taskData);
        }
        
        // Resetear el flag después de un breve tiempo
        setTimeout(() => {
            this.isSubmitting = false;
        }, 2000);
    }

    async handleEditTask(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const updates = {
            title: formData.get('title'),
            description: formData.get('description'),
            area: formData.get('area'),
            dueDate: formData.get('dueDate')
        };

        if (this.validateTaskData(updates)) {
            try {
                await this.updateTask(this.currentTaskId, updates);
                this.hideModal('editTaskModal');
                this.showToast('Tarea actualizada exitosamente', 'success');
            } catch (error) {
                // El error ya se maneja en updateTask
            }
        }
    }

    confirmDeleteTask(taskId) {
        console.log('🗑️ [DEBUG] Confirmando eliminación de tarea:', taskId);
        
        // Verificar que el taskId sea válido
        if (!taskId) {
            console.error('❌ [ERROR] ID de tarea inválido');
            return;
        }

        // Prevenir múltiples confirmaciones
        if (this.taskDeletionLock) {
            console.warn('🚫 [WARNING] Eliminación de tarea en progreso. Espere.');
            return;
        }

        // Mostrar modal de confirmación
        const modal = document.getElementById('deleteConfirmModal');
        const confirmDeleteBtn = document.getElementById('confirmDeleteTaskBtn');
        
        if (!modal || !confirmDeleteBtn) {
            console.error('❌ [ERROR] Modal o botón de confirmación no encontrados');
            return;
        }
        
        // Limpiar eventos anteriores para evitar múltiples manejadores
        confirmDeleteBtn.removeEventListener('click', this.boundDeleteHandler);
        
        // Crear un manejador de eventos vinculado
        this.boundDeleteHandler = (event) => {
            console.log('🗑️ [DEBUG] Botón de confirmación pulsado. Eliminando tarea:', taskId);
            
            // Prevenir comportamiento por defecto
            event.preventDefault();
            event.stopPropagation();
            
            // Cerrar modal
            modal.style.display = 'none';
            
            // Eliminar tarea
            this.deleteTask(taskId).catch(error => {
                console.error('❌ [ERROR] Error en eliminación de tarea:', error);
                this.showToast('Error al eliminar la tarea', 'error');
            });
        };
        
        // Añadir nuevo manejador de evento
        confirmDeleteBtn.addEventListener('click', this.boundDeleteHandler);
        
        // Mostrar modal
        modal.style.display = 'flex';
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
        // La descripción es opcional, no validar longitud
        if (!data.dueDate) {
            this.showToast('Debes seleccionar una fecha límite', 'error');
            return false;
        }
        return true;
    }

    addTask(taskData) {
        // Prevenir múltiples envíos simultáneos
        if (this.taskCreationLock) {
            console.warn('🚫 [WARNING] Creación de tarea en progreso. Espere.');
            return;
        }
        this.taskCreationLock = true;

        Logger.debug('Método addTask llamado', taskData, 'API');

        // Obtener usuario_id de localStorage o sessionStorage
        let usuario_id = localStorage.getItem('astren_usuario_id');
        if (!usuario_id) {
            try {
                const user = JSON.parse(sessionStorage.getItem('astren_user'));
                usuario_id = user?.usuario_id;
            } catch (e) {
                console.error('❌ [ERROR] No se pudo obtener usuario_id:', e);
                this.showToast('Error: No se pudo identificar el usuario', 'error');
                this.taskCreationLock = false;
                return;
            }
        }

        const nuevaTarea = {
            usuario_id: parseInt(usuario_id, 10), // Convertir explícitamente a número
            titulo: taskData.title,
            descripcion: taskData.description,
            area_id: taskData.area ? parseInt(taskData.area, 10) : null,
            grupo_id: null,
            fecha_vencimiento: this.formatDateForBackend(taskData.dueDate)
        };
        
        Logger.debug('Enviando tarea al backend', nuevaTarea, 'API');
        
        fetch(buildApiUrl(CONFIG.API_ENDPOINTS.TASKS), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(nuevaTarea)
        })
        .then(async response => {
            Logger.debug('Respuesta del backend recibida', response, 'API');
            
            let data = null;
            try {
                data = await response.json();
                Logger.debug('Datos del backend', data, 'API');
            } catch (e) {
                console.error('❌ [ERROR] Respuesta inválida del servidor:', e);
                
                // Si no es un JSON válido, intentar obtener el texto de la respuesta
                const errorText = await response.text();
                console.error('❌ [ERROR] Texto de respuesta:', errorText);
                
                this.showToast('Respuesta inválida del servidor', 'error');
                this.taskCreationLock = false;
                return;
            }
            
            if (response.ok && data.mensaje) {
                if (data.mensaje === 'Tarea creada') {
                    // Tarea creada exitosamente
                    if (data.tarea) {
                this.tasks.push({
                    ...data.tarea,
                    dueDate: data.tarea.fecha_vencimiento,
                    title: data.tarea.titulo,
                    description: data.tarea.descripcion,
                    area: data.tarea.area_id,
                    id: data.tarea.id
                });
                    }
                    this.showToast('Tarea creada exitosamente', 'success');
                this.renderTasks();
                this.hideModal('newTaskModal');
                } else if (data.mensaje === 'Tarea no creada') {
                    // Manejar el caso de tarea no creada
                    this.showToast('Tarea creada exitosamente', 'success');
                this.loadTasks().then(tasks => {
                    this.tasks = tasks;
                    this.renderTasks();
                    this.hideModal('newTaskModal');
                });
                } else {
                    // Otro mensaje inesperado
                    this.showToast(data.mensaje, 'info');
                }
            } else if (data && data.error) {
                this.showToast(data.error, 'error');
            } else {
                this.showToast('Error al guardar la tarea', 'error');
            }
            
            // Liberar el bloqueo de creación de tareas
            this.taskCreationLock = false;
        })
        .catch((err) => {
            console.error('❌ [ERROR] Error de red o fetch:', err);
            this.showToast('Error de red al crear tarea', 'error');
            this.taskCreationLock = false;
        });
    }

    formatDateForBackend(dateString) {
        if (!dateString) return '';
        const date = new Date(dateString);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${year}-${month}-${day} ${hours}:${minutes}`;
    }

    async updateTask(taskId, updates) {
        try {
            // Preparar los datos para el backend
            const backendData = {
                titulo: updates.title,
                descripcion: updates.description,
                area_id: updates.area ? parseInt(updates.area) : null,
                fecha_vencimiento: updates.dueDate ? this.formatDateForBackend(updates.dueDate) : null
            };
            
            // Enviar actualización al backend
            const response = await fetch(buildApiUrl(CONFIG.API_ENDPOINTS.TASKS, `/${taskId}`), {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(backendData)
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Error al actualizar la tarea');
            }
            
            // Actualizar localmente después de confirmar que el backend se actualizó
            const taskIndex = this.tasks.findIndex(t => t.id === taskId);
            if (taskIndex !== -1) {
                this.tasks[taskIndex] = { ...this.tasks[taskIndex], ...updates };
                this.saveTasks();
                this.renderTasks();
                this.updateTaskCounts();
            }
            
        } catch (error) {
            console.error('❌ [ERROR] Error al actualizar tarea:', error);
            this.showToast(error.message, 'error');
        }
    }

    deleteTask(taskId) {
        console.log('🗑️ [DEBUG] Método deleteTask llamado con taskId:', taskId);

        // Prevenir múltiples envíos de eliminación
        if (this.taskDeletionLock) {
            console.warn('🚫 [WARNING] Eliminación de tarea en progreso. Espere.');
            return Promise.reject('Eliminación en progreso');
        }
        this.taskDeletionLock = true;

        // Obtener usuario_id
        const usuario_id = this.getUserId();

        // Encontrar la tarea a eliminar
        const taskToDelete = this.tasks.find(t => t.id === taskId);
        
        // Eliminar la tarea localmente de inmediato
        const initialTaskCount = this.tasks.length;
        this.tasks = this.tasks.filter(t => t.id !== taskId);
        console.log(`🗑️ [DEBUG] Tareas después de eliminación local: ${this.tasks.length}`);
        
        // Renderizar de manera asíncrona
        return new Promise((resolve, reject) => {
            // Usar setTimeout para renderizar
            setTimeout(() => {
                if (this.tasks.length < initialTaskCount) {
                    this.renderTasks();
                }

                // Realizar la solicitud de eliminación
        fetch(buildApiUrl(CONFIG.API_ENDPOINTS.TASKS, `/${taskId}`), {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ 
                        usuario_id: parseInt(usuario_id, 10),
                        task_details: taskToDelete // Enviar detalles de la tarea para registro
                    })
                })
        .then(res => {
                    console.log(`🌐 [DEBUG] Respuesta del servidor recibida. OK: ${res.ok}, Status: ${res.status}`);
                    
                    // Manejar específicamente el caso de 404
                    if (res.status === 404) {
                        console.warn(`🚫 [WARNING] Tarea ${taskId} no encontrada en el servidor`);
                        this.showToast('La tarea ya ha sido eliminada', 'info');
                        resolve(null);
                        return null;
                    }

                    if (!res.ok) {
                        throw new Error('Error en la eliminación');
                    }
                    return res.json();
                })
                .then(res => {
                    if (res) {
                        console.log('📦 [DEBUG] Datos de respuesta:', res);
                        
                        // Mostrar notificación única
            this.showToast('Tarea eliminada exitosamente', 'info');
                        
                        // Recargar tareas desde el backend
                        return this.loadTasks();
                    }
                    return this.tasks;
                })
                .then(tasks => {
                    console.log(`🔄 [DEBUG] Tareas recargadas. Total: ${tasks.length}`);
                    // Actualizar tareas y renderizar
                this.tasks = tasks.filter(t => t.estado !== 'eliminada');
                    
                    // Renderizar de manera asíncrona
                    setTimeout(() => {
                this.renderTasks();
                    }, 0);
                    
                    resolve(tasks);
        })
                .catch((error) => {
                    console.error('❌ [ERROR] Error al eliminar la tarea:', error);
                    
                    // Revertir eliminación local si hay error
                    this.loadTasks().then(tasks => {
                        this.tasks = tasks;
                        
                        // Renderizar de manera asíncrona
                        setTimeout(() => {
                            this.renderTasks();
                        }, 0);
                        
            this.showToast('Error al eliminar la tarea', 'error');
                        reject(error);
                    });
                })
                .finally(() => {
                    console.log('🔓 [DEBUG] Liberando bloqueo de eliminación');
                    // Liberar el bloqueo de eliminación de tareas
                    this.taskDeletionLock = false;
                });
            }, 0);
        });
    }

    toggleTaskCompletion(taskId, completed) {
        const task = this.tasks.find(t => t.id === taskId);
        if (task) {
            // Cambiar ambos campos para compatibilidad
            task.status = completed ? 'completed' : 'pending';
            task.estado = completed ? 'completada' : 'pendiente';
            task.completedAt = completed ? new Date().toISOString() : null;
            if (completed) {
                task.reputationImpact = this.calculateReputationImpact(task);
            }
            // Actualizar en backend
            fetch(buildApiUrl(CONFIG.API_ENDPOINTS.TASKS, `/${taskId}/estado`), {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ estado: task.estado })
            })
            .then(response => response.json())
            .then(data => {
                // Opcional: mostrar mensaje de éxito o manejar error
                this.saveTasks();
                this.applyFilters();
                this.updateTaskCounts();
                if (typeof renderUrgentTasksOnlyPendingToday === 'function') {
                    renderUrgentTasksOnlyPendingToday();
                }
                if (typeof renderPendingTasks === 'function') {
                    renderPendingTasks();
                }
                if (typeof renderCompletedTasks === 'function') {
                    renderCompletedTasks();
                }
                if (typeof renderOverdueTasks === 'function') {
                    renderOverdueTasks();
                }
                this.showToast(
                    completed ? 'Tarea marcada como completada' : 'Tarea marcada como pendiente',
                    'success'
                );
            })
            .catch(error => {
                this.showToast('Error al actualizar el estado en el servidor', 'error');
            });
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
        // Limitar la cantidad de tareas renderizadas para mejorar el rendimiento
        const MAX_TASKS_TO_RENDER = 50;
        tasksToRender = tasksToRender.slice(0, MAX_TASKS_TO_RENDER);

        // Usar setTimeout para evitar bloquear el hilo principal
        setTimeout(() => {
        // Seleccionar los contenedores de cada sección
        const urgentTasks = document.getElementById('urgentTasks');
        const pendingTasks = document.getElementById('pendingTasks');
        const completedTasks = document.getElementById('completedTasks');
        const overdueTasks = document.getElementById('overdueTasks');

            // Limpiar contenedores
        if (urgentTasks) urgentTasks.innerHTML = '';
        if (pendingTasks) pendingTasks.innerHTML = '';
        if (completedTasks) completedTasks.innerHTML = '';
        if (overdueTasks) overdueTasks.innerHTML = '';

        // Filtrar tareas por estado y fecha usando status en inglés
        const tareasHoy = tasksToRender.filter(task => task.status === 'pending' && this.esFechaHoy(task.fecha_vencimiento || task.dueDate))
            .sort((a, b) => new Date(a.fecha_vencimiento || a.dueDate) - new Date(b.fecha_vencimiento || b.dueDate));
        const tareasPendientes = tasksToRender.filter(task => task.status === 'pending')
            .sort((a, b) => new Date(a.fecha_vencimiento || a.dueDate) - new Date(b.fecha_vencimiento || b.dueDate));
        const tareasCompletadas = tasksToRender.filter(task => task.status === 'completed')
            .sort((a, b) => new Date(a.fecha_vencimiento || a.dueDate) - new Date(b.fecha_vencimiento || b.dueDate));
        const tareasVencidas = tasksToRender.filter(task => task.status === 'overdue')
            .sort((a, b) => new Date(a.fecha_vencimiento || a.dueDate) - new Date(b.fecha_vencimiento || b.dueDate));

            // Renderizar cada sección en lotes
            const renderSection = (container, tasks) => {
                if (!container) return;
                
                // Renderizar en lotes para evitar bloquear la UI
                const BATCH_SIZE = 10;
                for (let i = 0; i < tasks.length; i += BATCH_SIZE) {
                    const batch = tasks.slice(i, i + BATCH_SIZE);
                    batch.forEach(task => {
                        container.insertAdjacentHTML('beforeend', this.createTaskCard(task));
            });
        }
            };

            renderSection(urgentTasks, tareasHoy);
            renderSection(pendingTasks, tareasPendientes);
            renderSection(completedTasks, tareasCompletadas);
            renderSection(overdueTasks, tareasVencidas);

            // Actualizar contadores de tareas
            this.updateTaskCounts();
        }, 0);
    }

    createTaskCard(task) {
        // Compatibilidad con campos del backend y frontend
        const titulo = task.titulo || task.title || 'Sin título';
        const descripcion = task.descripcion || task.description || '';
        const fechaVencimiento = task.fecha_vencimiento || task.dueDate || '';
        const area = task.area_id || task.area || null;
        const areaColor = task.area_color || task.color || null;
        const areaIcono = task.area_icono || task.icono || null;
        const areaNombre = task.area_nombre || task.nombre || area;
        
        // Información del grupo
        const grupoNombre = task.grupo_nombre || null;
        const grupoColor = task.grupo_color || null;
        const grupoIcono = task.grupo_icono || 'fa-users';
        
        // Usar status en inglés para la lógica, pero mostrar en español
        const estado = task.status || 'pending';
        
        // Mapa de colores para áreas y grupos (unificados con el color picker de grupos)
        const colorMap = {
            'blue': '#93c5fd',      // Azul
            'green': '#86efac',      // Verde
            'purple': '#c4b5fd',     // Púrpura
            'orange': '#fed7aa',     // Naranja
            'red': '#fca5a5',        // Rojo
            'pink': '#f9a8d4',       // Rosa
            'yellow': '#fef3c7',     // Amarillo
            'mint': '#a7f3d0',       // Menta
            'sky': '#bae6fd',        // Cielo
            'coral': '#fecaca',      // Coral
            'lavender': '#e9d5ff'    // Lavanda
        };

        // Función para intensificar colores
        const intensifyColor = (hexColor) => {
            // Convertir hex a RGB
            const r = parseInt(hexColor.slice(1, 3), 16);
            const g = parseInt(hexColor.slice(3, 5), 16);
            const b = parseInt(hexColor.slice(5, 7), 16);
            
            // Intensificar el color (hacerlo más oscuro)
            const factor = 0.9; // 0.9 = 10% más oscuro
            const newR = Math.round(r * factor);
            const newG = Math.round(g * factor);
            const newB = Math.round(b * factor);
            
            // Convertir de vuelta a hex
            return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
        };

        // Área con color intensificado
        let areaHtml = '';
        if (area && (areaColor || areaIcono)) {
            const color = colorMap[areaColor] || areaColor || '#666';
            const intensifiedColor = intensifyColor(color);
            const icon = areaIcono || 'fa-tasks';
            areaHtml = `<span class="task-area-badge" style="display: inline-flex; align-items: center; gap: 0.35rem; font-size: 0.87rem; border-radius: 1rem; padding: 0.13rem 0.7rem; font-weight: 500; background: none; color: #666; margin-left: -0.7rem;">
                <i class="fas ${icon}" style="font-size: 1rem; color: ${intensifiedColor};"></i> ${areaNombre}
            </span>`;
        }

        // Grupo con color intensificado
        let grupoHtml = '';
        if (grupoNombre && grupoColor) {
            const color = colorMap[grupoColor] || grupoColor || '#666';
            const intensifiedColor = intensifyColor(color);
            const icon = grupoIcono || 'fa-users';
            grupoHtml = `<span class="task-group-badge" style="display: inline-flex; align-items: center; gap: 0.35rem; font-size: 0.87rem; border-radius: 1rem; padding: 0.13rem 0.7rem; font-weight: 500; background: none; color: #666; margin-left: 0.5rem;">
                <i class="fas ${icon}" style="font-size: 1rem; color: ${intensifiedColor};"></i> ${grupoNombre}
            </span>`;
        }

        // Clases de estado
        const completedClass = estado === 'completed' ? 'task-card--completed' : '';
        const overdueClass = estado === 'overdue' ? 'task-card--overdue' : '';
        const pendingClass = estado === 'pending' ? 'task-card--pending' : '';
        
        // Etiqueta visual del estado
        let estadoHtml = '';
        if (estado === 'completed') {
            estadoHtml = '<span class="task-status task-status--completed">Completada</span>';
        } else if (estado === 'overdue') {
            estadoHtml = '<span class="task-status task-status--overdue">Vencida</span>';
        } else {
            estadoHtml = '<span class="task-status task-status--pending">Pendiente</span>';
        }

        // Determinar el color del icono basado en el estado
        let iconColor = '#3b82f6'; // Color por defecto
        if (estado === 'completed') {
            iconColor = '#10b981'; // Verde para completadas
        } else if (estado === 'overdue') {
            iconColor = '#ef4444'; // Rojo para vencidas
        } else if (estado === 'pending') {
            iconColor = '#f59e0b'; // Amarillo para pendientes
        }

        return `
            <div class="task-card ${completedClass} ${overdueClass} ${pendingClass}" data-task-id="${task.id || ''}">
                <div class="task-header">
                    <div style="display: flex; align-items: center; gap: 0.2rem;">
                        <div class="task-checkbox">
                            <input type="checkbox" id="task-${task.id || ''}" ${estado === 'completed' ? 'checked' : ''}>
                            <label for="task-${task.id || ''}"></label>
                        </div>
                        <div class="task-actions">
                            <button class="task-action task-action--edit" title="Editar tarea">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="task-action task-action--delete" title="Eliminar tarea">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                    <div class="task-icon" style="background: linear-gradient(135deg, ${iconColor}, ${this.adjustColor ? this.adjustColor(iconColor, -20) : iconColor});">
                        <i class="fas fa-tasks"></i>
                    </div>
                    ${estadoHtml}
                </div>
                <div class="task-info">
                    <h3 class="task-title">${this.escapeHtml(titulo)}</h3>
                    <p class="task-description">${this.escapeHtml(descripcion)}</p>
                    <div class="task-meta">
                        <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.3rem;">
                            ${areaHtml}
                            ${grupoHtml}
                        </div>
                        <span class="task-due ${this.getDueClass ? this.getDueClass(task) : ''}" style="color: #666;">
                            <i class="fas fa-calendar" style="color: #666;"></i>
                            ${fechaVencimiento ? this.formatDateForInput(fechaVencimiento) : ''}
                        </span>
                    </div>
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
        // Optimizar el cálculo de contadores
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        today.setHours(0, 0, 0, 0);

        const counts = {
            today: this.tasks.filter(task => 
                task.status === 'pending' && this.esFechaHoy(task.fecha_vencimiento || task.dueDate)
            ).length,
            pending: this.tasks.filter(task => task.status === 'pending').length,
            completed: this.tasks.filter(task => task.status === 'completed').length,
            overdue: this.tasks.filter(task => task.status === 'overdue').length
        };

        // Calcular porcentajes
        const totalTasks = counts.pending + counts.completed + counts.overdue;
        const todayPercentage = totalTasks > 0 ? Math.round((counts.today / totalTasks) * 100) : 0;
        const pendingPercentage = totalTasks > 0 ? Math.round((counts.pending / totalTasks) * 100) : 0;
        const completedPercentage = totalTasks > 0 ? Math.round((counts.completed / totalTasks) * 100) : 0;
        const overduePercentage = totalTasks > 0 ? Math.round((counts.overdue / totalTasks) * 100) : 0;

        // Función de animación
        const updateStatWithAnimation = (elementId, value) => {
            const statElement = document.getElementById(elementId);
            if (!statElement) return;

            // Siempre empezar desde 0 para que la animación sea visible
            const currentValue = 0;
            const animationDuration = 800; // Aumentar duración para mejor efecto
            const increment = value / (animationDuration / 16); // 16ms es aproximadamente un frame

            let currentDisplayValue = currentValue;
            const updateValue = () => {
                currentDisplayValue += increment;
                if (currentDisplayValue >= value) {
                    statElement.textContent = value;
                    return;
                }
                statElement.textContent = Math.round(currentDisplayValue);
                requestAnimationFrame(updateValue);
            };
            updateValue();
        };

        // Actualizar cada estadística con animación
        updateStatWithAnimation('statToday', counts.today);
        updateStatWithAnimation('statPending', counts.pending);
        updateStatWithAnimation('statCompleted', counts.completed);
        updateStatWithAnimation('statOverdue', counts.overdue);
    }

    checkEmptyState() {
        const container = document.getElementById('tasks-container') || document.querySelector('.tasks-grid');
        if (container && this.tasks.length === 0) {
            this.renderTasks();
        }
    }

    formatDateForInput(dateString) {
        if (!dateString) return '';
        // Soporta tanto 'YYYY-MM-DD HH:MM' como ISO
        let date;
        if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/.test(dateString)) {
            // Formato 'YYYY-MM-DD HH:MM' (local)
            const [datePart, timePart] = dateString.split(' ');
            const [year, month, day] = datePart.split('-').map(Number);
            const [hours, minutes] = timePart.split(':').map(Number);
            date = new Date();
            date.setFullYear(year, month - 1, day);
            date.setHours(hours, minutes, 0, 0);
        } else {
            // ISO o cualquier otro formato
            date = new Date(dateString);
        }
        const now = new Date();
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const time = `${hours}:${minutes}`;
        // Normaliza fechas para comparar solo día
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const target = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        const diffDays = Math.round((target - today) / (1000 * 60 * 60 * 24));
        const weekDays = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
        if (diffDays === 0) {
            return `Vence hoy a las ${time}`;
        } else if (diffDays === 1) {
            return `Vence mañana a las ${time}`;
        } else if (diffDays > 1 && diffDays < 7) {
            return `Vence ${weekDays[date.getDay()]} a las ${time}`;
        } else {
            return `Vence el ${day}/${month}/${year} a las ${time}`;
        }
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    adjustColor(hex, percent) {
        // Convertir hex a RGB
        let r = parseInt(hex.slice(1, 3), 16);
        let g = parseInt(hex.slice(3, 5), 16);
        let b = parseInt(hex.slice(5, 7), 16);

        // Ajustar brillo
        r = Math.max(0, Math.min(255, r + (r * percent / 100)));
        g = Math.max(0, Math.min(255, g + (g * percent / 100)));
        b = Math.max(0, Math.min(255, b + (b * percent / 100)));

        // Convertir de vuelta a hex
        return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
    }

    showToast(message, type = 'info') {
        // Eliminar cualquier toast existente antes de mostrar uno nuevo
        document.querySelectorAll('.toast').forEach(t => t.remove());

        // Crear un identificador único para este toast
        const toastId = `toast-${Date.now()}`;

        // Crear el elemento toast
        const toast = document.createElement('div');
        toast.id = toastId;
        toast.className = `toast toast--${type}`;
        toast.innerHTML = `
            <i class="${this.getToastIcon(type)}"></i>
            <span>${this.escapeHtml(message)}</span>
        `;

        // Añadir estilos si no están presentes
        if (!document.getElementById('toast-styles')) {
            const style = document.createElement('style');
            style.id = 'toast-styles';
            style.textContent = `
                .toast {
                    position: fixed !important;
                    top: 20px !important;
                    right: 20px !important;
                    background: white !important;
                    border: 1px solid #e1e5e9 !important;
                    border-radius: 8px !important;
                    padding: 12px 16px !important;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.15) !important;
                    display: flex !important;
                    align-items: center !important;
                    gap: 8px !important;
                    z-index: 10000 !important;
                    animation: slideInRight 0.3s ease-out !important;
                    max-width: 300px !important;
                    min-width: 200px !important;
                    color: #333 !important;
                }
                .toast--success { border-left: 4px solid #10b981 !important; }
                .toast--error { border-left: 4px solid #ef4444 !important; }
                .toast--warning { border-left: 4px solid #f59e0b !important; }
                .toast--info { border-left: 4px solid #3b82f6 !important; }
                @keyframes slideInRight {
                    from { transform: translateX(100%) !important; opacity: 0 !important; }
                    to { transform: translateX(0) !important; opacity: 1 !important; }
                }
                .toast i {
                    margin-right: 8px !important;
                    font-size: 18px !important;
                }
            `;
            document.head.appendChild(style);
        }

        // Añadir al cuerpo del documento
        document.body.appendChild(toast);

        // Eliminar el toast después de 3 segundos
        setTimeout(() => {
            const existingToast = document.getElementById(toastId);
            if (existingToast) {
                existingToast.style.animation = 'slideOutRight 0.3s ease-out';
                setTimeout(() => {
                    if (existingToast.parentNode) {
                        existingToast.parentNode.removeChild(existingToast);
                    }
                }, 300);
            }
        }, 3000);

        // Añadir animación de salida
        const styleSheet = document.createElement('style');
        styleSheet.textContent = `
            @keyframes slideOutRight {
                from { transform: translateX(0) !important; opacity: 1 !important; }
                to { transform: translateX(100%) !important; opacity: 0 !important; }
            }
        `;
        document.head.appendChild(styleSheet);

        console.log(`🍞 [DEBUG] Toast creado con ID: ${toastId}`);

        // Prevenir múltiples toasts
        return toastId;
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

    populateTaskAreaSelect() {
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
            select.disabled = false; // Nunca deshabilitar
            if (areas.length === 0) {
                select.innerHTML = '<option value="">Sin área</option>';
            } else {
                select.innerHTML = '<option value="">Sin área</option>' +
                    areas.map(area => `<option value="${area.id}">${area.name}</option>`).join('');
            }
        });
        // Siempre habilitar botón de crear tarea
        const newTaskBtn = document.querySelector('#newTaskForm button[type="submit"]');
        if (newTaskBtn) {
            newTaskBtn.disabled = false;
        }
        // Eliminar mensaje de "Debes crear un área..."
        const form = document.getElementById('newTaskForm');
        if (form) {
            let msg = form.querySelector('.no-areas-msg');
            if (msg) {
                msg.remove();
            }
        }
    }

    // Función para comparar si una fecha es hoy
    esFechaHoy(fechaStr) {
        if (!fechaStr) return false;
        
        // Función de comparación de fechas optimizada
        const parseDate = (dateStr) => {
            // Manejar diferentes formatos de fecha
            if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/.test(dateStr)) {
                dateStr = dateStr.replace(' ', 'T') + ':00';
        }
            return new Date(dateStr);
        };

        const fecha = parseDate(fechaStr);
        const hoy = new Date();

        // Comparación de fechas simplificada
        return fecha.getFullYear() === hoy.getFullYear() &&
            fecha.getMonth() === hoy.getMonth() &&
               fecha.getDate() === hoy.getDate();
    }

    // Método auxiliar para obtener el ID de usuario
    getUserId() {
        if (typeof getAstrenUserId === 'function') return getAstrenUserId();
        let usuario_id = localStorage.getItem('astren_usuario_id');
        if (usuario_id) return usuario_id;
        try {
            const user = JSON.parse(sessionStorage.getItem('astren_user'));
            if (user && user.usuario_id) return user.usuario_id;
        } catch (e) {}
        return sessionStorage.getItem('userId') || localStorage.getItem('userId') || 1;
    }

    // Añadir un método para configurar eventos globales de eliminación
    setupDeleteTaskEvents() {
        const confirmDeleteBtn = document.getElementById('confirmDeleteTask');
        const cancelDeleteBtn = document.getElementById('cancelDeleteTask');
        const closeDeleteBtn = document.getElementById('closeDeleteModal');

        console.log('🔧 [DEBUG] Configurando eventos de eliminación de tareas');

        // Función para restaurar el scroll
        const restoreScroll = () => {
            document.body.style.overflow = '';
            document.documentElement.style.overflow = '';
            document.body.style.paddingRight = '';
        };

        // Limpiar eventos anteriores
        if (confirmDeleteBtn) {
            confirmDeleteBtn.onclick = null;
            confirmDeleteBtn.removeEventListener('click', this.boundConfirmDeleteHandler);
        }

        // Crear un nuevo manejador de eventos vinculado
        this.boundConfirmDeleteHandler = (event) => {
            event.preventDefault();
            event.stopPropagation();
            
            console.log('🗑️ [DEBUG] Botón de confirmación global pulsado');
            
            // Verificar que el botón y el modal existan
            const modal = document.getElementById('deleteConfirmModal');
            const confirmBtn = document.getElementById('confirmDeleteTask');

            if (!modal || !confirmBtn) {
                console.error('❌ [ERROR] Modal o botón de confirmación no encontrados');
                return;
            }
            
            // Deshabilitar el botón para prevenir múltiples clics
            confirmBtn.disabled = true;
            
            if (this.currentTaskId) {
                console.log(`🗑️ [DEBUG] Intentando eliminar tarea: ${this.currentTaskId}`);
                
                // Cerrar modal y restaurar scroll
                modal.style.display = 'none';
                restoreScroll();
                
                // Eliminar tarea con un pequeño retraso para permitir la renderización
                setTimeout(() => {
                    // Verificar si la tarea ya existe antes de intentar eliminarla
                    const taskExists = this.tasks.some(t => t.id === this.currentTaskId);
                    
                    if (!taskExists) {
                        console.warn(`🚫 [WARNING] Tarea ${this.currentTaskId} ya no existe localmente`);
                        this.showToast('La tarea ya ha sido eliminada', 'info');
                        confirmBtn.disabled = false;
                        return;
                    }

                    this.deleteTask(this.currentTaskId)
                        .then(() => {
                            console.log('🗑️ [DEBUG] Tarea eliminada exitosamente');
                            confirmBtn.disabled = false;
                        })
                        .catch(error => {
                            console.error('❌ [ERROR] Error al eliminar la tarea:', error);
                            this.showToast('Error al eliminar la tarea', 'error');
                            confirmBtn.disabled = false;
                        });
                }, 50);
            } else {
                console.warn('❌ [ERROR] No hay tarea seleccionada para eliminar');
                confirmBtn.disabled = false;
            }
        };

        // Añadir el nuevo manejador de eventos
        if (confirmDeleteBtn) {
            confirmDeleteBtn.addEventListener('click', this.boundConfirmDeleteHandler);
        }

        if (cancelDeleteBtn) {
            cancelDeleteBtn.onclick = () => {
                const modal = document.getElementById('deleteConfirmModal');
                if (modal) {
                    modal.style.display = 'none';
                    restoreScroll();
                }
            };
        }

        if (closeDeleteBtn) {
            closeDeleteBtn.onclick = () => {
                const modal = document.getElementById('deleteConfirmModal');
                if (modal) {
                    modal.style.display = 'none';
                    restoreScroll();
                }
            };
        }

        console.log('✅ [DEBUG] Eventos de eliminación de tareas configurados');
    }
    
    // Navegación automática a secciones específicas
    handleSectionNavigation() {
        // Obtener el fragmento de la URL (parte después del #)
        const hash = window.location.hash.substring(1);
        
        if (hash) {
            console.log('🎯 Navegando a sección:', hash);
            
            // Función para intentar hacer scroll
            const attemptScroll = () => {
                const targetSection = document.getElementById(hash);
                
                if (targetSection) {
                    console.log('✅ Sección encontrada, haciendo scroll a:', hash);
                    
                    // Hacer scroll suave a la sección
                    targetSection.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                    
                    // Agregar un efecto visual temporal
                    targetSection.style.transition = 'all 0.3s ease';
                    targetSection.style.backgroundColor = 'hsl(var(--surface-hover))';
                    
                    setTimeout(() => {
                        targetSection.style.backgroundColor = '';
                    }, 2000);
                    
                    console.log('✅ Scroll completado a sección:', hash);
                    return true;
                } else {
                    console.warn('⚠️ Sección no encontrada:', hash);
                    return false;
                }
            };
            
            // Intentar inmediatamente
            if (!attemptScroll()) {
                // Si no funciona, intentar después de un delay
                setTimeout(() => {
                    if (!attemptScroll()) {
                        // Si aún no funciona, intentar una vez más
                        setTimeout(attemptScroll, 1000);
                    }
                }, 1000);
            }
        } else {
            console.log('ℹ️ No hay hash en la URL');
        }
    }
    
    // Esperar a que las tareas se carguen y luego navegar
    waitForTasksAndNavigate() {
        console.log('⏳ Esperando a que las tareas se carguen...');
        
        // Verificar si las tareas ya están cargadas
        if (this.tasks && this.tasks.length > 0) {
            console.log('✅ Tareas ya cargadas, navegando inmediatamente');
            this.handleSectionNavigation();
            return;
        }
        
        // Si no están cargadas, esperar y verificar periódicamente
        let attempts = 0;
        const maxAttempts = 20; // Máximo 10 segundos (20 * 500ms)
        
        const checkAndNavigate = () => {
            attempts++;
            console.log(`⏳ Intento ${attempts}/${maxAttempts} - Verificando tareas...`);
            
            if (this.tasks && this.tasks.length > 0) {
                console.log('✅ Tareas cargadas, navegando a sección');
                this.handleSectionNavigation();
                return;
            }
            
            if (attempts >= maxAttempts) {
                console.warn('⚠️ Tiempo de espera agotado, intentando navegar de todas formas');
                this.handleSectionNavigation();
                return;
            }
            
            // Intentar de nuevo en 500ms
            setTimeout(checkAndNavigate, 500);
        };
        
        checkAndNavigate();
    }
    
    // Navegación directa a una sección específica
    navigateToSection(sectionId) {
        console.log('🎯 Navegando directamente a sección:', sectionId);
        
        const targetSection = document.getElementById(sectionId);
        
        if (targetSection) {
            console.log('✅ Sección encontrada, haciendo scroll a:', sectionId);
            
            // Hacer scroll suave a la sección
            targetSection.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
            
            // Agregar un efecto visual temporal
            targetSection.style.transition = 'all 0.3s ease';
            targetSection.style.backgroundColor = 'hsl(var(--surface-hover))';
            
            setTimeout(() => {
                targetSection.style.backgroundColor = '';
            }, 2000);
            
            console.log('✅ Scroll completado a sección:', sectionId);
        } else {
            console.warn('⚠️ Sección no encontrada:', sectionId);
        }
    }

        // Métodos para el modal de vista detallada
    showTaskViewModal(taskId) {
        const task = this.tasks.find(t => t.id == taskId);
        if (!task) return;

        // Llenar información de la tarea
        const titleElement = document.getElementById('taskViewTitle');
        const nameElement = document.getElementById('taskViewName');
        const descriptionElement = document.getElementById('taskViewDescription');
        
        if (titleElement) titleElement.textContent = `Vista de Tarea`;
        if (nameElement) nameElement.textContent = task.title;
        if (descriptionElement) descriptionElement.textContent = task.description || 'Sin descripción';
        
        // Información del área
        const areaText = task.area ? this.getAreaText(task.area) : 'Sin área';
        const areaElement = document.getElementById('taskViewArea');
        if (areaElement) areaElement.textContent = areaText;
        
        // Fecha de vencimiento
        const dueDate = task.dueDate ? this.formatDateForInput(task.dueDate) : 'Sin fecha';
        const dueElement = document.getElementById('taskViewDue');
        if (dueElement) dueElement.textContent = `Vence: ${dueDate}`;
        
        // Estado
        const statusText = this.getStatusText(task.status);
        const statusElement = document.getElementById('taskViewStatus');
        if (statusElement) statusElement.textContent = statusText;

        // Cargar notas
        this.loadTaskNotes(taskId);
        
        // Crear modal completamente nuevo desde cero
        console.log('Datos de la tarea:', task);
        
        // Alert temporal para verificar que se ejecuta
        alert('Creando modal de vista de tarea...');
        
        const newModal = document.createElement('div');
        newModal.id = 'newTaskViewModal';
        newModal.innerHTML = `
            <div style="
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: red;
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 999999;
            ">
                <div style="
                    background: white;
                    border-radius: 12px;
                    padding: 20px;
                    max-width: 500px;
                    width: 90%;
                ">
                    <h2>¡MODAL DE PRUEBA!</h2>
                    <p><strong>Título:</strong> ${task.titulo || task.title || 'Tarea sin título'}</p>
                    <p><strong>Descripción:</strong> ${task.descripcion || task.description || 'Sin descripción'}</p>
                    <p><strong>Área:</strong> ${task.area_nombre || task.area || 'Sin área'}</p>
                    <p><strong>Estado:</strong> ${this.getStatusText(task.estado || task.status)}</p>
                    <button onclick="document.getElementById('newTaskViewModal').remove()" style="
                        background: #007bff;
                        color: white;
                        border: none;
                        padding: 10px 20px;
                        border-radius: 5px;
                        cursor: pointer;
                    ">Cerrar</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(newModal);
        document.body.style.overflow = 'hidden';
        
        // Alert temporal para verificar que se agregó al DOM
        setTimeout(() => {
            const modal = document.getElementById('newTaskViewModal');
            if (modal) {
                alert('Modal creado y agregado al DOM correctamente');
                console.log('Modal en DOM:', modal);
                console.log('Display del modal:', modal.style.display);
                console.log('Z-index del modal:', modal.style.zIndex);
            } else {
                alert('ERROR: Modal no encontrado en DOM');
            }
        }, 100);
        
        // Cargar notas después de crear el modal
        this.loadTaskNotesForNewModal(taskId);
    }

    async loadTaskNotes(taskId) {
        try {
            const response = await fetch(buildApiUrl(CONFIG.API_ENDPOINTS.TASK_NOTES, `/${taskId}`));
            if (response.ok) {
                const notes = await response.json();
                this.renderTaskNotes(notes);
            } else {
                console.error('Error al cargar notas:', response.statusText);
                this.renderTaskNotes([]);
            }
        } catch (error) {
            console.error('Error al cargar notas:', error);
            this.renderTaskNotes([]);
        }
    }

    renderTaskNotes(notes) {
        const notesList = document.getElementById('notesList');
        
        if (notes.length === 0) {
            notesList.innerHTML = `
                <div class="empty-notes">
                    <i class="fas fa-sticky-note"></i>
                    <p>No hay notas para esta tarea</p>
                </div>
            `;
            return;
        }

        notesList.innerHTML = notes.map(note => `
            <div class="note-item" data-note-id="${note.id}">
                <div class="note-header">
                    <div class="note-meta">
                        <span class="note-author">${note.user_name}</span>
                        <span class="note-date">${this.formatDate(note.created_at)}</span>
                        <span class="note-type">${this.getNoteTypeText(note.note_type)}</span>
                    </div>
                    <div class="note-actions">
                        <button class="note-action" onclick="tasksManager.editNote(${note.id})" title="Editar">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="note-action" onclick="tasksManager.deleteNote(${note.id})" title="Eliminar">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
                <div class="note-content">
                    ${this.renderNoteContent(note)}
                </div>
            </div>
        `).join('');
    }

    renderNoteContent(note) {
        switch (note.note_type) {
            case 'link':
                return `<a href="${note.content}" class="note-link" target="_blank">${note.content}</a>`;
            case 'file':
                return `
                    <div class="note-content">${note.content}</div>
                    <div class="note-file">
                        <i class="fas fa-file"></i>
                        <div class="note-file-info">
                            <div class="note-file-name">${note.file_name}</div>
                            <div class="note-file-size">${this.formatFileSize(note.file_size)}</div>
                        </div>
                    </div>
                `;
            default:
                return `<div class="note-content">${note.content}</div>`;
        }
    }

    getNoteTypeText(type) {
        const types = {
            'text': 'Texto',
            'link': 'Enlace',
            'file': 'Archivo'
        };
        return types[type] || type;
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    formatFileSize(bytes) {
        if (!bytes) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    }

    showAddNoteForm() {
        document.getElementById('addNoteForm').style.display = 'block';
        document.getElementById('noteContent').focus();
    }

    hideAddNoteForm() {
        document.getElementById('addNoteForm').style.display = 'none';
        document.getElementById('noteContent').value = '';
        document.getElementById('noteFile').value = '';
        document.getElementById('noteType').value = 'text';
        document.getElementById('noteFileInput').style.display = 'none';
    }

    async saveNote() {
        const noteType = document.getElementById('noteType').value;
        const noteContent = document.getElementById('noteContent').value.trim();
        const noteFile = document.getElementById('noteFile').files[0];

        if (!noteContent) {
            this.showToast('El contenido de la nota es requerido', 'error');
            return;
        }

        const currentTaskId = this.currentViewTaskId;
        if (!currentTaskId) {
            this.showToast('Error: No se encontró la tarea', 'error');
            return;
        }

        try {
            const noteData = {
                task_id: currentTaskId,
                user_id: this.getUserId(),
                content: noteContent,
                note_type: noteType
            };

            // Si es un archivo, procesar el archivo
            if (noteType === 'file' && noteFile) {
                // Por ahora, solo guardamos el nombre del archivo
                // En una implementación completa, subiríamos el archivo al servidor
                noteData.file_name = noteFile.name;
                noteData.file_size = noteFile.size;
            }

            const response = await fetch(buildApiUrl(CONFIG.API_ENDPOINTS.TASK_NOTES), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(noteData)
            });

            if (response.ok) {
                this.showToast('Nota guardada exitosamente', 'success');
                this.hideAddNoteForm();
                this.loadTaskNotes(currentTaskId);
            } else {
                const error = await response.json();
                this.showToast(`Error: ${error.error}`, 'error');
            }
        } catch (error) {
            console.error('Error al guardar nota:', error);
            this.showToast('Error al guardar la nota', 'error');
        }
    }

    async editNote(noteId) {
        const noteItem = document.querySelector(`[data-note-id="${noteId}"]`);
        const noteContent = noteItem.querySelector('.note-content');
        const currentContent = noteContent.textContent.trim();

        const newContent = prompt('Editar nota:', currentContent);
        if (newContent === null || newContent.trim() === '') return;

        try {
            const response = await fetch(buildApiUrl(CONFIG.API_ENDPOINTS.TASK_NOTES, `/${noteId}`), {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ content: newContent.trim() })
            });

            if (response.ok) {
                this.showToast('Nota actualizada exitosamente', 'success');
                this.loadTaskNotes(this.currentViewTaskId);
            } else {
                const error = await response.json();
                this.showToast(`Error: ${error.error}`, 'error');
            }
        } catch (error) {
            console.error('Error al actualizar nota:', error);
            this.showToast('Error al actualizar la nota', 'error');
        }
    }

    async deleteNote(noteId) {
        if (!confirm('¿Estás seguro de que quieres eliminar esta nota?')) return;

        try {
            const response = await fetch(buildApiUrl(CONFIG.API_ENDPOINTS.TASK_NOTES, `/${noteId}`), {
                method: 'DELETE'
            });

            if (response.ok) {
                this.showToast('Nota eliminada exitosamente', 'success');
                this.loadTaskNotes(this.currentViewTaskId);
            } else {
                const error = await response.json();
                this.showToast(`Error: ${error.error}`, 'error');
            }
        } catch (error) {
            console.error('Error al eliminar nota:', error);
            this.showToast('Error al eliminar la nota', 'error');
        }
    }

    setupTaskViewEvents() {
        // Eventos para las pestañas
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tabName = e.target.dataset.tab;
                this.switchTab(tabName);
            });
        });

        // Evento para cambiar tipo de nota
        document.getElementById('noteType').addEventListener('change', (e) => {
            const noteType = e.target.value;
            const fileInput = document.getElementById('noteFileInput');
            
            if (noteType === 'file') {
                fileInput.style.display = 'block';
            } else {
                fileInput.style.display = 'none';
            }
        });
    }

    switchTab(tabName) {
        // Remover clase active de todas las pestañas
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelectorAll('.tab-pane').forEach(pane => {
            pane.classList.remove('active');
        });

        // Activar la pestaña seleccionada
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
        document.getElementById(`${tabName}Tab`).classList.add('active');
    }

    getStatusText(status) {
        const statuses = {
            'pending': 'Pendiente',
            'in-progress': 'En progreso',
            'completed': 'Completada',
            'overdue': 'Vencida'
        };
        return statuses[status] || status;
    }
    
    // Funciones para el nuevo modal de notas
    async loadTaskNotesForNewModal(taskId) {
        try {
            const response = await fetch(buildApiUrl(CONFIG.API_ENDPOINTS.TASK_NOTES, `/${taskId}`));
            if (response.ok) {
                const notes = await response.json();
                this.renderTaskNotesForNewModal(notes);
            } else {
                console.error('Error al cargar notas:', response.statusText);
                this.renderTaskNotesForNewModal([]);
            }
        } catch (error) {
            console.error('Error al cargar notas:', error);
            this.renderTaskNotesForNewModal([]);
        }
    }
    
    renderTaskNotesForNewModal(notes) {
        const notesList = document.getElementById('notesList');
        
        if (notes.length === 0) {
            notesList.innerHTML = `
                <div class="empty-notes">
                    <i class="fas fa-sticky-note"></i>
                    <p>No hay notas para esta tarea</p>
                </div>
            `;
            return;
        }
        
        notesList.innerHTML = notes.map(note => `
            <div class="note-item" data-note-id="${note.id}">
                <div class="note-header">
                    <div class="note-meta">
                        <span class="note-author">${note.user_name}</span>
                        <span class="note-date">${this.formatDate(note.created_at)}</span>
                        <span class="note-type">${this.getNoteTypeText(note.note_type)}</span>
                    </div>
                    <div class="note-actions">
                        <button class="note-action" onclick="editNoteInNewModal(${note.id})" title="Editar">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="note-action" onclick="deleteNoteInNewModal(${note.id})" title="Eliminar">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
                <div class="note-content">
                    ${this.renderNoteContentForNewModal(note)}
                </div>
            </div>
        `).join('');
    }
    
    renderNoteContentForNewModal(note) {
        switch (note.note_type) {
            case 'link':
                return `<a href="${note.content}" target="_blank" style="color: #007bff; text-decoration: none;">${note.content}</a>`;
            case 'file':
                return `
                    <div>${note.content}</div>
                    <div style="
                        background: #e9ecef;
                        padding: 8px;
                        border-radius: 4px;
                        margin-top: 5px;
                        font-size: 12px;
                    ">
                        <div style="font-weight: bold;">${note.file_name}</div>
                        <div style="color: #666;">${this.formatFileSize(note.file_size)}</div>
                    </div>
                `;
            default:
                return `<div>${note.content}</div>`;
        }
    }
}

async function populateTaskAreaSelect() {
    let usuario_id = localStorage.getItem('astren_usuario_id');
    if (!usuario_id) {
        try {
            const user = JSON.parse(sessionStorage.getItem('astren_user'));
            usuario_id = user?.usuario_id;
        } catch (e) {}
    }
    if (!usuario_id) return;
    try {
        const url = buildApiUrl(CONFIG.API_ENDPOINTS.AREAS, `/${usuario_id}`);
        console.log('URL fetch:', url);
        const response = await fetch(url, { cache: 'no-store' });
        if (response.ok) {
            let areas = await response.json();
            // Filtrar solo áreas activas
            areas = areas.filter(area => area.estado === 'activa');
            const select = document.getElementById('taskArea');
            if (select) {
                select.innerHTML = '<option value="">Seleccionar área</option>' +
                    areas.map(area => `<option value="${area.id}">${area.nombre}</option>`).join('');
            }
        }
    } catch (e) {}
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    if (document.querySelector('.tasks-container') || document.querySelector('.tasks-grid')) {
        window.tasksManager = new TasksManager();
    }
    window.populateTaskAreaSelect = populateTaskAreaSelect;
    populateTaskAreaSelect();

    const confirmDeleteBtn = document.getElementById('confirmDeleteTask');
    if (confirmDeleteBtn && window.tasksManager) {
        confirmDeleteBtn.onclick = function() {
            // Usar el currentTaskId guardado en el TasksManager
            if (window.tasksManager.currentTaskId) {
                window.tasksManager.confirmDeleteTask(window.tasksManager.currentTaskId);
            } else {
                console.warn('No hay tarea seleccionada para eliminar');
            }
        };
    }
    const cancelDeleteBtn = document.getElementById('cancelDeleteTask');
    if (cancelDeleteBtn) {
        cancelDeleteBtn.onclick = function() {
            const modal = document.getElementById('deleteConfirmModal');
            if (modal) {
                modal.style.display = 'none';
                modal.classList.remove('active');
            }
        };
    }
    const closeDeleteBtn = document.getElementById('closeDeleteModal');
    if (closeDeleteBtn) {
        closeDeleteBtn.onclick = function() {
            const modal = document.getElementById('deleteConfirmModal');
            if (modal) {
                modal.style.display = 'none';
                modal.classList.remove('active');
            }
        };
    }
});

// Export for global access
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TasksManager;
}

// Funciones globales para el modal de vista detallada
function showAddNoteForm() {
    tasksManager.showAddNoteForm();
}

function hideAddNoteForm() {
    tasksManager.hideAddNoteForm();
}

function saveNote() {
    tasksManager.saveNote();
}

// Funciones para el nuevo modal
function showAddNoteForm() {
    const form = document.getElementById('addNoteForm');
    if (form) {
        form.style.display = 'block';
    }
}

function hideAddNoteForm() {
    const form = document.getElementById('addNoteForm');
    if (form) {
        form.style.display = 'none';
        // Limpiar campos
        document.getElementById('noteContent').value = '';
        document.getElementById('noteType').value = 'text';
        document.getElementById('noteFileInput').style.display = 'none';
    }
}

function switchTab(tabName) {
    // Por ahora solo tenemos la pestaña de notas
    console.log('Cambiando a pestaña:', tabName);
}

async function saveNote() {
    const noteType = document.getElementById('noteType').value;
    const noteContent = document.getElementById('noteContent').value;
    
    if (!noteContent.trim()) {
        alert('Por favor ingresa el contenido de la nota');
        return;
    }
    
    try {
        const formData = new FormData();
        formData.append('note_type', noteType);
        formData.append('content', noteContent);
        
        if (noteType === 'file') {
            const fileInput = document.getElementById('noteFile');
            if (fileInput.files.length > 0) {
                formData.append('file', fileInput.files[0]);
            }
        }
        
        const response = await fetch(buildApiUrl(CONFIG.API_ENDPOINTS.TASK_NOTES, `/${window.tasksManager.currentViewTaskId}`), {
            method: 'POST',
            body: formData
        });
        
        if (response.ok) {
            // Recargar notas
            window.tasksManager.loadTaskNotesForNewModal(window.tasksManager.currentViewTaskId);
            hideAddNoteForm();
            alert('Nota guardada correctamente');
        } else {
            alert('Error al guardar la nota');
        }
    } catch (error) {
        console.error('Error al guardar nota:', error);
        alert('Error al guardar la nota');
    }
}

async function editNoteInNewModal(noteId) {
    // Implementar edición de nota
    alert('Función de edición en desarrollo');
}

async function deleteNoteInNewModal(noteId) {
    if (confirm('¿Estás seguro de que quieres eliminar esta nota?')) {
        try {
            const response = await fetch(buildApiUrl(CONFIG.API_ENDPOINTS.TASK_NOTES, `/${noteId}`), {
                method: 'DELETE'
            });
            
            if (response.ok) {
                // Recargar notas
                window.tasksManager.loadTaskNotesForNewModal(window.tasksManager.currentViewTaskId);
                alert('Nota eliminada correctamente');
            } else {
                alert('Error al eliminar la nota');
            }
        } catch (error) {
            console.error('Error al eliminar nota:', error);
            alert('Error al eliminar la nota');
        }
    }
}

function toggleNoteFileInput() {
    const noteType = document.getElementById('noteType').value;
    const fileInput = document.getElementById('noteFileInput');
    
    if (noteType === 'file') {
        fileInput.style.display = 'block';
    } else {
        fileInput.style.display = 'none';
    }
}

// Inicializar eventos del modal de vista detallada
document.addEventListener('DOMContentLoaded', function() {
    if (typeof tasksManager !== 'undefined') {
        tasksManager.setupTaskViewEvents();
    }
});