@echo off
setlocal ENABLEDELAYEDEXPANSION

title Astren - Local (BD Aiven)
echo.
echo ========================================
echo    ASTREN - MODO LOCAL (BASE DE DATOS NUBE)
echo ========================================
echo.
echo Este script inicia el backend localmente usando la BD de Aiven.
echo.

REM Preparar rutas
cd /d "%~dp0"
set "ROOT=%cd%"
set "BACKEND_DIR=%ROOT%\backend"
set "FRONTEND_DIR=%ROOT%\frontend"

REM Verificar backend y frontend
if not exist "%BACKEND_DIR%\app.py" (
  echo ❌ Error: No se encontro backend\app.py en %BACKEND_DIR%
  pause
  exit /b 1
)
if not exist "%FRONTEND_DIR%" (
  echo ❌ Error: No se encontro la carpeta frontend en %FRONTEND_DIR%
  pause
  exit /b 1
)

REM (Sin verificacion adicional en raiz; ya validamos BACKEND_DIR)

REM Activar entorno virtual si existe (.venv en raiz o venv en backend)
REM Elegir interprete de Python
set "PYTHON_EXE=python"
if exist "%ROOT%\.venv\Scripts\python.exe" set "PYTHON_EXE=%ROOT%\.venv\Scripts\python.exe"
if exist "%BACKEND_DIR%\venv\Scripts\python.exe" set "PYTHON_EXE=%BACKEND_DIR%\venv\Scripts\python.exe"

REM Verificar que python este disponible
if /I "%PYTHON_EXE%"=="python" (
  where python >nul 2>&1
  if errorlevel 1 (
    echo ❌ Error: Python no esta en el PATH.
    echo Instala Python 3.x y vuelve a intentar.
    pause
    exit /b 1
  )
) else (
  if not exist "%PYTHON_EXE%" (
    echo ❌ Error: No se encontro Python en "%PYTHON_EXE%".
    pause
    exit /b 1
  )
)

REM Configuracion de entorno (local + Aiven)
REM Lanzar BACKEND (Aiven) y FRONTEND con scripts dedicados para evitar problemas de quoting
start "Astren Backend (Aiven)" cmd /k "scripts\run_backend_aiven.cmd"
start "Astren Frontend" cmd /k "scripts\run_frontend.cmd"

echo.
echo ========================================
echo  Servicios iniciados
echo  - Backend:  http://localhost:8000
echo  - Frontend: http://localhost:5500
echo ========================================
echo.
echo Cierra esta ventana si ya no la necesitas.
pause


