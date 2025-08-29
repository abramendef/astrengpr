/*===== DASHBOARD FUNCTIONALITY =====*/

// DOM Elements - Check if elements exist before using them
const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const sidebar = document.getElementById('sidebar');
const sidebarClose = document.getElementById('sidebar-close') || document.getElementById('sidebarToggle');
const overlay = document.getElementById('mobileOverlay');
const searchInput = document.querySelector('.header__search .search__input');

// Navegación inteligente del dashboard
function setupDashboardNavigation() {
    // Contadores de estadísticas
    const statToday = document.getElementById('statToday');
    const statPending = document.getElementById('statPending');
    const statCompleted = document.getElementById('statCompleted');
    const statOverdue = document.getElementById('statOverdue');
    
    if (statToday) {
        // statToday.closest('.stat-item').style.cursor = 'pointer';
        statToday.closest('.stat-item').addEventListener('click', () => {
            window.location.href = 'tasks.html#today';
        });
    }
    
    if (statPending) {
        // statPending.closest('.stat-item').style.cursor = 'pointer';
        statPending.closest('.stat-item').addEventListener('click', () => {
            window.location.href = 'tasks.html#pending';
        });
    }
    
    if (statCompleted) {
        // statCompleted.closest('.stat-item').style.cursor = 'pointer';
        statCompleted.closest('.stat-item').addEventListener('click', () => {
            window.location.href = 'tasks.html#completed';
        });
    }
    
    if (statOverdue) {
        // statOverdue.closest('.stat-item').style.cursor = 'pointer';
        statOverdue.closest('.stat-item').addEventListener('click', () => {
            window.location.href = 'tasks.html#overdue';
        });
    }
    
    // Progreso de reputación
    const reputationCard = document.querySelector('.dashboard-card:nth-child(2)');
    if (reputationCard) {
        reputationCard.style.cursor = 'pointer';
        reputationCard.addEventListener('click', () => {
            window.location.href = 'reputation.html';
        });
    }
}

/*===== MOBILE MENU FUNCTIONALITY =====*/
function openMobileMenu() {
    if (sidebar) {
        sidebar.classList.add('sidebar--mobile-open');
    }
    if (overlay) {
        overlay.classList.add('sidebar-overlay--active');
    }
    document.body.style.overflow = 'hidden';
}

function closeMobileMenu() {
    if (sidebar) {
        sidebar.classList.remove('sidebar--mobile-open');
    }
    if (overlay) {
        overlay.classList.remove('sidebar-overlay--active');
    }
    document.body.style.overflow = '';
}

// Event listeners
if (mobileMenuBtn) {
    mobileMenuBtn.addEventListener('click', openMobileMenu);
}

if (sidebarClose) {
    sidebarClose.addEventListener('click', closeMobileMenu);
}

if (overlay) {
    overlay.addEventListener('click', closeMobileMenu);
}

/*===== SEARCH FUNCTIONALITY =====*/
document.addEventListener('DOMContentLoaded', function() {
    // Selector ultra-específico para el input del buscador del header del dashboard
    const searchInput = document.querySelector('.dashboard__header .header__search input[type="text"]');
    if (searchInput) {
        searchInput.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                e.stopPropagation();
            }
        });
    } else {
        console.log('❌ No se encontró el input del buscador del dashboard');
    }
});

/*===== TASK INTERACTIONS =====*/
document.addEventListener('DOMContentLoaded', function() {
    // Handle task checkboxes
    const taskCheckboxes = document.querySelectorAll('.task__checkbox input[type="checkbox"]');
    
    if (taskCheckboxes.length > 0) {
        taskCheckboxes.forEach(checkbox => {
            checkbox.addEventListener('change', function() {
                const taskItem = this.closest('.task-item');
                const priorityElement = taskItem.querySelector('.task__priority');
                
                if (this.checked) {
                    taskItem.classList.add('task-item--completed');
                    if (priorityElement) {
                        priorityElement.textContent = '✓';
                        priorityElement.className = 'task__priority task__priority--completed';
                    }
                } else {
                    taskItem.classList.remove('task-item--completed');
                    if (priorityElement) {
                        priorityElement.textContent = 'Media';
                        priorityElement.className = 'task__priority task__priority--medium';
                    }
                }
            });
        });
    }

    // Initialize user data if available
    const userData = sessionStorage.getItem('astren_user');
    if (userData) {
        try {
            const user = JSON.parse(userData);
            const userNameElement = document.getElementById('userName');
            const userTypeElement = document.getElementById('userType');
            
            if (userNameElement && user.nombre) {
                userNameElement.textContent = `${user.nombre} ${user.apellido || ''}`.trim();
            }
            if (userTypeElement && user.userType) {
                userTypeElement.textContent = user.userType.charAt(0).toUpperCase() + user.userType.slice(1);
            }
        } catch (e) {
            console.log('Error parsing user data:', e);
        }
    }

    // Handle logout
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            sessionStorage.clear();
            localStorage.removeItem('astren_rememberMe');
            localStorage.removeItem('astren_email');
            localStorage.removeItem('astren_usuario_id');
            localStorage.removeItem('astren_nombre');
            localStorage.removeItem('astren_apellido');
            localStorage.removeItem('astren_correo');
            window.location.href = 'login.html';
        });
    }

    // Animate stats on load
    const statValues = document.querySelectorAll('.stat-card__value');
    if (statValues.length > 0) {
        statValues.forEach(stat => {
            const finalValue = parseInt(stat.textContent);
            let currentValue = 0;
            const increment = finalValue / 30;
            
            const timer = setInterval(() => {
                currentValue += increment;
                if (currentValue >= finalValue) {
                    stat.textContent = finalValue;
                    clearInterval(timer);
                } else {
                    stat.textContent = Math.floor(currentValue);
                }
            }, 50);
        });
    }

    // Initialize reputation charts
    initReputationCharts();
    
    // Initialize notification button
    initNotificationButton();
    
    // Initialize profile button
    initProfileButton();
    
    // Initialize quick add task button
    initQuickAddTaskButton();
    
    // Initialize evidence buttons
    initEvidenceButtons();
    
    // Sincronizar tareas al cargar el dashboard
    syncTasksOnLoad();
    
    console.log('📊 Dashboard de Astren cargado correctamente');

    populateAreaSelects();
    // Inicializar Flatpickr en el campo de fecha del modal
    if (typeof flatpickr !== 'undefined') {
        flatpickr("#taskDueDate", {
            enableTime: true,
            dateFormat: "Y-m-d H:i",
            locale: "es"
        });
    }
});

/*===== REPUTATION CHARTS =====*/
function initReputationCharts() {
    // Initialize reputation evolution chart
    initReputationEvolutionChart();
}

function initReputationEvolutionChart() {
    const canvas = document.getElementById('reputationChart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
            datasets: [{
                label: 'Reputación',
                data: [3.8, 4.0, 4.2, 4.3, 4.4, 4.5],
                borderColor: '#3366FF',
                backgroundColor: 'rgba(51, 102, 255, 0.1)',
                borderWidth: 2,
                fill: true,
                tension: 0.4,
                pointBackgroundColor: '#3366FF',
                pointBorderColor: '#FFFFFF',
                pointBorderWidth: 2,
                pointRadius: 4,
                pointHoverRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            layout: {
                padding: {
                    top: 5,
                    bottom: 5,
                    left: 5,
                    right: 5
                }
            },
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                x: {
                    grid: {
                        color: 'rgba(0, 0, 0, 0.1)'
                    },
                    ticks: {
                        color: '#64748B',
                        maxRotation: 0,
                        autoSkip: true,
                        maxTicksLimit: 6,
                        font: {
                            size: 10
                        }
                    }
                },
                y: {
                    beginAtZero: false,
                    min: 0,
                    max: 5,
                    ticks: {
                        stepSize: 1,
                        color: '#64748B',
                        maxTicksLimit: 6,
                        font: {
                            size: 10
                        }
                    },
                    grid: {
                        color: 'rgba(0, 0, 0, 0.1)'
                    }
                }
            }
        }
    });
}

/*===== NOTIFICATION SYSTEM =====*/
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification--${type}`;
    notification.innerHTML = `
        <div class="notification__content">
            <i class="fas fa-${getNotificationIcon(type)}"></i>
            <span>${message}</span>
        </div>
        <button class="notification__close">
            <i class="fas fa-times"></i>
        </button>
    `;

    // Add to page
    document.body.appendChild(notification);

    // Animate in
    setTimeout(() => {
        notification.classList.add('notification--show');
    }, 100);

    // Auto remove after 5 seconds
    setTimeout(() => {
        removeNotification(notification);
    }, 5000);

    // Close button
    const closeBtn = notification.querySelector('.notification__close');
    closeBtn.addEventListener('click', () => removeNotification(notification));
}

function removeNotification(notification) {
    notification.classList.remove('notification--show');
    setTimeout(() => {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
    }, 300);
}

function getNotificationIcon(type) {
    switch (type) {
        case 'success': return 'check-circle';
        case 'error': return 'exclamation-circle';
        case 'warning': return 'exclamation-triangle';
        default: return 'info-circle';
    }
}

/*===== ANALYTICS TRACKING =====*/
function trackEvent(category, action, label) {
    console.log(`Track: ${category} - ${action} - ${label}`);
    // In a real app, this would send to analytics service
}

/*===== AREA PROGRESS ANIMATION =====*/
function animateProgressBars() {
    const progressBars = document.querySelectorAll('.progress__fill');
    
    if (progressBars.length > 0) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const progressBar = entry.target;
                    const width = progressBar.style.width;
                    
                    // Reset and animate
                    progressBar.style.width = '0%';
                    progressBar.style.transition = 'width 1s ease-out';
                    
                    setTimeout(() => {
                        progressBar.style.width = width;
                    }, 100);
                    
                    observer.unobserve(progressBar);
                }
            });
        }, {
            threshold: 0.1
        });
        
        progressBars.forEach(bar => {
            observer.observe(bar);
        });
    }
}

/*===== RESPONSIVE HANDLER =====*/
function handleResize() {
    if (window.innerWidth > 768) {
        closeMobileMenu();
    }
}

window.addEventListener('resize', handleResize);

/*===== UI ENHANCEMENTS =====*/
function initializeUIEnhancements() {
    // Add hover effects to cards
    const cards = document.querySelectorAll('.dashboard-card, .stat-card');
    
    if (cards.length > 0) {
        cards.forEach(card => {
            card.addEventListener('mouseenter', function() {
                this.style.transform = 'translateY(-2px)';
            });
            
            card.addEventListener('mouseleave', function() {
                this.style.transform = 'translateY(0)';
            });
        });
    }
    
    // Add focus indicators for accessibility
    const interactiveElements = document.querySelectorAll('button, .nav__link, input');
    
    if (interactiveElements.length > 0) {
        interactiveElements.forEach(element => {
            element.addEventListener('focus', function() {
                this.style.outline = '2px solid hsl(220, 100%, 60%)';
                this.style.outlineOffset = '2px';
            });
            
            element.addEventListener('blur', function() {
                this.style.outline = '';
                this.style.outlineOffset = '';
            });
        });
    }
}

/*===== KEYBOARD SHORTCUTS =====*/
document.addEventListener('keydown', function(e) {
    // Ctrl/Cmd + K for search
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        if (searchInput) {
            searchInput.focus();
        }
    }
    
    // Ctrl/Cmd + N for new task
    if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault();
        showNotification('Atajo para nueva tarea activado', 'info');
    }
});

/*===== ERROR HANDLING =====*/
window.addEventListener('error', function(e) {
    console.error('Dashboard error:', e.error);
    
    // Solo mostrar notificación para errores críticos del dashboard
    // y solo si estamos en una página que realmente es el dashboard
    const isDashboardPage = window.location.pathname.includes('dashboard.html') || 
                           document.querySelector('.dashboard__content') !== null;
    
    // Solo mostrar notificación para errores específicos del dashboard
    const isDashboardError = e.error && (
        e.error.message.includes('dashboard') ||
        e.error.message.includes('chart') ||
        e.error.message.includes('stat') ||
        e.filename && e.filename.includes('dashboard.js')
    );
    
    if (isDashboardPage && isDashboardError) {
        showNotification('Ha ocurrido un error en el dashboard', 'error');
    }
});

/*===== PERFORMANCE MONITORING =====*/
window.addEventListener('load', function() {
    const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
    console.log(`Dashboard loaded in ${loadTime}ms`);
    
    // Track performance metrics
    if (typeof trackEvent === 'function') {
        trackEvent('Performance', 'dashboard_load_time', loadTime);
    }
});

/*===== NOTIFICATION BUTTON =====*/
function initNotificationButton() {
    const notificationBtn = document.querySelector('.header__notification');
    if (notificationBtn) {
        notificationBtn.addEventListener('click', function() {
            window.location.href = 'notifications.html';
        });
    }
}

/*===== PROFILE BUTTON =====*/
function initProfileButton() {
    const profileBtn = document.querySelector('.header__profile');
    if (profileBtn) {
        profileBtn.addEventListener('click', function() {
            window.location.href = 'profile.html';
        });
    }
}

/*===== QUICK ADD TASK BUTTON =====*/
function initQuickAddTaskButton() {
    const quickAddBtn = document.getElementById('quickAddTaskBtn');
    const newTaskModal = document.getElementById('newTaskModal');
    const closeModal = document.getElementById('closeModal');
    const cancelTask = document.getElementById('cancelTask');
    const newTaskForm = document.getElementById('newTaskForm');
    
    if (quickAddBtn) {
        quickAddBtn.addEventListener('click', function() {
            newTaskModal.style.display = 'flex';
            newTaskModal.classList.add('active');
            if (typeof populateTaskAreaSelect === 'function') {
                populateTaskAreaSelect();
            }
        });
    }

    if (closeModal) {
        closeModal.addEventListener('click', function() {
            newTaskModal.style.display = 'none';
            newTaskModal.classList.remove('active');
        });
    }

    if (cancelTask) {
        cancelTask.addEventListener('click', function() {
            newTaskModal.style.display = 'none';
            newTaskModal.classList.remove('active');
        });
    }

    // Close modal on overlay click
    if (newTaskModal) {
        newTaskModal.addEventListener('click', (e) => {
            if (e.target === newTaskModal) {
                closeModalFunction();
            }
        });
    }

    // Close modal on escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && newTaskModal && newTaskModal.classList.contains('active')) {
            closeModalFunction();
        }
    });

    // Form submission
    if (newTaskForm) {
        newTaskForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const usuario_id = (typeof getAstrenUserId === 'function' && getAstrenUserId()) || (typeof getUserId === 'function' && getUserId());
            if (!usuario_id) {
                showNotification('No hay usuario autenticado. Inicia sesión.', 'error');
                return;
            }
            const titulo = document.getElementById('taskTitle').value;
            const descripcion = document.getElementById('taskDescription').value;
            const area_id = document.getElementById('taskArea').value || null;
            // Normalizar a ISO UTC para el backend
            const dueInput = document.getElementById('taskDueDate').value;
            const fecha_vencimiento = new Date(dueInput.replace(' ', 'T')).toISOString();
            const data = {
                usuario_id: usuario_id,
                titulo: titulo,
                descripcion: descripcion,
                area_id: area_id,
                fecha_vencimiento: fecha_vencimiento
            };
            fetch(buildApiUrl(CONFIG.API_ENDPOINTS.TASKS), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            })
            .then(res => res.json())
            .then(res => {
                // Cerrar modal, limpiar formulario, actualizar dashboard
                newTaskModal.style.display = 'none';
                newTaskModal.classList.remove('active');
                newTaskForm.reset();
                updateDashboardTaskCounts();
                renderDashboardTodayTasks();
            })
            .catch(() => {
                alert('Error al crear la tarea.');
            });
        });
    }
}

function openModal() {
    const newTaskModal = document.getElementById('newTaskModal');
    if (newTaskModal) {
        newTaskModal.classList.add('active');
        document.body.style.overflow = 'hidden';
        if (typeof populateTaskAreaSelect === 'function') {
            populateTaskAreaSelect();
        }
        // Inicializar Flatpickr cuando se abre el modal
        setTimeout(() => {
            if (window.taskDueDatePicker && window.taskDueDatePicker.destroy) {
                window.taskDueDatePicker.destroy();
            }
            window.taskDueDatePicker = flatpickr('#taskDueDate', {
                enableTime: true,
                time_24hr: true,
                dateFormat: 'Y-m-d H:i',
                locale: 'es',
                minDate: 'today',
                placeholder: 'Seleccionar fecha y hora'
            });
        }, 100);
    }
}

function closeModalFunction() {
    const newTaskModal = document.getElementById('newTaskModal');
    const newTaskForm = document.getElementById('newTaskForm');
    
    if (newTaskModal) {
        newTaskModal.classList.remove('active');
    }
    
    document.body.style.overflow = '';
    
    if (newTaskForm) {
        newTaskForm.reset();
    }
}

// --- Agregar función robusta esFechaHoy al inicio del archivo ---
function esFechaHoy(fechaStr) {
    if (!fechaStr) return false;
    let fechaIso = fechaStr.trim();
    if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/.test(fechaIso)) {
        fechaIso = fechaIso.replace(' ', 'T') + ':00';
    }
    if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(fechaIso)) {
        fechaIso += ':00';
    }
    const fecha = new Date(fechaIso);
    console.log('DASHBOARD esFechaHoy:', fechaStr, '->', fecha, 'Hoy:', new Date());
    if (isNaN(fecha.getTime())) return false;
    const hoy = new Date();
    return (
        fecha.getFullYear() === hoy.getFullYear() &&
        fecha.getMonth() === hoy.getMonth() &&
        fecha.getDate() === hoy.getDate()
    );
}

// --- Función para obtener tareas del backend y normalizarlas ---
let _dashboardTasksPromise = null;
function fetchDashboardTasks() {
    if (_dashboardTasksPromise) {
        return _dashboardTasksPromise;
    }
    const usuario_id = (typeof getAstrenUserId === 'function' && getAstrenUserId()) || (typeof getUserId === 'function' && getUserId());
    if (!usuario_id) {
        console.warn('❌ No hay usuario autenticado; devolviendo lista de tareas vacía');
        return Promise.resolve([]);
    }
    _dashboardTasksPromise = fetch(buildApiUrl(CONFIG.API_ENDPOINTS.TASKS, `/${usuario_id}`), { cache: 'no-store' })
        .then(response => {
            if (!response.ok) throw new Error('Error al cargar tareas del dashboard');
            return response.json();
        })
        .then(tareas => {
            const mapped = tareas.map(t => ({
                ...t,
                status: t.estado === 'pendiente' ? 'pending' :
                        t.estado === 'completada' ? 'completed' :
                        t.estado === 'vencida' ? 'overdue' : t.estado,
                title: t.titulo || t.title,
                dueDate: t.fecha_vencimiento || t.dueDate
            }));
            try { localStorage.setItem('astren_tasks', JSON.stringify(mapped)); } catch (_) {}
            return mapped;
        })
        .catch((e) => {
            console.error('❌ Error en fetchDashboardTasks:', e);
            return [];
        })
        .finally(() => {
            // Liberar para permitir una nueva carga en el futuro
            _dashboardTasksPromise = null;
        });
    return _dashboardTasksPromise;
}

// --- updateDashboardTaskCounts usando backend ---
function updateDashboardTaskCounts() {
    const usuario_id = (typeof getAstrenUserId === 'function' && getAstrenUserId()) || (typeof getUserId === 'function' && getUserId());
    if (!usuario_id) {
        ['statToday', 'statCompleted', 'statPending', 'statOverdue', 'todayTasksCounter'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.textContent = '0';
        });
        return;
    }
    fetchDashboardTasks().then(tasks => {
        const tasksDueToday = tasks.filter(task => 
            task.status === 'pending' && esFechaHoy(task.dueDate)
        ).length;
        const completedTasks = tasks.filter(task => task.status === 'completed').length;
        const pendingTasks = tasks.filter(task => task.status === 'pending').length;
        const overdueTasks = tasks.filter(task => task.status === 'overdue').length;

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
        updateStatWithAnimation('statToday', tasksDueToday);
        updateStatWithAnimation('statCompleted', completedTasks);
        updateStatWithAnimation('statPending', pendingTasks);
        updateStatWithAnimation('statOverdue', overdueTasks);
        
        // También animar el contador de tareas de hoy si existe
        if (document.getElementById('todayTasksCounter')) {
            updateStatWithAnimation('todayTasksCounter', tasksDueToday);
        }
    });
}

// --- renderDashboardTodayTasks usando backend ---
function renderDashboardTodayTasks() {
    console.log('🔄 [DEBUG] Renderizando tareas de hoy...');
    
    const dashboardTodayTasks = document.getElementById('dashboardTodayTasks');
    if (dashboardTodayTasks) {
        fetchDashboardTasks().then(tasks => {
            console.log('📋 [DEBUG] Total de tareas cargadas:', tasks.length);
            
        let tasksToday = tasks.filter(task => {
                const isPending = task.status === 'pending';
                const isToday = esFechaHoy(task.dueDate);
                console.log(`📋 [DEBUG] Tarea "${task.title}": status=${task.status}, isToday=${isToday}, mostrar=${isPending && isToday}`);
                return isPending && isToday;
            });
            
            console.log('📋 [DEBUG] Tareas filtradas para hoy (pendientes):', tasksToday.length);
            
        tasksToday = tasksToday.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
            
            // Limpiar justo antes de pintar para evitar parpadeo
            dashboardTodayTasks.innerHTML = '';
            if (tasksToday.length === 0) {
                console.log('📋 [DEBUG] No hay tareas pendientes para hoy, mostrando mensaje vacío');
            dashboardTodayTasks.innerHTML = `
                <div class="empty-tasks-message">
                    <div class="empty-tasks-icon">
                        <i class="fas fa-calendar-check"></i>
                    </div>
                    <h3 class="empty-tasks-title">¡Excelente día!</h3>
                    <p class="empty-tasks-description">No tienes tareas pendientes para hoy. ¡Mantén el buen trabajo!</p>
                </div>
            `;
            } else {
                console.log('📋 [DEBUG] Renderizando', tasksToday.length, 'tareas pendientes');
            tasksToday.forEach(task => {
                const taskElement = createTaskCard(task);
                dashboardTodayTasks.appendChild(taskElement);
            });
        }
            
            // Detectar si necesita scrollbar después de renderizar
            setTimeout(() => {
                detectScrollbarNeeded();
            }, 100);
        });
    }
}

// Función para detectar si necesita scrollbar
function detectScrollbarNeeded() {
    const scrollContainer = document.querySelector('.dashboard-task-list-scroll');
    if (!scrollContainer) {
        console.log('❌ No se encontró el contenedor de scroll');
        return;
    }
    
    // Esperar a que el contenido se renderice completamente
    setTimeout(() => {
        const scrollHeight = scrollContainer.scrollHeight;
        const clientHeight = scrollContainer.clientHeight;
        const hasScroll = scrollHeight > clientHeight;
        
        console.log('📋 Debug scrollbar:', {
            scrollHeight,
            clientHeight,
            hasScroll,
            difference: scrollHeight - clientHeight
        });
        
        if (hasScroll) {
            scrollContainer.classList.add('has-scroll');
            console.log('📋 Scrollbar activado - hay más de 3 tareas');
        } else {
            scrollContainer.classList.remove('has-scroll');
            console.log('📋 Sin scrollbar - 3 tareas o menos');
        }
    }, 200);
}

function deleteDashboardTask(taskId) {
            fetch(buildApiUrl(CONFIG.API_ENDPOINTS.TASKS, `/${taskId}`), {
        method: 'DELETE'
    })
    .then(res => res.json())
    .then(res => {
        showNotification('Tarea eliminada exitosamente', 'info');
        updateDashboardTaskCounts();
        renderDashboardTodayTasks();
    })
    .catch(() => {
        showNotification('Error al eliminar la tarea', 'error');
    });
}

function createTaskCard(task) {
    // Determina el color del borde según el estado
    let borderColor = 'hsl(55, 95%, 75%)'; // pendiente (amarillo igual que en tasks)
    if (task.status === 'completed') borderColor = '#4ade80'; // verde
    if (task.status === 'overdue') borderColor = '#f87171'; // rojo

    const areaText = { personal: 'Personal', work: 'Trabajo', school: 'Escuela' };
    const areaIcon = { personal: 'fas fa-user', work: 'fas fa-briefcase', school: 'fas fa-graduation-cap' };
    let groupTag = '';
    if (task.group) {
        groupTag = `<span class=\"task-group\" style=\"display: flex; align-items: center; gap: 0.35rem; font-size: 0.95rem; color: #666;\"><i class='fas fa-users' style=\"font-size: 1rem;\"></i> ${task.group}</span>`;
    }
    const uploadEvidenceBtn = `<button class=\"task-action\" title=\"Subir evidencia\" onclick=\"triggerEvidenceUpload(${task.id})\"><i class=\"fas fa-camera\"></i></button><input type=\"file\" id=\"evidence-input-${task.id}\" style=\"display:none\" accept=\"image/*,application/pdf\" onchange=\"handleEvidenceUpload(event, ${task.id})\">`;

    // Solo mostrar el área si existe
    let areaSpan = '';
    if (task.area_nombre) {
        const colorMap = {
            'blue': '#3b82f6', 'green': '#10b981', 'purple': '#8b5cf6',
            'orange': '#f59e0b', 'red': '#ef4444', 'pink': '#ffb6c1', 
            'yellow': '#ffe066', 'mint': '#98ff98', 'sky': '#87ceeb',
            'coral': '#ff7f50', 'lavender': '#e6e6fa'
        };
        const areaColor = colorMap[task.area_color] || '#666';
        areaSpan = `<span class="task-area-badge" style="display: inline-flex; align-items: center; gap: 0.35rem; font-size: 0.95rem; border-radius: 1rem; padding: 0.13rem 0.7rem; font-weight: 500; background: none;">
            <i class="fas ${task.area_icono || 'fa-layer-group'}" style="font-size: 1rem; color: ${areaColor};"></i> ${task.area_nombre}
        </span>`;
    }

    const taskCard = document.createElement('div');
    taskCard.className = 'dashboard-task-card-content';
    taskCard.style.display = 'flex';
    taskCard.style.alignItems = 'center';
    taskCard.style.gap = '0.7rem';
    taskCard.style.width = '100%';
    taskCard.style.padding = '0.7rem 0.8rem';
    taskCard.style.border = `1px solid ${borderColor}`;
    taskCard.style.borderLeft = `5px solid ${borderColor}`;
    taskCard.style.cursor = 'pointer';
    taskCard.style.transition = 'all 0.2s ease';
    
    // Hacer la tarjeta clickeable para navegar a la tarea específica
    taskCard.addEventListener('click', (e) => {
        // No navegar si se hace click en botones o checkbox
        if (e.target.closest('button') || e.target.closest('input[type="checkbox"]') || e.target.closest('input[type="file"]')) {
            return;
        }
        window.location.href = `tasks.html?task=${task.id}`;
    });
    
    // Efecto hover para indicar que es clickeable
    taskCard.addEventListener('mouseenter', () => {
        taskCard.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
    });
    
    taskCard.addEventListener('mouseleave', () => {
        taskCard.style.boxShadow = 'none';
    });
    taskCard.innerHTML = `
        <div class=\"task-checkbox\" style=\"flex-shrink: 0;\">\n` +
            `<input type=\"checkbox\" id=\"task-${task.id}\">\n` +
            `<label for=\"task-${task.id}\"></label>\n` +
        `</div>\n` +
        `<div class=\"dashboard-task-content\" style=\"flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 0.18rem;\">\n` +
            `<div style=\"display: flex; align-items: center; gap: 0.5rem;\">\n` +
                `<h3 class=\"dashboard-task-title\" style=\"font-size: 0.98rem; font-weight: 700; margin: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; letter-spacing: 0.01em;\">${task.title}</h3>\n` +
                `<span class=\"task-status task-status--${task.status}\" style=\"font-size: 0.82rem; padding: 0.08rem 0.7rem; border-radius: 1rem; background: #fffbe6; color: #bfa100; font-weight: 500;\">\n` +
                    `<i class=\"fas fa-clock\" style=\"font-size: 0.9rem;\"></i> ${task.status === 'pending' ? 'Pendiente' : task.status === 'completed' ? 'Completada' : 'Vencida'}\n` +
                `</span>\n` +
            `</div>\n` +
            `<div class=\"dashboard-task-meta-row\" style=\"display: flex; align-items: center; gap: 0.7rem; flex-wrap: wrap;\">\n` +
                areaSpan +
                groupTag +
                `<span class=\"task-due task-due--normal\" style=\"display: flex; align-items: center; gap: 0.25rem; font-size: 0.92rem; color: #666;\">\n` +
                    `<i class=\"fas fa-calendar\" style=\"font-size: 0.95rem;\"></i> Vence a las ${parseLocalDateTime(task.dueDate).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}\n` +
                `</span>\n` +
            `</div>\n` +
        `</div>\n` +
        `<div class=\"dashboard-task-actions\" style=\"display: flex; align-items: center; gap: 0.6rem; margin-left: auto;\">\n` +
            `<button class=\"task-action\" title=\"Editar\" onclick=\"editTask(${task.id})\"><i class=\"fas fa-edit\" style=\"font-size: 1rem;\"></i></button>\n` +
            uploadEvidenceBtn +
            `<button class=\"task-action task-action--danger\" title=\"Eliminar\" onclick=\"deleteDashboardTask(${task.id})\"><i class=\"fas fa-trash\" style=\"font-size: 1rem;\"></i></button>\n` +
        `</div>\n`;

    // Add event listener for checkbox
    const checkbox = taskCard.querySelector('input[type="checkbox"]');
    checkbox.addEventListener('change', (e) => {
        if (e.target.checked) {
            // Verificar si requiere evidencia antes de marcar como completada
            const requiresEvidence = task.area === 'work' || task.area === 'school';

            if (requiresEvidence && !task.evidence) {
                // Desmarcar el checkbox y mostrar notificación
                e.target.checked = false;
                showNotification('Esta tarea requiere evidencia antes de completarse', 'warning');
                return;
            }

            // Si no requiere evidencia o ya tiene evidencia, proceder normalmente
            taskCard.classList.add('task-completing');
            setTimeout(() => {
                toggleTaskCompletion(task.id, true);
            }, 500);
        } else {
            toggleTaskCompletion(task.id, false);
        }
    });

    return taskCard;
}

// Añadir función para parsear fecha local
function parseLocalDateTime(dateTimeStr) {
    // Espera formato 'YYYY-MM-DD HH:mm'
    if (!dateTimeStr) return null;
    const [datePart, timePart] = dateTimeStr.split(' ');
    if (!datePart || !timePart) return new Date(dateTimeStr); // fallback
    const [year, month, day] = datePart.split('-').map(Number);
    const [hour, minute] = timePart.split(':').map(Number);
    // Mes en JS es 0-indexado
    return new Date(year, month - 1, day, hour, minute);
}

function getDueTimeText(task) {
    // Usar parseLocalDateTime en vez de new Date
    const dueDate = parseLocalDateTime(task.dueDate);
    const now = new Date();
    const dueDay = new Date(dueDate.getFullYear(), dueDate.getMonth(), dueDate.getDate());
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    if (task.status === 'pending' && dueDay.getTime() === today.getTime()) {
        return `Vence hoy a las ${dueDate.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}`;
    }
    if (task.status === 'pending' && dueDay.getTime() === tomorrow.getTime()) {
        return `Vence mañana a las ${dueDate.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}`;
    }
    if (task.status === 'completed' && task.completedAt) {
        const completedDate = parseLocalDateTime(task.completedAt);
        return `Completada el ${completedDate.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })} a las ${completedDate.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}`;
    }
    if (task.status === 'overdue') {
        return `Vencida el ${dueDate.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })} a las ${dueDate.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}`;
    }
    const daysDiff = (dueDay - today) / (1000 * 60 * 60 * 24);
    if (task.status === 'pending' && daysDiff > 1 && daysDiff < 7) {
        return `Vence el ${dueDate.toLocaleDateString('es-ES', { weekday: 'long' })} a las ${dueDate.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}`;
    }
    return `Vence el ${dueDate.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })} a las ${dueDate.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}`;
}

window.addEventListener('storage', function(event) {
  if (event.key === 'astren_tasks') {
    console.log('🔄 Cambios detectados en localStorage, sincronizando dashboard...');
    
    // Sincronizar todo el dashboard
    syncTasksOnLoad();
  }
});

// También sincronizar cuando la página vuelve a estar visible
document.addEventListener('visibilitychange', function() {
  if (!document.hidden) {
    console.log('🔄 Página visible, sincronizando tareas...');
    syncTasksOnLoad();
  }
});

// --- Función para marcar tareas como completadas (igual que en tasks.js) ---
function toggleTaskCompletion(taskId, completed) {
    console.log('🔄 [DEBUG] Cambiando estado de tarea:', taskId, 'completed:', completed);
    
    const tasks = JSON.parse(localStorage.getItem('astren_tasks')) || [];
    const task = tasks.find(t => t.id === taskId);
    if (!task) {
        console.error('❌ [ERROR] Tarea no encontrada:', taskId);
        return;
    }
    
    console.log('📝 [DEBUG] Estado anterior de la tarea:', task.status);
    
    if (completed) {
        // Check if task requires evidence
        const requiresEvidence = task.area === 'work' || task.area === 'school';
        
        if (requiresEvidence && !task.evidence) {
            showNotification('Esta tarea requiere evidencia antes de completarse', 'warning');
            console.log('⚠️ [DEBUG] Tarea requiere evidencia, no se completa');
            return;
        }
        
        task.status = 'completed';
        task.completedAt = new Date().toISOString();
        
        // Calculate reputation impact based on completion time
        const dueDate = new Date(task.dueDate);
        const completedDate = new Date(task.completedAt);
        const daysEarly = Math.ceil((dueDate - completedDate) / (1000 * 60 * 60 * 24));
        
        if (daysEarly > 0) {
            task.reputationImpact = Math.min(20, daysEarly * 2); // Bonus for early completion
        } else if (daysEarly === 0) {
            task.reputationImpact = 5; // On-time completion
        } else {
            task.reputationImpact = Math.max(-20, daysEarly * 2); // Penalty for late completion
        }
        
        console.log('✅ [DEBUG] Tarea marcada como completada:', task);
        showNotification('¡Tarea completada! +' + task.reputationImpact + ' puntos de reputación', 'success');
    } else {
        task.status = 'pending';
        task.completedAt = null;
        task.evidence = null;
        task.evidenceValidated = false;
        task.reputationImpact = 0;
        console.log('⏳ [DEBUG] Tarea marcada como pendiente:', task);
        showNotification('Tarea marcada como pendiente', 'info');
    }
    
    // Guardar cambios en localStorage
    localStorage.setItem('astren_tasks', JSON.stringify(tasks));
    console.log('💾 [DEBUG] Cambios guardados en localStorage');
    
    // Recargar las tareas del dashboard usando la función centralizada
    renderDashboardTodayTasks();
    
    // Actualizar contadores usando la función centralizada
    updateDashboardTaskCounts();
    
    console.log('🔄 [DEBUG] Dashboard actualizado');
}

// --- Funciones para manejar evidencia ---
function triggerEvidenceUpload(taskId) {
    const input = document.getElementById(`evidence-input-${taskId}`);
    if (input) {
        input.click();
    }
}

function handleEvidenceUpload(event, taskId) {
    const file = event.target.files[0];
    if (!file) return;
    
    const tasks = JSON.parse(localStorage.getItem('astren_tasks')) || [];
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    
    // Simular subida de evidencia
    task.evidence = file.name;
    task.evidenceValidated = false;
    
    // Guardar cambios
    localStorage.setItem('astren_tasks', JSON.stringify(tasks));
    
    showNotification('Evidencia subida. Pendiente de validación.', 'success');
    
    // Recargar la tarjeta
    const dashboardTodayTasks = document.getElementById('dashboardTodayTasks');
    if (dashboardTodayTasks) {
        dashboardTodayTasks.innerHTML = '';
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tasksToday = tasks.filter(task => {
            if (task.status !== 'pending') return false;
            const dueDate = new Date(task.dueDate);
            dueDate.setHours(0, 0, 0, 0);
            return dueDate.getTime() === today.getTime();
        });
        tasksToday.forEach(task => {
            const card = createTaskCard(task);
            dashboardTodayTasks.appendChild(card);
        });
    }
}

function viewEvidence(taskId) {
    const tasks = JSON.parse(localStorage.getItem('astren_tasks')) || [];
    const task = tasks.find(t => t.id === taskId);
    if (!task || !task.evidence) return;
    
    showNotification(`Evidencia: ${task.evidence}`, 'info');
}

function editTask(taskId) {
    console.log('📝 [DEBUG] Editando tarea:', taskId);
    console.log('📝 [DEBUG] Función editTask llamada desde:', new Error().stack);
    
    // Buscar la tarea en el localStorage
    const tasks = JSON.parse(localStorage.getItem('astren_tasks')) || [];
    const task = tasks.find(t => t.id === taskId);
    
    if (!task) {
        console.error('❌ [ERROR] Tarea no encontrada con ID:', taskId);
        showNotification('Tarea no encontrada', 'error');
        return;
    }
    
    console.log('📝 [DEBUG] Tarea encontrada:', task);
    
    // Mostrar modal de edición
    showEditTaskModal(task);
}

// Hacer la función global para que sea accesible desde onclick
window.editTask = editTask;

function showEditTaskModal(task) {
    console.log('📝 [DEBUG] Mostrando modal de edición para tarea:', task);
    
    // Obtener elementos del modal
    const modal = document.getElementById('editTaskModal');
    const form = document.getElementById('editTaskForm');
    
    console.log('📝 [DEBUG] Modal encontrado:', modal);
    console.log('📝 [DEBUG] Form encontrado:', form);
    
    if (!modal || !form) {
        console.error('❌ [ERROR] Modal de edición no encontrado');
        showNotification('Error al abrir el modal de edición', 'error');
        return;
    }
    
    // Poblar el formulario con los datos de la tarea
    form.querySelector('#editTaskTitle').value = task.title;
    form.querySelector('#editTaskDescription').value = task.description || '';
    form.querySelector('#editTaskArea').value = task.area || '';
    form.querySelector('#editTaskDueDate').value = formatDateForInput(task.dueDate);
    
    console.log('📝 [DEBUG] Formulario poblado con datos:', {
        title: task.title,
        description: task.description,
        area: task.area,
        dueDate: formatDateForInput(task.dueDate)
    });
    
    // Guardar el ID de la tarea actual
    window.currentEditTaskId = task.id;
    
    // Mostrar el modal
    modal.style.display = 'flex';
    modal.classList.add('active');
    
    console.log('📝 [DEBUG] Modal mostrado, display:', modal.style.display);
    console.log('📝 [DEBUG] Modal classes:', modal.classList.toString());
    
    // Configurar el formulario para manejar la edición
    form.onsubmit = (e) => handleEditTask(e);
}

function handleEditTask(e) {
    e.preventDefault();
    
    const taskId = window.currentEditTaskId;
    if (!taskId) {
        showNotification('Error: ID de tarea no encontrado', 'error');
        return;
    }
    
    const formData = new FormData(e.target);
    const updates = {
        title: formData.get('title'),
        description: formData.get('description'),
        area: formData.get('area'),
        dueDate: formData.get('dueDate')
    };
    
    // Validar datos
    if (!validateTaskData(updates)) {
        return;
    }
    
    // Actualizar la tarea
    updateTask(taskId, updates);
    
    // Cerrar modal
    const modal = document.getElementById('editTaskModal');
    modal.style.display = 'none';
    modal.classList.remove('active');
    
    showNotification('Tarea actualizada exitosamente', 'success');
}

function validateTaskData(data) {
    if (!data.title || data.title.trim().length < 3) {
        showNotification('El título debe tener al menos 3 caracteres', 'error');
        return false;
    }
    if (!data.dueDate) {
        showNotification('Debes seleccionar una fecha límite', 'error');
        return false;
    }
    return true;
}

function updateTask(taskId, updates) {
    console.log('📝 [DEBUG] Actualizando tarea:', taskId, updates);
    
    // Obtener tareas del localStorage
    const tasks = JSON.parse(localStorage.getItem('astren_tasks')) || [];
    const taskIndex = tasks.findIndex(t => t.id === taskId);
    
    if (taskIndex === -1) {
        showNotification('Tarea no encontrada', 'error');
        return;
    }
    
    // Actualizar la tarea
    tasks[taskIndex] = { ...tasks[taskIndex], ...updates };
    
    // Guardar en localStorage
    localStorage.setItem('astren_tasks', JSON.stringify(tasks));
    
    // Recargar tareas en el dashboard
    fetchDashboardTasks();
    updateDashboardTaskCounts();
    renderDashboardTodayTasks();
    
    console.log('✅ [SUCCESS] Tarea actualizada correctamente');
}

function formatDateForInput(dateString) {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    
    return `${year}-${month}-${day}T${hours}:${minutes}`;
}

function openDeleteModal(taskId) {
    showNotification('Función de eliminación disponible próximamente', 'info');
}

// Función para sincronizar tareas al cargar el dashboard
function syncTasksOnLoad() {
    console.log('🔄 Sincronizando tareas del dashboard...');
    
    // Actualizar contadores
    updateDashboardTaskCounts();
    
    // Renderizar tareas de hoy
    renderDashboardTodayTasks();
    
    // Actualizar estados de tareas (verificar si están vencidas)
    updateTaskStatuses();
    
    console.log('✅ Tareas sincronizadas correctamente');
}

// Función para actualizar estados de tareas (verificar vencimientos)
function updateTaskStatuses() {
    const tasks = JSON.parse(localStorage.getItem('astren_tasks')) || [];
    const now = new Date();
    let hasChanges = false;
    
    tasks.forEach(task => {
        if (task.status === 'pending') {
            const dueDate = new Date(task.dueDate);
            if (dueDate < now) {
                task.status = 'overdue';
                hasChanges = true;
            }
        }
    });
    
    if (hasChanges) {
        localStorage.setItem('astren_tasks', JSON.stringify(tasks));
        updateDashboardTaskCounts();
        renderDashboardTodayTasks();
    }
}

/*===== EVIDENCE BUTTONS =====*/
function initEvidenceButtons() {
    const evidenceBtns = document.querySelectorAll('.task__evidence-btn');
    if (evidenceBtns.length > 0) {
        evidenceBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                const taskId = this.getAttribute('data-task-id');
                const isCompleted = this.classList.contains('task__evidence-btn--completed');
                
                if (isCompleted) {
                    showNotification('Ver evidencia de tarea completada', 'info');
                } else {
                    showNotification('Agregar evidencia a tarea', 'info');
                }
            });
        });
    }
}

// Setup edit task modal event listeners
document.addEventListener('DOMContentLoaded', function() {
    const editModal = document.getElementById('editTaskModal');
    const closeEditBtn = document.getElementById('closeEditModal');
    const cancelEditBtn = document.getElementById('cancelEditTask');
    
    console.log('🔍 [DEBUG] Modal de edición encontrado:', editModal);
    console.log('🔍 [DEBUG] Botón cerrar encontrado:', closeEditBtn);
    console.log('🔍 [DEBUG] Botón cancelar encontrado:', cancelEditBtn);
    
    if (closeEditBtn) {
        closeEditBtn.addEventListener('click', function() {
            console.log('🔍 [DEBUG] Cerrando modal con botón X');
            editModal.style.display = 'none';
            editModal.classList.remove('active');
        });
    }
    
    if (cancelEditBtn) {
        cancelEditBtn.addEventListener('click', function() {
            console.log('🔍 [DEBUG] Cerrando modal con botón Cancelar');
            editModal.style.display = 'none';
            editModal.classList.remove('active');
        });
    }
    
    // Cerrar modal al hacer clic fuera de él
    if (editModal) {
        editModal.addEventListener('click', function(e) {
            if (e.target === editModal) {
                console.log('🔍 [DEBUG] Cerrando modal con clic fuera');
                editModal.style.display = 'none';
                editModal.classList.remove('active');
            }
        });
    }
    
    // Test function para verificar que el modal funciona
    window.testEditModal = function() {
        console.log('🧪 [TEST] Probando modal de edición');
        const testTask = {
            id: 'test-123',
            title: 'Tarea de prueba',
            description: 'Descripción de prueba',
            area: 'personal',
            dueDate: '2024-12-25 10:00'
        };
        showEditTaskModal(testTask);
    };
});

// Add animation styles
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInFromRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes pulse {
        0% { transform: scale(1); }
        50% { transform: scale(1.05); }
        100% { transform: scale(1); }
    }
    
    .notification__content {
        display: flex;
        align-items: center;
        gap: 0.75rem;
    }
    
    .notification__close {
        background: none;
        border: none;
        color: white;
        cursor: pointer;
        padding: 0.25rem;
        border-radius: 0.25rem;
        opacity: 0.8;
        transition: opacity 0.2s;
    }
    
    .notification__close:hover {
        opacity: 1;
    }
`;
document.head.appendChild(style);

console.log('Dashboard functionality initialized');

// --- Agregar función para formatear fecha (adaptada de tasks.js) ---
function formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
        year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
}

/*===== DASHBOARD RESPONSIVE ENHANCEMENTS =====*/
class DashboardResponsive {
    constructor() {
        this.isInitialized = false;
        this.currentBreakpoint = this.getBreakpoint();
    }

    init() {
        if (this.isInitialized) return;
        
        this.setupEventListeners();
        this.handleInitialLayout();
        this.isInitialized = true;
        console.log('Dashboard responsive enhancements initialized');
    }

    getBreakpoint() {
        const width = window.innerWidth;
        if (width <= 480) return 'small';
        if (width <= 768) return 'medium';
        if (width <= 1024) return 'large';
        return 'xlarge';
    }

    setupEventListeners() {
        // Handle window resize
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                this.handleResize();
            }, 250);
        });

        // Handle search input focus on mobile
        const searchInput = document.querySelector('.search__input');
        if (searchInput) {
            searchInput.addEventListener('focus', () => {
                if (window.innerWidth <= 1024) {
                    this.handleSearchFocus();
                }
            });

            searchInput.addEventListener('blur', () => {
                if (window.innerWidth <= 1024) {
                    this.handleSearchBlur();
                }
            });
        }

        // Handle mobile menu button
        const mobileMenuBtn = document.getElementById('mobileMenuBtn');
        if (mobileMenuBtn) {
            mobileMenuBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.toggleMobileMenu();
            });
        }

        // Handle overlay clicks
        const mobileOverlay = document.getElementById('mobileOverlay');
        if (mobileOverlay) {
            mobileOverlay.addEventListener('click', () => {
                this.closeMobileMenu();
            });
        }

        // Handle escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeMobileMenu();
            }
        });
    }

    handleInitialLayout() {
        this.adjustLayoutForBreakpoint();
        this.setupGridLayouts();
    }

    handleResize() {
        const newBreakpoint = this.getBreakpoint();
        if (newBreakpoint !== this.currentBreakpoint) {
            this.currentBreakpoint = newBreakpoint;
            this.adjustLayoutForBreakpoint();
        }
    }

    adjustLayoutForBreakpoint() {
        const dashboardContent = document.querySelector('.dashboard__content');
        const statsGrid = document.querySelector('.stats-grid');
        const dashboardRowGrid = document.querySelector('.dashboard-row-grid');
        const areasGrid = document.querySelector('.areas-grid');

        if (!dashboardContent) return;

        switch (this.currentBreakpoint) {
            case 'small':
                this.applySmallLayout(dashboardContent, statsGrid, dashboardRowGrid, areasGrid);
                break;
            case 'medium':
                this.applyMediumLayout(dashboardContent, statsGrid, dashboardRowGrid, areasGrid);
                break;
            case 'large':
                this.applyLargeLayout(dashboardContent, statsGrid, dashboardRowGrid, areasGrid);
                break;
            default:
                this.applyXLargeLayout(dashboardContent, statsGrid, dashboardRowGrid, areasGrid);
        }
    }

    applySmallLayout(content, statsGrid, rowGrid, areasGrid) {
        if (content) content.style.padding = '0.75rem';
        // if (rowGrid) rowGrid.style.gridTemplateColumns = '1fr';
        // if (areasGrid) areasGrid.style.gridTemplateColumns = '1fr';
    }

    applyMediumLayout(content, statsGrid, rowGrid, areasGrid) {
        if (content) content.style.padding = '1rem';
        // if (rowGrid) rowGrid.style.gridTemplateColumns = '1fr';
        // if (areasGrid) areasGrid.style.gridTemplateColumns = '1fr';
    }

    applyLargeLayout(content, statsGrid, rowGrid, areasGrid) {
        if (content) content.style.padding = '1.5rem';
        // if (rowGrid) rowGrid.style.gridTemplateColumns = '1fr';
        // if (areasGrid) areasGrid.style.gridTemplateColumns = 'repeat(auto-fit, minmax(250px, 1fr))';
    }

    applyXLargeLayout(content, statsGrid, rowGrid, areasGrid) {
        if (content) content.style.padding = '2rem';
        // if (rowGrid) rowGrid.style.gridTemplateColumns = '2fr 1fr';
        // if (areasGrid) areasGrid.style.gridTemplateColumns = 'repeat(auto-fit, minmax(280px, 1fr))';
    }

    setupGridLayouts() {
        // Ensure proper grid behavior
        const grids = document.querySelectorAll('.dashboard-row-grid, .areas-grid');
        grids.forEach(grid => {
            if (grid) {
                // grid.style.display = 'grid';
                // grid.style.gap = '1.5rem';
            }
        });
    }

    handleSearchFocus() {
        const searchInput = document.querySelector('.search__input');
        const headerRight = document.querySelector('.header__right');
        
        if (searchInput && headerRight) {
            // Expand search on mobile focus
            searchInput.style.width = '200px';
            headerRight.style.gap = '0.5rem';
        }
    }

    handleSearchBlur() {
        const searchInput = document.querySelector('.search__input');
        const headerRight = document.querySelector('.header__right');
        
        if (searchInput && headerRight) {
            // Contract search on mobile blur
            setTimeout(() => {
                searchInput.style.width = '160px';
                headerRight.style.gap = '0.5rem';
            }, 100);
        }
    }

    toggleMobileMenu() {
        const sidebar = document.querySelector('.sidebar');
        const overlay = document.querySelector('.mobile-overlay');
        
        if (sidebar && overlay) {
            if (sidebar.classList.contains('sidebar--mobile-open')) {
                this.closeMobileMenu();
            } else {
                this.openMobileMenu();
            }
        }
    }

    openMobileMenu() {
        const sidebar = document.querySelector('.sidebar');
        const overlay = document.querySelector('.mobile-overlay');
        
        if (sidebar && overlay) {
            sidebar.classList.add('sidebar--mobile-open');
            overlay.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    }

    closeMobileMenu() {
        const sidebar = document.querySelector('.sidebar');
        const overlay = document.querySelector('.mobile-overlay');
        
        if (sidebar && overlay) {
            sidebar.classList.remove('sidebar--mobile-open');
            overlay.classList.remove('active');
            document.body.style.overflow = '';
        }
    }

    // Utility method to check if element is in viewport
    isInViewport(element) {
        if (!element) return false;
        const rect = element.getBoundingClientRect();
        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
    }

    // Smooth scroll to element
    scrollToElement(element, offset = 0) {
        if (!element) return;
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - offset;
        
        window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
        });
    }
}

// Initialize dashboard responsive enhancements
let dashboardResponsive;

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        dashboardResponsive = new DashboardResponsive();
        dashboardResponsive.init();
    });
} else {
    dashboardResponsive = new DashboardResponsive();
    dashboardResponsive.init();
}

// Export for use in other scripts
window.DashboardResponsive = DashboardResponsive;

// --- Función para poblar el select de áreas en el modal de nueva tarea (igual que en tasks.js) ---
function populateAreaSelects() {
    const userId = getUserId();
    if (!userId) {
        console.log('❌ No se encontró userId para poblar selects de áreas');
        return;
    }

    // Cargar áreas del usuario
            fetch(buildApiUrl(CONFIG.API_ENDPOINTS.AREAS, `/${userId}`), { cache: 'no-store' })
        .then(response => response.json())
        .then(data => {
            const areas = data.areas || [];
            console.log('📝 Poblando selects con áreas:', areas.length);
            
            // Poblar select de área en el modal de nueva tarea
            const areaSelect = document.getElementById('taskArea');
            if (areaSelect) {
                areaSelect.innerHTML = '<option value="">Seleccionar área</option>';
                areas.forEach(area => {
                    if (!area.archived) {
                        const option = document.createElement('option');
                        option.value = area.id;
                        option.textContent = area.name;
                        areaSelect.appendChild(option);
                    }
                });
            }
        })
        .catch(error => {
            console.error('❌ Error al cargar áreas para selects:', error);
        });
}

// --- Funciones para cargar áreas y grupos desde el backend ---
async function loadDashboardAreas() {
    try {
        const userId = getUserId();
        if (!userId) {
            console.log('❌ No se encontró userId para cargar áreas');
            return [];
        }

        console.log('📡 Cargando áreas para usuario:', userId);
                    const response = await fetch(buildApiUrl(CONFIG.API_ENDPOINTS.AREAS, `/${userId}`), { cache: 'no-store' });
        if (response.ok) {
            const data = await response.json();
            Logger.debug('Datos completos del backend', data, 'API');
            
            // El backend devuelve un array directo de áreas
            const areas = Array.isArray(data) ? data : (data.areas || []);
            console.log('📋 Áreas recibidas:', areas);
            console.log('🔍 Áreas con estado "activa":', areas.filter(area => area.estado === 'activa'));
            
            // Guardar en localStorage para uso posterior
            localStorage.setItem('astren_areas', JSON.stringify(areas));
            
            // Renderizar áreas en el dashboard
            renderDashboardAreas(areas);
            
            return areas;
        } else {
            console.error('❌ Error al cargar áreas:', response.status);
            return [];
        }
    } catch (error) {
        console.error('❌ Error al cargar áreas:', error);
        return [];
    }
}

async function loadDashboardGroups() {
    try {
        const userId = getUserId();
        if (!userId) {
            console.log('❌ No se encontró userId para cargar grupos');
            return [];
        }

        console.log('📡 Cargando grupos para usuario:', userId);
                    const response = await fetch(buildApiUrl(CONFIG.API_ENDPOINTS.GROUPS, `/${userId}`), { cache: 'no-store' });
        if (response.ok) {
            const data = await response.json();
            const groups = data.grupos || [];
            console.log('✅ Grupos cargados para dashboard:', groups);
            
            // Guardar en localStorage para uso posterior
            localStorage.setItem('astren_groups', JSON.stringify(groups));
            
            // Renderizar grupos en el dashboard
            renderDashboardGroups(groups);
            
            return groups;
        } else {
            console.error('❌ Error al cargar grupos:', response.status);
            return [];
        }
    } catch (error) {
        console.error('❌ Error al cargar grupos:', error);
        return [];
    }
}

function renderDashboardAreas(areas) {
    console.log('🎨 Renderizando áreas:', areas);
    const areasContainer = document.getElementById('areasGrid');
    if (!areasContainer) {
        console.log('❌ No se encontró el contenedor de áreas');
        return;
    }

    // Filtrar solo áreas activas
    const activeAreas = areas.filter(area => area.estado === 'activa');
    console.log('✅ Áreas activas:', activeAreas.length);
    
    if (activeAreas.length === 0) {
        console.log('📝 Mostrando estado vacío para áreas');
        areasContainer.innerHTML = `
            <div class="empty-state">
                <div class="empty-state__icon">
                    <i class="fas fa-layer-group"></i>
                </div>
                <h3 class="empty-state__title">No tienes áreas aún</h3>
                <p class="empty-state__description">
                    Crea tu primera área para comenzar a organizar tus tareas.
                </p>
            </div>
        `;
        return;
    }

    // Mapear colores de la base de datos a valores hexadecimales (versiones pasteles)
    const colorMap = {
        'blue': '#93c5fd',
        'green': '#86efac',
        'purple': '#c4b5fd',
        'orange': '#fed7aa',
        'red': '#fca5a5',
        'pink': '#f9a8d4',
        'yellow': '#fde68a',
        'mint': '#a7f3d0',
        'sky': '#7dd3fc',
        'coral': '#fecaca',
        'lavender': '#ddd6fe'
    };

    const areasHTML = activeAreas.map(area => {
        const areaColor = colorMap[area.color] || '#93c5fd';
        console.log('🎨 Área:', area.nombre || area.name, 'Color:', area.color, '→', areaColor);
        
        return `
            <div class="area-card" data-area-id="${area.id}" style="border-color: ${areaColor}; cursor: pointer; transition: all 0.2s ease;" onclick="window.location.href='areas.html?area=${area.id}'">
                <div class="area__header">
                    <div class="area__icon" style="background: linear-gradient(135deg, ${areaColor}, ${adjustColor(areaColor, -20)});">
                        <i class="fas ${area.icon || area.icono || 'fa-briefcase'}"></i>
                    </div>
                    <div class="area__actions">
                        <button class="area__action" title="Ver área" onclick="event.stopPropagation(); window.location.href='areas.html?area=${area.id}'">
                            <i class="fas fa-eye"></i>
                        </button>
                    </div>
                </div>
                <div class="area__info">
                    <h3 class="area__name">${escapeHtml(area.nombre || area.name || 'Sin nombre')}</h3>
                    <p class="area__description">${escapeHtml(area.descripcion || area.description || 'Sin descripción')}</p>
                </div>
            </div>
        `;
    }).join('');

    console.log('📝 HTML generado para áreas:', areasHTML.length, 'caracteres');
    areasContainer.innerHTML = areasHTML;
    console.log('✅ Áreas renderizadas');
}

function renderDashboardGroups(groups) {
    console.log('🎨 Renderizando grupos:', groups);
    const groupsContainer = document.getElementById('groupsGrid');
    if (!groupsContainer) {
        console.log('❌ No se encontró el contenedor de grupos');
        return;
    }

    // Filtrar solo grupos activos
    const activeGroups = groups.filter(group => group.estado === 'activo');
    console.log('✅ Grupos activos:', activeGroups.length);
    
    if (activeGroups.length === 0) {
        console.log('📝 Mostrando estado vacío para grupos');
        groupsContainer.innerHTML = `
            <div class="empty-state">
                <div class="empty-state__icon">
                    <i class="fas fa-users"></i>
                </div>
                <h3 class="empty-state__title">No tienes grupos aún</h3>
                <p class="empty-state__description">
                    Crea tu primer grupo para comenzar a colaborar.
                </p>
            </div>
        `;
        return;
    }

    // Mapear colores de la base de datos a valores hexadecimales (versiones pasteles más suaves)
    const colorMap = {
        'blue': '#dbeafe',
        'green': '#dcfce7',
        'purple': '#ede9fe',
        'orange': '#fed7aa',
        'red': '#fee2e2',
        'pink': '#fce7f3',
        'yellow': '#fef3c7',
        'mint': '#d1fae5',
        'sky': '#e0f2fe',
        'coral': '#fecaca',
        'lavender': '#f3e8ff'
    };

    const groupsHTML = activeGroups.map(group => {
        const groupColor = colorMap[group.color] || '#93c5fd';
        console.log('🎨 Grupo:', group.nombre, 'Color:', group.color, '→', groupColor);
        
        return `
            <div class="group-card" data-group-id="${group.id}" onclick="window.location.href='groups.html?group=${group.id}'">
                <div class="group__header">
                    <div class="group__avatar">
                        <i class="fas ${group.icono || 'fa-users'}"></i>
                    </div>
                    <div class="group__actions">
                        <button class="group__action" title="Ver grupo" onclick="event.stopPropagation(); window.location.href='groups.html?group=${group.id}'">
                            <i class="fas fa-eye"></i>
                        </button>
                    </div>
                </div>
                <div class="group__info">
                    <h3 class="group__name">${escapeHtml(group.nombre)}</h3>
                    <p class="group__description">${escapeHtml(group.descripcion || 'Sin descripción')}</p>
                </div>
                <div class="group__meta">
                    <span class="group__role group__role--${group.rol}">
                        <i class="fas ${getRoleIcon(group.rol)}"></i>
                        ${getRoleText(group.rol)}
                    </span>
                    <span class="group__members">
                        <i class="fas fa-users"></i>
                        ${group.num_miembros || 0}
                    </span>
                </div>
            </div>
        `;
    }).join('');

    console.log('📝 HTML generado para grupos:', groupsHTML.length, 'caracteres');
    groupsContainer.innerHTML = groupsHTML;
    console.log('✅ Grupos renderizados');
}

// Funciones helper
function adjustColor(hexColor, percentage) {
    let r = parseInt(hexColor.slice(1, 3), 16);
    let g = parseInt(hexColor.slice(3, 5), 16);
    let b = parseInt(hexColor.slice(5, 7), 16);

    r = Math.round(r * (1 + percentage / 100));
    g = Math.round(g * (1 + percentage / 100));
    b = Math.round(b * (1 + percentage / 100));

    r = Math.min(255, Math.max(0, r));
    g = Math.min(255, Math.max(0, g));
    b = Math.min(255, Math.max(0, b));

    const rHex = r.toString(16).padStart(2, '0');
    const gHex = g.toString(16).padStart(2, '0');
    const bHex = b.toString(16).padStart(2, '0');

    return `#${rHex}${gHex}${bHex}`;
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function getRoleIcon(role) {
    switch (role) {
        case 'lider': return 'fa-crown';
        case 'administrador': return 'fa-user-shield';
        case 'miembro': return 'fa-user';
        default: return 'fa-user';
    }
}

function getRoleText(role) {
    switch (role) {
        case 'lider': return 'Líder';
        case 'administrador': return 'Administrador';
        case 'miembro': return 'Miembro';
        default: return 'Miembro';
    }
}

// Funciones para scroll horizontal
function setupHorizontalScroll(containerId, leftBtnId, rightBtnId) {
    const container = document.getElementById(containerId);
    const leftBtn = document.getElementById(leftBtnId);
    const rightBtn = document.getElementById(rightBtnId);
    
    if (!container || !leftBtn || !rightBtn) return;
    
    // Calcular el ancho de una tarjeta + gap
    const cardWidth = 380; // Ancho de la tarjeta
    const gap = 16; // Gap entre tarjetas
    const scrollAmount = cardWidth + gap; // Una tarjeta completa + gap
    
    function updateScrollButtons() {
        const isAtStart = container.scrollLeft === 0;
        const isAtEnd = container.scrollLeft >= container.scrollWidth - container.clientWidth;
        
        leftBtn.style.display = isAtStart ? 'none' : 'flex';
        rightBtn.style.display = isAtEnd ? 'none' : 'flex';
    }
    
    // Scroll hacia la izquierda
    leftBtn.addEventListener('click', () => {
        container.scrollBy({
            left: -scrollAmount,
            behavior: 'smooth'
        });
    });
    
    // Scroll hacia la derecha
    rightBtn.addEventListener('click', () => {
        container.scrollBy({
            left: scrollAmount,
            behavior: 'smooth'
        });
    });
    
    // Actualizar botones al hacer scroll
    container.addEventListener('scroll', updateScrollButtons);
    
    // Actualizar botones inicialmente
    updateScrollButtons();
    
    // Actualizar botones cuando cambie el contenido
    const observer = new MutationObserver(updateScrollButtons);
    observer.observe(container, { childList: true, subtree: true });
}

// Inicializar scroll horizontal después de cargar el contenido
function initializeHorizontalScroll() {
    setupHorizontalScroll('areasGrid', 'areasScrollLeft', 'areasScrollRight');
    setupHorizontalScroll('groupsGrid', 'groupsScrollLeft', 'groupsScrollRight');
}

// Cargar datos del dashboard al inicializar
document.addEventListener('DOMContentLoaded', async function() {
    console.log('🚀 Dashboard inicializando...');
    
    // Verificar userId
    const userId = sessionStorage.getItem('userId') || localStorage.getItem('userId');
    console.log('👤 UserId encontrado:', userId);
    
    // Verificar contenedores
    const areasContainer = document.getElementById('areasGrid');
    const groupsContainer = document.getElementById('groupsGrid');
    console.log('📦 Contenedor de áreas encontrado:', !!areasContainer);
    console.log('📦 Contenedor de grupos encontrado:', !!groupsContainer);
    
    // Render inmediato desde cache local (solo si la feature está activa)
    if (CONFIG.FEATURES && CONFIG.FEATURES.CACHE_FIRST) {
        try {
            const cachedAreas = JSON.parse(localStorage.getItem('astren_areas') || '[]');
            if (Array.isArray(cachedAreas) && cachedAreas.length) {
                renderDashboardAreas(cachedAreas);
            }
            const cachedGroups = JSON.parse(localStorage.getItem('astren_groups') || '[]');
            if (Array.isArray(cachedGroups) && cachedGroups.length) {
                renderDashboardGroups(cachedGroups);
            }
            setTimeout(initializeHorizontalScroll, 100);
        } catch (e) {}
    }

    // Asegurar datos bootstrap (si existe helper)
    if (typeof bootstrapUserData === 'function') {
        await bootstrapUserData(false);
    }

    // Revalidación en segundo plano
    console.log('📡 Cargando áreas...');
    loadDashboardAreas().then(areas => {
        console.log('✅ Áreas cargadas:', areas.length);
        setTimeout(initializeHorizontalScroll, 100);
    });
    
    console.log('📡 Cargando grupos...');
    loadDashboardGroups().then(groups => {
        console.log('✅ Grupos cargados:', groups.length);
        setTimeout(initializeHorizontalScroll, 100);
    });
    
    // Poblar selects de áreas
    populateAreaSelects();
    
    // Inicializar navegación inteligente del dashboard
    setupDashboardNavigation();
    
    // Cargar y animar contadores: usar cache solo si la feature está activa
    if (CONFIG.FEATURES && CONFIG.FEATURES.CACHE_FIRST) {
        try {
            const cachedTasks = JSON.parse(localStorage.getItem('astren_tasks') || '[]');
            if (Array.isArray(cachedTasks) && cachedTasks.length) {
                const count = (statusFilter) => cachedTasks.filter(t => {
                    const statusOk = statusFilter ? t.status === statusFilter : true;
                    return statusOk;
                });
                const isToday = (t) => t.status === 'pending' && esFechaHoy(t.dueDate || t.fecha_vencimiento);
                const tasksDueToday = cachedTasks.filter(isToday).length;
                const completedTasks = count('completed').length;
                const pendingTasks = count('pending').length;
                const overdueTasks = count('overdue').length;
                const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
                set('statToday', tasksDueToday);
                set('statCompleted', completedTasks);
                set('statPending', pendingTasks);
                set('statOverdue', overdueTasks);
                renderDashboardTodayTasks();
            }
        } catch (e) {}
    }
    updateDashboardTaskCounts();
    
    // Configurar funcionalidades adicionales
    setupRefreshButton();
    setupAutoRefresh();
    setupConnectionMonitoring();
    setupScrollOptimization();
    
    console.log('✅ Dashboard inicializado');
});

// Función para obtener el userId del usuario logueado
function getUserId() {
    // Intentar obtener de sessionStorage (sesión activa)
    const astrenUser = sessionStorage.getItem('astren_user');
    if (astrenUser) {
        try {
            const userData = JSON.parse(astrenUser);
            return userData.usuario_id;
        } catch (error) {
            console.error('❌ Error al parsear astren_user:', error);
        }
    }
    
    // Intentar obtener de localStorage (recordarme)
    const astrenUserId = localStorage.getItem('astren_usuario_id');
    if (astrenUserId) {
        return astrenUserId;
    }
    
    // Fallback: buscar userId directamente (compatibilidad)
    return sessionStorage.getItem('userId') || localStorage.getItem('userId');
}

// --- FUNCIONALIDADES ADICIONALES DEL DASHBOARD ---

// Función para mostrar indicador de sincronización
function mostrarIndicadorSincronizacion(mensaje, tipo = 'success', duracion = 3000) {
    const indicator = document.getElementById('syncIndicator');
    if (!indicator) return;
    
    const icon = indicator.querySelector('i');
    const text = indicator.querySelector('span');
    
    // Actualizar contenido
    text.textContent = mensaje;
    
    // Actualizar clase y icono según el tipo
    indicator.className = `sync-indicator show ${tipo}`;
    
    switch (tipo) {
        case 'syncing':
            icon.className = 'fas fa-sync-alt fa-spin';
            break;
        case 'error':
            icon.className = 'fas fa-exclamation-triangle';
            break;
        default:
            icon.className = 'fas fa-check';
    }
    
    // Ocultar después del tiempo especificado
    setTimeout(() => {
        indicator.classList.remove('show');
    }, duracion);
}

// Función para manejar el botón de actualización
function setupRefreshButton() {
    const refreshButton = document.getElementById('refreshButton');
    if (!refreshButton) return;
    
    refreshButton.addEventListener('click', async function() {
        // Prevenir múltiples clics
        if (this.classList.contains('loading')) return;
        
        // Mostrar estado de carga
        this.classList.add('loading');
        mostrarIndicadorSincronizacion('Actualizando...', 'syncing');
        
        try {
            // Forzar actualización
            await actualizarDashboard();
            
            // Mostrar éxito
            mostrarIndicadorSincronizacion('¡Actualizado!', 'success');
            
        } catch (error) {
            console.error('❌ Error al actualizar dashboard:', error);
            mostrarIndicadorSincronizacion('Error al actualizar', 'error');
        } finally {
            // Restaurar estado normal
            this.classList.remove('loading');
        }
    });
}

// Función para actualizar automáticamente el dashboard cada 5 minutos
function setupAutoRefresh() {
    setInterval(() => {
        // Solo actualizar si el usuario está activo
        if (!document.hidden) {
            console.log('🔄 Actualización automática del dashboard...');
            cargarDashboardCompleto();
        }
    }, 5 * 60 * 1000); // 5 minutos
}

// Función para detectar cambios en la conexión
function setupConnectionMonitoring() {
    if ('ononline' in window) {
        window.addEventListener('online', () => {
            console.log('🌐 Conexión restaurada, actualizando dashboard...');
            mostrarIndicadorSincronizacion('Conexión restaurada', 'success');
            cargarDashboardCompleto();
        });
        
        window.addEventListener('offline', () => {
            console.log('📡 Conexión perdida');
            mostrarIndicadorSincronizacion('Sin conexión', 'error');
        });
    }
}

// Función para optimizar el rendimiento del scroll
function setupScrollOptimization() {
    let ticking = false;
    
    function updateScroll() {
        // Aquí puedes agregar optimizaciones de scroll si es necesario
        ticking = false;
    }
    
    function requestTick() {
        if (!ticking) {
            requestAnimationFrame(updateScroll);
            ticking = true;
        }
    }
    
    // Optimizar eventos de scroll
    window.addEventListener('scroll', requestTick, { passive: true });
}