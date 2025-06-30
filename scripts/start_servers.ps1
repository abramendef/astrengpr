# Script para iniciar tanto el backend como el frontend
Write-Host "🚀 Iniciando servidores de Astren..." -ForegroundColor Green
Write-Host ""

# Función para iniciar el backend
function Start-Backend {
    Write-Host "🔧 Iniciando Backend (Puerto 8000)..." -ForegroundColor Yellow
    Set-Location "backend"
    Start-Process -FilePath "py" -ArgumentList "-3.13", "app.py" -WindowStyle Minimized
    Set-Location ".."
    Write-Host "✅ Backend iniciado en http://localhost:8000" -ForegroundColor Green
}

# Función para iniciar el frontend
function Start-Frontend {
    Write-Host "🎨 Iniciando Frontend (Puerto 5500)..." -ForegroundColor Yellow
    Set-Location "frontend"
    Start-Process -FilePath "python" -ArgumentList "-m", "http.server", "5500" -WindowStyle Minimized
    Set-Location ".."
    Write-Host "✅ Frontend iniciado en http://localhost:5500" -ForegroundColor Green
}

# Verificar si los puertos están libres
function Test-Port {
    param($Port)
    $connection = Test-NetConnection -ComputerName "localhost" -Port $Port -InformationLevel Quiet
    return $connection.TcpTestSucceeded
}

# Verificar puertos
Write-Host "🔍 Verificando puertos..." -ForegroundColor Cyan
if (Test-Port 8000) {
    Write-Host "❌ Puerto 8000 está en uso. Deteniendo proceso..." -ForegroundColor Red
    $process = Get-NetTCPConnection -LocalPort 8000 -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess
    if ($process) {
        Stop-Process -Id $process -Force
        Start-Sleep -Seconds 2
    }
}

if (Test-Port 5500) {
    Write-Host "❌ Puerto 5500 está en uso. Deteniendo proceso..." -ForegroundColor Red
    $process = Get-NetTCPConnection -LocalPort 5500 -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess
    if ($process) {
        Stop-Process -Id $process -Force
        Start-Sleep -Seconds 2
    }
}

# Iniciar servidores
Start-Backend
Start-Sleep -Seconds 3
Start-Frontend

Write-Host ""
Write-Host "🎉 ¡Servidores iniciados correctamente!" -ForegroundColor Green
Write-Host ""
Write-Host "📱 URLs disponibles:" -ForegroundColor Cyan
Write-Host "   • Frontend: http://localhost:5500" -ForegroundColor White
Write-Host "   • Backend API: http://localhost:8000" -ForegroundColor White
Write-Host "   • Configuración: http://localhost:8000/sync/config" -ForegroundColor White
Write-Host ""
Write-Host "💡 Para detener los servidores, presiona Ctrl+C o cierra esta ventana" -ForegroundColor Yellow
Write-Host ""

# Esperar a que el usuario presione una tecla
Read-Host "Presiona Enter para continuar..."

# Mostrar estado de los servidores
Write-Host "🔍 Verificando estado de los servidores..." -ForegroundColor Cyan
if (Test-Port 8000) {
    Write-Host "✅ Backend (puerto 8000): ACTIVO" -ForegroundColor Green
} else {
    Write-Host "❌ Backend (puerto 8000): INACTIVO" -ForegroundColor Red
}

if (Test-Port 5500) {
    Write-Host "✅ Frontend (puerto 5500): ACTIVO" -ForegroundColor Green
} else {
    Write-Host "❌ Frontend (puerto 5500): INACTIVO" -ForegroundColor Red
}

Write-Host ""
Write-Host "🎯 ¡Listo! Puedes abrir http://localhost:5500 en tu navegador" -ForegroundColor Green 