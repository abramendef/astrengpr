/*===== DASHBOARD FUNCTIONALITY =====*/

// DOM Elements - Check if elements exist before using them
const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const sidebar = document.getElementById('sidebar');
const sidebarClose = document.getElementById('sidebar-close') || document.getElementById('sidebarToggle');
const overlay = document.getElementById('mobileOverlay');
const searchInput = document.querySelector('.header__search .search__input');

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
            const usuario_id = localStorage.getItem('astren_usuario_id') || 1;
            const titulo = document.getElementById('taskTitle').value;
            const descripcion = document.getElementById('taskDescription').value;
            const area_id = document.getElementById('taskArea').value || null;
            const fecha_vencimiento = document.getElementById('taskDueDate').value;
            const data = {
                usuario_id: usuario_id,
                titulo: titulo,
                descripcion: descripcion,
                area_id: area_id,
                fecha_vencimiento: fecha_vencimiento
            };
            fetch('http://localhost:8000/tareas', {
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
function fetchDashboardTasks() {
    const usuario_id = localStorage.getItem('astren_usuario_id') || 1;
    return fetch(`http://localhost:8000/tareas/${usuario_id}`)
        .then(response => response.json())
        .then(tareas => tareas.map(t => ({
            ...t,
            status: t.estado === 'pendiente' ? 'pending' :
                    t.estado === 'completada' ? 'completed' :
                    t.estado === 'vencida' ? 'overdue' : t.estado,
            title: t.titulo || t.title,
            dueDate: t.fecha_vencimiento || t.dueDate
        })))
        .catch(() => []);
}

// --- updateDashboardTaskCounts usando backend ---
function updateDashboardTaskCounts() {
    fetchDashboardTasks().then(tasks => {
        const tasksDueToday = tasks.filter(task => 
            task.status === 'pending' && esFechaHoy(task.dueDate)
        ).length;
    const completedTasks = tasks.filter(task => task.status === 'completed').length;
    const pendingTasks = tasks.filter(task => task.status === 'pending').length;
    const overdueTasks = tasks.filter(task => task.status === 'overdue').length;

    if (document.getElementById('statToday')) document.getElementById('statToday').textContent = tasksDueToday;
    if (document.getElementById('statCompleted')) document.getElementById('statCompleted').textContent = completedTasks;
    if (document.getElementById('statPending')) document.getElementById('statPending').textContent = pendingTasks;
    if (document.getElementById('statOverdue')) document.getElementById('statOverdue').textContent = overdueTasks;
    if (document.getElementById('todayTasksCounter')) {
        document.getElementById('todayTasksCounter').textContent = tasksDueToday;
    }
    });
}

// --- renderDashboardTodayTasks usando backend ---
function renderDashboardTodayTasks() {
    const dashboardTodayTasks = document.getElementById('dashboardTodayTasks');
    if (dashboardTodayTasks) {
        dashboardTodayTasks.innerHTML = '';
        fetchDashboardTasks().then(tasks => {
        let tasksToday = tasks.filter(task => {
                return task.status === 'pending' && esFechaHoy(task.dueDate);
            });
        tasksToday = tasksToday.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
        if (tasksToday.length === 0) {
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
            tasksToday.forEach(task => {
                const taskElement = createTaskCard(task);
                dashboardTodayTasks.appendChild(taskElement);
            });
        }
        });
    }
}

function deleteDashboardTask(taskId) {
    fetch(`http://localhost:8000/tareas/${taskId}`, {
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
    const tasks = JSON.parse(localStorage.getItem('astren_tasks')) || [];
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    
    if (completed) {
        // Check if task requires evidence
        const requiresEvidence = task.area === 'work' || task.area === 'school';
        
        if (requiresEvidence && !task.evidence) {
            showNotification('Esta tarea requiere evidencia antes de completarse', 'warning');
            // NO cambiar el estado ni recargar la vista, para que el usuario pueda subir evidencia
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
        
        showNotification('¡Tarea completada! +' + task.reputationImpact + ' puntos de reputación', 'success');
    } else {
        task.status = 'pending';
        task.completedAt = null;
        task.evidence = null;
        task.evidenceValidated = false;
        task.reputationImpact = 0;
        showNotification('Tarea marcada como pendiente', 'info');
    }
    
    // Guardar cambios en localStorage
    localStorage.setItem('astren_tasks', JSON.stringify(tasks));
    
    // Recargar las tareas del dashboard
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
        
        if (tasksToday.length === 0) {
            // Mostrar mensaje cuando no hay tareas de hoy
            dashboardTodayTasks.innerHTML = `
                <div class="empty-tasks-message">
                    <div class="empty-tasks-icon">
                        <i class="fas fa-check-circle"></i>
                    </div>
                    <h3 class="empty-tasks-title">¡Excelente trabajo!</h3>
                    <p class="empty-tasks-description">No tienes tareas pendientes para hoy. ¡Disfruta tu día!</p>
                </div>
            `;
        } else {
            tasksToday.forEach(task => {
                const card = createTaskCard(task);
                dashboardTodayTasks.appendChild(card);
            });
        }
    }
    
    // Actualizar contadores usando la función centralizada
    updateDashboardTaskCounts();
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
    showNotification('Función de edición disponible próximamente', 'info');
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
        if (statsGrid) statsGrid.style.gridTemplateColumns = '1fr';
        if (rowGrid) rowGrid.style.gridTemplateColumns = '1fr';
        if (areasGrid) areasGrid.style.gridTemplateColumns = '1fr';
    }

    applyMediumLayout(content, statsGrid, rowGrid, areasGrid) {
        if (content) content.style.padding = '1rem';
        if (statsGrid) statsGrid.style.gridTemplateColumns = 'repeat(auto-fit, minmax(150px, 1fr))';
        if (rowGrid) rowGrid.style.gridTemplateColumns = '1fr';
        if (areasGrid) areasGrid.style.gridTemplateColumns = '1fr';
    }

    applyLargeLayout(content, statsGrid, rowGrid, areasGrid) {
        if (content) content.style.padding = '1.5rem';
        if (statsGrid) statsGrid.style.gridTemplateColumns = 'repeat(auto-fit, minmax(180px, 1fr))';
        if (rowGrid) rowGrid.style.gridTemplateColumns = '1fr';
        if (areasGrid) areasGrid.style.gridTemplateColumns = 'repeat(auto-fit, minmax(250px, 1fr))';
    }

    applyXLargeLayout(content, statsGrid, rowGrid, areasGrid) {
        if (content) content.style.padding = '2rem';
        if (statsGrid) statsGrid.style.gridTemplateColumns = 'repeat(auto-fit, minmax(200px, 1fr))';
        if (rowGrid) rowGrid.style.gridTemplateColumns = '2fr 1fr';
        if (areasGrid) areasGrid.style.gridTemplateColumns = 'repeat(auto-fit, minmax(280px, 1fr))';
    }

    setupGridLayouts() {
        // Ensure proper grid behavior
        const grids = document.querySelectorAll('.stats-grid, .dashboard-row-grid, .areas-grid');
        grids.forEach(grid => {
            if (grid) {
                grid.style.display = 'grid';
                grid.style.gap = '1.5rem';
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
    let areas = [];
    try {
        const savedAreas = localStorage.getItem('astren_areas');
        if (savedAreas) {
            areas = JSON.parse(savedAreas);
        }
    } catch (e) {
        areas = [];
    }
    areas = areas.filter(a => !a.archived);
    const areaSelects = [
        document.getElementById('taskArea'),
        document.getElementById('editTaskArea')
    ];
    areaSelects.forEach(select => {
        if (!select) return;
        select.innerHTML = '';
        select.disabled = false;
        if (areas.length === 0) {
            select.innerHTML = '<option value="">Sin área</option>';
        } else {
            select.innerHTML = '<option value="">Sin área</option>' +
                areas.map(area => `<option value="${area.id}">${area.name}</option>`).join('');
        }
    });
    const newTaskBtn = document.querySelector('#newTaskForm button[type="submit"]');
    if (newTaskBtn) {
        newTaskBtn.disabled = false;
    }
    const form = document.getElementById('newTaskForm');
    if (form) {
        let msg = form.querySelector('.no-areas-msg');
        if (msg) {
            msg.remove();
        }
    }
}