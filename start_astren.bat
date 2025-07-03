@echo off
REM ========================================
REM ASTren - Gestor de Productividad
REM ========================================
REM Acceso rápido para iniciar todos los servicios
REM Backend Flask + Frontend HTTP + IA Secreta

echo.
echo ========================================
echo    ASTren - Gestor de Productividad
echo ========================================
echo.
echo Iniciando todos los servicios...
echo - Backend Flask (Puerto 8000)
echo - Frontend HTTP (Puerto 5500) 
echo.
echo Por favor espera mientras se configuran los servidores...
echo.

REM Verificar que el script de PowerShell existe
if not exist "scripts\start_servers.ps1" (
    echo ERROR: No se encontró el script start_servers.ps1
    echo Asegúrate de estar en la carpeta raíz de Astren
    pause
    exit /b 1
)

REM Ejecutar el script de PowerShell
powershell -ExecutionPolicy Bypass -File "scripts\start_servers.ps1"

REM Verificar si hubo errores
if %ERRORLEVEL% neq 0 (
    echo.
    echo ERROR: Hubo un problema al iniciar los servidores
    echo Verifica que Python esté instalado correctamente
    pause
    exit /b 1
)

echo.
echo ========================================
echo    ¡Astren iniciado correctamente!
echo ========================================
echo.
echo URLs disponibles:
echo - Frontend Principal: http://localhost:5500
echo - Backend API: http://localhost:8000
echo.
echo Presiona cualquier tecla para cerrar esta ventana...
pause >nul 