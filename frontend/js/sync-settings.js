// Sistema de Sincronización de Tareas de Astren
class SyncManager {
    constructor() {
        this.apiBaseUrl = 'http://localhost:8000';
        this.syncConfig = this.loadSyncConfig();
        this.syncHistory = this.loadSyncHistory();
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadSyncStatus();
        this.renderSyncHistory();
        console.log('🔄 Sync Manager inicializado');
    }

    loadSyncConfig() {
        const saved = localStorage.getItem('astren_sync_config');
        return saved ? JSON.parse(saved) : {
            auto_sync: true,
            sync_interval: 30,
            bidirectional_sync: true,
            microsoft_connected: false,
            icloud_connected: false
        };
    }

    saveSyncConfig() {
        localStorage.setItem('astren_sync_config', JSON.stringify(this.syncConfig));
    }

    loadSyncHistory() {
        const saved = localStorage.getItem('astren_sync_history');
        return saved ? JSON.parse(saved) : [];
    }

    saveSyncHistory() {
        localStorage.setItem('astren_sync_history', JSON.stringify(this.syncHistory));
    }

    setupEventListeners() {
        // Microsoft To Do
        const connectMicrosoftBtn = document.getElementById('connectMicrosoft');
        const syncMicrosoftBtn = document.getElementById('syncMicrosoft');
        const authorizeMicrosoftBtn = document.getElementById('authorizeMicrosoft');
        const closeMicrosoftModal = document.getElementById('closeMicrosoftModal');
        const cancelMicrosoftBtn = document.getElementById('cancelMicrosoft');

        if (connectMicrosoftBtn) {
            connectMicrosoftBtn.addEventListener('click', () => this.showMicrosoftModal());
        }
        if (syncMicrosoftBtn) {
            syncMicrosoftBtn.addEventListener('click', () => this.syncMicrosoftTasks());
        }
        if (authorizeMicrosoftBtn) {
            authorizeMicrosoftBtn.addEventListener('click', () => this.authorizeMicrosoft());
        }
        if (closeMicrosoftModal) {
            closeMicrosoftModal.addEventListener('click', () => this.hideModal('microsoftModal'));
        }
        if (cancelMicrosoftBtn) {
            cancelMicrosoftBtn.addEventListener('click', () => this.hideModal('microsoftModal'));
        }

        // iCloud
        const connectICloudBtn = document.getElementById('connectICloud');
        const syncICloudBtn = document.getElementById('syncICloud');
        const connectICloudModalBtn = document.getElementById('connectICloudBtn');
        const closeICloudModal = document.getElementById('closeICloudModal');
        const cancelICloudBtn = document.getElementById('cancelICloud');

        console.log('🔍 Configurando event listeners de iCloud:');
        console.log('  - connectICloudBtn:', connectICloudBtn);
        console.log('  - syncICloudBtn:', syncICloudBtn);
        console.log('  - connectICloudModalBtn:', connectICloudModalBtn);
        console.log('  - closeICloudModal:', closeICloudModal);
        console.log('  - cancelICloudBtn:', cancelICloudBtn);

        if (connectICloudBtn) {
            connectICloudBtn.addEventListener('click', () => {
                console.log('🎯 Botón Conectar iCloud (tarjeta) clickeado');
                this.showICloudModal();
            });
            console.log('✅ Event listener agregado a connectICloudBtn');
        }
        if (syncICloudBtn) {
            syncICloudBtn.addEventListener('click', () => this.syncICloudTasks());
        }
        if (connectICloudModalBtn) {
            connectICloudModalBtn.addEventListener('click', () => {
                console.log('🎯 Botón Conectar iCloud (modal) clickeado');
                this.connectICloud();
            });
            console.log('✅ Event listener agregado a connectICloudModalBtn');
        }
        if (closeICloudModal) {
            closeICloudModal.addEventListener('click', () => this.hideModal('icloudModal'));
        }
        if (cancelICloudBtn) {
            cancelICloudBtn.addEventListener('click', () => this.hideModal('icloudModal'));
        }

        const testICloudConnection = document.getElementById('testICloudConnection');
        if (testICloudConnection) {
            testICloudConnection.addEventListener('click', () => this.testICloudConnection());
        }

        // Configuración
        const autoSyncCheckbox = document.getElementById('autoSync');
        const syncIntervalSelect = document.getElementById('syncInterval');
        const bidirectionalSyncCheckbox = document.getElementById('bidirectionalSync');

        if (autoSyncCheckbox) {
            autoSyncCheckbox.addEventListener('change', (e) => {
                this.syncConfig.auto_sync = e.target.checked;
                this.saveSyncConfig();
                this.updateAutoSync();
            });
        }
        if (syncIntervalSelect) {
            syncIntervalSelect.addEventListener('change', (e) => {
                this.syncConfig.sync_interval = parseInt(e.target.value);
                this.saveSyncConfig();
                this.updateAutoSync();
            });
        }
        if (bidirectionalSyncCheckbox) {
            bidirectionalSyncCheckbox.addEventListener('change', (e) => {
                this.syncConfig.bidirectional_sync = e.target.checked;
                this.saveSyncConfig();
            });
        }

        // Cerrar modales al hacer clic fuera
        window.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                this.hideAllModals();
            }
        });
    }

    async loadSyncStatus() {
        try {
            const response = await fetch(`${this.apiBaseUrl}/sync/config`);
            if (response.ok) {
                const config = await response.json();
                this.updateServiceStatus('microsoft', config.microsoft_connected);
                this.updateServiceStatus('icloud', config.icloud_connected);
            }
        } catch (error) {
            console.error('Error cargando estado de sincronización:', error);
        }
    }

    updateServiceStatus(service, connected) {
        const statusElement = document.getElementById(`${service}Status`);
        const connectBtn = document.getElementById(`connect${service.charAt(0).toUpperCase() + service.slice(1)}`);
        const syncBtn = document.getElementById(`sync${service.charAt(0).toUpperCase() + service.slice(1)}`);

        if (statusElement) {
            const badge = statusElement.querySelector('.status-badge');
            if (connected) {
                badge.className = 'status-badge status-connected';
                badge.textContent = 'Conectado';
            } else {
                badge.className = 'status-badge status-disconnected';
                badge.textContent = 'Desconectado';
            }
        }

        if (connectBtn && syncBtn) {
            if (connected) {
                connectBtn.style.display = 'none';
                syncBtn.style.display = 'inline-flex';
            } else {
                connectBtn.style.display = 'inline-flex';
                syncBtn.style.display = 'none';
            }
        }

        this.syncConfig[`${service}_connected`] = connected;
        this.saveSyncConfig();
    }

    showModal(modalId) {
        console.log('🔍 Mostrando modal:', modalId);
        const modal = document.getElementById(modalId);
        if (modal) {
            console.log('✅ Modal encontrado, mostrando...');
            modal.style.display = 'flex';
            modal.classList.add('active');
            console.log('🎯 Modal display:', modal.style.display);
            console.log('🎯 Modal classes:', modal.className);
        } else {
            console.error('❌ Modal no encontrado:', modalId);
        }
    }

    hideModal(modalId) {
        console.log('🔍 Ocultando modal:', modalId);
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'none';
            modal.classList.remove('active');
        }
    }

    hideAllModals() {
        console.log('🔍 Ocultando todos los modales');
        const modals = document.querySelectorAll('.modal');
        modals.forEach(modal => {
            modal.style.display = 'none';
            modal.classList.remove('active');
        });
    }

    showMicrosoftModal() {
        this.showModal('microsoftModal');
    }

    showICloudModal() {
        this.showModal('icloudModal');
    }

    async authorizeMicrosoft() {
        try {
            const response = await fetch(`${this.apiBaseUrl}/auth/microsoft/url`);
            if (response.ok) {
                const data = await response.json();
                window.open(data.auth_url, '_blank', 'width=500,height=600');
                
                // Verificar conexión después de un tiempo
                setTimeout(() => {
                    this.checkMicrosoftConnection();
                }, 5000);
            }
        } catch (error) {
            this.showToast('Error conectando con Microsoft', 'error');
            console.error('Error autorizando Microsoft:', error);
        }
    }

    async checkMicrosoftConnection() {
        try {
            const response = await fetch(`${this.apiBaseUrl}/sync/config`);
            if (response.ok) {
                const config = await response.json();
                if (config.microsoft_connected) {
                    this.updateServiceStatus('microsoft', true);
                    this.hideModal('microsoftModal');
                    this.showToast('Microsoft To Do conectado exitosamente', 'success');
                    this.addSyncHistory('Microsoft To Do', 'Conectado exitosamente', 'success');
                }
            }
        } catch (error) {
            console.error('Error verificando conexión Microsoft:', error);
        }
    }

    async connectICloud() {
        const appleId = document.getElementById('appleId').value.trim();
        const appPassword = document.getElementById('appPassword').value.trim();

        // Validaciones
        if (!appleId || !appPassword) {
            this.showToast('Por favor completa todos los campos', 'error');
            return;
        }

        if (!appleId.includes('@')) {
            this.showToast('El Apple ID debe ser un email válido', 'error');
            return;
        }

        if (appPassword.length < 10) {
            this.showToast('La contraseña específica de app debe tener al menos 10 caracteres', 'error');
            return;
        }

        // Mostrar indicador de carga
        const connectBtn = document.querySelector('#icloudModal .button--primary');
        const originalText = connectBtn.textContent;
        connectBtn.textContent = 'Conectando...';
        connectBtn.disabled = true;

        try {
            const response = await fetch(`${this.apiBaseUrl}/sync/icloud/connect`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    apple_id: appleId,
                    app_specific_password: appPassword
                })
            });

            const data = await response.json();

            if (response.ok) {
                this.updateServiceStatus('icloud', true);
                this.hideModal('icloudModal');
                this.showToast('iCloud Reminders conectado exitosamente', 'success');
                this.addSyncHistory('iCloud Reminders', 'Conectado exitosamente', 'success');
                
                // Limpiar formulario
                document.getElementById('appleId').value = '';
                document.getElementById('appPassword').value = '';
            } else {
                // Manejar errores específicos
                let errorMessage = data.error || 'Error conectando con iCloud';
                
                if (response.status === 401) {
                    errorMessage = 'Credenciales incorrectas. Verifica tu Apple ID y contraseña específica de app.';
                } else if (response.status === 403) {
                    errorMessage = 'Acceso denegado. Asegúrate de que la contraseña específica de app tenga permisos para CalDAV.';
                } else if (response.status === 404) {
                    errorMessage = 'Recurso no encontrado. Verifica que tengas recordatorios configurados en iCloud.';
                } else if (response.status === 408) {
                    errorMessage = 'Tiempo de espera agotado. Verifica tu conexión a internet.';
                } else if (response.status === 503) {
                    errorMessage = 'Error de conexión. Verifica tu conexión a internet.';
                }
                
                this.showToast(errorMessage, 'error');
                this.addSyncHistory('iCloud Reminders', errorMessage, 'error');
            }
        } catch (error) {
            console.error('Error conectando iCloud:', error);
            const errorMessage = 'Error de conexión. Verifica tu conexión a internet y vuelve a intentar.';
            this.showToast(errorMessage, 'error');
            this.addSyncHistory('iCloud Reminders', errorMessage, 'error');
        } finally {
            // Restaurar botón
            connectBtn.textContent = originalText;
            connectBtn.disabled = false;
        }
    }

    async syncMicrosoftTasks() {
        try {
            // Obtener tareas locales
            const localTasks = this.getLocalTasks();
            
            const response = await fetch(`${this.apiBaseUrl}/sync/sync-all`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    local_tasks: localTasks,
                    sync_services: ['microsoft']
                })
            });

            if (response.ok) {
                const result = await response.json();
                this.processSyncedTasks(result.synced_tasks, 'microsoft');
                this.showToast(`Sincronizadas ${result.synced_tasks.length} tareas de Microsoft To Do`, 'success');
                this.addSyncHistory('Microsoft To Do', `${result.synced_tasks.length} tareas sincronizadas`, 'success');
            } else {
                const error = await response.json();
                this.showToast(error.error || 'Error sincronizando con Microsoft', 'error');
                this.addSyncHistory('Microsoft To Do', 'Error de sincronización', 'error');
            }
        } catch (error) {
            this.showToast('Error sincronizando con Microsoft', 'error');
            this.addSyncHistory('Microsoft To Do', 'Error de conexión', 'error');
            console.error('Error sincronizando Microsoft:', error);
        }
    }

    async syncICloudTasks() {
        try {
            // Obtener tareas locales
            const localTasks = this.getLocalTasks();
            
            const response = await fetch(`${this.apiBaseUrl}/sync/sync-all`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    local_tasks: localTasks,
                    sync_services: ['icloud']
                })
            });

            if (response.ok) {
                const result = await response.json();
                this.processSyncedTasks(result.synced_tasks, 'icloud');
                this.showToast(`Sincronizadas ${result.synced_tasks.length} tareas de iCloud`, 'success');
                this.addSyncHistory('iCloud Reminders', `${result.synced_tasks.length} tareas sincronizadas`, 'success');
            } else {
                const error = await response.json();
                this.showToast(error.error || 'Error sincronizando con iCloud', 'error');
                this.addSyncHistory('iCloud Reminders', 'Error de sincronización', 'error');
            }
        } catch (error) {
            this.showToast('Error sincronizando con iCloud', 'error');
            this.addSyncHistory('iCloud Reminders', 'Error de conexión', 'error');
            console.error('Error sincronizando iCloud:', error);
        }
    }

    getLocalTasks() {
        const savedTasks = localStorage.getItem('astren_tasks');
        return savedTasks ? JSON.parse(savedTasks) : [];
    }

    processSyncedTasks(syncedTasks, source) {
        // Convertir tareas externas al formato de Astren
        const convertedTasks = syncedTasks.map(task => ({
            id: `ext_${source}_${task.id}`,
            title: task.title,
            description: task.description || '',
            area: task.area || 'personal', // Área por defecto
            dueDate: task.due_date,
            status: task.status,
            createdAt: new Date().toISOString(),
            completedAt: task.status === 'completed' ? new Date().toISOString() : null,
            evidence: null,
            evidenceValidated: false,
            reputationImpact: 0,
            source: source, // Marcar origen
            externalId: task.id,
            listName: task.list_name || ''
        }));

        // Guardar tareas externas separadamente
        const externalTasksKey = `astren_external_tasks_${source}`;
        localStorage.setItem(externalTasksKey, JSON.stringify(convertedTasks));

        // Si la sincronización bidireccional está activada, también enviar tareas locales
        if (this.syncConfig.bidirectional_sync) {
            this.sendLocalTasksToExternal(source);
        }
    }

    async sendLocalTasksToExternal(source) {
        const localTasks = this.getLocalTasks();
        const tasksToSend = localTasks.filter(task => !task.source); // Solo tareas locales

        try {
            if (source === 'microsoft') {
                for (const task of tasksToSend) {
                    await fetch(`${this.apiBaseUrl}/sync/microsoft/tasks`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            title: task.title,
                            description: task.description,
                            due_date: task.dueDate
                        })
                    });
                }
            }
            // Para iCloud se implementaría de manera similar
        } catch (error) {
            console.error(`Error enviando tareas locales a ${source}:`, error);
        }
    }

    addSyncHistory(service, message, status) {
        const historyItem = {
            id: Date.now(),
            service: service,
            message: message,
            status: status,
            timestamp: new Date().toISOString()
        };

        this.syncHistory.unshift(historyItem);
        
        // Mantener solo los últimos 50 registros
        if (this.syncHistory.length > 50) {
            this.syncHistory = this.syncHistory.slice(0, 50);
        }

        this.saveSyncHistory();
        this.renderSyncHistory();
    }

    renderSyncHistory() {
        const historyContainer = document.getElementById('syncHistory');
        if (!historyContainer) return;

        historyContainer.innerHTML = this.syncHistory.map(item => `
            <div class="history-item">
                <div class="history-icon">
                    <i class="fas ${this.getHistoryIcon(item.status)}"></i>
                </div>
                <div class="history-content">
                    <h4>${item.service}</h4>
                    <p>${item.message}</p>
                    <span class="history-time">${this.formatTimeAgo(item.timestamp)}</span>
                </div>
                <div class="history-status">
                    <span class="status-badge status-${item.status}">${this.getStatusText(item.status)}</span>
                </div>
            </div>
        `).join('');
    }

    getHistoryIcon(status) {
        switch (status) {
            case 'success': return 'fa-check-circle';
            case 'error': return 'fa-exclamation-triangle';
            case 'warning': return 'fa-exclamation-circle';
            default: return 'fa-info-circle';
        }
    }

    getStatusText(status) {
        switch (status) {
            case 'success': return 'Exitoso';
            case 'error': return 'Error';
            case 'warning': return 'Advertencia';
            default: return 'Info';
        }
    }

    formatTimeAgo(timestamp) {
        const now = new Date();
        const time = new Date(timestamp);
        const diffMs = now - time;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Hace un momento';
        if (diffMins < 60) return `Hace ${diffMins} minutos`;
        if (diffHours < 24) return `Hace ${diffHours} horas`;
        if (diffDays < 7) return `Hace ${diffDays} días`;
        return time.toLocaleDateString();
    }

    updateAutoSync() {
        // Implementar sincronización automática
        if (this.syncConfig.auto_sync) {
            // Limpiar intervalo anterior si existe
            if (this.autoSyncInterval) {
                clearInterval(this.autoSyncInterval);
            }
            
            // Configurar nuevo intervalo
            const intervalMs = this.syncConfig.sync_interval * 60 * 1000;
            this.autoSyncInterval = setInterval(() => {
                this.performAutoSync();
            }, intervalMs);
        } else {
            if (this.autoSyncInterval) {
                clearInterval(this.autoSyncInterval);
                this.autoSyncInterval = null;
            }
        }
    }

    async performAutoSync() {
        const services = [];
        if (this.syncConfig.microsoft_connected) services.push('microsoft');
        if (this.syncConfig.icloud_connected) services.push('icloud');

        if (services.length > 0) {
            try {
                const localTasks = this.getLocalTasks();
                const response = await fetch(`${this.apiBaseUrl}/sync/sync-all`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        local_tasks: localTasks,
                        sync_services: services
                    })
                });

                if (response.ok) {
                    const result = await response.json();
                    this.processSyncedTasks(result.synced_tasks, 'auto');
                    this.addSyncHistory('Sincronización automática', `${result.synced_tasks.length} tareas sincronizadas`, 'success');
                }
            } catch (error) {
                console.error('Error en sincronización automática:', error);
                this.addSyncHistory('Sincronización automática', 'Error de conexión', 'error');
            }
        }
    }

    showToast(message, type = 'info') {
        // Crear toast notification
        const toast = document.createElement('div');
        toast.className = `toast toast--${type}`;
        toast.innerHTML = `
            <div class="toast__icon">
                <i class="fas ${this.getToastIcon(type)}"></i>
            </div>
            <div class="toast__message">${message}</div>
            <button class="toast__close">
                <i class="fas fa-times"></i>
            </button>
        `;

        // Agregar al DOM
        document.body.appendChild(toast);

        // Mostrar con animación
        setTimeout(() => toast.classList.add('active'), 100);

        // Auto-remover después de 5 segundos
        setTimeout(() => {
            toast.classList.remove('active');
            setTimeout(() => document.body.removeChild(toast), 300);
        }, 5000);

        // Cerrar manualmente
        const closeBtn = toast.querySelector('.toast__close');
        closeBtn.addEventListener('click', () => {
            toast.classList.remove('active');
            setTimeout(() => document.body.removeChild(toast), 300);
        });
    }

    getToastIcon(type) {
        switch (type) {
            case 'success': return 'fa-check-circle';
            case 'error': return 'fa-exclamation-triangle';
            case 'warning': return 'fa-exclamation-circle';
            default: return 'fa-info-circle';
        }
    }

    async testICloudConnection() {
        const appleId = document.getElementById('appleId').value.trim();
        const appPassword = document.getElementById('appPassword').value.trim();

        // Validaciones
        if (!appleId || !appPassword) {
            this.showToast('Por favor completa todos los campos para probar la conexión', 'error');
            return;
        }

        if (!appleId.includes('@')) {
            this.showToast('El Apple ID debe ser un email válido', 'error');
            return;
        }

        if (appPassword.length < 10) {
            this.showToast('La contraseña específica de app debe tener al menos 10 caracteres', 'error');
            return;
        }

        // Mostrar indicador de carga
        const testBtn = document.getElementById('testICloudConnection');
        const originalText = testBtn.textContent;
        testBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Probando...';
        testBtn.disabled = true;

        try {
            const response = await fetch(`${this.apiBaseUrl}/sync/icloud/connect`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    apple_id: appleId,
                    app_specific_password: appPassword
                })
            });

            const data = await response.json();

            if (response.ok) {
                this.showToast('✅ Conexión exitosa con iCloud Reminders', 'success');
                this.addSyncHistory('iCloud Reminders', 'Prueba de conexión exitosa', 'success');
            } else {
                // Manejar errores específicos
                let errorMessage = data.error || 'Error conectando con iCloud';
                
                if (response.status === 401) {
                    errorMessage = '❌ Credenciales incorrectas. Verifica tu Apple ID y contraseña específica de app.';
                } else if (response.status === 403) {
                    errorMessage = '❌ Acceso denegado. Asegúrate de que la contraseña específica de app tenga permisos para CalDAV.';
                } else if (response.status === 404) {
                    errorMessage = '❌ Recurso no encontrado. Verifica que tengas recordatorios configurados en iCloud.';
                } else if (response.status === 408) {
                    errorMessage = '❌ Tiempo de espera agotado. Verifica tu conexión a internet.';
                } else if (response.status === 503) {
                    errorMessage = '❌ Error de conexión. Verifica tu conexión a internet.';
                }
                
                this.showToast(errorMessage, 'error');
                this.addSyncHistory('iCloud Reminders', `Prueba fallida: ${errorMessage}`, 'error');
            }
        } catch (error) {
            console.error('Error probando conexión iCloud:', error);
            const errorMessage = '❌ Error de conexión. Verifica tu conexión a internet y vuelve a intentar.';
            this.showToast(errorMessage, 'error');
            this.addSyncHistory('iCloud Reminders', `Prueba fallida: ${errorMessage}`, 'error');
        } finally {
            // Restaurar botón
            testBtn.innerHTML = originalText;
            testBtn.disabled = false;
        }
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Inicializando SyncManager...');
    window.syncManager = new SyncManager();
}); 