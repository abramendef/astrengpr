# Script para iniciar tanto el backend como el frontend
Write-Host "Iniciando servidores de Astren..." -ForegroundColor Green
Write-Host ""

# Función para iniciar el backend
function Start-Backend {
    Write-Host "Iniciando Backend (Puerto 8000)..." -ForegroundColor Yellow
    Set-Location "backend"
    
    # Verificar si Flask está instalado
    Write-Host "Verificando dependencias..." -ForegroundColor Cyan
    try {
        py -3.13 -c "import flask" 2>$null
        if ($LASTEXITCODE -ne 0) {
            Write-Host "Instalando dependencias..." -ForegroundColor Yellow
            py -3.13 -m pip install -r requirements.txt
        }
    } catch {
        Write-Host "Error verificando dependencias, continuando..." -ForegroundColor Yellow
    }
    
    # Intentar con py -3.13, si falla usar python
    try {
        Start-Process -FilePath "py" -ArgumentList "-3.13", "main_app.py" -WindowStyle Minimized
        Write-Host "Backend iniciado con py -3.13" -ForegroundColor Green
    } catch {
        Write-Host "Intentando con 'python' en lugar de 'py -3.13'..." -ForegroundColor Yellow
        try {
            Start-Process -FilePath "python" -ArgumentList "main_app.py" -WindowStyle Minimized
            Write-Host "Backend iniciado con python" -ForegroundColor Green
        } catch {
            Write-Host "Error iniciando backend. Verifica que Python esté instalado." -ForegroundColor Red
            return $false
        }
    }
    Set-Location ".."
    Write-Host "Backend iniciado en http://localhost:8000" -ForegroundColor Green
    return $true
}

# Función para iniciar el frontend
function Start-Frontend {
    Write-Host "Iniciando Frontend (Puerto 5500)..." -ForegroundColor Yellow
    Set-Location "frontend"
    try {
        Start-Process -FilePath "py" -ArgumentList "-3.13", "-m", "http.server", "5500" -WindowStyle Minimized
        Write-Host "Frontend iniciado con py -3.13" -ForegroundColor Green
    } catch {
        Write-Host "Intentando con 'python' en lugar de 'py -3.13'..." -ForegroundColor Yellow
        try {
            Start-Process -FilePath "python" -ArgumentList "-m", "http.server", "5500" -WindowStyle Minimized
            Write-Host "Frontend iniciado con python" -ForegroundColor Green
        } catch {
            Write-Host "Error iniciando frontend. Verifica que Python esté instalado." -ForegroundColor Red
            return $false
        }
    }
    Set-Location ".."
    Write-Host "Frontend iniciado en http://localhost:5500" -ForegroundColor Green
    return $true
}

# Verificar si los puertos están libres
function Test-Port {
    param($Port)
    $connection = Test-NetConnection -ComputerName "localhost" -Port $Port -InformationLevel Quiet
    return $connection.TcpTestSucceeded
}

# Verificar puertos
Write-Host "Verificando puertos..." -ForegroundColor Cyan
if (Test-Port 8000) {
    Write-Host "Puerto 8000 esta en uso. Deteniendo proceso..." -ForegroundColor Red
    $process = Get-NetTCPConnection -LocalPort 8000 -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess
    if ($process) {
        Stop-Process -Id $process -Force
        Start-Sleep -Seconds 2
    }
}

if (Test-Port 5500) {
    Write-Host "Puerto 5500 esta en uso. Deteniendo proceso..." -ForegroundColor Red
    $process = Get-NetTCPConnection -LocalPort 5500 -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess
    if ($process) {
        Stop-Process -Id $process -Force
        Start-Sleep -Seconds 2
    }
}

# Iniciar servidores
$backendStarted = Start-Backend
if ($backendStarted) {
    Start-Sleep -Seconds 3
    $frontendStarted = Start-Frontend
    
    if (-not $frontendStarted) {
        Write-Host "Error: No se pudo iniciar el frontend" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "Error: No se pudo iniciar el backend" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Servidores iniciados correctamente!" -ForegroundColor Green
Write-Host ""
Write-Host "URLs disponibles:" -ForegroundColor Cyan
Write-Host "   • Frontend Principal: http://localhost:5500" -ForegroundColor White
Write-Host "   • Backend API: http://localhost:8000" -ForegroundColor White
Write-Host "   • Configuracion: http://localhost:8000/sync/config" -ForegroundColor White
Write-Host ""
Write-Host "Para detener los servidores, presiona Ctrl+C o cierra esta ventana" -ForegroundColor Yellow
Write-Host ""

# Esperar a que el usuario presione una tecla
Read-Host "Presiona Enter para continuar..."

# Mostrar estado de los servidores
Write-Host "Verificando estado de los servidores..." -ForegroundColor Cyan
if (Test-Port 8000) {
    Write-Host "Backend (puerto 8000): ACTIVO" -ForegroundColor Green
} else {
    Write-Host "Backend (puerto 8000): INACTIVO" -ForegroundColor Red
}

if (Test-Port 5500) {
    Write-Host "Frontend (puerto 5500): ACTIVO" -ForegroundColor Green
} else {
    Write-Host "Frontend (puerto 5500): INACTIVO" -ForegroundColor Red
}

Write-Host ""
Write-Host "¡Astren está listo!" -ForegroundColor Green
Write-Host "Abre http://localhost:5500 en tu navegador para comenzar" -ForegroundColor Green
Write-Host "" 